/**
 * ML-Powered Dimension Extraction Lambda Function
 * 
 * This function extracts dimensions from communications using our new ML services
 * and updates the DynamoDB record with the extracted dimensions.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DimensionMapper } from '@doc-tales/common';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const dimensionMapper = new DimensionMapper(process.env.AWS_REGION || 'us-east-1');

/**
 * Lambda handler for dimension extraction
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Dimension extraction started', { event, context });

  try {
    // Parse the event - could be from S3 trigger or direct API call
    const { communicationId, s3Bucket, s3Key, text } = parseEvent(event);

    if (!communicationId) {
      return createErrorResponse(400, 'Missing communicationId');
    }

    // Get communication text
    let communicationText = text;
    if (!communicationText && s3Bucket && s3Key) {
      communicationText = await getTextFromS3(s3Bucket, s3Key);
    }

    if (!communicationText) {
      return createErrorResponse(400, 'No communication text available');
    }

    // Extract dimensions using ML services
    console.log('Extracting dimensions for communication:', communicationId);
    const extractionResult = await dimensionMapper.extractDimensions(
      communicationText,
      { 
        communicationId,
        timestamp: new Date().toISOString(),
        source: 'lambda-extraction'
      }
    );

    // Update DynamoDB with extracted dimensions
    await updateCommunicationWithDimensions(communicationId, extractionResult);

    console.log('Dimension extraction completed successfully', {
      communicationId,
      processingTime: extractionResult.extractionMetadata.processingTime,
      confidenceScore: extractionResult.extractionMetadata.confidenceScore
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        communicationId,
        dimensions: extractionResult.dimensions,
        metadata: extractionResult.extractionMetadata
      })
    };

  } catch (error) {
    console.error('Error in dimension extraction:', error);
    
    return createErrorResponse(
      500, 
      'Internal server error during dimension extraction',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * Parse incoming event to extract parameters
 */
function parseEvent(event: APIGatewayProxyEvent): {
  communicationId?: string;
  s3Bucket?: string;
  s3Key?: string;
  text?: string;
} {
  // Handle direct API Gateway request
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      return {
        communicationId: body.communicationId,
        s3Bucket: body.s3Bucket,
        s3Key: body.s3Key,
        text: body.text
      };
    } catch (error) {
      console.error('Error parsing request body:', error);
    }
  }

  // Handle query parameters
  if (event.queryStringParameters) {
    return {
      communicationId: event.queryStringParameters.communicationId,
      s3Bucket: event.queryStringParameters.s3Bucket,
      s3Key: event.queryStringParameters.s3Key,
      text: event.queryStringParameters.text
    };
  }

  // Handle S3 event (if triggered by S3)
  if ((event as any).Records) {
    const s3Record = (event as any).Records[0]?.s3;
    if (s3Record) {
      return {
        s3Bucket: s3Record.bucket.name,
        s3Key: decodeURIComponent(s3Record.object.key.replace(/\+/g, ' ')),
        communicationId: extractCommunicationIdFromS3Key(s3Record.object.key)
      };
    }
  }

  return {};
}

/**
 * Get text content from S3
 */
async function getTextFromS3(bucket: string, key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('No content in S3 object');
    }

    // Convert stream to string
    const chunks: Buffer[] = [];
    const stream = response.Body as any;
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    
  } catch (error) {
    console.error('Error reading from S3:', error);
    throw new Error(`Failed to read S3 object: ${bucket}/${key}`);
  }
}

/**
 * Update DynamoDB communication record with extracted dimensions
 */
async function updateCommunicationWithDimensions(
  communicationId: string,
  extractionResult: any
): Promise<void> {
  try {
    const updateCommand = new UpdateItemCommand({
      TableName: process.env.COMMUNICATIONS_TABLE || 'doc-tales-communications',
      Key: {
        id: { S: communicationId }
      },
      UpdateExpression: `
        SET 
          dimensions = :dimensions,
          extractionMetadata = :metadata,
          lastProcessed = :timestamp,
          #status = :status
      `,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':dimensions': { S: JSON.stringify(extractionResult.dimensions) },
        ':metadata': { S: JSON.stringify(extractionResult.extractionMetadata) },
        ':timestamp': { S: new Date().toISOString() },
        ':status': { S: 'processed' }
      }
    });

    await dynamoClient.send(updateCommand);
    console.log('Successfully updated DynamoDB record:', communicationId);
    
  } catch (error) {
    console.error('Error updating DynamoDB:', error);
    throw new Error(`Failed to update communication ${communicationId}: ${error}`);
  }
}

/**
 * Extract communication ID from S3 key
 */
function extractCommunicationIdFromS3Key(s3Key: string): string {
  // Assume S3 key format: communications/{communicationId}/content.txt
  const parts = s3Key.split('/');
  return parts.length > 1 ? parts[1] : s3Key.replace(/\.[^/.]+$/, '');
}

/**
 * Create error response
 */
function createErrorResponse(
  statusCode: number, 
  message: string, 
  details?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: false,
      error: message,
      details: details || undefined,
      timestamp: new Date().toISOString()
    })
  };
}

// Export for testing
export { dimensionMapper, dynamoClient, s3Client };
