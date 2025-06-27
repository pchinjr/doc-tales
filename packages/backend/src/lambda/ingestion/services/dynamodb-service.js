/**
 * DynamoDB Service
 * 
 * A service layer for interacting with DynamoDB that can be easily mocked for testing.
 * Updated to use AWS SDK v3 for better performance and tree-shaking.
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  DynamoDBDocumentClient, 
  QueryCommand, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  BatchWriteCommand, 
  BatchGetCommand, 
  ScanCommand 
} = require("@aws-sdk/lib-dynamodb");

class DynamoDBService {
  constructor(options = {}) {
    this.tableName = options.tableName || process.env.COMMUNICATIONS_TABLE;
    this.userProfilesTableName = options.userProfilesTableName || process.env.USER_PROFILES_TABLE;
    
    // Create DynamoDB client with region configuration
    const client = new DynamoDBClient({
      region: options.region || process.env.AWS_REGION || "us-east-1"
    });
    
    // Create document client from the base client
    this.documentClient = options.documentClient || DynamoDBDocumentClient.from(client);
  }

  /**
   * Execute a query operation
   */
  async query(params) {
    const command = new QueryCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Execute a get operation
   */
  async get(params) {
    const command = new GetCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Execute a put operation
   */
  async put(params) {
    const command = new PutCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Execute an update operation
   */
  async update(params) {
    const command = new UpdateCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Execute a delete operation
   */
  async delete(params) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Execute a batch write operation
   */
  async batchWrite(params) {
    const command = new BatchWriteCommand(params);
    return this.documentClient.send(command);
  }

  /**
   * Execute a batch get operation
   */
  async batchGet(params) {
    const command = new BatchGetCommand(params);
    return this.documentClient.send(command);
  }

  /**
   * Execute a scan operation (use sparingly)
   */
  async scan(params) {
    const command = new ScanCommand({
      TableName: this.tableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Get a user profile
   */
  async getUserProfile(params) {
    const command = new GetCommand({
      TableName: this.userProfilesTableName,
      ...params
    });
    return this.documentClient.send(command);
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(params) {
    const command = new UpdateCommand({
      TableName: this.userProfilesTableName,
      ...params
    });
    return this.documentClient.send(command);
  }
}

module.exports = DynamoDBService;
