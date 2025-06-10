#!/bin/bash
# Test script for Doc-Tales S3 event trigger

echo "Testing Doc-Tales S3 event trigger..."

S3_BUCKET="doc-tales-raw-communications-dev-837132623653"
TEST_FILE="test-communication.json"
S3_KEY="email/2025/06/10/test-$(date +%s).json"

# Create a test JSON file
echo "Creating test communication file..."
cat > $TEST_FILE << EOF
{
  "id": "test-$(date +%s)",
  "content": "This is a test communication uploaded directly to S3. Please review the attached documents for your home purchase.",
  "subject": "Test S3 Upload",
  "from": {
    "name": "Test Sender",
    "email": "test@example.com",
    "id": "contact-test"
  },
  "to": [
    {
      "name": "User",
      "email": "user@example.com",
      "id": "user-001"
    }
  ],
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": "home-purchase",
  "urgency": "medium",
  "category": "test",
  "hasAttachments": false,
  "files": []
}
EOF

# Upload to S3
echo "Uploading test file to S3 bucket: $S3_BUCKET"
aws s3 cp $TEST_FILE s3://$S3_BUCKET/$S3_KEY

if [ $? -eq 0 ]; then
  echo "Upload successful!"
  echo "File uploaded to: s3://$S3_BUCKET/$S3_KEY"
else
  echo "Upload failed!"
  exit 1
fi

# Wait for processing
echo "Waiting 5 seconds for Lambda processing..."
sleep 5

# Check if the file exists in S3
echo "Verifying file exists in S3..."
aws s3 ls s3://$S3_BUCKET/$S3_KEY

# Clean up
echo "Cleaning up local test file..."
rm $TEST_FILE

echo "Test completed successfully!"
echo "To check if the Lambda function was triggered, view the CloudWatch logs."
echo "Run: aws logs get-log-events --log-group-name /aws/lambda/doc-tales-DimensionExtractionFunction-* --log-stream-name \$(aws logs describe-log-streams --log-group-name /aws/lambda/doc-tales-DimensionExtractionFunction-* --order-by LastEventTime --descending --limit 1 --query 'logStreams[0].logStreamName' --output text)"
