#!/bin/bash

# Set environment variables for testing
export NODE_ENV=test
export AWS_SDK_LOAD_CONFIG=0
export AWS_ACCESS_KEY_ID=test-key
export AWS_SECRET_ACCESS_KEY=test-secret

# Suppress AWS SDK v2 deprecation warnings
export NODE_OPTIONS="--no-warnings"

echo "Running common package tests..."
cd packages/common && npm test
COMMON_EXIT=$?

echo "Running backend package tests..."
cd ../backend && npm test
BACKEND_EXIT=$?

echo "Running frontend package tests..."
cd ../frontend && npm test
FRONTEND_EXIT=$?

# Return to root directory
cd ../..

# Check if any tests failed
if [ $COMMON_EXIT -ne 0 ] || [ $BACKEND_EXIT -ne 0 ] || [ $FRONTEND_EXIT -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi

echo "All tests passed!"
