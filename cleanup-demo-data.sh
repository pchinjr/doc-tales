#!/bin/bash

# Demo Data Cleanup for Doc-Tales
# Removes demo data from real AWS infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
APP_NAME="doc-tales"

echo -e "${BLUE}🧹 Cleaning Up Doc-Tales Demo Data${NC}"
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

# Get infrastructure details
RAW_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`RawCommunicationsBucketName`].OutputValue' \
    --output text)

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

if [ -z "$RAW_BUCKET" ] || [ -z "$COMMUNICATIONS_TABLE" ] || [ -z "$USER_PROFILES_TABLE" ]; then
    echo -e "${RED}❌ Could not find required infrastructure. Is the stack deployed?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found infrastructure${NC}"

# Clean up S3 demo files
echo -e "${YELLOW}🗑️  Cleaning up S3 demo files...${NC}"

# List and delete demo files
DEMO_FILES=$(aws s3 ls "s3://$RAW_BUCKET/raw/" --recursive --region "$REGION" | grep -E "(urgent-client-meeting|budget-overrun-alert|q3-performance-review|security-update-required|team-pizza-party|office-coffee-upgrade)" | awk '{print $4}' || true)

if [ -n "$DEMO_FILES" ]; then
    echo "$DEMO_FILES" | while read -r file; do
        if [ -n "$file" ]; then
            aws s3 rm "s3://$RAW_BUCKET/$file" --region "$REGION"
            echo -e "  🗑️  Removed: $file"
        fi
    done
else
    echo -e "  ℹ️  No demo files found in S3"
fi

# Clean up DynamoDB demo communications
echo -e "${YELLOW}🗑️  Cleaning up DynamoDB demo communications...${NC}"

# Get demo communications
DEMO_COMMS=$(aws dynamodb scan \
    --table-name "$COMMUNICATIONS_TABLE" \
    --filter-expression "contains(metadata.category, :category)" \
    --expression-attribute-values '{":category":{"S":"demo"}}' \
    --projection-expression "PK, SK" \
    --region "$REGION" \
    --output json 2>/dev/null || echo '{"Items":[]}')

COMM_COUNT=$(echo "$DEMO_COMMS" | jq -r '.Items | length')

if [ "$COMM_COUNT" -gt "0" ]; then
    echo -e "  🔍 Found $COMM_COUNT demo communications to remove"
    
    # Delete each communication
    echo "$DEMO_COMMS" | jq -r '.Items[] | @base64' | while read -r item; do
        DECODED=$(echo "$item" | base64 --decode)
        PK=$(echo "$DECODED" | jq -r '.PK.S')
        SK=$(echo "$DECODED" | jq -r '.SK.S')
        
        aws dynamodb delete-item \
            --table-name "$COMMUNICATIONS_TABLE" \
            --key "{\"PK\":{\"S\":\"$PK\"},\"SK\":{\"S\":\"$SK\"}}" \
            --region "$REGION" > /dev/null
        
        echo -e "    🗑️  Removed communication: $SK"
    done
else
    echo -e "  ℹ️  No demo communications found in DynamoDB"
fi

# Clean up demo user profiles
echo -e "${YELLOW}🗑️  Cleaning up demo user profiles...${NC}"

# List of demo user IDs
DEMO_USERS=("sarah-analytical" "alex-creative" "pat-practical")

for user_id in "${DEMO_USERS[@]}"; do
    # Check if user exists
    USER_EXISTS=$(aws dynamodb get-item \
        --table-name "$USER_PROFILES_TABLE" \
        --key "{\"PK\":{\"S\":\"USER#$user_id\"}}" \
        --region "$REGION" \
        --query 'Item' \
        --output text 2>/dev/null || echo "None")
    
    if [ "$USER_EXISTS" != "None" ]; then
        aws dynamodb delete-item \
            --table-name "$USER_PROFILES_TABLE" \
            --key "{\"PK\":{\"S\":\"USER#$user_id\"}}" \
            --region "$REGION" > /dev/null
        
        echo -e "  🗑️  Removed user profile: $user_id"
    else
        echo -e "  ℹ️  User profile not found: $user_id"
    fi
done

# Clean up any test data from integration tests
echo -e "${YELLOW}🧪 Cleaning up integration test data...${NC}"

# Clean up test communications (those with test/integration/demo prefixes)
TEST_COMMS=$(aws dynamodb scan \
    --table-name "$COMMUNICATIONS_TABLE" \
    --filter-expression "begins_with(SK, :test1) OR begins_with(SK, :test2) OR begins_with(SK, :test3)" \
    --expression-attribute-values '{":test1":{"S":"COMM#test-"},":test2":{"S":"COMM#integration-"},":test3":{"S":"COMM#demo-"}}' \
    --projection-expression "PK, SK" \
    --region "$REGION" \
    --output json 2>/dev/null || echo '{"Items":[]}')

TEST_COUNT=$(echo "$TEST_COMMS" | jq -r '.Items | length')

if [ "$TEST_COUNT" -gt "0" ]; then
    echo -e "  🔍 Found $TEST_COUNT test communications to remove"
    
    echo "$TEST_COMMS" | jq -r '.Items[] | @base64' | while read -r item; do
        DECODED=$(echo "$item" | base64 --decode)
        PK=$(echo "$DECODED" | jq -r '.PK.S')
        SK=$(echo "$DECODED" | jq -r '.SK.S')
        
        aws dynamodb delete-item \
            --table-name "$COMMUNICATIONS_TABLE" \
            --key "{\"PK\":{\"S\":\"$PK\"},\"SK\":{\"S\":\"$SK\"}}" \
            --region "$REGION" > /dev/null
        
        echo -e "    🗑️  Removed test communication: $SK"
    done
else
    echo -e "  ℹ️  No test communications found"
fi

# Clean up test user profiles
TEST_USER_PROFILES=$(aws dynamodb scan \
    --table-name "$USER_PROFILES_TABLE" \
    --filter-expression "begins_with(userId, :test1) OR begins_with(userId, :test2)" \
    --expression-attribute-values '{":test1":{"S":"test-"},":test2":{"S":"analytical-"}}' \
    --projection-expression "PK" \
    --region "$REGION" \
    --output json 2>/dev/null || echo '{"Items":[]}')

TEST_USER_COUNT=$(echo "$TEST_USER_PROFILES" | jq -r '.Items | length')

if [ "$TEST_USER_COUNT" -gt "0" ]; then
    echo -e "  🔍 Found $TEST_USER_COUNT test user profiles to remove"
    
    echo "$TEST_USER_PROFILES" | jq -r '.Items[] | @base64' | while read -r item; do
        DECODED=$(echo "$item" | base64 --decode)
        PK=$(echo "$DECODED" | jq -r '.PK.S')
        
        aws dynamodb delete-item \
            --table-name "$USER_PROFILES_TABLE" \
            --key "{\"PK\":{\"S\":\"$PK\"}}" \
            --region "$REGION" > /dev/null
        
        echo -e "    🗑️  Removed test user: $PK"
    done
else
    echo -e "  ℹ️  No test user profiles found"
fi

echo -e "${GREEN}🎉 Demo data cleanup completed!${NC}"
echo -e "${BLUE}📋 Cleanup Summary:${NC}"
echo -e "  • Removed demo communications from S3 and DynamoDB"
echo -e "  • Removed demo user profiles"
echo -e "  • Removed integration test data"
echo -e ""
echo -e "${YELLOW}✨ Your environment is clean and ready for fresh demo data${NC}"
