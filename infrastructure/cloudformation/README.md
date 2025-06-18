# Doc-Tales AWS SAM Infrastructure

This directory contains the AWS Serverless Application Model (SAM) templates and resources for deploying the Doc-Tales application to AWS.

## Overview

The Doc-Tales AWS infrastructure consists of:

- Lambda functions for processing communications
- API Gateway for frontend communication
- DynamoDB tables for storing metadata and user profiles
- S3 buckets for storing raw communications and processed documents
- S3 bucket for hosting the frontend application
- SNS topics for notifications

## Directory Structure

```
infrastructure/
├── sam/
│   ├── template.yaml       # Main SAM template
│   ├── samconfig.toml      # SAM CLI configuration
│   └── README.md           # This file
└── scripts/
    └── deploy-frontend.sh  # Script to deploy the frontend
```

## Lambda Functions

The Lambda functions are located in the `src/lambda` directory:

```
src/lambda/
├── ingestion/          # Receives and normalizes communications
├── dimension-extraction/ # Extracts dimensions from communications
├── notification/       # Sends alerts for high-priority communications
└── api/                # Serves data to frontend
```

## Deployment

### Prerequisites

1. Install the AWS SAM CLI:
   ```bash
   pip install aws-sam-cli
   ```

2. Configure AWS credentials:
   ```bash
   aws configure
   ```

### Deploy the Backend

1. Build the SAM application:
   ```bash
   sam build -t infrastructure/sam/template.yaml
   ```

2. Deploy the application:
   ```bash
   sam deploy --guided
   ```

   Follow the prompts to configure the deployment.

### Deploy the Frontend

After deploying the backend, deploy the frontend:

1. Navigate to the project root directory:
   ```bash
   cd /path/to/doc-tales
   ```

2. Run the frontend deployment script:
   ```bash
   ./infrastructure/scripts/deploy-frontend.sh [environment] [region]
   ```

   Where:
   - `environment` is the environment name (default: dev)
   - `region` is the AWS region (default: us-east-1)

   This script will:
   - Get the API endpoint from the CloudFormation outputs
   - Create a `.env` file with the API endpoint
   - Build the React app
   - Upload the build to the S3 bucket
   - Output the website URL

### Update the Application

To update the application after making changes:

1. Build the updated application:
   ```bash
   sam build -t infrastructure/sam/template.yaml
   ```

2. Deploy the updates:
   ```bash
   sam deploy
   ```

3. Redeploy the frontend if needed:
   ```bash
   ./infrastructure/scripts/deploy-frontend.sh [environment] [region]
   ```

## Testing Locally

You can test the Lambda functions locally using the SAM CLI:

1. Start the API locally:
   ```bash
   sam local start-api
   ```

2. Invoke a specific function:
   ```bash
   sam local invoke IngestionFunction --event events/ingestion-event.json
   ```

## Cleanup

To remove all resources created by SAM:

```bash
sam delete
```

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Amazon API Gateway Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [Amazon S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
