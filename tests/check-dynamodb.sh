#!/bin/bash
# Script to check DynamoDB tables for Doc-Tales

echo "Checking DynamoDB tables for Doc-Tales..."

COMMUNICATIONS_TABLE="doc-tales-communications-dev"
USER_PROFILES_TABLE="doc-tales-user-profiles-dev"

# Check communications table
echo "Checking communications table: $COMMUNICATIONS_TABLE"
echo "Recent items:"
aws dynamodb scan --table-name $COMMUNICATIONS_TABLE --limit 5 --query "Items" | jq '.'

# Check if a specific communication exists
if [ -n "$1" ]; then
  COMMUNICATION_ID=$1
  echo -e "\nChecking for specific communication: $COMMUNICATION_ID"
  aws dynamodb get-item --table-name $COMMUNICATIONS_TABLE --key "{\"id\":{\"S\":\"$COMMUNICATION_ID\"},\"timestamp\":{\"S\":\"2025-06-10T10:30:00Z\"}}" | jq '.'
else
  echo -e "\nNo communication ID provided. Skipping specific communication check."
  echo "To check a specific communication, run: $0 <communication-id>"
fi

# Check user profiles table
echo -e "\nChecking user profiles table: $USER_PROFILES_TABLE"
echo "Recent items:"
aws dynamodb scan --table-name $USER_PROFILES_TABLE --limit 5 --query "Items" | jq '.'

echo -e "\nCheck completed!"
