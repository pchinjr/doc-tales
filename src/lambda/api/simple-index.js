/**
 * Simplified API Lambda Function for testing
 */

const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  try {
    // API Gateway event
    if (event.httpMethod) {
      // Route based on path and method
      const path = event.path;
      const method = event.httpMethod;
      
      // Communications endpoints
      if (path === "/communications" && method === "GET") {
        return await getCommunications();
      }
      
      // User profile endpoints
      if (path === "/user-profile" && method === "GET") {
        return await getUserProfile();
      }
      
      // Archetype endpoints
      if (path === "/archetypes" && method === "GET") {
        return await getArchetypes();
      }
      
      // Default response for unsupported routes
      return {
        statusCode: 404,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: "Not Found" })
      };
    }
    
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unsupported event type" })
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};

/**
 * Get communications
 */
async function getCommunications() {
  try {
    const params = {
      TableName: process.env.COMMUNICATIONS_TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "COMM"
      },
      Limit: 100
    };
    
    const result = await dynamodb.query(params).promise();
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        communications: result.Items || [],
        count: (result.Items || []).length,
        scannedCount: result.ScannedCount || 0
      })
    };
  } catch (error) {
    console.error("Error getting communications:", error);
    throw error;
  }
}

/**
 * Get user profile
 */
async function getUserProfile() {
  try {
    const params = {
      TableName: process.env.USER_PROFILES_TABLE,
      Key: {
        PK: "USER#default-user"
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      // Return default profile if not found
      const defaultProfile = {
        id: "default-user",
        primaryArchetype: "prioritizer",
        archetypeConfidence: {
          prioritizer: 0.25,
          connector: 0.25,
          visualizer: 0.25,
          analyst: 0.25
        },
        preferences: {}
      };
      
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify(defaultProfile)
      };
    }
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Get available archetypes
 */
async function getArchetypes() {
  const archetypes = [
    {
      id: "prioritizer",
      name: "Prioritizer",
      description: "Time-based organization with urgency indicators",
      icon: "calendar"
    },
    {
      id: "connector",
      name: "Connector",
      description: "People-centric view with relationship mapping",
      icon: "users"
    },
    {
      id: "visualizer",
      name: "Visualizer",
      description: "Visual boards with spatial organization",
      icon: "image"
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Detailed metadata view with logical hierarchies",
      icon: "chart-bar"
    }
  ];
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify(archetypes)
  };
}

/**
 * Get CORS headers for API responses
 */
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  };
}
