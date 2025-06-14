# Guide to Implementing GitHub Actions OIDC with AWS

This guide will walk you through setting up OpenID Connect (OIDC) between GitHub Actions and AWS, allowing your workflows to obtain temporary AWS credentials without storing long-lived secrets.

## Benefits of OIDC

- **Enhanced Security**: No long-lived credentials stored in GitHub
- **Simplified Management**: No need to rotate credentials
- **Fine-grained Control**: Limit access based on repository, branch, or environment
- **Temporary Access**: Credentials are short-lived and scoped to specific workflows

## Prerequisites

- AWS account with administrator access
- GitHub repository where you'll run workflows
- Basic familiarity with AWS IAM and GitHub Actions

## Step 1: Create an Identity Provider in AWS

1. Sign in to the AWS Management Console
2. Navigate to IAM > Identity providers
3. Click "Add Provider"
4. Select "OpenID Connect"
5. For the Provider URL, enter: `https://token.actions.githubusercontent.com`
6. For the Audience, enter: `sts.amazonaws.com`
7. Click "Get thumbprint" to retrieve the certificate thumbprint
8. Click "Add provider"

## Step 2: Create an IAM Role with Trust Policy

1. Navigate to IAM > Roles
2. Click "Create role"
3. Select "Web identity"
4. Choose the identity provider you just created (`token.actions.githubusercontent.com`)
5. For Audience, select `sts.amazonaws.com`
6. Click "Next: Permissions"
7. Attach policies that grant the permissions your workflow needs (e.g., `AmazonS3FullAccess`, `AmazonDynamoDBFullAccess`, etc.)
8. Click "Next: Tags" (add optional tags)
9. Click "Next: Review"
10. Name your role (e.g., `github-actions-role`)
11. Click "Create role"

## Step 3: Customize the Trust Policy

After creating the role, you need to customize the trust policy to restrict which repositories can assume this role:

1. Navigate to the role you just created
2. Click the "Trust relationships" tab
3. Click "Edit trust policy"
4. Replace the policy with the following (update the values as needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:pchinjr/doc-tales:*"
        }
      }
    }
  ]
}
```

This policy restricts access to workflows running in your `pchinjr/doc-tales` repository.

## Step 4: Update Your GitHub Actions Workflow

Update your workflow file (`.github/workflows/test-and-deploy.yml`) to use the OIDC provider:

```yaml
name: Test and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    # Test job remains unchanged
    runs-on: ubuntu-latest
    steps:
      # Your existing test steps...

  deploy-backend:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read   # Required to checkout the code
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: '3.9'
          
      - name: Install AWS SAM CLI
        run: |
          pip install aws-sam-cli
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:role/github-actions-role
          aws-region: us-east-1
          
      - name: Deploy and verify backend
        run: |
          cd infrastructure/sam
          sam build
          sam deploy --stack-name doc-tales-dev --no-confirm-changeset --parameter-overrides Environment=dev --region us-east-1
          cd ../../
          ./deploy-and-verify.sh
        env:
          SAM_CLI_TELEMETRY: 0

  deploy-frontend:
    # Frontend job with similar OIDC configuration
    needs: deploy-backend
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read   # Required to checkout the code
    steps:
      - uses: actions/checkout@v3
      
      # Other steps remain the same
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:role/github-actions-role
          aws-region: us-east-1
      
      # Rest of your frontend deployment steps...
```

## Step 5: Add Permissions to Your Repository

You need to allow your workflow to request the OIDC JWT token:

1. Go to your GitHub repository
2. Click "Settings"
3. Click "Actions" > "General" in the sidebar
4. Scroll down to "Workflow permissions"
5. Select "Read and write permissions"
6. Check "Allow GitHub Actions to create and approve pull requests"
7. Click "Save"

## Step 6: Test Your Workflow

1. Make a small change to your repository
2. Push the change to trigger the workflow
3. Monitor the workflow execution in the "Actions" tab
4. Check AWS CloudTrail logs to verify the role assumption

## Troubleshooting

### Common Issues:

1. **"Error: No OpenID Connect provider found"**
   - Verify the identity provider was created correctly in AWS IAM

2. **"Error: Role cannot be assumed"**
   - Check the trust policy conditions
   - Ensure the repository name is correct
   - Verify the role has the necessary permissions

3. **"Error: Missing id-token permission"**
   - Make sure you've added `permissions: id-token: write` to your job

## Security Considerations

- Limit the permissions of the IAM role to only what's needed
- Consider adding branch restrictions in the trust policy
- Regularly audit the role's permissions and usage

## Advanced Configuration

### Restrict by Branch

To only allow workflows on specific branches to assume the role:

```json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:pchinjr/doc-tales:ref:refs/heads/main"
  }
}
```

### Restrict by Environment

For workflows using GitHub environments:

```json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:pchinjr/doc-tales:environment:production"
  }
}
```

By following this guide, you'll have a secure, credential-free way for your GitHub Actions workflows to interact with AWS resources, eliminating the need to manage long-lived access keys.
