// Dimension Extraction Integration Service
// Integrates ML dimension extraction with existing communication processing pipeline

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

export interface IntegrationConfig {
  dimensionExtractionFunctionName: string;
  communicationsTableName: string;
  region: string;
  enableAsyncProcessing: boolean;
}

export interface CommunicationRecord {
  id: string;
  content: string;
  source: string;
  timestamp: string;
  sender?: string;
  subject?: string;
  metadata?: any;
}

/**
 * Service for integrating ML dimension extraction with communication processing
 */
export class DimensionExtractionIntegrator {
  private lambdaClient: LambdaClient;
  private dynamoClient: DynamoDBClient;
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.lambdaClient = new LambdaClient({ region: config.region });
    this.dynamoClient = new DynamoDBClient({ region: config.region });
  }

  /**
   * Process communication and trigger dimension extraction
   */
  async processCommunication(communication: CommunicationRecord): Promise<{
    success: boolean;
    communicationId: string;
    dimensionExtractionTriggered: boolean;
    error?: string;
  }> {
    try {
      console.log('Processing communication for dimension extraction:', communication.id);

      // Store communication in DynamoDB first
      await this.storeCommunication(communication);

      // Trigger dimension extraction
      const extractionTriggered = await this.triggerDimensionExtraction(communication);

      return {
        success: true,
        communicationId: communication.id,
        dimensionExtractionTriggered: extractionTriggered
      };

    } catch (error) {
      console.error('Error processing communication:', error);
      return {
        success: false,
        communicationId: communication.id,
        dimensionExtractionTriggered: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store communication in DynamoDB
   */
  private async storeCommunication(communication: CommunicationRecord): Promise<void> {
    const updateCommand = new UpdateItemCommand({
      TableName: this.config.communicationsTableName,
      Key: {
        id: { S: communication.id }
      },
      UpdateExpression: `
        SET 
          content = :content,
          #source = :source,
          #timestamp = :timestamp,
          sender = :sender,
          subject = :subject,
          metadata = :metadata,
          #status = :status,
          createdAt = if_not_exists(createdAt, :timestamp),
          updatedAt = :timestamp
      `,
      ExpressionAttributeNames: {
        '#source': 'source',
        '#timestamp': 'timestamp',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':content': { S: communication.content },
        ':source': { S: communication.source },
        ':timestamp': { S: communication.timestamp },
        ':sender': { S: communication.sender || '' },
        ':subject': { S: communication.subject || '' },
        ':metadata': { S: JSON.stringify(communication.metadata || {}) },
        ':status': { S: 'ingested' }
      }
    });

    await this.dynamoClient.send(updateCommand);
    console.log('Communication stored in DynamoDB:', communication.id);
  }

  /**
   * Trigger dimension extraction Lambda function
   */
  private async triggerDimensionExtraction(communication: CommunicationRecord): Promise<boolean> {
    try {
      const payload = {
        communicationId: communication.id,
        text: communication.content,
        metadata: {
          source: communication.source,
          timestamp: communication.timestamp,
          sender: communication.sender,
          subject: communication.subject,
          ...communication.metadata
        }
      };

      if (this.config.enableAsyncProcessing) {
        // Asynchronous invocation
        const invokeCommand = new InvokeCommand({
          FunctionName: this.config.dimensionExtractionFunctionName,
          InvocationType: 'Event', // Async
          Payload: JSON.stringify(payload)
        });

        await this.lambdaClient.send(invokeCommand);
        console.log('Dimension extraction triggered asynchronously for:', communication.id);
        return true;

      } else {
        // Synchronous invocation
        const invokeCommand = new InvokeCommand({
          FunctionName: this.config.dimensionExtractionFunctionName,
          InvocationType: 'RequestResponse', // Sync
          Payload: JSON.stringify(payload)
        });

        const response = await this.lambdaClient.send(invokeCommand);
        
        if (response.StatusCode === 200) {
          console.log('Dimension extraction completed synchronously for:', communication.id);
          return true;
        } else {
          console.error('Dimension extraction failed:', response.StatusCode);
          return false;
        }
      }

    } catch (error) {
      console.error('Error triggering dimension extraction:', error);
      return false;
    }
  }

  /**
   * Check if communication has been processed for dimensions
   */
  async isProcessed(communicationId: string): Promise<boolean> {
    try {
      const getCommand = new GetItemCommand({
        TableName: this.config.communicationsTableName,
        Key: {
          id: { S: communicationId }
        },
        ProjectionExpression: '#status, dimensions'
      });

      const response = await this.dynamoClient.send(getCommand);
      
      if (!response.Item) {
        return false;
      }

      const status = response.Item.status?.S;
      const hasDimensions = !!response.Item.dimensions?.S;

      return status === 'processed' && hasDimensions;

    } catch (error) {
      console.error('Error checking processing status:', error);
      return false;
    }
  }

  /**
   * Batch process multiple communications
   */
  async batchProcessCommunications(communications: CommunicationRecord[]): Promise<{
    processed: number;
    failed: number;
    results: Array<{
      communicationId: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const results = [];
    let processed = 0;
    let failed = 0;

    for (const communication of communications) {
      const result = await this.processCommunication(communication);
      
      results.push({
        communicationId: result.communicationId,
        success: result.success,
        error: result.error
      });

      if (result.success) {
        processed++;
      } else {
        failed++;
      }
    }

    return { processed, failed, results };
  }

  /**
   * Reprocess communication for dimension extraction
   */
  async reprocessCommunication(communicationId: string): Promise<boolean> {
    try {
      // Get existing communication
      const getCommand = new GetItemCommand({
        TableName: this.config.communicationsTableName,
        Key: {
          id: { S: communicationId }
        }
      });

      const response = await this.dynamoClient.send(getCommand);
      
      if (!response.Item) {
        console.error('Communication not found:', communicationId);
        return false;
      }

      // Reconstruct communication record
      const communication: CommunicationRecord = {
        id: communicationId,
        content: response.Item.content?.S || '',
        source: response.Item.source?.S || '',
        timestamp: response.Item.timestamp?.S || new Date().toISOString(),
        sender: response.Item.sender?.S,
        subject: response.Item.subject?.S,
        metadata: response.Item.metadata?.S ? JSON.parse(response.Item.metadata.S) : {}
      };

      // Trigger dimension extraction
      return await this.triggerDimensionExtraction(communication);

    } catch (error) {
      console.error('Error reprocessing communication:', error);
      return false;
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    total: number;
    processed: number;
    pending: number;
    failed: number;
  }> {
    // This would require a more complex query or scan
    // For now, return placeholder stats
    return {
      total: 0,
      processed: 0,
      pending: 0,
      failed: 0
    };
  }
}
