#!/bin/bash

# Set environment variables for testing
export NODE_ENV=test
export AWS_SDK_LOAD_CONFIG=0
export AWS_ACCESS_KEY_ID=test-key
export AWS_SECRET_ACCESS_KEY=test-secret

# Suppress AWS SDK v2 deprecation warnings
export NODE_OPTIONS="--no-warnings"

echo "Running all Lambda tests..."
npx tape 'src/lambda/tests/*.test.js' | npx tap-spec

# Check if any tests failed
if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi

echo "All tests passed!"
