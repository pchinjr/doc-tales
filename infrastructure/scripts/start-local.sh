#!/bin/bash

# Start SAM local development environment
# This script starts the API Gateway locally for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting SAM Local Development Environment${NC}"

# Ensure SAM cache directory exists with correct permissions
mkdir -p ~/.aws-sam/layers-pkg

# Navigate to SAM directory
cd "$(dirname "$0")/../sam"

# Build the SAM application
echo -e "${YELLOW}📦 Building SAM application...${NC}"
sam build

# Start local API
echo -e "${YELLOW}🌐 Starting local API Gateway on http://localhost:3001${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

sam local start-api --port 3001 --env-vars env.json
