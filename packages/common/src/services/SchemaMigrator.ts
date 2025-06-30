// Schema Migration Utility
// Helps migrate existing communications to support ML dimensions

import { DynamoDBClient, ScanCommand, UpdateItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

export interface MigrationConfig {
  tableName: string;
  region: string;
  batchSize: number;
  dryRun: boolean;
}

export interface MigrationResult {
  totalScanned: number;
  totalUpdated: number;
  totalFailed: number;
  errors: string[];
  duration: number;
}

/**
 * Utility for migrating DynamoDB schema to support ML dimensions
 */
export class SchemaMigrator {
  private dynamoClient: DynamoDBClient;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.dynamoClient = new DynamoDBClient({ region: config.region });
  }

  /**
   * Migrate existing communications to support dimensions
   */
  async migrateCommunications(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      totalScanned: 0,
      totalUpdated: 0,
      totalFailed: 0,
      errors: [],
      duration: 0
    };

    console.log(`Starting migration (dry run: ${this.config.dryRun})`);

    try {
      let lastEvaluatedKey: any = undefined;
      
      do {
        // Scan for communications that need migration
        const scanCommand = new ScanCommand({
          TableName: this.config.tableName,
          FilterExpression: "begins_with(PK, :pk) AND attribute_not_exists(#status)",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":pk": { S: "COMM#" }
          },
          Limit: this.config.batchSize,
          ExclusiveStartKey: lastEvaluatedKey
        });

        const scanResponse = await this.dynamoClient.send(scanCommand);
        
        if (!scanResponse.Items || scanResponse.Items.length === 0) {
          break;
        }

        result.totalScanned += scanResponse.Items.length;
        console.log(`Scanned ${scanResponse.Items.length} items, total: ${result.totalScanned}`);

        // Process batch
        const batchResult = await this.processBatch(scanResponse.Items);
        result.totalUpdated += batchResult.updated;
        result.totalFailed += batchResult.failed;
        result.errors.push(...batchResult.errors);

        lastEvaluatedKey = scanResponse.LastEvaluatedKey;
        
        // Add delay to avoid throttling
        await this.delay(100);
        
      } while (lastEvaluatedKey);

    } catch (error) {
      console.error("Migration error:", error);
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    result.duration = Date.now() - startTime;
    console.log("Migration completed:", result);
    
    return result;
  }

  /**
   * Process a batch of communications
   */
  private async processBatch(items: any[]): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const result = { updated: 0, failed: 0, errors: [] as string[] };

    for (const item of items) {
      try {
        if (this.config.dryRun) {
          console.log(`[DRY RUN] Would update item: ${item.PK?.S}`);
          result.updated++;
        } else {
          await this.updateCommunicationForDimensions(item);
          result.updated++;
        }
      } catch (error) {
        result.failed++;
        const errorMsg = `Failed to update ${item.PK?.S}: ${error instanceof Error ? error.message : "Unknown error"}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return result;
  }

  /**
   * Update a single communication to support dimensions
   */
  private async updateCommunicationForDimensions(item: any): Promise<void> {
    const pk = item.PK?.S;
    const sk = item.SK?.S;
    
    if (!pk || !sk) {
      throw new Error("Invalid item: missing PK or SK");
    }

    // Add status and dimension-related fields
    const updateCommand = new UpdateItemCommand({
      TableName: this.config.tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk }
      },
      UpdateExpression: `
        SET 
          #status = if_not_exists(#status, :status),
          lastProcessed = if_not_exists(lastProcessed, :never),
          GSI1PK = if_not_exists(GSI1PK, :gsi1pk),
          GSI1SK = if_not_exists(GSI1SK, :gsi1sk)
      `,
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": { S: "ingested" },
        ":never": { S: "never" },
        ":gsi1pk": { S: "STATUS#ingested" },
        ":gsi1sk": { S: (item.timestamp?.S as string) || new Date().toISOString() }
      }
    });

    await this.dynamoClient.send(updateCommand);
  }

  /**
   * Validate migration results
   */
  async validateMigration(): Promise<{
    totalCommunications: number;
    withStatus: number;
    withDimensions: number;
    needsProcessing: number;
  }> {
    const result = {
      totalCommunications: 0,
      withStatus: 0,
      withDimensions: 0,
      needsProcessing: 0
    };

    try {
      let lastEvaluatedKey: any = undefined;
      
      do {
        const scanCommand = new ScanCommand({
          TableName: this.config.tableName,
          FilterExpression: "begins_with(PK, :pk)",
          ExpressionAttributeValues: {
            ":pk": { S: "COMM#" }
          },
          Limit: 100,
          ExclusiveStartKey: lastEvaluatedKey
        });

        const scanResponse = await this.dynamoClient.send(scanCommand);
        
        if (!scanResponse.Items || scanResponse.Items.length === 0) {
          break;
        }

        for (const item of scanResponse.Items) {
          result.totalCommunications++;
          
          if (item.status?.S) {
            result.withStatus++;
          }
          
          if (item.dimensions?.S) {
            result.withDimensions++;
          }
          
          if (item.status?.S === "ingested" || !item.status?.S) {
            result.needsProcessing++;
          }
        }

        lastEvaluatedKey = scanResponse.LastEvaluatedKey;
        
      } while (lastEvaluatedKey);

    } catch (error) {
      console.error("Validation error:", error);
    }

    return result;
  }

  /**
   * Rollback migration changes
   */
  async rollbackMigration(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      totalScanned: 0,
      totalUpdated: 0,
      totalFailed: 0,
      errors: [],
      duration: 0
    };

    console.log(`Starting rollback (dry run: ${this.config.dryRun})`);

    try {
      let lastEvaluatedKey: any = undefined;
      
      do {
        const scanCommand = new ScanCommand({
          TableName: this.config.tableName,
          FilterExpression: "begins_with(PK, :pk) AND attribute_exists(#status)",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":pk": { S: "COMM#" }
          },
          Limit: this.config.batchSize,
          ExclusiveStartKey: lastEvaluatedKey
        });

        const scanResponse = await this.dynamoClient.send(scanCommand);
        
        if (!scanResponse.Items || scanResponse.Items.length === 0) {
          break;
        }

        result.totalScanned += scanResponse.Items.length;

        for (const item of scanResponse.Items) {
          try {
            if (this.config.dryRun) {
              console.log(`[DRY RUN] Would rollback item: ${item.PK?.S}`);
              result.totalUpdated++;
            } else {
              await this.rollbackCommunication(item);
              result.totalUpdated++;
            }
          } catch (error) {
            result.totalFailed++;
            const errorMsg = `Failed to rollback ${item.PK?.S}: ${error instanceof Error ? error.message : "Unknown error"}`;
            result.errors.push(errorMsg);
          }
        }

        lastEvaluatedKey = scanResponse.LastEvaluatedKey;
        await this.delay(100);
        
      } while (lastEvaluatedKey);

    } catch (error) {
      result.errors.push(`Rollback failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Rollback a single communication
   */
  private async rollbackCommunication(item: any): Promise<void> {
    const updateCommand = new UpdateItemCommand({
      TableName: this.config.tableName,
      Key: {
        PK: item.PK,
        SK: item.SK
      },
      UpdateExpression: "REMOVE #status, dimensions, extractionMetadata, lastProcessed, GSI1PK, GSI1SK, GSI2PK, GSI2SK",
      ExpressionAttributeNames: {
        "#status": "status"
      }
    });

    await this.dynamoClient.send(updateCommand);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
