/**
 * S3 Service
 * 
 * A service layer for interacting with S3 that can be easily mocked for testing.
 */

const AWS = require('aws-sdk');

class S3Service {
  constructor(options = {}) {
    this.bucketName = options.bucketName || process.env.RAW_BUCKET;
    
    // Configure AWS SDK with region for production
    AWS.config.update({
      region: options.region || process.env.AWS_REGION || 'us-east-1'
    });
    
    this.s3Client = options.s3Client || new AWS.S3();
  }

  /**
   * Get an object from S3
   */
  async getObject(params) {
    return this.s3Client.getObject({
      Bucket: this.bucketName,
      ...params
    }).promise();
  }

  /**
   * Put an object in S3
   */
  async putObject(params) {
    return this.s3Client.putObject({
      Bucket: this.bucketName,
      ...params
    }).promise();
  }

  /**
   * Delete an object from S3
   */
  async deleteObject(params) {
    return this.s3Client.deleteObject({
      Bucket: this.bucketName,
      ...params
    }).promise();
  }

  /**
   * List objects in S3
   */
  async listObjects(params) {
    return this.s3Client.listObjectsV2({
      Bucket: this.bucketName,
      ...params
    }).promise();
  }

  /**
   * Get a signed URL for an object
   */
  getSignedUrl(operation, params) {
    return this.s3Client.getSignedUrl(operation, {
      Bucket: this.bucketName,
      ...params
    });
  }
}

module.exports = S3Service;
