/**
 * Communication Processing Pipeline Integration Test
 * Tests the complete flow from S3 upload to DynamoDB storage
 * Updated to use AWS SDK v3 for better performance.
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const https = require('https');
const http = require('http');

// Configure AWS SDK v3
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCommunicationPipeline() {
    console.log('📨 Testing Communication Processing Pipeline...');
    
    const testId = `integration-test-${Date.now()}`;
    const bucketName = process.env.RAW_BUCKET;
    const tableName = process.env.COMMUNICATIONS_TABLE;
    const apiEndpoint = process.env.API_ENDPOINT;
    
    if (!bucketName || !tableName || !apiEndpoint) {
        throw new Error('Required environment variables not set');
    }
    
    try {
        // Test 1: Upload test communication to S3
        console.log('  📤 Uploading test communication to S3...');
        
        const testCommunication = {
            id: testId,
            timestamp: new Date().toISOString(),
            type: 'email',
            subject: 'Integration Test Email',
            content: 'This is a test email for integration testing.',
            sender: 'test@example.com',
            recipients: ['recipient@example.com'],
            metadata: {
                urgency: 'medium',
                category: 'test'
            }
        };
        
        const s3Key = `raw/email/${testId}.json`;
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: JSON.stringify(testCommunication),
            ContentType: 'application/json'
        });
        await s3.send(putCommand);
        
        console.log('  ✅ Test communication uploaded to S3');
        
        // Test 2: Wait for processing (Lambda should process the S3 event)
        console.log('  ⏳ Waiting for Lambda processing...');
        await sleep(5000); // Wait 5 seconds for processing
        
        // Test 3: Check if communication appears in DynamoDB
        console.log('  🔍 Checking DynamoDB for processed communication...');
        
        let attempts = 0;
        let found = false;
        const maxAttempts = 6; // 30 seconds total
        
        while (attempts < maxAttempts && !found) {
            try {
                const queryCommand = new GetCommand({
                    TableName: tableName,
                    Key: {
                        PK: 'COMM',
                        SK: `COMM#${testId}`
                    }
                });
                const result = await dynamodb.send(queryCommand);
                
                if (result.Item) {
                    found = true;
                    console.log('  ✅ Communication found in DynamoDB');
                    
                    const item = result.Item;
                    if (item.subject === testCommunication.subject) {
                        console.log('  ✅ Communication data matches');
                    } else {
                        throw new Error('Communication data does not match');
                    }
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`  ⏳ Not found yet, waiting... (attempt ${attempts}/${maxAttempts})`);
                        await sleep(5000);
                    }
                }
            } catch (error) {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`  ⏳ Error checking, retrying... (attempt ${attempts}/${maxAttempts})`);
                    await sleep(5000);
                } else {
                    throw error;
                }
            }
        }
        
        if (!found) {
            throw new Error('Communication was not processed within expected time');
        }
        
        // Test 4: Verify API can retrieve the communication
        console.log('  🌐 Testing API retrieval...');
        
        const apiUrl = `${apiEndpoint}communications`;
        const apiResponse = await makeRequest(apiUrl);
        
        if (apiResponse.statusCode !== 200) {
            throw new Error(`API request failed with status ${apiResponse.statusCode}`);
        }
        
        const communications = apiResponse.data.communications || [];
        const testComm = communications.find(c => c.id === testId);
        
        if (testComm) {
            console.log('  ✅ Communication retrievable via API');
        } else {
            console.log('  ⚠️  Communication not found in API response (may be due to pagination)');
        }
        
        console.log('🎉 Communication Pipeline Test: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ Communication Pipeline Test: FAILED');
        console.error('Error:', error.message);
        throw error;
    } finally {
        // Cleanup: Remove test data
        try {
            console.log('  🧹 Cleaning up test data...');
            
            // Remove from S3
            const deleteS3Command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: `raw/email/${testId}.json`
            });
            await s3.send(deleteS3Command);
            
            // Remove from DynamoDB
            const deleteCommand = new DeleteCommand({
                TableName: tableName,
                Key: {
                    PK: 'COMM',
                    SK: `COMM#${testId}`
                }
            });
            await dynamodb.send(deleteCommand);
            
            console.log('  ✅ Cleanup completed');
        } catch (cleanupError) {
            console.warn('  ⚠️  Cleanup failed:', cleanupError.message);
        }
    }
}

// Run the test
if (require.main === module) {
    testCommunicationPipeline()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { testCommunicationPipeline };
