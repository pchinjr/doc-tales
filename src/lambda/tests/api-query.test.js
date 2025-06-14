/**
 * API Query Tests
 * 
 * Tests for the API Lambda's query functionality
 */

const test = require('tape');
const apiLambda = require('../api/index');
const { createMockDynamoDBService, createMockS3Service } = require('./mock-services');

// Test queryCommunications with project filter
test('API queryCommunications - project filter', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: (params) => {
        t.equal(params.IndexName, 'GSI1', 'Should use GSI1 for project queries');
        t.ok(params.KeyConditionExpression.includes('GSI1PK'), 'Should query by GSI1PK');
        
        return {
          Items: [
            { 
              PK: 'COMM', 
              SK: 'COMM#123', 
              GSI1PK: 'PROJ#home-purchase',
              subject: 'Test Communication' 
            }
          ],
          Count: 1,
          ScannedCount: 1
        };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev'
  });
  
  try {
    const result = await apiLambda.queryCommunications({ project: 'home-purchase' });
    t.equal(result.communications.length, 1, 'Should return one communication');
    t.equal(result.count, 1, 'Count should be 1');
    t.equal(result.communications[0].id, '123', 'Communication should have correct ID');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});

// Test queryCommunications with sender filter
test('API queryCommunications - sender filter', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: (params) => {
        t.equal(params.IndexName, 'GSI2', 'Should use GSI2 for sender queries');
        t.ok(params.KeyConditionExpression.includes('GSI2PK'), 'Should query by GSI2PK');
        
        return {
          Items: [
            { 
              PK: 'COMM', 
              SK: 'COMM#456', 
              GSI2PK: 'ENTITY#sender@example.com',
              subject: 'From Sender' 
            }
          ],
          Count: 1,
          ScannedCount: 1
        };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev'
  });
  
  try {
    const result = await apiLambda.queryCommunications({ sender: 'sender@example.com' });
    t.equal(result.communications.length, 1, 'Should return one communication');
    t.equal(result.communications[0].subject, 'From Sender', 'Should return correct communication');
    t.equal(result.communications[0].id, '456', 'Should extract ID from SK');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});

// Test queryCommunications with no filters
test('API queryCommunications - no filters', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: (params) => {
        t.equal(params.IndexName, undefined, 'Should use base table for no filters');
        t.ok(params.KeyConditionExpression.includes('PK'), 'Should query by PK');
        
        return {
          Items: [
            { PK: 'COMM', SK: 'COMM#123', subject: 'Test 1' },
            { PK: 'COMM', SK: 'COMM#456', subject: 'Test 2' }
          ],
          Count: 2,
          ScannedCount: 2
        };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev'
  });
  
  try {
    const result = await apiLambda.queryCommunications({});
    t.equal(result.communications.length, 2, 'Should return two communications');
    t.equal(result.communications[0].id, '123', 'First communication should have correct ID');
    t.equal(result.communications[1].id, '456', 'Second communication should have correct ID');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});

// Test queryCommunications with type filter
test('API queryCommunications - type filter', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: (params) => {
        t.ok(params.FilterExpression, 'Should have a filter expression');
        t.ok(params.FilterExpression.includes('commType = :type'), 'Should filter by type');
        t.equal(params.ExpressionAttributeValues[':type'], 'email', 'Should use correct type value');
        
        return {
          Items: [
            { PK: 'COMM', SK: 'COMM#789', subject: 'Email Test', commType: 'email' }
          ],
          Count: 1,
          ScannedCount: 2 // Simulating that filtering happened
        };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev'
  });
  
  try {
    const result = await apiLambda.queryCommunications({ type: 'email' });
    t.equal(result.communications.length, 1, 'Should return one communication');
    t.equal(result.communications[0].id, '789', 'Should have correct ID');
    t.equal(result.scannedCount, 2, 'Should report correct scanned count');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});

// Test getCommunicationData
test('API getCommunicationData - existing communication', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: (params) => {
        t.equal(params.KeyConditionExpression, 'PK = :pk AND SK = :sk', 'Should use correct key condition');
        t.equal(params.ExpressionAttributeValues[':pk'], 'COMM', 'Should use correct PK');
        t.equal(params.ExpressionAttributeValues[':sk'], 'COMM#123', 'Should use correct SK');
        
        return {
          Items: [
            { 
              PK: 'COMM', 
              SK: 'COMM#123', 
              subject: 'Test Communication',
              s3Key: 'raw/email/123.json'
            }
          ]
        };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev',
    responses: {
      getObject: (params) => {
        t.equal(params.Key, 'raw/email/123.json', 'Should use correct S3 key');
        
        return {
          Body: Buffer.from(JSON.stringify({
            content: 'This is the full content',
            metadata: { category: 'test' }
          }))
        };
      }
    }
  });
  
  try {
    const result = await apiLambda.getCommunicationData('123');
    t.ok(result, 'Should return a result');
    t.equal(result.id, '123', 'Should have correct ID');
    t.equal(result.content, 'This is the full content', 'Should include content from S3');
    t.equal(result.metadata.category, 'test', 'Should include metadata from S3');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});

// Test getCommunicationData - not found
test('API getCommunicationData - not found', async (t) => {
  // Save original services
  const originalDynamoService = apiLambda.services.dynamoService;
  const originalS3Service = apiLambda.services.s3Service;
  
  // Create mock services
  apiLambda.services.dynamoService = createMockDynamoDBService({
    tableName: 'doc-tales-communications-dev',
    responses: {
      query: () => {
        return { Items: [] };
      }
    }
  });
  
  apiLambda.services.s3Service = createMockS3Service({
    bucketName: 'doc-tales-raw-communications-dev'
  });
  
  try {
    const result = await apiLambda.getCommunicationData('nonexistent');
    t.equal(result, null, 'Should return null for non-existent communication');
  } catch (error) {
    t.fail(error);
  } finally {
    // Restore original services
    apiLambda.services.dynamoService = originalDynamoService;
    apiLambda.services.s3Service = originalS3Service;
    t.end();
  }
});
