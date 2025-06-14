# AWS SDK Migration Plan

## Overview

This document outlines the plan to migrate from AWS SDK v2 to AWS SDK v3 in the Doc-Tales project. AWS SDK v2 is now in maintenance mode, and AWS recommends migrating to v3 for new features, improved performance, and continued support.

## Current Status

The project currently uses AWS SDK v2 for:
- DynamoDB operations (DocumentClient)
- S3 operations (getObject, putObject, etc.)

## Benefits of AWS SDK v3

1. **Modular architecture**: Only import the services you need
2. **Reduced bundle size**: Smaller deployment packages
3. **Improved performance**: Better middleware stack and reduced latency
4. **TypeScript support**: Built with TypeScript for better type safety
5. **Middleware system**: Easier to customize request/response handling
6. **Streaming operations**: Better support for streaming large objects
7. **Retry strategies**: More configurable retry mechanisms

## Migration Steps

### 1. Update Dependencies

```bash
# Remove AWS SDK v2
npm uninstall aws-sdk

# Install AWS SDK v3 core and specific service clients
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Update DynamoDB Service

```javascript
// Before (AWS SDK v2)
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

// After (AWS SDK v3)
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const documentClient = DynamoDBDocumentClient.from(client);
```

#### Method Updates

```javascript
// Before (AWS SDK v2)
const result = await documentClient.query(params).promise();

// After (AWS SDK v3)
const command = new QueryCommand(params);
const result = await documentClient.send(command);
```

### 3. Update S3 Service

```javascript
// Before (AWS SDK v2)
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// After (AWS SDK v3)
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({ region: 'us-east-1' });
```

#### Method Updates

```javascript
// Before (AWS SDK v2)
const result = await s3.getObject(params).promise();

// After (AWS SDK v3)
const command = new GetObjectCommand(params);
const result = await s3Client.send(command);

// Before (AWS SDK v2) - Signed URL
const url = s3.getSignedUrl('getObject', params);

// After (AWS SDK v3) - Signed URL
const command = new GetObjectCommand(params);
const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

### 4. Update Mock Services for Testing

The mock services will need to be updated to match the new AWS SDK v3 API structure:

```javascript
// Mock S3 client for AWS SDK v3
const mockS3Client = {
  send: jest.fn().mockImplementation((command) => {
    if (command instanceof GetObjectCommand) {
      return Promise.resolve({
        Body: {
          transformToString: () => Promise.resolve(JSON.stringify({ test: 'data' }))
        }
      });
    }
    return Promise.resolve({});
  })
};
```

## Testing Strategy

1. Create a new branch for the migration
2. Update one service at a time
3. Update corresponding tests
4. Run tests to ensure functionality is maintained
5. Perform integration tests with actual AWS resources in a dev environment

## Timeline

- Week 1: Update dependencies and DynamoDB service
- Week 2: Update S3 service
- Week 3: Update tests and fix any issues
- Week 4: Integration testing and deployment

## Risks and Mitigation

- **Breaking changes**: Carefully review API differences and update code accordingly
- **Performance impact**: Monitor performance metrics after migration
- **Deployment issues**: Use canary deployments to minimize impact

## Resources

- [AWS SDK v3 Developer Guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
- [AWS SDK v3 Migration Guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html)
- [AWS SDK v3 API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)
