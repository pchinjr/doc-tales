#!/bin/bash
# End-to-end test script for Doc-Tales

echo "Running end-to-end test for Doc-Tales..."

API_ENDPOINT="https://fzoxdyrkj4.execute-api.us-east-1.amazonaws.com/dev"
S3_BUCKET="doc-tales-raw-communications-dev-837132623653"
DYNAMODB_TABLE="doc-tales-communications-dev"
COMMUNICATION_ID=""

# Step 1: Send a communication via the API
echo "Step 1: Sending test communication to API Gateway..."
RESPONSE=$(curl -s -X POST \
  "${API_ENDPOINT}/communications" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "URGENT: Your mortgage pre-approval has been processed. We need to schedule a follow-up call to discuss the details. Are you available tomorrow at 2pm?",
    "subject": "URGENT: Mortgage Pre-Approval Update",
    "from": {
      "name": "Sarah Johnson",
      "email": "sarah.johnson@bankofamerica.com",
      "id": "contact-001"
    },
    "to": [
      {
        "name": "User",
        "email": "user@example.com",
        "id": "user-001"
      }
    ],
    "timestamp": "2025-06-10T10:30:00Z",
    "project": "home-purchase",
    "urgency": "high",
    "category": "finance",
    "hasAttachments": true,
    "files": [
      {
        "id": "att-001",
        "name": "Pre-Approval-Letter.pdf",
        "type": "application/pdf",
        "size": 245000
      }
    ]
  }')

echo "Response from API:"
echo $RESPONSE

# Extract communication ID from response
COMMUNICATION_ID=$(echo $RESPONSE | grep -o '"communicationId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$COMMUNICATION_ID" ]; then
  echo "Communication ID: $COMMUNICATION_ID"
else
  echo "Test failed! Could not extract communication ID from response."
  exit 1
fi

# Wait for processing
echo "Waiting 5 seconds for processing..."
sleep 5

# Step 2: Verify it's stored in S3
echo -e "\nStep 2: Verifying communication is stored in S3..."
S3_PREFIX="email/2025/06/10"
S3_FILES=$(aws s3 ls s3://$S3_BUCKET/$S3_PREFIX/ | grep $COMMUNICATION_ID)

if [ -n "$S3_FILES" ]; then
  echo "Communication found in S3:"
  echo "$S3_FILES"
else
  echo "Test failed! Communication not found in S3."
  exit 1
fi

# Step 3: Verify the communication is stored in DynamoDB
echo -e "\nStep 3: Verifying communication is stored in DynamoDB..."
DB_ITEM=$(aws dynamodb query \
  --table-name $DYNAMODB_TABLE \
  --key-condition-expression "id = :id" \
  --expression-attribute-values '{":id":{"S":"'$COMMUNICATION_ID'"}}' \
  --query "Items" \
  --output json)

if [ "$DB_ITEM" != "[]" ]; then
  echo "Communication found in DynamoDB:"
  echo "$DB_ITEM" | jq '.'
else
  echo "Test failed! Communication not found in DynamoDB."
  exit 1
fi

# Step 4: Verify dimensions were extracted
echo -e "\nStep 4: Verifying dimensions were extracted..."
DIMENSIONS=$(echo "$DB_ITEM" | jq '.[0].dimensions')

if [ "$DIMENSIONS" != "null" ] && [ "$DIMENSIONS" != "" ]; then
  echo "Dimensions found in DynamoDB:"
  echo "$DIMENSIONS" | jq '.'
else
  echo "Warning: Dimensions not found in DynamoDB. This might be expected if the DimensionExtractionFunction hasn't completed yet."
fi

# Step 5: Check CloudWatch logs for Lambda executions
echo -e "\nStep 5: Checking CloudWatch logs for Lambda executions..."
echo "Note: This step requires the Lambda functions to have completed execution."
echo "You can check the logs manually using the check-logs.sh script."

echo -e "\nEnd-to-end test completed!"
echo "Communication ID: $COMMUNICATION_ID"
echo "To check the full details of this communication, run:"
echo "./test-api-get.sh $COMMUNICATION_ID"
