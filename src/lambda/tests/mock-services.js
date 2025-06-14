/**
 * Mock Services for Testing
 * 
 * This module provides mock implementations of the services used in the application.
 */

/**
 * Create a mock DynamoDB service
 * 
 * @param {Object} options - Options for the mock service
 * @param {string} options.tableName - Table name to use for all operations
 * @param {Object} options.responses - Mock responses for each method
 * @returns {Object} Mock DynamoDB service
 */
function createMockDynamoDBService(options = {}) {
  const tableName = options.tableName || 'mock-table';
  const responses = options.responses || {};
  
  return {
    tableName,
    userProfilesTableName: options.userProfilesTableName || 'mock-user-profiles-table',
    
    query: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.query === 'function') {
        return Promise.resolve(responses.query(updatedParams));
      }
      
      return Promise.resolve(responses.query || {
        Items: [],
        Count: 0,
        ScannedCount: 0
      });
    },
    
    get: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.get === 'function') {
        return Promise.resolve(responses.get(updatedParams));
      }
      
      return Promise.resolve(responses.get || { Item: null });
    },
    
    put: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.put === 'function') {
        return Promise.resolve(responses.put(updatedParams));
      }
      
      return Promise.resolve(responses.put || {});
    },
    
    update: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.update === 'function') {
        return Promise.resolve(responses.update(updatedParams));
      }
      
      return Promise.resolve(responses.update || {});
    },
    
    delete: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.delete === 'function') {
        return Promise.resolve(responses.delete(updatedParams));
      }
      
      return Promise.resolve(responses.delete || {});
    },
    
    scan: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: tableName,
        ...params
      };
      
      if (typeof responses.scan === 'function') {
        return Promise.resolve(responses.scan(updatedParams));
      }
      
      return Promise.resolve(responses.scan || { Items: [] });
    },
    
    batchGet: (params) => {
      if (typeof responses.batchGet === 'function') {
        return Promise.resolve(responses.batchGet(params));
      }
      
      return Promise.resolve(responses.batchGet || { Responses: {} });
    },
    
    batchWrite: (params) => {
      if (typeof responses.batchWrite === 'function') {
        return Promise.resolve(responses.batchWrite(params));
      }
      
      return Promise.resolve(responses.batchWrite || {});
    },
    
    getUserProfile: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: options.userProfilesTableName || 'mock-user-profiles-table',
        ...params
      };
      
      if (typeof responses.getUserProfile === 'function') {
        return Promise.resolve(responses.getUserProfile(updatedParams));
      }
      
      return Promise.resolve(responses.getUserProfile || { Item: null });
    },
    
    updateUserProfile: (params) => {
      // Add tableName if not provided
      const updatedParams = {
        TableName: options.userProfilesTableName || 'mock-user-profiles-table',
        ...params
      };
      
      if (typeof responses.updateUserProfile === 'function') {
        return Promise.resolve(responses.updateUserProfile(updatedParams));
      }
      
      return Promise.resolve(responses.updateUserProfile || {});
    }
  };
}

/**
 * Create a mock S3 service
 * 
 * @param {Object} options - Options for the mock service
 * @param {string} options.bucketName - Bucket name to use for all operations
 * @param {Object} options.responses - Mock responses for each method
 * @returns {Object} Mock S3 service
 */
function createMockS3Service(options = {}) {
  const bucketName = options.bucketName || 'mock-bucket';
  const responses = options.responses || {};
  
  return {
    bucketName,
    
    getObject: (params) => {
      // Add bucketName if not provided
      const updatedParams = {
        Bucket: bucketName,
        ...params
      };
      
      if (typeof responses.getObject === 'function') {
        return Promise.resolve(responses.getObject(updatedParams));
      }
      
      return Promise.resolve(responses.getObject || {
        Body: Buffer.from('{}')
      });
    },
    
    putObject: (params) => {
      // Add bucketName if not provided
      const updatedParams = {
        Bucket: bucketName,
        ...params
      };
      
      if (typeof responses.putObject === 'function') {
        return Promise.resolve(responses.putObject(updatedParams));
      }
      
      return Promise.resolve(responses.putObject || {});
    },
    
    deleteObject: (params) => {
      // Add bucketName if not provided
      const updatedParams = {
        Bucket: bucketName,
        ...params
      };
      
      if (typeof responses.deleteObject === 'function') {
        return Promise.resolve(responses.deleteObject(updatedParams));
      }
      
      return Promise.resolve(responses.deleteObject || {});
    },
    
    listObjects: (params) => {
      // Add bucketName if not provided
      const updatedParams = {
        Bucket: bucketName,
        ...params
      };
      
      if (typeof responses.listObjects === 'function') {
        return Promise.resolve(responses.listObjects(updatedParams));
      }
      
      return Promise.resolve(responses.listObjects || { Contents: [] });
    },
    
    getSignedUrl: (operation, params) => {
      // Add bucketName if not provided
      const updatedParams = {
        Bucket: bucketName,
        ...params
      };
      
      if (typeof responses.getSignedUrl === 'function') {
        return responses.getSignedUrl(operation, updatedParams);
      }
      
      return responses.getSignedUrl || 'https://example.com/signed-url';
    }
  };
}

module.exports = {
  createMockDynamoDBService,
  createMockS3Service
};
