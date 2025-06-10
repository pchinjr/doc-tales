#!/bin/bash
# Test script for Doc-Tales API GET endpoints

echo "Testing Doc-Tales API GET endpoints..."

API_ENDPOINT="https://fzoxdyrkj4.execute-api.us-east-1.amazonaws.com/dev"

# Test getting all communications
echo "Testing GET /communications endpoint..."
echo "Response:"
curl -s "${API_ENDPOINT}/communications" | jq '.'

# Test getting communications by project
echo -e "\nTesting GET /communications?project=home-purchase endpoint..."
echo "Response:"
curl -s "${API_ENDPOINT}/communications?project=home-purchase" | jq '.'

# If you have a specific communication ID, test getting it
if [ -n "$1" ]; then
  COMMUNICATION_ID=$1
  echo -e "\nTesting GET /communications/$COMMUNICATION_ID endpoint..."
  echo "Response:"
  curl -s "${API_ENDPOINT}/communications/$COMMUNICATION_ID" | jq '.'
else
  echo -e "\nNo communication ID provided. Skipping individual communication test."
  echo "To test a specific communication, run: $0 <communication-id>"
fi

echo -e "\nTest completed!"
