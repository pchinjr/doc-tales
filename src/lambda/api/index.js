/**
 * API Lambda Function
 * 
 * This function serves data to the frontend application,
 * providing endpoints for retrieving communications and user profiles.
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Environment variables
const COMMUNICATIONS_TABLE = process.env.COMMUNICATIONS_TABLE;
const USER_PROFILES_TABLE = process.env.USER_PROFILES_TABLE || '';
const RAW_BUCKET = process.env.RAW_BUCKET;

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // API Gateway event
    if (event.httpMethod) {
      // Route based on path and method
      const path = event.path;
      const method = event.httpMethod;
      
      // Communications endpoints
      if (path === '/communications' && method === 'GET') {
        return await getCommunications(event);
      }
      
      if (path.match(/^\/communications\/[\w-]+$/) && method === 'GET') {
        const id = path.split('/').pop();
        return await getCommunicationById(id);
      }
      
      // User profile endpoints
      if (path === '/user-profile' && method === 'GET') {
        return await getUserProfile(event);
      }
      
      if (path === '/user-profile' && method === 'PUT') {
        return await updateUserProfile(event);
      }
      
      // Archetype endpoints
      if (path === '/archetypes' && method === 'GET') {
        return await getArchetypes();
      }
      
      // Default response for unsupported routes
      return {
        statusCode: 404,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'Not Found' })
      };
    }
    
    // Direct invocation
    if (event.action === 'getCommunications') {
      const result = await queryCommunications(event.filters || {});
      return result;
    }
    
    if (event.action === 'getCommunicationById') {
      const result = await getCommunicationData(event.id);
      return result;
    }
    
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unsupported event type' })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

/**
 * Get communications with optional filtering
 */
async function getCommunications(event) {
  // Parse query parameters
  const queryParams = event.queryStringParameters || {};
  
  // Build filters
  const filters = {};
  
  if (queryParams.project) {
    filters.project = queryParams.project;
  }
  
  if (queryParams.type) {
    filters.type = queryParams.type;
  }
  
  if (queryParams.urgency) {
    filters.urgency = queryParams.urgency;
  }
  
  if (queryParams.sender) {
    filters.sender = queryParams.sender;
  }
  
  if (queryParams.from) {
    filters.from = queryParams.from;
  }
  
  if (queryParams.to) {
    filters.to = queryParams.to;
  }
  
  // Query communications
  const result = await queryCommunications(filters);
  
  // Format for API response
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify(result)
  };
}

/**
 * Get a specific communication by ID
 */
async function getCommunicationById(id) {
  const result = await getCommunicationData(id);
  
  if (!result) {
    return {
      statusCode: 404,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Communication not found' })
    };
  }
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify(result)
  };
}

/**
 * Get user profile
 */
async function getUserProfile(event) {
  // Parse query parameters
  const queryParams = event.queryStringParameters || {};
  const userId = queryParams.userId || 'default-user';
  
  // Get user profile from DynamoDB
  const result = await getUserProfileData(userId);
  
  if (!result) {
    // Return default profile if not found
    const defaultProfile = createDefaultUserProfile(userId);
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify(defaultProfile)
    };
  }
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify(result)
  };
}

/**
 * Update user profile
 */
async function updateUserProfile(event) {
  const body = JSON.parse(event.body);
  const userId = body.id || 'default-user';
  
  // Update user profile in DynamoDB
  await updateUserProfileData(userId, body);
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify({ success: true, userId })
  };
}

/**
 * Get available archetypes
 */
async function getArchetypes() {
  const archetypes = [
    {
      id: 'prioritizer',
      name: 'Prioritizer',
      description: 'Time-based organization with urgency indicators',
      icon: 'calendar'
    },
    {
      id: 'connector',
      name: 'Connector',
      description: 'People-centric view with relationship mapping',
      icon: 'users'
    },
    {
      id: 'visualizer',
      name: 'Visualizer',
      description: 'Visual boards with spatial organization',
      icon: 'image'
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'Detailed metadata view with logical hierarchies',
      icon: 'chart-bar'
    }
  ];
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify(archetypes)
  };
}

/**
 * Query communications from DynamoDB
 */
async function queryCommunications(filters) {
  let params = {
    TableName: COMMUNICATIONS_TABLE,
    Limit: 100
  };
  
  // If filtering by project, use the GSI
  if (filters.project) {
    params = {
      TableName: COMMUNICATIONS_TABLE,
      IndexName: 'ProjectIndex',
      KeyConditionExpression: 'project = :project',
      ExpressionAttributeValues: {
        ':project': filters.project
      },
      Limit: 100
    };
  }
  
  // If filtering by sender, use the sender GSI
  if (filters.sender) {
    params = {
      TableName: COMMUNICATIONS_TABLE,
      IndexName: 'SenderIndex',
      KeyConditionExpression: 'sender_id = :sender',
      ExpressionAttributeValues: {
        ':sender': filters.sender
      },
      Limit: 100
    };
  }
  
  // Execute the query
  const result = await dynamodb.query(params).promise();
  
  // For each item, get the full communication from S3 if needed
  const communications = [];
  
  for (const item of result.Items) {
    // If we need the full content, get it from S3
    if (filters.includeContent) {
      try {
        const fullCommunication = await getFullCommunicationFromS3(item);
        communications.push(fullCommunication);
      } catch (error) {
        console.error(`Error getting full communication for ${item.id}:`, error);
        communications.push(item);
      }
    } else {
      communications.push(item);
    }
  }
  
  return {
    communications,
    count: communications.length,
    scannedCount: result.ScannedCount
  };
}

/**
 * Get a specific communication by ID
 */
async function getCommunicationData(id) {
  // First, get the metadata from DynamoDB
  const params = {
    TableName: COMMUNICATIONS_TABLE,
    Key: {
      id: id
    }
  };
  
  const result = await dynamodb.get(params).promise();
  
  if (!result.Item) {
    return null;
  }
  
  // Get the full communication from S3
  try {
    const fullCommunication = await getFullCommunicationFromS3(result.Item);
    return fullCommunication;
  } catch (error) {
    console.error(`Error getting full communication for ${id}:`, error);
    return result.Item;
  }
}

/**
 * Get the full communication from S3
 */
async function getFullCommunicationFromS3(item) {
  if (!item.s3Key) {
    return item;
  }
  
  try {
    const s3Result = await s3.getObject({
      Bucket: RAW_BUCKET,
      Key: item.s3Key
    }).promise();
    
    const fullCommunication = JSON.parse(s3Result.Body.toString());
    
    // Merge with any dimensions from DynamoDB
    if (item.dimensions) {
      fullCommunication.dimensions = item.dimensions;
    }
    
    return fullCommunication;
  } catch (error) {
    console.error(`Error getting object from S3: ${item.s3Key}`, error);
    throw error;
  }
}

/**
 * Get user profile from DynamoDB
 */
async function getUserProfileData(userId) {
  // If no table name is provided, return null
  if (!USER_PROFILES_TABLE) {
    return null;
  }
  
  const params = {
    TableName: USER_PROFILES_TABLE,
    Key: {
      user_id: userId
    }
  };
  
  try {
    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`Error getting user profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Update user profile in DynamoDB
 */
async function updateUserProfileData(userId, data) {
  // If no table name is provided, just log
  if (!USER_PROFILES_TABLE) {
    console.log(`Would update user profile for ${userId}:`, data);
    return;
  }
  
  const params = {
    TableName: USER_PROFILES_TABLE,
    Key: {
      user_id: userId
    },
    UpdateExpression: 'set primaryArchetype = :primaryArchetype, archetypeConfidence = :archetypeConfidence, preferences = :preferences',
    ExpressionAttributeValues: {
      ':primaryArchetype': data.primaryArchetype,
      ':archetypeConfidence': data.archetypeConfidence || {},
      ':preferences': data.preferences || {}
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  await dynamodb.update(params).promise();
}

/**
 * Create a default user profile
 */
function createDefaultUserProfile(userId) {
  return {
    user_id: userId,
    primaryArchetype: 'prioritizer',
    archetypeConfidence: {
      prioritizer: 0.25,
      connector: 0.25,
      visualizer: 0.25,
      analyst: 0.25
    },
    preferences: {}
  };
}

/**
 * Get CORS headers for API responses
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
}
