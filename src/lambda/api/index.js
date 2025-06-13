/**
 * API Lambda Function
 * 
 * This function serves data to the frontend application,
 * providing endpoints for retrieving communications and user profiles.
 * 
 * Refactored to use single-table design with composite keys and service layer
 */

const DynamoDBService = require('../services/dynamodb-service');
const S3Service = require('../services/s3-service');

// Create service instances
const dynamoService = new DynamoDBService();
const s3Service = new S3Service();

// Export services for testing
exports.services = {
  dynamoService,
  s3Service
};

// Entity types for partition keys
const ENTITY_TYPES = {
  COMMUNICATION: 'COMM',
  USER: 'USER',
  PROJECT: 'PROJ',
  ENTITY: 'ENTITY'
};

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
      const result = await exports.queryCommunications(event.filters || {});
      return result;
    }
    
    if (event.action === 'getCommunicationById') {
      const result = await exports.getCommunicationData(event.id);
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
  const result = await exports.queryCommunications(filters);
  
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
  const result = await exports.getCommunicationData(id);
  
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
 * Query communications from DynamoDB using the single-table design
 */
exports.queryCommunications = async function queryCommunications(filters) {
  try {
    let params = {};
    
    // If filtering by project, use GSI1 to query by project
    if (filters.project) {
      params = {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :projectPK',
        ExpressionAttributeValues: {
          ':projectPK': `${ENTITY_TYPES.PROJECT}#${filters.project}`
        },
        Limit: 100
      };
    } 
    // If filtering by sender, use GSI2 to query by sender
    else if (filters.sender) {
      params = {
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :senderPK',
        ExpressionAttributeValues: {
          ':senderPK': `${ENTITY_TYPES.ENTITY}#${filters.sender}`
        },
        Limit: 100
      };
    } 
    // If no specific filter, query all communications by type
    else {
      params = {
        KeyConditionExpression: 'PK = :commType',
        ExpressionAttributeValues: {
          ':commType': ENTITY_TYPES.COMMUNICATION
        },
        Limit: 100
      };
    }
    
    // Add additional filter expressions if needed
    if (filters.type || filters.urgency) {
      let filterExpressions = [];
      let expressionAttributeValues = params.ExpressionAttributeValues || {};
      
      if (filters.type) {
        filterExpressions.push('commType = :type');
        expressionAttributeValues[':type'] = filters.type;
      }
      
      if (filters.urgency) {
        filterExpressions.push('metadata.urgency = :urgency');
        expressionAttributeValues[':urgency'] = filters.urgency;
      }
      
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeValues = expressionAttributeValues;
      }
    }
    
    console.log('Query params:', JSON.stringify(params, null, 2));
    
    // Execute the query using the service
    const result = await dynamoService.query(params);
    console.log(`Query returned ${result.Items.length} items`);
    
    // For each item, get the full communication from S3 if needed
    const communications = [];
    
    for (const item of result.Items) {
      // Extract the actual communication ID from the sort key
      const commId = item.SK.split('#')[1];
      
      // If we need the full content, get it from S3
      if (filters.includeContent && item.s3Key) {
        try {
          const fullCommunication = await exports.getFullCommunicationFromS3(item);
          communications.push({
            ...fullCommunication,
            id: commId
          });
        } catch (error) {
          console.error(`Error getting full communication for ${commId}:`, error);
          communications.push({
            ...item,
            id: commId
          });
        }
      } else {
        // Return the item with a clean ID
        communications.push({
          ...item,
          id: commId
        });
      }
    }
    
    return {
      communications,
      count: communications.length,
      scannedCount: result.ScannedCount
    };
  } catch (error) {
    console.error('Error querying communications:', error);
    throw error;
  }
};

/**
 * Get a specific communication by ID using the single-table design
 */
exports.getCommunicationData = async function getCommunicationData(id) {
  try {
    // Query the communication directly using its primary key
    const params = {
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': ENTITY_TYPES.COMMUNICATION,
        ':sk': `${ENTITY_TYPES.COMMUNICATION}#${id}`
      }
    };
    
    const result = await dynamoService.query(params);
    
    if (!result.Items || result.Items.length === 0) {
      console.log(`No communication found with ID: ${id}`);
      return null;
    }
    
    const item = result.Items[0];
    
    // Get the full communication from S3 if needed
    if (item.s3Key) {
      try {
        const fullCommunication = await exports.getFullCommunicationFromS3(item);
        return {
          ...fullCommunication,
          id // Ensure the ID is included
        };
      } catch (error) {
        console.error(`Error getting full communication for ${id}:`, error);
      }
    }
    
    // Return the item with a clean ID
    return {
      ...item,
      id
    };
  } catch (error) {
    console.error(`Error getting communication data for ${id}:`, error);
    throw error;
  }
};

/**
 * Get the full communication from S3
 */
exports.getFullCommunicationFromS3 = async function getFullCommunicationFromS3(item) {
  if (!item.s3Key) {
    return item;
  }
  
  try {
    const s3Result = await s3Service.getObject({
      Key: item.s3Key
    });
    
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
};

/**
 * Get user profile from DynamoDB using the single-table design
 */
async function getUserProfileData(userId) {
  try {
    const result = await dynamoService.getUserProfile({
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`
      }
    });
    
    if (!result.Item) {
      return null;
    }
    
    // Clean up the response to remove the PK
    const { PK, ...userProfile } = result.Item;
    return {
      ...userProfile,
      id: userId
    };
  } catch (error) {
    console.error(`Error getting user profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Update user profile in DynamoDB using the single-table design
 */
async function updateUserProfileData(userId, data) {
  try {
    await dynamoService.updateUserProfile({
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`
      },
      UpdateExpression: 'set primaryArchetype = :primaryArchetype, archetypeConfidence = :archetypeConfidence, preferences = :preferences',
      ExpressionAttributeValues: {
        ':primaryArchetype': data.primaryArchetype,
        ':archetypeConfidence': data.archetypeConfidence || {},
        ':preferences': data.preferences || {}
      },
      ReturnValues: 'UPDATED_NEW'
    });
  } catch (error) {
    console.error(`Error updating user profile for ${userId}:`, error);
    throw error;
  }
}

/**
 * Create a default user profile
 */
function createDefaultUserProfile(userId) {
  return {
    id: userId,
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
