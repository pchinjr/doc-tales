# Dimension Extraction Testing Guide

This document provides instructions for testing the dimension extraction functionality in the Doc-Tales application.

## Overview

The dimension extraction process is a critical part of the Doc-Tales application. It analyzes communications and extracts four key dimensions:

1. **Temporal Dimension**: Time-related aspects like deadlines, urgency, and chronology
2. **Relationship Dimension**: People-related aspects like connection strength and network position
3. **Visual Dimension**: Visual aspects like document type and visual elements
4. **Analytical Dimension**: Analytical aspects like categories, tags, and sentiment

## Testing Process

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. Access to the deployed AWS resources
3. Sample communication data

### Test 1: End-to-End Flow

This test verifies the complete flow from ingestion to dimension extraction.

1. **Ingest a new communication**:

```bash
aws lambda invoke \
  --function-name doc-tales-IngestionFunction-XXXXXXXXXXXX \
  --payload '{
    "content": "Hi Team, We need to review the mortgage documents by Friday. This is urgent as the closing date is approaching. Please let me know if you have any questions. Thanks, John",
    "subject": "Mortgage Document Review",
    "type": "email",
    "source": "gmail",
    "project": "home-purchase",
    "metadata": {
      "urgency": "high",
      "category": "finance"
    },
    "sender": {
      "id": "contact-123",
      "name": "John Smith",
      "email": "john@example.com"
    },
    "recipients": [
      {
        "id": "contact-456",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    ],
    "attachments": []
  }' \
  response.json
```

2. **Extract the communication ID**:

```bash
COMM_ID=$(cat response.json | jq -r '.communicationId')
echo "Communication ID: $COMM_ID"
```

3. **Manually trigger dimension extraction**:

```bash
aws lambda invoke \
  --function-name doc-tales-DimensionExtractionFunction-XXXXXXXXXXXX \
  --payload "{\"communicationId\": \"$COMM_ID\"}" \
  dimension-response.json
```

4. **Verify the results**:

```bash
aws dynamodb get-item \
  --table-name doc-tales-communications-dev \
  --key "{\"id\":{\"S\":\"$COMM_ID\"},\"timestamp\":{\"S\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}}"
```

### Test 2: S3 Event Trigger

This test verifies that the S3 event trigger correctly invokes the dimension extraction function.

1. **Upload a file directly to S3**:

```bash
# Create a sample communication file
cat > sample-communication.json << EOF
{
  "id": "test-$(date +%s)",
  "content": "We need to schedule a family reunion for next month. I'm thinking July 15th would work well. Please let me know if that works for everyone.",
  "subject": "Family Reunion Planning",
  "type": "email",
  "source": "gmail",
  "project": "family-event",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "metadata": {
    "urgency": "medium",
    "category": "planning"
  },
  "sender": {
    "id": "contact-789",
    "name": "Sarah Johnson",
    "email": "sarah@example.com"
  },
  "recipients": [
    {
      "id": "contact-101",
      "name": "Family Group",
      "email": "family@example.com"
    }
  ],
  "attachments": []
}
EOF

# Get the S3 bucket name
BUCKET=$(aws cloudformation describe-stacks --stack-name doc-tales --query "Stacks[0].Outputs[?OutputKey=='RawCommunicationsBucketName'].OutputValue" --output text)

# Upload to S3
COMM_ID=$(cat sample-communication.json | jq -r '.id')
aws s3 cp sample-communication.json s3://$BUCKET/email/2025/06/10/$COMM_ID.json
```

2. **Check CloudWatch logs to verify the function was triggered**:

```bash
# Get the function name
FUNCTION=$(aws cloudformation describe-stack-resources --stack-name doc-tales --query "StackResources[?LogicalResourceId=='DimensionExtractionFunction'].PhysicalResourceId" --output text)

# Get the log group name
LOG_GROUP="/aws/lambda/$FUNCTION"

# Get recent log streams
aws logs describe-log-streams --log-group-name $LOG_GROUP --order-by LastEventTime --descending --limit 5
```

3. **Check the most recent log stream**:

```bash
# Get the most recent log stream name
LOG_STREAM=$(aws logs describe-log-streams --log-group-name $LOG_GROUP --order-by LastEventTime --descending --limit 1 --query "logStreams[0].logStreamName" --output text)

# Get the log events
aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name $LOG_STREAM
```

4. **Verify the dimensions were stored in DynamoDB**:

```bash
aws dynamodb query \
  --table-name doc-tales-communications-dev \
  --index-name IdOnlyIndex \
  --key-condition-expression "id = :id" \
  --expression-attribute-values "{\":id\":{\"S\":\"$COMM_ID\"}}"
```

### Test 3: Dimension Quality Check

This test verifies that the extracted dimensions are accurate and complete.

1. **Create a communication with specific dimension-related content**:

```bash
aws lambda invoke \
  --function-name doc-tales-IngestionFunction-XXXXXXXXXXXX \
  --payload '{
    "content": "We need to schedule a meeting with John and Sarah from ABC Corp to discuss the property inspection results. The deadline is June 20th, and it is very urgent as we need to finalize the purchase agreement by the end of the month. The property at 123 Main St has 3 bedrooms and 2 bathrooms. Please review the attached floor plans and inspection report.",
    "subject": "Property Inspection Results",
    "type": "email",
    "source": "gmail",
    "project": "home-purchase",
    "metadata": {
      "urgency": "high",
      "category": "finance",
      "sourceSpecific": {
        "hasImages": true,
        "imageCount": 2,
        "chartCount": 1,
        "tableCount": 1
      }
    },
    "sender": {
      "id": "contact-222",
      "name": "Real Estate Agent",
      "email": "agent@example.com"
    },
    "recipients": [
      {
        "id": "contact-333",
        "name": "Home Buyer",
        "email": "buyer@example.com"
      }
    ],
    "attachments": [
      {
        "id": "att-111",
        "name": "floor-plans.pdf",
        "type": "application/pdf",
        "size": 1024000
      },
      {
        "id": "att-222",
        "name": "inspection-report.pdf",
        "type": "application/pdf",
        "size": 2048000
      }
    ]
  }' \
  dimension-test-response.json
```

2. **Extract the communication ID and trigger dimension extraction**:

```bash
COMM_ID=$(cat dimension-test-response.json | jq -r '.communicationId')
echo "Communication ID: $COMM_ID"

aws lambda invoke \
  --function-name doc-tales-DimensionExtractionFunction-XXXXXXXXXXXX \
  --payload "{\"communicationId\": \"$COMM_ID\"}" \
  dimension-quality-response.json
```

3. **Retrieve and analyze the extracted dimensions**:

```bash
aws dynamodb query \
  --table-name doc-tales-communications-dev \
  --index-name IdOnlyIndex \
  --key-condition-expression "id = :id" \
  --expression-attribute-values "{\":id\":{\"S\":\"$COMM_ID\"}}" \
  --query "Items[0].dimensions" \
  > extracted-dimensions.json

# Analyze the dimensions
cat extracted-dimensions.json | jq .
```

4. **Verify each dimension**:

- **Temporal**: Should identify "June 20th" as a deadline and mark it as urgent
- **Relationship**: Should identify "John" and "Sarah" as people and "ABC Corp" as an organization
- **Visual**: Should identify 2 images, 1 chart, 1 table, and 2 attachments
- **Analytical**: Should identify "property inspection" as a key concept and have a high urgency score

## Troubleshooting

### Common Issues

1. **ValidationException: The provided key element does not match the schema**
   - This occurs when trying to access an item without providing all required key attributes
   - Make sure both hash and range keys are included in the Key object
   - Use the IdOnlyIndex GSI to find the item by ID first

2. **ResourceNotFoundException: Requested resource not found**
   - Check that the S3 key or DynamoDB item exists
   - Verify that you're using the correct bucket name and table name
   - Check that the environment variables are set correctly

3. **Dimensions not being extracted**
   - Check the CloudWatch logs for errors
   - Verify that the communication content is properly formatted
   - Check that AWS Comprehend has the necessary permissions

### Debugging Steps

1. **Enable verbose logging**:
   - Add more console.log statements to the Lambda function
   - Set the log level to DEBUG in the Lambda configuration

2. **Test with simplified data**:
   - Create a minimal communication with just the essential fields
   - Gradually add more fields to identify what's causing issues

3. **Check AWS Comprehend limits**:
   - Ensure the text isn't too long (max 5KB)
   - Check the AWS Comprehend service quotas

4. **Verify DynamoDB access**:
   - Check that the Lambda function has the necessary permissions
   - Verify that the table and indexes exist
   - Check that the key structure matches the table schema

## Next Steps

After successful testing, consider the following improvements:

1. **Add more sophisticated dimension extraction**:
   - Use machine learning for better entity recognition
   - Implement custom models for domain-specific entities
   - Add more context-aware extraction logic

2. **Optimize performance**:
   - Add caching for frequently accessed data
   - Implement batch processing for multiple communications
   - Use parallel processing for different dimensions

3. **Enhance error handling**:
   - Add retry logic for transient errors
   - Implement dead-letter queues for failed processing
   - Add more detailed error reporting

4. **Improve monitoring**:
   - Add custom metrics for dimension extraction quality
   - Set up alerts for processing failures
   - Create dashboards for monitoring extraction performance
