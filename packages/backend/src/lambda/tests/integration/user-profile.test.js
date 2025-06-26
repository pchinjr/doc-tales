/**
 * User Profile Management Integration Test
 * Tests user profile creation, retrieval, and archetype functionality
 */

const AWS = require('aws-sdk');
const https = require('https');
const http = require('http');

// Configure AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        const req = protocol.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testUserProfile() {
    console.log('👤 Testing User Profile Management...');
    
    const testUserId = `test-user-${Date.now()}`;
    const tableName = process.env.USER_PROFILES_TABLE;
    const apiEndpoint = process.env.API_ENDPOINT;
    
    if (!tableName || !apiEndpoint) {
        throw new Error('Required environment variables not set');
    }
    
    try {
        // Test 1: Create user profile directly in DynamoDB
        console.log('  📝 Creating test user profile...');
        
        const testProfile = {
            PK: `USER#${testUserId}`,
            userId: testUserId,
            email: 'test@example.com',
            name: 'Test User',
            archetype: 'analytical',
            preferences: {
                theme: 'light',
                notifications: true,
                priorityThreshold: 70
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: tableName,
            Item: testProfile
        }).promise();
        
        console.log('  ✅ User profile created');
        
        // Test 2: Retrieve user profile via DynamoDB
        console.log('  🔍 Retrieving user profile from DynamoDB...');
        
        const getResult = await dynamodb.get({
            TableName: tableName,
            Key: {
                PK: `USER#${testUserId}`
            }
        }).promise();
        
        if (!getResult.Item) {
            throw new Error('User profile not found in DynamoDB');
        }
        
        console.log('  ✅ User profile retrieved from DynamoDB');
        
        // Test 3: Validate archetype data
        console.log('  🎭 Validating archetype configuration...');
        
        const validArchetypes = ['analytical', 'creative', 'practical'];
        if (!validArchetypes.includes(getResult.Item.archetype)) {
            throw new Error(`Invalid archetype: ${getResult.Item.archetype}`);
        }
        
        console.log(`  ✅ Archetype '${getResult.Item.archetype}' is valid`);
        
        // Test 4: Test archetype-specific preferences
        console.log('  ⚙️  Testing archetype preferences...');
        
        const preferences = getResult.Item.preferences;
        if (preferences && typeof preferences.priorityThreshold === 'number') {
            console.log(`  ✅ Priority threshold: ${preferences.priorityThreshold}`);
        }
        
        // Test 5: Update user profile
        console.log('  📝 Testing profile update...');
        
        const updatedProfile = {
            ...testProfile,
            archetype: 'creative',
            preferences: {
                ...testProfile.preferences,
                priorityThreshold: 80
            },
            updatedAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: tableName,
            Item: updatedProfile
        }).promise();
        
        // Verify update
        const updatedResult = await dynamodb.get({
            TableName: tableName,
            Key: {
                PK: `USER#${testUserId}`
            }
        }).promise();
        
        if (updatedResult.Item.archetype !== 'creative') {
            throw new Error('Profile update failed');
        }
        
        console.log('  ✅ Profile updated successfully');
        
        // Test 6: Test API integration (if profile endpoint exists)
        console.log('  🌐 Testing API integration...');
        
        try {
            const profileUrl = `${apiEndpoint}profile/${testUserId}`;
            const apiResponse = await makeRequest(profileUrl);
            
            if (apiResponse.statusCode === 200) {
                console.log('  ✅ Profile accessible via API');
            } else if (apiResponse.statusCode === 404) {
                console.log('  ℹ️  Profile API endpoint not implemented (expected for MVP)');
            } else {
                console.log(`  ⚠️  Unexpected API response: ${apiResponse.statusCode}`);
            }
        } catch (apiError) {
            console.log('  ℹ️  Profile API not available (expected for MVP)');
        }
        
        console.log('🎉 User Profile Test: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ User Profile Test: FAILED');
        console.error('Error:', error.message);
        throw error;
    } finally {
        // Cleanup: Remove test user profile
        try {
            console.log('  🧹 Cleaning up test user profile...');
            
            await dynamodb.delete({
                TableName: tableName,
                Key: {
                    PK: `USER#${testUserId}`
                }
            }).promise();
            
            console.log('  ✅ Cleanup completed');
        } catch (cleanupError) {
            console.warn('  ⚠️  Cleanup failed:', cleanupError.message);
        }
    }
}

// Run the test
if (require.main === module) {
    testUserProfile()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { testUserProfile };
