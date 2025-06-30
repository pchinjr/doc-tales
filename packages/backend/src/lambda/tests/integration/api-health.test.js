/**
 * API Health Check Integration Test
 * Tests the API endpoint is accessible and responding correctly
 */

const https = require("https");
const http = require("http");

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith("https:") ? https : http;
        
        const req = protocol.request(url, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on("error", reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testApiHealth() {
    console.log("🏥 Testing API Health...");
    
    const apiEndpoint = process.env.API_ENDPOINT;
    if (!apiEndpoint) {
        throw new Error("API_ENDPOINT environment variable not set");
    }
    
    try {
        // Test 1: Basic connectivity
        console.log("  📡 Testing basic connectivity...");
        const healthUrl = `${apiEndpoint}communications`;
        const response = await makeRequest(healthUrl);
        
        if (response.statusCode !== 200) {
            throw new Error(`API health check failed with status ${response.statusCode}`);
        }
        
        console.log("  ✅ API is responding");
        
        // Test 2: CORS headers
        console.log("  🌐 Testing CORS headers...");
        if (!response.headers["access-control-allow-origin"]) {
            console.log("  ⚠️  CORS headers not found (may be expected for some configurations)");
        } else {
            console.log("  ✅ CORS headers present");
        }
        
        // Test 3: Response format
        console.log("  📋 Testing response format...");
        if (typeof response.data === "object" && response.data !== null) {
            console.log("  ✅ Response is valid JSON");
        } else {
            throw new Error("Response is not valid JSON");
        }
        
        console.log("🎉 API Health Check: PASSED");
        return true;
        
    } catch (error) {
        console.error("❌ API Health Check: FAILED");
        console.error("Error:", error.message);
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testApiHealth()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { testApiHealth };
