# Frontend Deployment Guide

This document explains how to deploy the Doc-Tales frontend application to AWS using the SAM template and deployment scripts.

## Overview

The Doc-Tales frontend is a React application that is built and deployed to an S3 bucket configured for static website hosting. The deployment process involves:

1. Deploying the backend infrastructure using AWS SAM
2. Building the React application with environment variables pointing to the backend API
3. Uploading the built files to the S3 bucket

## Prerequisites

- AWS CLI installed and configured
- Node.js and npm installed
- AWS SAM CLI installed

## Deployment Steps

### 1. Deploy the Backend

First, deploy the backend infrastructure using AWS SAM:

```bash
# Navigate to the project root
cd /path/to/doc-tales

# Build the SAM application
sam build -t infrastructure/sam/template.yaml

# Deploy the application
sam deploy --guided
```

During the guided deployment, you'll be prompted to provide:
- Stack name (e.g., `doc-tales-dev`)
- AWS Region
- Environment name (dev, staging, or prod)
- Application name (default: doc-tales)

### 2. Deploy the Frontend

After the backend is deployed, use the provided script to deploy the frontend:

```bash
./infrastructure/scripts/deploy-frontend.sh [environment] [region]
```

For example:
```bash
./infrastructure/scripts/deploy-frontend.sh dev us-east-1
```

This script performs the following actions:
1. Retrieves the frontend S3 bucket name and API endpoint from CloudFormation outputs
2. Creates a `.env` file with the API endpoint for the React app to use
3. Builds the React application
4. Uploads the build files to the S3 bucket
5. Outputs the website URL

### 3. Access the Website

After deployment, the script will output the website URL, which will be in the format:
```
http://[bucket-name].s3-website-[region].amazonaws.com
```

You can access your application at this URL.

## Manual Deployment

If you need to deploy the frontend manually:

1. Get the API endpoint and frontend bucket name:
```bash
aws cloudformation describe-stacks \
  --stack-name doc-tales-dev \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text

aws cloudformation describe-stacks \
  --stack-name doc-tales-dev \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text
```

2. Create a `.env` file in the project root:
```bash
echo "REACT_APP_API_ENDPOINT=[API_ENDPOINT]" > .env
```

3. Build the React app:
```bash
npm run build
```

4. Upload the build to S3:
```bash
aws s3 sync build/ s3://[FRONTEND_BUCKET] --delete
```

## Troubleshooting

### CORS Issues

If you encounter CORS issues when the frontend tries to access the API:

1. Verify that the API Gateway CORS configuration in the SAM template is correct
2. Check that the frontend is using the correct API endpoint
3. Ensure that the API Gateway deployment stage matches the environment

### S3 Website Access Issues

If you cannot access the S3 website:

1. Verify that the bucket policy allows public read access
2. Check that the bucket is configured for static website hosting
3. Ensure that the website endpoint URL is correct

### Environment Variables Not Working

If the frontend is not connecting to the API:

1. Check that the `.env` file was created correctly
2. Verify that environment variables are being used correctly in the React app
3. Rebuild and redeploy the frontend

## Future Improvements

For production deployments, consider these improvements:

1. Add CloudFront distribution for better performance and HTTPS support
2. Set up a custom domain name
3. Implement CI/CD for automated deployments
4. Add versioning and cache control for frontend assets
