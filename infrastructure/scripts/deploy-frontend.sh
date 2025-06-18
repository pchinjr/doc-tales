#!/bin/bash
set -e

# Get parameters
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="doc-tales"

# Navigate to project root directory
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

# Get the frontend bucket name from CloudFormation outputs
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text \
  --region $REGION)

# Get the API endpoint from CloudFormation outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text \
  --region $REGION)

if [ -z "$FRONTEND_BUCKET" ]; then
  echo "Error: Could not retrieve frontend bucket name from CloudFormation outputs"
  exit 1
fi

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not retrieve API endpoint from CloudFormation outputs"
  exit 1
fi

echo "Frontend bucket: $FRONTEND_BUCKET"
echo "API endpoint: $API_ENDPOINT"

# Create or update .env file with API endpoint
echo "REACT_APP_API_ENDPOINT=$API_ENDPOINT" > $PROJECT_ROOT/.env
echo "Created .env file with API endpoint"

# Build the React app
echo "Building React app..."
npm run build

# Upload the build to S3
echo "Uploading build to S3 bucket: $FRONTEND_BUCKET"
aws s3 sync $PROJECT_ROOT/build/ s3://$FRONTEND_BUCKET --delete --region $REGION

# Get the website URL
WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteURL'].OutputValue" \
  --output text \
  --region $REGION)

echo "Deployment complete!"
echo "Frontend website URL: $WEBSITE_URL"
