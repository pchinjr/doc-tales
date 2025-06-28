#!/bin/bash

# Prepare Lambda functions for SAM build by copying common package
set -e

# Colors for output
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Preparing Lambda functions for build...${NC}"

# Base directories
BACKEND_DIR="$(dirname "$0")/../../packages/backend"
COMMON_DIR="$(dirname "$0")/../../packages/common"
LAMBDA_DIR="${BACKEND_DIR}/src/lambda"

# Lambda function directories
LAMBDA_FUNCTIONS=(
    "api"
    "dimension-extraction"
    "ingestion"
    "notification"
    "setup-s3-events"
)

# Build common package first
echo -e "${YELLOW}Building common package...${NC}"
cd "${COMMON_DIR}"
npm run build

# Copy common package to each Lambda function
for func in "${LAMBDA_FUNCTIONS[@]}"; do
    echo -e "${YELLOW}Preparing ${func} function...${NC}"
    
    FUNC_DIR="${LAMBDA_DIR}/${func}"
    
    if [ -d "${FUNC_DIR}" ]; then
        # Create node_modules/@doc-tales directory if it doesn't exist
        mkdir -p "${FUNC_DIR}/node_modules/@doc-tales"
        
        # Remove existing symlink if it exists
        rm -rf "${FUNC_DIR}/node_modules/@doc-tales/common"
        
        # Copy the built common package (actual files, not symlink)
        cp -rL "${COMMON_DIR}" "${FUNC_DIR}/node_modules/@doc-tales/common"
        
        echo -e "${GREEN}✅ Prepared ${func} function${NC}"
    else
        echo -e "${YELLOW}⚠️  Function directory ${func} not found, skipping...${NC}"
    fi
done

echo -e "${GREEN}✅ All Lambda functions prepared for build!${NC}"
