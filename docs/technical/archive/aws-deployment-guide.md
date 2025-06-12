# AWS Deployment Guide for Doc-Tales

This guide provides step-by-step instructions for deploying the Doc-Tales application to AWS using the Serverless Application Model (SAM).

## Prerequisites

Before deploying, ensure you have the following:

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
3. **AWS SAM CLI**: Installed for local testing and deployment
4. **Node.js**: Version 18.x or later

## Setup AWS CLI and SAM

1. **Install AWS CLI**:
   ```bash
   pip install awscli
   ```

2. **Configure AWS CLI**:
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, default region (e.g., us-east-1), and output format (json).

3. **Install AWS SAM CLI**:
   ```bash
   pip install aws-sam-cli
   ```

4. **Verify installation**:
   ```bash
   sam --version
   ```

## Deployment Steps

### 1. Build the SAM Application

Navigate to the project root directory and build the SAM application:

```bash
cd /home/pchinjr/Code/doc-tales
sam build -t infrastructure/sam/template.yaml
```

This command processes the SAM template, installs dependencies, and prepares the application for deployment.

### 2. Deploy the Application

Deploy the application to AWS:

```bash
sam deploy --guided
```

This will start an interactive deployment process:

- **Stack Name**: Enter a name for your CloudFormation stack (e.g., `doc-tales-dev`)
- **AWS Region**: Choose your preferred region (e.g., `us-east-1`)
- **Parameters**: Set the environment parameter (default is `dev`)
- **Confirm changes**: Review the changes before deployment
- **IAM role creation**: Allow SAM to create IAM roles
- **Disable rollback**: Choose whether to disable rollback on failure
- **Save arguments**: Save your choices for future deployments

### 3. Monitor Deployment

The deployment process will create all the resources defined in the SAM template:

- Lambda functions
- API Gateway
- DynamoDB tables
- S3 buckets
- SNS topics
- IAM roles and policies

You can monitor the deployment in the AWS CloudFormation console or in the terminal output.

### 4. Get Deployment Outputs

After successful deployment, SAM will display the outputs defined in the template:

- **API Endpoint URL**: The URL for the API Gateway
- **S3 Bucket Names**: Names of the created S3 buckets
- **DynamoDB Table Names**: Names of the created DynamoDB tables

Save these outputs for configuring the frontend application.

## Connecting the Frontend

Update the frontend configuration to use the deployed API:

1. Create a configuration file in the frontend project:
   ```javascript
   // src/config.js
   export const API_ENDPOINT = 'https://your-api-id.execute-api.region.amazonaws.com/dev/';
   ```

2. Update the data service to use the API instead of mock data:
   ```javascript
   // src/services/UnifiedDataService.js
   import { API_ENDPOINT } from '../config';
   
   // Replace mock data fetching with API calls
   async fetchCommunications() {
     const response = await fetch(`${API_ENDPOINT}communications`);
     return await response.json();
   }
   ```

## Testing the Deployment

### Test the API Endpoints

Use curl or Postman to test the API endpoints:

```bash
# Get all communications
curl https://your-api-id.execute-api.region.amazonaws.com/dev/communications

# Get communications for a specific project
curl https://your-api-id.execute-api.region.amazonaws.com/dev/communications?project=home-purchase

# Get a specific communication
curl https://your-api-id.execute-api.region.amazonaws.com/dev/communications/communication-id
```

### Test the Ingestion Process

Send a test communication to the ingestion endpoint:

```bash
curl -X POST \
  https://your-api-id.execute-api.region.amazonaws.com/dev/communications \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "Test communication content",
    "subject": "Test Subject",
    "from": {
      "name": "Test Sender",
      "email": "sender@example.com"
    },
    "to": [
      {
        "name": "Test Recipient",
        "email": "recipient@example.com"
      }
    ],
    "timestamp": "2025-06-10T10:00:00Z",
    "project": "home-purchase"
  }'
```

### Monitor Lambda Executions

Check the AWS Lambda console to monitor function executions and logs:

1. Open the AWS Lambda console
2. Select your function (e.g., `doc-tales-dev-IngestionFunction-XXXX`)
3. Go to the "Monitor" tab to view invocation metrics
4. Check CloudWatch Logs for detailed execution logs

## Updating the Deployment

After making changes to the code or SAM template:

1. Build the updated application:
   ```bash
   sam build -t infrastructure/sam/template.yaml
   ```

2. Deploy the updates:
   ```bash
   sam deploy
   ```

## Cleanup

To remove all resources created by the deployment:

```bash
sam delete --stack-name doc-tales-dev
```

This will delete all AWS resources created for the application.

## Troubleshooting

### API Gateway Issues

If the API endpoints return errors:

1. Check the Lambda function logs in CloudWatch
2. Verify the API Gateway configuration in the AWS console
3. Ensure the Lambda functions have the correct permissions

### S3 Event Triggers

If S3 event triggers are not working:

1. Check the S3 bucket notification configuration
2. Verify the Lambda function permissions
3. Check the Lambda function logs for errors

### DynamoDB Issues

If DynamoDB operations fail:

1. Verify the table structure matches the expected schema
2. Check the Lambda function permissions
3. Ensure the correct table names are used in the code

## Security Considerations

For a production deployment, consider implementing:

1. **API Authentication**: Add Cognito or Lambda authorizers to API Gateway
2. **Encryption**: Enable encryption at rest for S3 and DynamoDB
3. **VPC Configuration**: Run Lambda functions within a VPC for network isolation
4. **IAM Roles**: Refine IAM roles to follow the principle of least privilege
5. **CloudTrail**: Enable CloudTrail for auditing API calls

## Cost Optimization

To optimize costs:

1. **Lambda Memory**: Adjust Lambda memory settings based on performance needs
2. **DynamoDB Capacity**: Use on-demand capacity mode for unpredictable workloads
3. **S3 Lifecycle Policies**: Implement lifecycle policies for older communications
4. **CloudWatch Logs**: Set appropriate retention periods for logs

## Next Steps

After successful deployment:

1. **Set up CI/CD**: Automate deployments using GitHub Actions or AWS CodePipeline
2. **Monitoring**: Implement CloudWatch alarms for critical metrics
3. **Backup Strategy**: Configure backups for DynamoDB tables
4. **Performance Testing**: Test the system under load to identify bottlenecks
