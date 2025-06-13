/**
 * Test Helpers
 * 
 * Helper functions for setting up and tearing down tests
 */

const apiLambda = require('../api/index');

/**
 * Set up mocks for services
 * 
 * @param {Object} mocks - Object containing mock services
 * @returns {Object} Original services for restoration
 */
function setupMocks(mocks = {}) {
  const originals = {};
  
  if (mocks.dynamoService) {
    originals.dynamoService = apiLambda.services.dynamoService;
    apiLambda.services.dynamoService = mocks.dynamoService;
  }
  
  if (mocks.s3Service) {
    originals.s3Service = apiLambda.services.s3Service;
    apiLambda.services.s3Service = mocks.s3Service;
  }
  
  return originals;
}

/**
 * Restore original services
 * 
 * @param {Object} originals - Original services to restore
 */
function restoreMocks(originals) {
  if (originals.dynamoService) {
    apiLambda.services.dynamoService = originals.dynamoService;
  }
  
  if (originals.s3Service) {
    apiLambda.services.s3Service = originals.s3Service;
  }
}

/**
 * Create a mock DynamoDB service
 * 
 * @param {Object} mockResponses - Mock responses for DynamoDB methods
 * @returns {Object} Mock DynamoDB service
 */
function createMockDynamoService(mockResponses = {}) {
  return {
    query: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.query || { Items: [] });
    }),
    get: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.get || { Item: null });
    }),
    put: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.put || {});
    }),
    update: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.update || {});
    }),
    delete: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.delete || {});
    }),
    scan: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.scan || { Items: [] });
    }),
    getUserProfile: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.getUserProfile || { Item: null });
    }),
    updateUserProfile: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.updateUserProfile || {});
    })
  };
}

/**
 * Create a mock S3 service
 * 
 * @param {Object} mockResponses - Mock responses for S3 methods
 * @returns {Object} Mock S3 service
 */
function createMockS3Service(mockResponses = {}) {
  return {
    getObject: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.getObject || { Body: Buffer.from('{}') });
    }),
    putObject: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.putObject || {});
    }),
    deleteObject: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.deleteObject || {});
    }),
    listObjects: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockResponses.listObjects || { Contents: [] });
    }),
    getSignedUrl: jest.fn().mockImplementation(() => {
      return mockResponses.getSignedUrl || 'https://example.com/signed-url';
    })
  };
}

module.exports = {
  setupMocks,
  restoreMocks,
  createMockDynamoService,
  createMockS3Service
};
