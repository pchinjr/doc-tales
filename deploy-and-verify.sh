#!/bin/bash
# deploy-and-verify.sh
# Script to verify the Doc-Tales application deployment

# Exit on error
set -e

# Configuration
STACK_NAME="doc-tales-dev"
REGION="us-east-1"
ENVIRONMENT="dev"

echo "=== Doc-Tales Deployment Verification ==="
echo "Stack: $STACK_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo

# Get API endpoint from CloudFormation outputs
echo "Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text \
  --region $REGION)

echo "API Endpoint: $API_ENDPOINT"

# Wait for API to be available
echo "Waiting for API to be available..."
sleep 10

# Test API endpoints
echo "Testing API endpoints..."

# Test communications endpoint
echo "Testing /communications endpoint..."
RESPONSE=$(curl -s "$API_ENDPOINT/communications")
if [[ $RESPONSE == *"communications"* ]]; then
  echo "✅ /communications endpoint test passed!"
else
  echo "❌ /communications endpoint test failed!"
  echo "Response: $RESPONSE"
  echo "Deployment verification failed!"
  exit 1
fi

# Test archetypes endpoint
echo "Testing /archetypes endpoint..."
RESPONSE=$(curl -s "$API_ENDPOINT/archetypes")
if [[ $RESPONSE == *"prioritizer"* && $RESPONSE == *"connector"* ]]; then
  echo "✅ /archetypes endpoint test passed!"
else
  echo "❌ /archetypes endpoint test failed!"
  echo "Response: $RESPONSE"
  echo "Deployment verification failed!"
  exit 1
fi

# Test user profile endpoint
echo "Testing /user-profile endpoint..."
RESPONSE=$(curl -s "$API_ENDPOINT/user-profile")
if [[ $RESPONSE == *"archetypeConfidence"* ]]; then
  echo "✅ /user-profile endpoint test passed!"
else
  echo "❌ /user-profile endpoint test failed!"
  echo "Response: $RESPONSE"
  echo "Deployment verification failed!"
  exit 1
fi

# Verify DynamoDB tables
echo "Verifying DynamoDB tables..."
COMM_TABLE=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='CommunicationsTableName'].OutputValue" \
  --output text \
  --region $REGION)

USER_TABLE=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='UserProfilesTableName'].OutputValue" \
  --output text \
  --region $REGION)

echo "Communications Table: $COMM_TABLE"
echo "User Profiles Table: $USER_TABLE"

# Verify S3 buckets
echo "Verifying S3 buckets..."
RAW_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='RawCommunicationsBucketName'].OutputValue" \
  --output text \
  --region $REGION)

PROCESSED_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='ProcessedDocumentsBucketName'].OutputValue" \
  --output text \
  --region $REGION)

echo "Raw Communications Bucket: $RAW_BUCKET"
echo "Processed Documents Bucket: $PROCESSED_BUCKET"

echo
echo "=== Deployment Verification Successful! ==="
echo "The Doc-Tales application has been successfully verified."
echo "API Endpoint: $API_ENDPOINT"
echo

exit 0
