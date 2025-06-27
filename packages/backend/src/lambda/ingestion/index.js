/**
 * Ingestion Lambda Function
 * 
 * This function receives and normalizes communications from various sources,
 * storing them in DynamoDB and S3 using the single-table design pattern.
 * Refactored to use service layer for better testability.
 * Updated to use AWS SDK v3 for better performance.
 */

const { v4: uuidv4 } = require("uuid");
const DynamoDBService = require("./services/dynamodb-service");
const S3Service = require("./services/s3-service");

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
  COMMUNICATION: "COMM",
  USER: "USER",
  PROJECT: "PROJ",
  ENTITY: "ENTITY"
};

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  try {
    // S3 event
    if (event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:s3') {
      const results = [];
      
      for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;
        
        console.log(`Processing S3 object: ${bucket}/${key}`);
        
        // Get the object from S3
        const s3Object = await s3Service.getObject({ Key: key });
        const content = await s3Object.Body.transformToString();
        const data = JSON.parse(content);
        
        // Process the communication
        const result = await exports.processCommunication(data);
        results.push(result);
      }
      
      return {
        statusCode: 200,
        processedCount: results.length,
        results: results
      };
    }
    
    // API Gateway event
    if (event.body) {
      const body = JSON.parse(event.body);
      const result = await exports.processCommunication(body);
      
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify(result)
      };
    }
    
    // Direct invocation
    if (event.source) {
      const result = await exports.processCommunication(event);
      return result;
    }
    
    return {
      statusCode: 400,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: "Unsupported event type" })
    };
  } catch (error) {
    console.error("Error processing communication:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};

/**
 * Process a communication from any source
 */
exports.processCommunication = async function processCommunication(data) {
  // Generate a unique ID if not provided
  const id = data.id || uuidv4();
  
  // Normalize the communication data
  const normalizedData = exports.normalizeData(data, id);
  
  // Store the full communication in S3
  const s3Key = await exports.storeInS3(normalizedData, id);
  
  // Store metadata in DynamoDB
  const dbItem = exports.createDynamoDBItem(normalizedData, id, s3Key);
  await exports.storeInDynamoDB(dbItem);
  
  return {
    id,
    s3Key,
    message: "Communication processed successfully"
  };
};

/**
 * Normalize data from different sources into a standard format
 */
exports.normalizeData = function normalizeData(data, id) {
  // Default values
  const normalized = {
    id,
    timestamp: data.timestamp || new Date().toISOString(),
    type: data.type || "unknown",
    project: data.project || "default",
    metadata: {
      urgency: data.urgency || "normal",
      read: false
    }
  };
  
  // Source-specific normalization
  switch (data.source) {
    case "email":
      normalized.subject = data.subject || "(No Subject)";
      normalized.sender = data.from || "unknown";
      normalized.sender_id = data.from_email || "unknown";
      normalized.recipients = data.to || [];
      normalized.content = data.body || "";
      normalized.attachments = data.attachments || [];
      break;
      
    case "document":
      normalized.title = data.title || "Untitled Document";
      normalized.sender = data.author || "unknown";
      normalized.sender_id = data.author_id || "unknown";
      normalized.content = data.content || "";
      normalized.fileType = data.fileType || "unknown";
      normalized.fileSize = data.fileSize || 0;
      break;
      
    case "social":
      normalized.platform = data.platform || "unknown";
      normalized.sender = data.user || "unknown";
      normalized.sender_id = data.user_id || "unknown";
      normalized.content = data.text || "";
      normalized.mentions = data.mentions || [];
      normalized.hashtags = data.hashtags || [];
      break;
      
    default:
      // Copy all fields for unknown sources
      Object.assign(normalized, data);
  }
  
  return normalized;
};

/**
 * Store the full communication in S3
 */
exports.storeInS3 = async function storeInS3(data, id) {
  // Use 'processed/' prefix to avoid triggering S3 events that listen to 'incoming/'
  const key = `processed/${data.type}/${id}.json`;
  
  await s3Service.putObject({
    Key: key,
    Body: JSON.stringify(data),
    ContentType: "application/json"
  });
  
  return key;
};

/**
 * Create a DynamoDB item using the single-table design
 */
exports.createDynamoDBItem = function createDynamoDBItem(data, id, s3Key) {
  // Extract timestamp for sorting
  const timestamp = data.timestamp;
  
  // Create the base item
  const item = {
    // Primary key
    PK: ENTITY_TYPES.COMMUNICATION,
    SK: `${ENTITY_TYPES.COMMUNICATION}#${id}`,
    
    // GSI1 for project-based queries
    GSI1PK: `${ENTITY_TYPES.PROJECT}#${data.project}`,
    GSI1SK: timestamp,
    
    // GSI2 for sender-based queries
    GSI2PK: `${ENTITY_TYPES.ENTITY}#${data.sender_id}`,
    GSI2SK: timestamp,
    
    // Common attributes
    id,
    timestamp,
    commType: data.type,
    project: data.project,
    s3Key,
    
    // Metadata
    metadata: data.metadata || {},
    
    // Source-specific attributes
    subject: data.subject || data.title,
    sender: data.sender,
    sender_id: data.sender_id,
    
    // Creation metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return item;
};

/**
 * Store metadata in DynamoDB
 */
exports.storeInDynamoDB = async function storeInDynamoDB(item) {
  await dynamoService.put({
    Item: item
  });
};

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
