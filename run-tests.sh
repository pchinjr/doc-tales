#!/bin/bash

# Run API query tests
echo "Running API query tests..."
NODE_ENV=test AWS_SDK_LOAD_CONFIG=0 AWS_ACCESS_KEY_ID=test-key AWS_SECRET_ACCESS_KEY=test-secret node src/lambda/tests/api-query.test.js
