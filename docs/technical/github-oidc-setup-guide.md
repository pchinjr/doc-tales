# GitHub OIDC Setup Guide for AWS Deployments

This guide explains how to set up GitHub OpenID Connect (OIDC) for secure, token-based authentication between GitHub Actions and AWS. This approach eliminates the need to store AWS credentials as GitHub secrets.

## Overview

GitHub Actions can use OpenID Connect (OIDC) to authenticate with AWS. This provides several benefits:

1. **No long-lived credentials**: No need to store AWS access keys in GitHub secrets
2. **Automatic rotation**: Tokens are short-lived and automatically rotated
3. **Conditional access**: You can restrict access based on repository, branch, or other conditions

## Setup Instructions

### 1. Create an Identity Provider in AWS

1. Open the AWS IAM console
2. Navigate to "Identity providers" and click "Add provider"
3. Select "OpenID Connect" as the provider type
4. For the provider URL, enter: `https://token.actions.githubusercontent.com`
5. For the Audience, enter: `sts.amazonaws.com`
6. Click "Get thumbprint" to retrieve the certificate thumbprint
7. Click "Add provider"

### 2. Create an IAM Role for GitHub Actions

1. In the IAM console, navigate to "Roles" and click "Create role"
2. Select "Web identity" as the trusted entity type
3. Select the identity provider you just created
4. For Audience, select `sts.amazonaws.com`
5. Add a condition to restrict access to your repository:
   ```
   {
     "StringLike": {
       "token.actions.githubusercontent.com:sub": "repo:pchinjr/doc-tales:*"
     }
   }
   ```
6. Click "Next"
7. Attach the necessary permissions policies:
   - `AmazonS3FullAccess` (for frontend deployment)
   - `AWSCloudFormationFullAccess` (for CloudFormation operations)
   - `AWSLambda_FullAccess` (for Lambda functions)
   - `IAMFullAccess` (for creating roles and policies)
   - `AmazonDynamoDBFullAccess` (for DynamoDB operations)
8. Name the role (e.g., `GitHubActionsDocTales`) and create it
9. Note the Role ARN for the next step

### 3. Configure GitHub Repository Secrets

1. In your GitHub repository, go to "Settings" > "Secrets and variables" > "Actions"
2. Add the following repository secrets:
   - `AWS_ROLE_TO_ASSUME`: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/GitHubActionsDocTales`)
   - `DEPLOYMENT_BUCKET`: The name of the S3 bucket for CloudFormation artifacts

### 4. Update GitHub Workflows

The GitHub workflow files in `.github/workflows/` are already configured to use OIDC authentication with AWS. They use the `aws-actions/configure-aws-credentials` action with the `role-to-assume` parameter.

Example:
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-east-1
```

## Environment-Specific Deployment

For environment-specific deployments (dev, staging, prod), you can create separate IAM roles with different permission boundaries and configure GitHub environments with different secrets.

### Setting Up GitHub Environments

1. In your GitHub repository, go to "Settings" > "Environments"
2. Create environments for "development", "staging", and "production"
3. For each environment, add environment-specific secrets
4. Optionally, add protection rules like required reviewers for production deployments

## Troubleshooting

If you encounter issues with OIDC authentication:

1. Check the IAM role trust policy to ensure it correctly specifies your GitHub repository
2. Verify that the GitHub workflow is using the correct role ARN
3. Check CloudTrail logs for authentication failures
4. Ensure the IAM role has the necessary permissions for the actions being performed

## Security Considerations

- Limit the permissions of the IAM role to only what is necessary
- Use condition keys in the trust policy to restrict which repositories and branches can assume the role
- Consider adding environment protection rules in GitHub for sensitive environments
- Regularly audit the permissions and access patterns

## References

- [GitHub Actions: Configuring OpenID Connect in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM: Creating OIDC providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
