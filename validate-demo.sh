#!/bin/bash

# Demo Validation Script for Doc-Tales
# Validates that the demo environment is ready for presentation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
APP_NAME="doc-tales"

echo -e "${PURPLE}🎯 Doc-Tales Demo Validation${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}$(date)${NC}"
echo ""

# Track validation results
VALIDATION_PASSED=true
WARNINGS=0

# Function to check status
check_status() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        if [ -n "$message" ]; then
            echo -e "   $message"
        fi
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $test_name: WARNING${NC}"
        echo -e "   $message"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        echo -e "   $message"
        VALIDATION_PASSED=false
    fi
    echo ""
}

# Check 1: AWS CLI Configuration
echo -e "${YELLOW}🔧 Checking AWS Configuration...${NC}"
if aws sts get-caller-identity > /dev/null 2>&1; then
    CALLER_IDENTITY=$(aws sts get-caller-identity --output json)
    ACCOUNT_ID=$(echo "$CALLER_IDENTITY" | jq -r '.Account')
    USER_ARN=$(echo "$CALLER_IDENTITY" | jq -r '.Arn')
    check_status "AWS CLI Configuration" "PASS" "Account: $ACCOUNT_ID, User: $USER_ARN"
else
    check_status "AWS CLI Configuration" "FAIL" "AWS CLI not configured or credentials invalid"
fi

# Check 2: CloudFormation Stack
echo -e "${YELLOW}📋 Checking CloudFormation Stack...${NC}"
STACK_NAME="${APP_NAME}-${ENVIRONMENT}"
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_STATUS" = "CREATE_COMPLETE" ] || [ "$STACK_STATUS" = "UPDATE_COMPLETE" ]; then
    check_status "CloudFormation Stack" "PASS" "Stack status: $STACK_STATUS"
else
    check_status "CloudFormation Stack" "FAIL" "Stack status: $STACK_STATUS (expected: CREATE_COMPLETE or UPDATE_COMPLETE)"
fi

# Check 3: Infrastructure Resources
echo -e "${YELLOW}🏗️  Checking Infrastructure Resources...${NC}"

# Get stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text 2>/dev/null || echo "")
COMMUNICATIONS_TABLE=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`CommunicationsTableName`].OutputValue' --output text 2>/dev/null || echo "")
USER_PROFILES_TABLE=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`UserProfilesTableName`].OutputValue' --output text 2>/dev/null || echo "")
RAW_BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`RawCommunicationsBucketName`].OutputValue' --output text 2>/dev/null || echo "")

if [ -n "$API_ENDPOINT" ] && [ -n "$COMMUNICATIONS_TABLE" ] && [ -n "$USER_PROFILES_TABLE" ] && [ -n "$RAW_BUCKET" ]; then
    check_status "Infrastructure Resources" "PASS" "All required resources found"
    echo -e "   API: $API_ENDPOINT"
    echo -e "   Communications Table: $COMMUNICATIONS_TABLE"
    echo -e "   User Profiles Table: $USER_PROFILES_TABLE"
    echo -e "   Raw Bucket: $RAW_BUCKET"
    echo ""
else
    check_status "Infrastructure Resources" "FAIL" "Missing required infrastructure resources"
fi

# Check 4: API Endpoint Health
echo -e "${YELLOW}🌐 Checking API Health...${NC}"
if [ -n "$API_ENDPOINT" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_ENDPOINT}communications" || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        check_status "API Health" "PASS" "API responding with HTTP $HTTP_STATUS"
    else
        check_status "API Health" "FAIL" "API responding with HTTP $HTTP_STATUS (expected: 200)"
    fi
else
    check_status "API Health" "FAIL" "API endpoint not available"
fi

# Check 5: DynamoDB Tables
echo -e "${YELLOW}🗄️  Checking DynamoDB Tables...${NC}"

# Check communications table
if [ -n "$COMMUNICATIONS_TABLE" ]; then
    COMM_TABLE_STATUS=$(aws dynamodb describe-table --table-name "$COMMUNICATIONS_TABLE" --region "$REGION" --query 'Table.TableStatus' --output text 2>/dev/null || echo "NOT_FOUND")
    if [ "$COMM_TABLE_STATUS" = "ACTIVE" ]; then
        check_status "Communications Table" "PASS" "Table status: $COMM_TABLE_STATUS"
    else
        check_status "Communications Table" "FAIL" "Table status: $COMM_TABLE_STATUS (expected: ACTIVE)"
    fi
fi

# Check user profiles table
if [ -n "$USER_PROFILES_TABLE" ]; then
    USER_TABLE_STATUS=$(aws dynamodb describe-table --table-name "$USER_PROFILES_TABLE" --region "$REGION" --query 'Table.TableStatus' --output text 2>/dev/null || echo "NOT_FOUND")
    if [ "$USER_TABLE_STATUS" = "ACTIVE" ]; then
        check_status "User Profiles Table" "PASS" "Table status: $USER_TABLE_STATUS"
    else
        check_status "User Profiles Table" "FAIL" "Table status: $USER_TABLE_STATUS (expected: ACTIVE)"
    fi
fi

# Check 6: S3 Bucket
echo -e "${YELLOW}🪣 Checking S3 Bucket...${NC}"
if [ -n "$RAW_BUCKET" ]; then
    if aws s3 ls "s3://$RAW_BUCKET" > /dev/null 2>&1; then
        check_status "S3 Bucket" "PASS" "Bucket accessible: $RAW_BUCKET"
    else
        check_status "S3 Bucket" "FAIL" "Bucket not accessible: $RAW_BUCKET"
    fi
fi

# Check 7: Lambda Functions
echo -e "${YELLOW}⚡ Checking Lambda Functions...${NC}"
LAMBDA_FUNCTIONS=$(aws lambda list-functions --region "$REGION" --query "Functions[?starts_with(FunctionName, 'doc-tales-')].FunctionName" --output text 2>/dev/null || echo "")

if [ -n "$LAMBDA_FUNCTIONS" ]; then
    FUNCTION_COUNT=$(echo "$LAMBDA_FUNCTIONS" | wc -w)
    check_status "Lambda Functions" "PASS" "$FUNCTION_COUNT Lambda functions found"
    echo -e "   Functions: $LAMBDA_FUNCTIONS"
    echo ""
else
    check_status "Lambda Functions" "WARN" "No Lambda functions found (may be expected for some deployments)"
fi

# Check 8: Demo Data
echo -e "${YELLOW}📊 Checking Demo Data...${NC}"
if [ -n "$COMMUNICATIONS_TABLE" ]; then
    DEMO_COMM_COUNT=$(aws dynamodb scan --table-name "$COMMUNICATIONS_TABLE" --filter-expression "contains(metadata.category, :category)" --expression-attribute-values '{":category":{"S":"demo"}}' --select "COUNT" --region "$REGION" --query 'Count' --output text 2>/dev/null || echo "0")
    
    if [ "$DEMO_COMM_COUNT" -gt "0" ]; then
        check_status "Demo Communications" "PASS" "$DEMO_COMM_COUNT demo communications found"
    else
        check_status "Demo Communications" "WARN" "No demo communications found (run 'npm run demo:seed' to add demo data)"
    fi
fi

if [ -n "$USER_PROFILES_TABLE" ]; then
    DEMO_USER_COUNT=$(aws dynamodb scan --table-name "$USER_PROFILES_TABLE" --filter-expression "begins_with(userId, :prefix)" --expression-attribute-values '{":prefix":{"S":"sarah"}}' --select "COUNT" --region "$REGION" --query 'Count' --output text 2>/dev/null || echo "0")
    
    if [ "$DEMO_USER_COUNT" -gt "0" ]; then
        check_status "Demo User Profiles" "PASS" "Demo user profiles found"
    else
        check_status "Demo User Profiles" "WARN" "No demo user profiles found (run 'npm run demo:seed' to add demo data)"
    fi
fi

# Check 9: Frontend Build
echo -e "${YELLOW}🎨 Checking Frontend Build...${NC}"
if [ -d "packages/frontend/build" ]; then
    BUILD_SIZE=$(du -sh packages/frontend/build 2>/dev/null | cut -f1 || echo "unknown")
    check_status "Frontend Build" "PASS" "Build directory exists (size: $BUILD_SIZE)"
else
    check_status "Frontend Build" "WARN" "Frontend build not found (run 'npm run build:frontend' to build)"
fi

# Check 10: Environment Variables
echo -e "${YELLOW}🔧 Checking Environment Configuration...${NC}"
if [ -f ".env" ]; then
    ENV_API_ENDPOINT=$(grep "REACT_APP_API_ENDPOINT" .env | cut -d'=' -f2 || echo "")
    if [ -n "$ENV_API_ENDPOINT" ]; then
        if [ "$ENV_API_ENDPOINT" = "$API_ENDPOINT" ]; then
            check_status "Environment Variables" "PASS" "API endpoint matches deployed infrastructure"
        else
            check_status "Environment Variables" "WARN" "API endpoint mismatch (env: $ENV_API_ENDPOINT, deployed: $API_ENDPOINT)"
        fi
    else
        check_status "Environment Variables" "WARN" "API endpoint not configured in .env file"
    fi
else
    check_status "Environment Variables" "WARN" ".env file not found"
fi

# Summary
echo -e "${PURPLE}📋 Validation Summary${NC}"
echo -e "${BLUE}==================${NC}"

if [ "$VALIDATION_PASSED" = true ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}🎉 Demo validation PASSED with no warnings!${NC}"
        echo -e "${GREEN}✨ Your demo environment is ready for presentation${NC}"
    else
        echo -e "${YELLOW}⚠️  Demo validation PASSED with $WARNINGS warnings${NC}"
        echo -e "${YELLOW}💡 Consider addressing warnings for optimal demo experience${NC}"
    fi
else
    echo -e "${RED}❌ Demo validation FAILED${NC}"
    echo -e "${RED}🔧 Please fix the failed checks before presenting${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo -e "  Seed demo data:     ${YELLOW}npm run demo:seed${NC}"
echo -e "  Run integration tests: ${YELLOW}npm run test:integration${NC}"
echo -e "  Clean demo data:    ${YELLOW}npm run demo:cleanup${NC}"
echo -e "  Build frontend:     ${YELLOW}npm run build:frontend${NC}"
echo -e "  Deploy backend:     ${YELLOW}npm run deploy:backend${NC}"

# Exit with appropriate code
if [ "$VALIDATION_PASSED" = true ]; then
    exit 0
else
    exit 1
fi
