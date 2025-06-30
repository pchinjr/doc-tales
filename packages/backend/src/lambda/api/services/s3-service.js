/**
 * S3 Service
 * 
 * A service layer for interacting with S3 that can be easily mocked for testing.
 * Updated to use AWS SDK v3 for better performance and tree-shaking.
 */

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class S3Service {
  constructor(options = {}) {
    this.bucketName = options.bucketName || process.env.RAW_BUCKET;
    
    // Create S3 client with region configuration
    this.s3Client = options.s3Client || new S3Client({
      region: options.region || process.env.AWS_REGION || "us-east-1"
    });
  }

  /**
   * Get an object from S3
   */
  async getObject(params) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      ...params
    });
    return this.s3Client.send(command);
  }

  /**
   * Put an object in S3
   */
  async putObject(params) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      ...params
    });
    return this.s3Client.send(command);
  }

  /**
   * Delete an object from S3
   */
  async deleteObject(params) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      ...params
    });
    return this.s3Client.send(command);
  }

  /**
   * List objects in S3
   */
  async listObjects(params) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      ...params
    });
    return this.s3Client.send(command);
  }

  /**
   * Get a signed URL for an object
   */
  async getSignedUrl(operation, params) {
    // Map v2 operation names to v3 commands
    let command;
    switch (operation) {
      case "getObject":
        command = new GetObjectCommand({
          Bucket: this.bucketName,
          ...params
        });
        break;
      case "putObject":
        command = new PutObjectCommand({
          Bucket: this.bucketName,
          ...params
        });
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}

module.exports = S3Service;
