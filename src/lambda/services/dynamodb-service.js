/**
 * DynamoDB Service
 * 
 * A service layer for interacting with DynamoDB that can be easily mocked for testing.
 */

const AWS = require("aws-sdk");

class DynamoDBService {
  constructor(options = {}) {
    this.tableName = options.tableName || process.env.COMMUNICATIONS_TABLE;
    this.userProfilesTableName = options.userProfilesTableName || process.env.USER_PROFILES_TABLE;
    
    // Configure AWS SDK with region for production
    AWS.config.update({
      region: options.region || process.env.AWS_REGION || "us-east-1"
    });
    
    this.documentClient = options.documentClient || new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Execute a query operation
   */
  async query(params) {
    return this.documentClient.query({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Execute a get operation
   */
  async get(params) {
    return this.documentClient.get({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Execute a put operation
   */
  async put(params) {
    return this.documentClient.put({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Execute an update operation
   */
  async update(params) {
    return this.documentClient.update({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Execute a delete operation
   */
  async delete(params) {
    return this.documentClient.delete({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Execute a batch write operation
   */
  async batchWrite(params) {
    return this.documentClient.batchWrite(params).promise();
  }

  /**
   * Execute a batch get operation
   */
  async batchGet(params) {
    return this.documentClient.batchGet(params).promise();
  }

  /**
   * Execute a scan operation (use sparingly)
   */
  async scan(params) {
    return this.documentClient.scan({
      TableName: this.tableName,
      ...params
    }).promise();
  }

  /**
   * Get a user profile
   */
  async getUserProfile(params) {
    return this.documentClient.get({
      TableName: this.userProfilesTableName,
      ...params
    }).promise();
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(params) {
    return this.documentClient.update({
      TableName: this.userProfilesTableName,
      ...params
    }).promise();
  }
}

module.exports = DynamoDBService;
