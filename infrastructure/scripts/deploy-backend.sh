#!/bin/bash

# Deploy backend infrastructure using SAM
# This script builds and deploys the SAM template

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="doc-tales-${ENVIRONMENT}"

echo -e "${YELLOW}🚀 Deploying Doc-Tales Backend Infrastructure${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Stack: ${STACK_NAME}${NC}"

# Navigate to SAM directory
cd "$(dirname "$0")/../sam"

# Build the SAM application
echo -e "${YELLOW}📦 Building SAM application...${NC}"
sam build

# Deploy the SAM application
echo -e "${YELLOW}🚀 Deploying SAM application...${NC}"
sam deploy \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment="${ENVIRONMENT}" \
    AppName="doc-tales" \
  --resolve-s3 \
  --no-confirm-changeset

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"

# Get stack outputs
echo -e "${YELLOW}📋 Stack Outputs:${NC}"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
