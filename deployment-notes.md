# Deployment Notes for Doc-Tales

## Overview

This document outlines the deployment process for the Doc-Tales application, including potential issues and their solutions.

## Deployment Architecture

The deployment is split into two main parts:

1. **Backend Deployment**:
   - AWS SAM template for serverless resources
   - Lambda functions for API, ingestion, dimension extraction, and notifications
   - DynamoDB tables for data storage
   - S3 buckets for document storage

2. **Frontend Deployment**:
   - React application built with TypeScript
   - Deployed to S3 static website hosting
   - Configured to connect to the API Gateway endpoint

## GitHub Actions Workflow

The GitHub Actions workflow is configured to:

1. **Test**: Run linting and unit tests
2. **Deploy Backend**: Deploy the SAM template and verify the deployment
3. **Deploy Frontend**: Build and deploy the React application to S3

## Potential Issues and Solutions

### 1. Node.js Version Compatibility

**Issue**: The SAM template specifies `nodejs22.x` for Lambda functions, but GitHub Actions is using Node.js 18.

**Solution**: Update the SAM template to use `nodejs18.x` for Lambda functions to match the GitHub Actions environment.

```yaml
Globals:
  Function:
    Runtime: nodejs18.x
```

### 2. AWS Credentials

**Issue**: The GitHub Actions workflow requires AWS credentials with appropriate permissions.

**Solution**: Ensure the following secrets are set in the GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The IAM user or role associated with these credentials should have permissions for:
- CloudFormation
- Lambda
- API Gateway
- DynamoDB
- S3
- IAM (for role creation)
- CloudWatch Logs

### 3. S3 Bucket Naming

**Issue**: S3 bucket names must be globally unique, which can cause conflicts.

**Solution**: The SAM template includes the AWS account ID in the bucket names to ensure uniqueness. For the frontend bucket, you may need to choose a unique name or include the account ID.

### 4. CORS Configuration

**Issue**: API Gateway needs proper CORS configuration for the frontend to access it.

**Solution**: The SAM template includes CORS configuration for API Gateway. Ensure it matches the frontend domain.

### 5. Frontend Configuration

**Issue**: The frontend needs to know the API endpoint URL.

**Solution**: The GitHub Actions workflow retrieves the API endpoint from CloudFormation outputs and sets it as an environment variable for the frontend build.

### 6. Deployment Verification

**Issue**: Deployment may succeed but the application might not work correctly.

**Solution**: The `deploy-and-verify.sh` script tests the API endpoints to ensure they're working correctly.

## Monitoring and Troubleshooting

1. **CloudWatch Logs**: Check Lambda function logs for errors
2. **CloudFormation Events**: Review events for deployment failures
3. **API Gateway Test Console**: Test API endpoints directly
4. **DynamoDB Console**: Verify table structure and data
5. **S3 Console**: Check bucket contents and permissions

## Future Improvements

1. **CloudFront Distribution**: Add CloudFront for the frontend for better performance and HTTPS
2. **Custom Domain**: Configure custom domains for both API Gateway and CloudFront
3. **Proper Authentication**: Implement Cognito or another authentication service
4. **Separate Environments**: Create separate deployment pipelines for dev, staging, and production
5. **Infrastructure as Code**: Move frontend infrastructure to CloudFormation/SAM
6. **Monitoring and Alerting**: Add CloudWatch alarms for critical metrics
7. **Automated Testing**: Add integration and end-to-end tests

## Conclusion

The current deployment setup provides a solid foundation for continuous deployment of the Doc-Tales application. By addressing the potential issues and implementing the suggested improvements, the deployment process can be made more robust and production-ready.
