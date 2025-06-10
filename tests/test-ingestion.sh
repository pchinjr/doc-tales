#!/bin/bash
# Test script for Doc-Tales Ingestion API

echo "Testing Doc-Tales Ingestion API..."
echo "Sending test communication to API Gateway..."

API_ENDPOINT="https://fzoxdyrkj4.execute-api.us-east-1.amazonaws.com/dev"
COMMUNICATION_ID=""

# Send a test communication
RESPONSE=$(curl -s -X POST \
  "${API_ENDPOINT}/communications" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "Good news! Your mortgage pre-approval has been processed. We need to schedule a follow-up call to discuss the details. Are you available tomorrow at 2pm?",
    "subject": "Mortgage Pre-Approval Update",
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
  echo "Test successful! Communication was ingested."
else
  echo "Test failed! Could not extract communication ID from response."
  exit 1
fi

# Wait for processing
echo "Waiting 5 seconds for processing..."
sleep 5

echo "Test completed successfully!"
