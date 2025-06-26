# Integration Testing with Real AWS Infrastructure

This document explains how to run Doc-Tales tests against real AWS infrastructure instead of mocked services.

## Overview

The Doc-Tales demo now supports integration testing against real AWS infrastructure, providing:

- **Real AWS Service Integration**: Tests run against actual DynamoDB tables, S3 buckets, and Lambda functions
- **End-to-End Validation**: Complete pipeline testing from S3 upload to API retrieval
- **Demo Data Management**: Automated seeding and cleanup of demo data
- **Multi-Environment Support**: Test against dev, staging, or production environments

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Doc-Tales infrastructure deployed** using SAM
3. **Node.js 22.x** and npm installed
4. **jq** installed for JSON processing (for cleanup scripts)

```bash
# Install jq on Ubuntu/Debian
sudo apt-get install jq

# Install jq on macOS
brew install jq
```

## Quick Start

### 1. Deploy Infrastructure

```bash
# Deploy to development environment
npm run deploy:backend:dev
```

### 2. Prepare Demo Environment

```bash
# Clean, seed, and test in one command
npm run demo:prepare

# Or run steps individually:
npm run demo:cleanup     # Remove old demo data
npm run demo:seed        # Add fresh demo data
npm run test:integration # Run integration tests
```

### 3. Run Integration Tests

```bash
# Test against development environment
npm run test:integration:dev

# Test against staging environment
npm run test:integration:staging
```

## Integration Test Suite

### Test Categories

1. **API Health Check** (`api-health.test.js`)
   - Verifies API endpoint accessibility
   - Tests CORS configuration
   - Validates response format

2. **Communication Pipeline** (`communication-pipeline.test.js`)
   - Tests S3 → Lambda → DynamoDB flow
   - Verifies event-driven processing
   - Validates API retrieval

3. **ML Enhancement** (`ml-enhancement.test.js`)
   - Tests ML processing pipeline
   - Validates priority scoring
   - Checks sentiment analysis and action item extraction

4. **User Profile Management** (`user-profile.test.js`)
   - Tests user profile CRUD operations
   - Validates archetype functionality
   - Checks preference management

5. **End-to-End Demo Scenario** (`demo-scenario.test.js`)
   - Complete demo workflow
   - Multiple communications with different priorities
   - Archetype-specific processing

### Running Individual Tests

```bash
# Run specific test
node packages/backend/src/lambda/tests/integration/api-health.test.js

# Set environment variables manually
export AWS_REGION=us-east-1
export API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/
export COMMUNICATIONS_TABLE=doc-tales-communications-dev
export USER_PROFILES_TABLE=doc-tales-user-profiles-dev
export RAW_BUCKET=doc-tales-raw-communications-dev

node packages/backend/src/lambda/tests/integration/communication-pipeline.test.js
```

## Demo Data Management

### Seeding Demo Data

The `seed-demo-data.sh` script creates realistic demo data:

```bash
# Seed development environment
./seed-demo-data.sh dev

# Seed staging environment
./seed-demo-data.sh staging
```

**Demo Data Includes:**
- 3 user profiles with different archetypes (Analytical, Creative, Practical)
- 6 communications with varying priorities:
  - 2 high-priority (urgent client meeting, budget overrun)
  - 2 medium-priority (performance review, security update)
  - 2 low-priority (pizza party, coffee machine)

### Cleaning Demo Data

```bash
# Clean development environment
./cleanup-demo-data.sh dev

# Clean all test data including integration test artifacts
./cleanup-demo-data.sh staging
```

## Environment Configuration

### Required Environment Variables

The integration tests automatically detect these from your CloudFormation stack:

- `API_ENDPOINT`: API Gateway endpoint URL
- `COMMUNICATIONS_TABLE`: DynamoDB communications table name
- `USER_PROFILES_TABLE`: DynamoDB user profiles table name
- `RAW_BUCKET`: S3 bucket for raw communications
- `AWS_REGION`: AWS region (defaults to us-east-1)

### Manual Configuration

If needed, you can set these manually:

```bash
export AWS_REGION=us-east-1
export API_ENDPOINT=https://yvydemum3a.execute-api.us-east-1.amazonaws.com/dev/
export COMMUNICATIONS_TABLE=doc-tales-communications-dev
export USER_PROFILES_TABLE=doc-tales-user-profiles-dev
export RAW_BUCKET=doc-tales-raw-communications-dev
```

## Troubleshooting

### Common Issues

1. **"Could not find API endpoint"**
   - Ensure the CloudFormation stack is deployed
   - Check stack name matches expected pattern: `doc-tales-{environment}`

2. **"AWS CLI not configured"**
   - Run `aws configure` to set up credentials
   - Ensure your AWS profile has necessary permissions

3. **"Communication was not processed within expected time"**
   - Lambda functions may need more time to process
   - Check CloudWatch logs for Lambda execution errors
   - Verify S3 event triggers are configured correctly

4. **"ML enhancements not found"**
   - This is expected if AWS Comprehend/Bedrock are not configured
   - Tests will pass but note that ML features are not available

### Debugging

1. **Check CloudWatch Logs**
   ```bash
   # View Lambda logs
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/doc-tales"
   
   # View specific log stream
   aws logs get-log-events --log-group-name "/aws/lambda/doc-tales-ingestion-dev" --log-stream-name "latest"
   ```

2. **Verify DynamoDB Data**
   ```bash
   # Scan communications table
   aws dynamodb scan --table-name doc-tales-communications-dev --max-items 10
   
   # Query specific communication
   aws dynamodb get-item --table-name doc-tales-communications-dev --key '{"PK":{"S":"COMM"},"SK":{"S":"COMM#your-id"}}'
   ```

3. **Check S3 Objects**
   ```bash
   # List objects in raw bucket
   aws s3 ls s3://doc-tales-raw-communications-dev/raw/ --recursive
   ```

## Performance Considerations

- **Test Duration**: Full integration test suite takes 2-3 minutes
- **AWS Costs**: Minimal costs for testing (< $0.10 per test run)
- **Rate Limits**: Tests include appropriate delays for Lambda processing
- **Cleanup**: Always run cleanup after testing to avoid accumulating test data

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests
on:
  push:
    branches: [main, develop]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Install dependencies
        run: npm install
      
      - name: Run integration tests
        run: npm run test:integration:dev
      
      - name: Cleanup test data
        if: always()
        run: npm run demo:cleanup:dev
```

## Best Practices

1. **Always Clean Up**: Run cleanup scripts after testing
2. **Use Separate Environments**: Don't run integration tests against production
3. **Monitor Costs**: Integration tests use real AWS resources
4. **Test Isolation**: Each test uses unique IDs to avoid conflicts
5. **Error Handling**: Tests include proper cleanup in finally blocks
6. **Realistic Data**: Use demo data that represents actual use cases

## Next Steps

- **Load Testing**: Scale up integration tests for performance validation
- **Multi-Region Testing**: Test cross-region functionality
- **Chaos Engineering**: Test failure scenarios and recovery
- **Security Testing**: Validate IAM permissions and data encryption
