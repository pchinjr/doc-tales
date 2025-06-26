#!/bin/bash

# Integration Tests for Doc-Tales Demo
# This script runs tests against real AWS infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
APP_NAME="doc-tales"

echo -e "${YELLOW}🚀 Starting Doc-Tales Integration Tests${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured or no valid credentials${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${YELLOW}📋 Getting stack information...${NC}"
STACK_NAME="${APP_NAME}-${ENVIRONMENT}"

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
    echo -e "${RED}❌ Could not find API endpoint. Is the stack deployed?${NC}"
    exit 1
fi

# Get table names
COMMUNICATIONS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CommunicationsTableName`].OutputValue' \
    --output text)

USER_PROFILES_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserProfilesTableName`].OutputValue' \
    --output text)

RAW_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`RawCommunicationsBucketName`].OutputValue' \
    --output text)

echo -e "${GREEN}✅ Found infrastructure:${NC}"
echo -e "  API Endpoint: $API_ENDPOINT"
echo -e "  Communications Table: $COMMUNICATIONS_TABLE"
echo -e "  User Profiles Table: $USER_PROFILES_TABLE"
echo -e "  Raw Bucket: $RAW_BUCKET"

# Export environment variables for tests
export NODE_ENV=integration
export AWS_REGION="$REGION"
export AWS_SDK_LOAD_CONFIG=1
export API_ENDPOINT="$API_ENDPOINT"
export COMMUNICATIONS_TABLE="$COMMUNICATIONS_TABLE"
export USER_PROFILES_TABLE="$USER_PROFILES_TABLE"
export RAW_BUCKET="$RAW_BUCKET"

# Run integration tests
echo -e "${YELLOW}🧪 Running integration tests...${NC}"

# Test 1: API Health Check
echo -e "${YELLOW}Test 1: API Health Check${NC}"
node packages/backend/src/lambda/tests/integration/api-health.test.js

# Test 2: Communication Processing Pipeline
echo -e "${YELLOW}Test 2: Communication Processing Pipeline${NC}"
node packages/backend/src/lambda/tests/integration/communication-pipeline.test.js

# Test 3: ML Enhancement Pipeline
echo -e "${YELLOW}Test 3: ML Enhancement Pipeline${NC}"
node packages/backend/src/lambda/tests/integration/ml-enhancement.test.js

# Test 4: User Profile Management
echo -e "${YELLOW}Test 4: User Profile Management${NC}"
node packages/backend/src/lambda/tests/integration/user-profile.test.js

# Test 5: End-to-End Demo Scenario
echo -e "${YELLOW}Test 5: End-to-End Demo Scenario${NC}"
node packages/backend/src/lambda/tests/integration/demo-scenario.test.js

echo -e "${GREEN}🎉 All integration tests passed!${NC}"
echo -e "${YELLOW}💡 Demo is ready to use with real AWS infrastructure${NC}"
