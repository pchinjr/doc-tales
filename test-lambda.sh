#!/bin/bash
# test-lambda.sh
# Script to directly invoke the Lambda function for testing

# Exit on error
set -e

# Configuration
FUNCTION_NAME="doc-tales-ApiFunction-hvO0k5heYD5p"
REGION="us-east-1"

echo "=== Doc-Tales Lambda Test ==="
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo

# Create a test event
echo "Creating test event..."
cat > /tmp/test-event.json << EOF
{
  "httpMethod": "GET",
  "path": "/communications",
  "queryStringParameters": {}
}
EOF

# Invoke the Lambda function
echo "Invoking Lambda function..."
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --payload file:///tmp/test-event.json \
  --cli-binary-format raw-in-base64-out \
  --log-type Tail \
  /tmp/lambda-response.json \
  --query 'LogResult' \
  --output text \
  --region $REGION | base64 --decode

echo
echo "Response:"
cat /tmp/lambda-response.json
echo

exit 0
