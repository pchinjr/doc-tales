/**
 * Dimension Extraction Lambda Function
 * 
 * This function extracts dimensions from communications stored in S3
 * and updates the DynamoDB record with the extracted dimensions.
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const comprehend = new AWS.Comprehend();

// Environment variables
const RAW_BUCKET = process.env.RAW_BUCKET;
const COMMUNICATIONS_TABLE = process.env.COMMUNICATIONS_TABLE;

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // For S3 events
    if (event.Records && event.Records[0].eventSource === 'aws:s3') {
      return await handleS3Event(event);
    }
    
    // For direct invocation
    if (event.communicationId) {
      return await processCommunication(event.communicationId);
    }
    
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unsupported event type' })
    };
  } catch (error) {
    console.error('Error extracting dimensions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to extract dimensions' })
    };
  }
};

/**
 * Handle S3 event
 */
async function handleS3Event(event) {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  
  console.log(`Processing new file in S3: ${bucket}/${key}`);
  
  // Extract communication ID from the key
  const communicationId = key.split('/').pop().replace('.json', '');
  
  await processCommunication(communicationId, key);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Dimensions extracted successfully',
      communicationId
    })
  };
}

/**
 * Process a communication to extract dimensions
 */
async function processCommunication(communicationId, s3Key) {
  // Get the communication from S3
  const communication = await getCommunicationFromS3(communicationId, s3Key);
  
  // Extract dimensions
  const dimensions = await extractDimensions(communication);
  
  // Update DynamoDB with dimensions
  await updateDynamoDBWithDimensions(communicationId, dimensions);
  
  return {
    communicationId,
    dimensions
  };
}

/**
 * Get communication from S3
 */
async function getCommunicationFromS3(communicationId, providedKey) {
  let key = providedKey;
  
  // If key not provided, look up in DynamoDB first
  if (!key) {
    const dbResult = await dynamodb.get({
      TableName: COMMUNICATIONS_TABLE,
      Key: { id: communicationId }
    }).promise();
    
    if (!dbResult.Item || !dbResult.Item.s3Key) {
      throw new Error(`Communication not found in DynamoDB: ${communicationId}`);
    }
    
    key = dbResult.Item.s3Key;
  }
  
  // Get the object from S3
  const s3Result = await s3.getObject({
    Bucket: RAW_BUCKET,
    Key: key
  }).promise();
  
  return JSON.parse(s3Result.Body.toString());
}

/**
 * Extract dimensions from a communication
 */
async function extractDimensions(communication) {
  // Extract each dimension
  const temporal = await extractTemporalDimension(communication);
  const relationship = await extractRelationshipDimension(communication);
  const visual = await extractVisualDimension(communication);
  const analytical = await extractAnalyticalDimension(communication);
  
  // Calculate confidence scores
  const confidenceScores = {
    temporal: calculateTemporalConfidence(temporal),
    relationship: calculateRelationshipConfidence(relationship),
    visual: calculateVisualConfidence(visual),
    analytical: calculateAnalyticalConfidence(analytical)
  };
  
  return {
    temporal,
    relationship,
    visual,
    analytical,
    confidenceScores
  };
}

/**
 * Extract temporal dimension
 */
async function extractTemporalDimension(communication) {
  // Extract deadline from content using pattern matching
  const deadlineMatch = communication.content.match(/deadline[:\s]*([\w\s,]+)/i);
  const deadline = deadlineMatch ? deadlineMatch[1].trim() : undefined;
  
  // Calculate days until deadline if it exists
  let daysUntilDeadline;
  if (deadline) {
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      // If we can't parse the date, leave it undefined
    }
  }
  
  // Use AWS Comprehend to detect dates in the content
  const entities = await detectEntities(communication.content);
  const dates = entities
    .filter(entity => entity.Type === 'DATE')
    .map(entity => entity.Text);
  
  // Determine if this requires action based on content and urgency
  const requiresAction = 
    communication.metadata.urgency === 'high' || 
    communication.content.toLowerCase().includes('please') ||
    communication.content.toLowerCase().includes('need') ||
    communication.content.toLowerCase().includes('required') ||
    communication.content.toLowerCase().includes('action');
  
  return {
    deadline,
    urgency: communication.metadata.urgency,
    chronology: {
      created: communication.timestamp,
      lastUpdated: communication.timestamp,
      followUpDate: deadline
    },
    timeContext: {
      isRecent: isRecent(communication.timestamp),
      isPast: isPast(communication.timestamp),
      requiresAction,
      daysUntilDeadline
    },
    detectedDates: dates
  };
}

/**
 * Extract relationship dimension
 */
async function extractRelationshipDimension(communication) {
  // Determine connection strength based on communication patterns
  let connectionStrength = 'medium';
  
  // For the MVP, use simple rules
  if (communication.type === 'email' && communication.metadata.category === 'finance') {
    connectionStrength = 'strong'; // Financial communications are important
  } else if (communication.type === 'social') {
    connectionStrength = 'weak'; // Social media connections are typically weaker
  }
  
  // Determine frequency based on metadata
  let frequency = 'occasional';
  
  // For the MVP, use the source type to guess frequency
  if (communication.type === 'email') {
    frequency = 'frequent';
  } else if (communication.type === 'document') {
    frequency = 'occasional';
  } else {
    frequency = 'rare';
  }
  
  // Use AWS Comprehend to detect people and organizations
  const entities = await detectEntities(communication.content);
  const people = entities
    .filter(entity => entity.Type === 'PERSON')
    .map(entity => entity.Text);
  
  const organizations = entities
    .filter(entity => entity.Type === 'ORGANIZATION')
    .map(entity => entity.Text);
  
  // Determine context based on project and content
  const personal = 
    communication.project === 'family-event' || 
    communication.content.toLowerCase().includes('family') ||
    communication.content.toLowerCase().includes('friend');
    
  const professional = 
    communication.project === 'career-change' || 
    communication.content.toLowerCase().includes('work') ||
    communication.content.toLowerCase().includes('job') ||
    communication.content.toLowerCase().includes('interview');
    
  const projectSpecific = 
    communication.project === 'home-purchase' || 
    communication.content.toLowerCase().includes('house') ||
    communication.content.toLowerCase().includes('property');
  
  return {
    connectionStrength,
    frequency,
    lastInteraction: communication.timestamp,
    networkPosition: {
      isDirectConnection: true, // For MVP, assume all are direct connections
      sharedConnections: communication.recipients.length,
      relevanceScore: calculateRelevanceScore(communication)
    },
    context: {
      personal,
      professional,
      projectSpecific
    },
    detectedPeople: people,
    detectedOrganizations: organizations
  };
}

/**
 * Extract visual dimension
 */
async function extractVisualDimension(communication) {
  // Determine if the communication has images
  const hasImages = Boolean(communication.attachments.length > 0 || 
    (communication.metadata.sourceSpecific && 
     typeof communication.metadata.sourceSpecific === 'object' &&
     'hasImages' in communication.metadata.sourceSpecific &&
     communication.metadata.sourceSpecific.hasImages));
  
  // Get document type if available
  const documentType = communication.metadata.sourceSpecific && 
    typeof communication.metadata.sourceSpecific === 'object' &&
    'fileType' in communication.metadata.sourceSpecific ? 
    String(communication.metadata.sourceSpecific.fileType) : undefined;
  
  // Count visual elements
  const charts = communication.metadata.sourceSpecific && 
    typeof communication.metadata.sourceSpecific === 'object' &&
    'chartCount' in communication.metadata.sourceSpecific ? 
    Number(communication.metadata.sourceSpecific.chartCount) : 0;
  
  const tables = communication.metadata.sourceSpecific && 
    typeof communication.metadata.sourceSpecific === 'object' &&
    'tableCount' in communication.metadata.sourceSpecific ? 
    Number(communication.metadata.sourceSpecific.tableCount) : 0;
  
  const images = communication.metadata.sourceSpecific && 
    typeof communication.metadata.sourceSpecific === 'object' &&
    'imageCount' in communication.metadata.sourceSpecific ? 
    Number(communication.metadata.sourceSpecific.imageCount) : 
    (communication.metadata.sourceSpecific && 
     typeof communication.metadata.sourceSpecific === 'object' &&
     'hasImages' in communication.metadata.sourceSpecific && 
     communication.metadata.sourceSpecific.hasImages ? 1 : 0);
  
  const attachments = communication.attachments.length;
  
  // Determine visual category
  let visualCategory = 'text-only';
  
  if (charts > 0 && tables > 0) {
    visualCategory = 'mixed';
  } else if (charts > 0) {
    visualCategory = 'chart';
  } else if (images > 0) {
    visualCategory = 'image';
  } else if (documentType) {
    visualCategory = 'document';
  }
  
  // Extract location if available
  const location = communication.metadata.sourceSpecific && 
    typeof communication.metadata.sourceSpecific === 'object' &&
    'location' in communication.metadata.sourceSpecific ? 
    String(communication.metadata.sourceSpecific.location) : undefined;
  
  // Use AWS Comprehend to detect locations
  const entities = await detectEntities(communication.content);
  const locations = entities
    .filter(entity => entity.Type === 'LOCATION')
    .map(entity => entity.Text);
  
  return {
    hasImages,
    documentType,
    visualElements: {
      charts,
      tables,
      images,
      attachments
    },
    spatialContext: location || locations.length > 0 ? {
      location: location || locations[0],
      coordinates: undefined,
      relatedLocations: locations
    } : undefined,
    visualCategory
  };
}

/**
 * Extract analytical dimension
 */
async function extractAnalyticalDimension(communication) {
  // Extract categories and tags
  const categories = [communication.metadata.category];
  
  // Extract tags using simple keyword matching
  const tags = [];
  if (communication.content.toLowerCase().includes('urgent')) tags.push('urgent');
  if (communication.content.toLowerCase().includes('follow up')) tags.push('follow-up');
  if (communication.content.toLowerCase().includes('review')) tags.push('review');
  if (communication.content.toLowerCase().includes('approve')) tags.push('approval');
  if (communication.content.toLowerCase().includes('meeting')) tags.push('meeting');
  
  // Add project as a tag
  tags.push(communication.project.replace('-', ' '));
  
  // Use AWS Comprehend for sentiment analysis
  const sentiment = await detectSentiment(communication.content);
  
  // Use AWS Comprehend for entity extraction
  const entities = await detectEntities(communication.content);
  
  // Use AWS Comprehend for key phrase extraction
  const keyPhrases = await detectKeyPhrases(communication.content);
  
  // Extract entities by type
  const people = entities
    .filter(entity => entity.Type === 'PERSON')
    .map(entity => entity.Text);
  
  const organizations = entities
    .filter(entity => entity.Type === 'ORGANIZATION')
    .map(entity => entity.Text);
  
  const locations = entities
    .filter(entity => entity.Type === 'LOCATION')
    .map(entity => entity.Text);
  
  const dates = entities
    .filter(entity => entity.Type === 'DATE')
    .map(entity => entity.Text);
  
  // Extract concepts from key phrases
  const concepts = keyPhrases.slice(0, 5);
  
  // Calculate metrics
  const wordCount = communication.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  // Determine complexity
  let complexity = 'medium';
  if (wordCount > 300) {
    complexity = 'high';
  } else if (wordCount < 50) {
    complexity = 'low';
  }
  
  // Calculate information density
  const allEntities = [...people, ...organizations, ...locations, ...dates, ...concepts];
  const informationDensity = allEntities.length / wordCount * 100;
  
  // Determine structure
  const hasHeadings = communication.content.match(/^#+\s+.+$/m) !== null;
  const hasBulletPoints = communication.content.match(/^[*-]\s+.+$/m) !== null;
  const hasNumberedLists = communication.content.match(/^\d+\.\s+.+$/m) !== null;
  const paragraphCount = communication.content.split(/\n\s*\n/).length;
  
  return {
    categories,
    tags,
    sentiment: sentiment.Sentiment.toLowerCase(),
    entities: {
      people,
      organizations,
      locations,
      dates,
      concepts
    },
    metrics: {
      wordCount,
      readingTime,
      complexity,
      informationDensity
    },
    structure: {
      hasHeadings,
      hasBulletPoints,
      hasNumberedLists,
      paragraphCount
    }
  };
}

/**
 * Update DynamoDB with extracted dimensions
 */
async function updateDynamoDBWithDimensions(communicationId, dimensions) {
  try {
    // First, get the full item to retrieve the timestamp
    const getParams = {
      TableName: COMMUNICATIONS_TABLE,
      Key: {
        id: communicationId
      }
    };
    
    const result = await dynamodb.get(getParams).promise();
    if (!result.Item || !result.Item.timestamp) {
      throw new Error(`Communication not found or missing timestamp: ${communicationId}`);
    }
    
    // Now update with both hash and range keys
    const updateParams = {
      TableName: COMMUNICATIONS_TABLE,
      Key: {
        id: communicationId,
        timestamp: result.Item.timestamp
      },
      UpdateExpression: 'set dimensions = :dimensions',
      ExpressionAttributeValues: {
        ':dimensions': dimensions
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    await dynamodb.update(updateParams).promise();
    console.log(`Updated DynamoDB with dimensions for: ${communicationId}`);
  } catch (error) {
    console.error(`Error updating DynamoDB: ${error}`);
    throw error;
  }
}

/**
 * Helper function to detect entities using AWS Comprehend
 */
async function detectEntities(text) {
  // Limit text length for Comprehend (max 5KB)
  const limitedText = text.substring(0, 5000);
  
  const params = {
    Text: limitedText,
    LanguageCode: 'en'
  };
  
  const result = await comprehend.detectEntities(params).promise();
  return result.Entities;
}

/**
 * Helper function to detect sentiment using AWS Comprehend
 */
async function detectSentiment(text) {
  // Limit text length for Comprehend (max 5KB)
  const limitedText = text.substring(0, 5000);
  
  const params = {
    Text: limitedText,
    LanguageCode: 'en'
  };
  
  return await comprehend.detectSentiment(params).promise();
}

/**
 * Helper function to detect key phrases using AWS Comprehend
 */
async function detectKeyPhrases(text) {
  // Limit text length for Comprehend (max 5KB)
  const limitedText = text.substring(0, 5000);
  
  const params = {
    Text: limitedText,
    LanguageCode: 'en'
  };
  
  const result = await comprehend.detectKeyPhrases(params).promise();
  return result.KeyPhrases.map(phrase => phrase.Text);
}

/**
 * Helper function to check if a date is recent (within the last week)
 */
function isRecent(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

/**
 * Helper function to check if a date is in the past
 */
function isPast(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  return date < now;
}

/**
 * Calculate relevance score for a communication
 */
function calculateRelevanceScore(communication) {
  // Simple relevance calculation based on urgency and recency
  let score = 0.5; // Start with neutral score
  
  // Adjust based on urgency
  if (communication.metadata.urgency === 'high') score += 0.3;
  if (communication.metadata.urgency === 'low') score -= 0.1;
  
  // Adjust based on recency
  if (isRecent(communication.timestamp)) score += 0.2;
  
  // Adjust based on project
  if (communication.project === 'home-purchase') score += 0.1;
  
  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate confidence scores for dimensions
 */
function calculateTemporalConfidence(temporal) {
  let score = 0.5;
  
  if (temporal.deadline) score += 0.2;
  if (temporal.timeContext.requiresAction) score += 0.1;
  if (temporal.timeContext.daysUntilDeadline !== undefined) score += 0.2;
  if (temporal.detectedDates && temporal.detectedDates.length > 0) score += 0.1;
  
  return Math.max(0, Math.min(1, score));
}

function calculateRelationshipConfidence(relationship) {
  let score = 0.5;
  
  if (relationship.connectionStrength === 'strong') score += 0.2;
  if (relationship.frequency === 'frequent') score += 0.1;
  if (relationship.networkPosition.sharedConnections > 0) score += 0.1;
  if (relationship.context.personal || relationship.context.professional) score += 0.1;
  if (relationship.detectedPeople && relationship.detectedPeople.length > 0) score += 0.1;
  
  return Math.max(0, Math.min(1, score));
}

function calculateVisualConfidence(visual) {
  let score = 0.5;
  
  if (visual.hasImages) score += 0.2;
  if (visual.visualElements.charts > 0) score += 0.1;
  if (visual.visualElements.tables > 0) score += 0.1;
  if (visual.spatialContext) score += 0.1;
  
  return Math.max(0, Math.min(1, score));
}

function calculateAnalyticalConfidence(analytical) {
  let score = 0.5;
  
  if (analytical.tags.length > 2) score += 0.1;
  if (analytical.entities.concepts.length > 0) score += 0.1;
  if (analytical.metrics.complexity === 'high') score += 0.1;
  if (analytical.structure.hasHeadings || 
      analytical.structure.hasBulletPoints || 
      analytical.structure.hasNumberedLists) score += 0.1;
  if (analytical.metrics.wordCount > 100) score += 0.1;
  
  return Math.max(0, Math.min(1, score));
}
