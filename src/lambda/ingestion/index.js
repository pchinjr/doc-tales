/**
 * Ingestion Lambda Function
 * 
 * This function receives communications from various sources,
 * normalizes them, and stores them in S3 for further processing.
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const RAW_BUCKET = process.env.RAW_BUCKET;
const COMMUNICATIONS_TABLE = process.env.COMMUNICATIONS_TABLE;

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // For API Gateway events
    if (event.httpMethod === 'POST') {
      return await handleApiEvent(event);
    }
    
    // For direct invocation
    return await processIncomingCommunication(event);
  } catch (error) {
    console.error('Error processing communication:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process communication' })
    };
  }
};

/**
 * Handle API Gateway events
 */
async function handleApiEvent(event) {
  const body = JSON.parse(event.body);
  
  // Validate the incoming data
  if (!validateCommunication(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid communication data' })
    };
  }
  
  // Process the communication
  const result = await processIncomingCommunication(body);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Communication received successfully',
      communicationId: result.id
    })
  };
}

/**
 * Process incoming communication
 */
async function processIncomingCommunication(data) {
  // Normalize the communication data
  const normalizedCommunication = normalizeCommunication(data);
  
  // Generate a unique ID if not provided
  if (!normalizedCommunication.id) {
    normalizedCommunication.id = generateId();
  }
  
  // Store raw communication in S3
  const s3Key = getS3Key(normalizedCommunication);
  await storeInS3(normalizedCommunication, s3Key);
  
  // Store metadata in DynamoDB
  await storeInDynamoDB(normalizedCommunication);
  
  return normalizedCommunication;
}

/**
 * Normalize communication data to standard format
 */
function normalizeCommunication(data) {
  // Start with a base structure
  const normalized = {
    id: data.id || null,
    type: determineType(data),
    source: determineSource(data),
    timestamp: data.timestamp || new Date().toISOString(),
    subject: data.subject || data.title || extractSubject(data),
    content: data.content || data.body || '',
    sender: normalizeSender(data),
    recipients: normalizeRecipients(data),
    attachments: normalizeAttachments(data),
    metadata: {
      urgency: determineUrgency(data),
      category: determineCategory(data),
      read: false,
      flagged: false,
      sourceSpecific: extractSourceSpecific(data)
    },
    entities: data.entities || [],
    relationships: data.relationships || [],
    project: determineProject(data)
  };
  
  return normalized;
}

/**
 * Determine communication type
 */
function determineType(data) {
  if (data.type) return data.type;
  
  if (data.source === 'gmail' || data.source === 'outlook') return 'email';
  if (data.source === 'dropbox' || data.source === 'gdrive') return 'document';
  if (data.source === 'twitter' || data.source === 'linkedin') return 'social';
  
  return 'email'; // Default
}

/**
 * Determine communication source
 */
function determineSource(data) {
  if (data.source) return data.source;
  
  // Try to infer from available data
  if (data.from && data.from.email && data.from.email.includes('gmail')) return 'gmail';
  if (data.creator && data.creator.email && data.creator.email.includes('outlook')) return 'outlook';
  
  return 'gmail'; // Default
}

/**
 * Normalize sender information
 */
function normalizeSender(data) {
  if (data.sender) return data.sender;
  
  if (data.from) {
    return {
      id: data.from.id || `contact-${generateId()}`,
      name: data.from.name || data.from.email || 'Unknown',
      email: data.from.email || null,
      projects: [determineProject(data)]
    };
  }
  
  if (data.creator) {
    return {
      id: data.creator.id || `contact-${generateId()}`,
      name: data.creator.name || data.creator.email || 'Unknown',
      email: data.creator.email || null,
      projects: [determineProject(data)]
    };
  }
  
  if (data.author) {
    return {
      id: data.author.id || `contact-${generateId()}`,
      name: data.author.name || data.author.handle || 'Unknown',
      email: null,
      projects: [determineProject(data)]
    };
  }
  
  return {
    id: `contact-${generateId()}`,
    name: 'Unknown',
    email: null,
    projects: [determineProject(data)]
  };
}

/**
 * Normalize recipients information
 */
function normalizeRecipients(data) {
  if (data.recipients) return data.recipients;
  
  const recipients = [];
  
  if (data.to && Array.isArray(data.to)) {
    data.to.forEach(recipient => {
      recipients.push({
        id: recipient.id || `contact-${generateId()}`,
        name: recipient.name || recipient.email || 'Unknown',
        email: recipient.email || null,
        projects: [determineProject(data)]
      });
    });
  }
  
  if (data.sharedWith && Array.isArray(data.sharedWith)) {
    data.sharedWith.forEach(recipient => {
      recipients.push({
        id: recipient.id || `contact-${generateId()}`,
        name: recipient.name || recipient.email || 'Unknown',
        email: recipient.email || null,
        projects: [determineProject(data)]
      });
    });
  }
  
  return recipients;
}

/**
 * Normalize attachments
 */
function normalizeAttachments(data) {
  if (data.attachments) return data.attachments;
  
  const attachments = [];
  
  if (data.hasAttachments && Array.isArray(data.files)) {
    data.files.forEach(file => {
      attachments.push({
        id: file.id || `att-${generateId()}`,
        name: file.name || 'Attachment',
        type: file.type || 'application/octet-stream',
        size: file.size || 0
      });
    });
  }
  
  return attachments;
}

/**
 * Determine urgency level
 */
function determineUrgency(data) {
  if (data.urgency) return data.urgency;
  if (data.priority) return data.priority;
  
  const content = (data.content || data.body || '').toLowerCase();
  
  if (content.includes('urgent') || 
      content.includes('asap') || 
      content.includes('immediately')) {
    return 'high';
  }
  
  if (content.includes('soon') || 
      content.includes('important')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Determine category
 */
function determineCategory(data) {
  if (data.category) return data.category;
  
  const content = (data.content || data.body || '').toLowerCase();
  
  if (content.includes('invoice') || content.includes('payment')) return 'finance';
  if (content.includes('interview') || content.includes('job')) return 'interviews';
  if (content.includes('plan') || content.includes('schedule')) return 'planning';
  
  return 'general';
}

/**
 * Determine project
 */
function determineProject(data) {
  if (data.project) return data.project;
  
  const content = (data.content || data.body || '').toLowerCase();
  
  if (content.includes('house') || 
      content.includes('mortgage') || 
      content.includes('property')) {
    return 'home-purchase';
  }
  
  if (content.includes('job') || 
      content.includes('interview') || 
      content.includes('resume')) {
    return 'career-change';
  }
  
  if (content.includes('family') || 
      content.includes('reunion') || 
      content.includes('event')) {
    return 'family-event';
  }
  
  return 'home-purchase'; // Default for demo
}

/**
 * Extract subject from content
 */
function extractSubject(data) {
  const content = data.content || data.body || '';
  return content.split('\n')[0].substring(0, 50);
}

/**
 * Extract source-specific metadata
 */
function extractSourceSpecific(data) {
  const sourceSpecific = {};
  
  // Copy over any source-specific fields
  if (data.metadata && data.metadata.sourceSpecific) {
    Object.assign(sourceSpecific, data.metadata.sourceSpecific);
  }
  
  // Email-specific fields
  if (data.isStarred) sourceSpecific.isStarred = data.isStarred;
  if (data.folder) sourceSpecific.folder = data.folder;
  
  // Document-specific fields
  if (data.fileType) sourceSpecific.fileType = data.fileType;
  if (data.fileSize) sourceSpecific.fileSize = data.fileSize;
  if (data.dateCreated) sourceSpecific.dateCreated = data.dateCreated;
  if (data.dateModified) sourceSpecific.dateModified = data.dateModified;
  if (data.hasImages !== undefined) sourceSpecific.hasImages = data.hasImages;
  if (data.imageCount !== undefined) sourceSpecific.imageCount = data.imageCount;
  if (data.hasCharts !== undefined) sourceSpecific.hasCharts = data.hasCharts;
  if (data.chartCount !== undefined) sourceSpecific.chartCount = data.chartCount;
  if (data.hasTables !== undefined) sourceSpecific.hasTables = data.hasTables;
  if (data.tableCount !== undefined) sourceSpecific.tableCount = data.tableCount;
  
  // Social-specific fields
  if (data.platform) sourceSpecific.platform = data.platform;
  if (data.likes !== undefined) sourceSpecific.likes = data.likes;
  if (data.shares !== undefined) sourceSpecific.shares = data.shares;
  if (data.comments !== undefined) sourceSpecific.comments = data.comments;
  if (data.hasMedia !== undefined) sourceSpecific.hasMedia = data.hasMedia;
  if (data.mediaType) sourceSpecific.mediaType = data.mediaType;
  if (data.mediaCount !== undefined) sourceSpecific.mediaCount = data.mediaCount;
  if (data.location) sourceSpecific.location = data.location;
  
  return sourceSpecific;
}

/**
 * Validate incoming communication data
 */
function validateCommunication(data) {
  // Basic validation
  if (!data) return false;
  
  // Must have content or body
  if (!data.content && !data.body) return false;
  
  return true;
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get S3 key for storing the communication
 */
function getS3Key(communication) {
  const date = new Date(communication.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${communication.type}/${year}/${month}/${day}/${communication.id}.json`;
}

/**
 * Store communication in S3
 */
async function storeInS3(communication, key) {
  const params = {
    Bucket: RAW_BUCKET,
    Key: key,
    Body: JSON.stringify(communication),
    ContentType: 'application/json'
  };
  
  await s3.putObject(params).promise();
  console.log(`Stored communication in S3: ${key}`);
}

/**
 * Store communication metadata in DynamoDB
 */
async function storeInDynamoDB(communication) {
  // Extract sender ID for the GSI
  const sender_id = communication.sender ? communication.sender.id : 'unknown';
  
  const params = {
    TableName: COMMUNICATIONS_TABLE,
    Item: {
      id: communication.id,
      timestamp: communication.timestamp,
      type: communication.type,
      source: communication.source,
      subject: communication.subject,
      sender_id: sender_id,
      project: communication.project,
      metadata: communication.metadata,
      s3Key: getS3Key(communication)
    }
  };
  
  await dynamodb.put(params).promise();
  console.log(`Stored communication metadata in DynamoDB: ${communication.id}`);
}
