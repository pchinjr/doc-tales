# Testing Strategy for Doc-Tales

This document outlines the testing strategy for the Doc-Tales application, focusing on ensuring reliable deployments and code quality.

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Testing Layers](#testing-layers)
- [Service-Based Testing Approach](#service-based-testing-approach)
- [Test Implementation](#test-implementation)
- [Continuous Integration](#continuous-integration)
- [Deployment Verification](#deployment-verification)

## Testing Philosophy

The Doc-Tales testing strategy follows these principles:

1. **Fast feedback loops**: Tests should run quickly to provide immediate feedback
2. **Isolation**: Tests should be isolated from external dependencies
3. **Maintainability**: Tests should be easy to maintain and understand
4. **Coverage**: Tests should cover critical business logic and edge cases
5. **Deployment confidence**: Tests should give confidence that deployments will succeed

## Testing Layers

### Unit Tests
- Test individual functions and components in isolation
- Mock all external dependencies
- Focus on business logic and edge cases
- Use lightweight testing frameworks (tape)

### Integration Tests
- Test interactions between components
- Test AWS service integrations using mocks or LocalStack
- Verify data flows correctly through the system

### Deployment Tests
- Verify infrastructure deployment
- Test API endpoints after deployment
- Validate configuration and permissions

## Service-Based Testing Approach

Doc-Tales uses a service-based approach to testing, which:

1. **Decouples AWS services**: Creates service classes that abstract AWS SDK calls
2. **Enables easy mocking**: Makes it simple to replace services with test doubles
3. **Standardizes interactions**: Provides a consistent interface for AWS services
4. **Improves testability**: Allows testing business logic without AWS dependencies

### Service Layer Structure

```
src/lambda/services/
├── dynamodb-service.js   # DynamoDB service abstraction
├── s3-service.js         # S3 service abstraction
└── ... other services
```

### Example Service Implementation

```javascript
// DynamoDB Service
class DynamoDBService {
  constructor(options = {}) {
    this.tableName = options.tableName || process.env.COMMUNICATIONS_TABLE;
    this.documentClient = options.documentClient || new AWS.DynamoDB.DocumentClient();
  }

  async query(params) {
    return this.documentClient.query({
      TableName: this.tableName,
      ...params
    }).promise();
  }
  
  // Other methods...
}
```

### Testing with Service Mocks

```javascript
// In tests
const originalService = apiLambda.services.dynamoService;

// Replace with mock
apiLambda.services.dynamoService = {
  query: (params) => {
    // Assertions about params
    return Promise.resolve({
      Items: [/* mock data */]
    });
  }
};

// Test function
const result = await apiLambda.queryCommunications({ project: 'home-purchase' });

// Restore original
apiLambda.services.dynamoService = originalService;
```

## Test Implementation

### Unit Test Structure

```
src/lambda/tests/
├── api-query.test.js      # Tests for API query functions
├── mock-services.js       # Mock implementations of services
└── test-helpers.js        # Common test helpers
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node src/lambda/tests/api-query.test.js | npx tap-spec
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      
  deploy-dev:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy and verify
        run: ./deploy-and-verify.sh
```

## Deployment Verification

### Deployment Verification Script

```bash
#!/bin/bash
# deploy-and-verify.sh

echo "Building SAM application..."
sam build || { echo "Build failed"; exit 1; }

echo "Deploying to dev environment..."
sam deploy --stack-name doc-tales-dev --no-confirm-changeset || { echo "Deploy failed"; exit 1; }

echo "Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name doc-tales-dev --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)

echo "Testing API endpoint..."
RESPONSE=$(curl -s "$API_ENDPOINT/communications")
if [[ $RESPONSE == *"communications"* ]]; then
  echo "API test passed!"
else
  echo "API test failed, rolling back..."
  aws cloudformation delete-stack --stack-name doc-tales-dev
  exit 1
fi

echo "Deployment successful and verified!"
```

## Best Practices

1. **Keep tests focused**: Each test should test one thing
2. **Use descriptive test names**: Test names should describe what is being tested
3. **Isolate tests**: Tests should not depend on each other
4. **Clean up after tests**: Restore mocks and clean up resources
5. **Test edge cases**: Test error conditions and edge cases
6. **Keep tests fast**: Tests should run quickly to provide fast feedback
7. **Use CI/CD**: Run tests automatically on push and pull requests
