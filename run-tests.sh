#!/bin/bash

# Set environment variables for testing
export NODE_ENV=test
export AWS_SDK_LOAD_CONFIG=0
export AWS_ACCESS_KEY_ID=test-key
export AWS_SECRET_ACCESS_KEY=test-secret

# Suppress AWS SDK v2 deprecation warnings
export NODE_OPTIONS="--no-warnings"

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Run tests for Lambda functions directly
echo "Running Lambda tests..."
npx tape 'packages/backend/src/lambda/tests/*.test.js' | npx tap-spec
LAMBDA_EXIT=$?

# Run tests for parsers
echo "Running parser tests..."
npx tape 'packages/backend/src/services/parsers/__tests__/*.test.ts' | npx tap-spec
PARSER_EXIT=$?

# Check if any tests failed
if [ $LAMBDA_EXIT -ne 0 ] || [ $PARSER_EXIT -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi

echo "All tests passed!"
