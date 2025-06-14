#!/bin/bash
# run-tests.sh

echo "Running API query tests..."
node src/lambda/tests/api-query.test.js | npx tap-spec

# Add more test files here as they are created
# echo "Running dimension extraction tests..."
# node src/lambda/tests/dimension-extraction.test.js | npx tap-spec
