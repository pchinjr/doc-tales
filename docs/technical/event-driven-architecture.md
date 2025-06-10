# Event-Driven Architecture in Doc-Tales

This document explains the event-driven architecture implemented in Doc-Tales, focusing on how events trigger different components of the system and enable real-time processing.

## Overview

Doc-Tales uses an event-driven architecture to process communications asynchronously and react to changes in the system. This approach provides several benefits:

- **Decoupling**: Components can operate independently
- **Scalability**: Each component can scale based on its own workload
- **Resilience**: Failures in one component don't affect others
- **Real-time processing**: Events trigger immediate actions

## Event Flow Diagram

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌─────────────┐
│ API Gateway │────▶│ Ingestion     │────▶│ S3 Event        │────▶│ Dimension   │
│ Event       │     │ Lambda        │     │ Notification    │     │ Extraction  │
└─────────────┘     └───────────────┘     └─────────────────┘     └──────┬──────┘
                                                                         │
                                                                         ▼
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌─────────────┐
│ SNS         │◀────│ Notification  │◀────│ DynamoDB        │◀────│ DynamoDB    │
│ Notification│     │ Lambda        │     │ Stream Event    │     │ Update      │
└─────────────┘     └───────────────┘     └─────────────────┘     └─────────────┘
```

## Event Types

Doc-Tales uses several types of events to trigger actions in the system:

### 1. API Gateway Events

**Source**: Frontend application or external systems  
**Target**: Ingestion Lambda Function  
**Format**: HTTP requests with JSON payloads  
**Purpose**: Trigger the ingestion of new communications

Example API Gateway event:
```json
{
  "httpMethod": "POST",
  "path": "/communications",
  "body": "{\"content\":\"Meeting tomorrow at 2pm\",\"subject\":\"Meeting Reminder\"}"
}
```

### 2. S3 Event Notifications

**Source**: S3 bucket (when new objects are created)  
**Target**: Dimension Extraction Lambda Function  
**Format**: S3 event notification with bucket and object details  
**Purpose**: Trigger dimension extraction when new communications are stored

Example S3 event:
```json
{
  "Records": [
    {
      "eventSource": "aws:s3",
      "eventName": "ObjectCreated:Put",
      "s3": {
        "bucket": { "name": "doc-tales-raw-communications-dev" },
        "object": { "key": "email/2025/06/10/email-123.json" }
      }
    }
  ]
}
```

### 3. DynamoDB Stream Events

**Source**: DynamoDB table (when items are modified)  
**Target**: Notification Lambda Function  
**Format**: DynamoDB stream event with old and new item images  
**Purpose**: Trigger notifications when high-priority communications are detected

Example DynamoDB Stream event:
```json
{
  "Records": [
    {
      "eventName": "MODIFY",
      "dynamodb": {
        "NewImage": {
          "id": { "S": "email-123" },
          "metadata": {
            "M": {
              "urgency": { "S": "high" }
            }
          }
        }
      }
    }
  ]
}
```

### 4. SNS Notifications

**Source**: Notification Lambda Function  
**Target**: External notification channels (email, SMS, etc.)  
**Format**: SNS message with subject and body  
**Purpose**: Deliver notifications to users

Example SNS message:
```json
{
  "Subject": "High Priority: Meeting Reminder",
  "Message": "You have a high priority communication that requires your attention.",
  "MessageAttributes": {
    "communicationId": {
      "DataType": "String",
      "StringValue": "email-123"
    }
  }
}
```

## Event Handlers

Each event type is handled by a specific component in the system:

### 1. Ingestion Lambda Function

Handles API Gateway events by:
- Validating and normalizing the communication data
- Storing the raw communication in S3
- Creating a metadata record in DynamoDB

The S3 storage operation automatically triggers an S3 event notification.

### 2. Dimension Extraction Lambda Function

Handles S3 event notifications by:
- Retrieving the communication from S3
- Extracting dimensions using AWS Comprehend
- Updating the DynamoDB record with the extracted dimensions

The DynamoDB update operation automatically triggers a DynamoDB Stream event.

### 3. Notification Lambda Function

Handles DynamoDB Stream events by:
- Checking if the communication requires notification
- Creating a notification message
- Publishing the message to an SNS topic

### 4. SNS Topic

Handles SNS notifications by:
- Delivering the message to subscribed endpoints
- Providing delivery status and metrics

## Event Filtering

Doc-Tales uses event filtering to ensure that components only process relevant events:

### S3 Event Filtering

The S3 event notification is configured to only trigger the Dimension Extraction Lambda for specific object creation events:

```yaml
Events:
  S3Event:
    Type: S3
    Properties:
      Bucket: !Ref RawCommunicationsBucket
      Events: s3:ObjectCreated:*
```

### DynamoDB Stream Filtering

The DynamoDB Stream event is configured to only trigger the Notification Lambda for high-urgency communications:

```yaml
Events:
  DynamoDBEvent:
    Type: DynamoDB
    Properties:
      Stream: !GetAtt CommunicationsTable.StreamArn
      StartingPosition: LATEST
      FilterCriteria:
        Filters:
          - Pattern: '{"dynamodb": {"NewImage": {"metadata": {"M": {"urgency": {"S": ["high"]}}}}}}'
```

## Error Handling

The event-driven architecture includes error handling mechanisms:

1. **Retry Policies**: Lambda functions are configured with retry policies for transient errors
2. **Dead Letter Queues**: Failed events can be sent to DLQs for later processing
3. **Error Logging**: All errors are logged to CloudWatch Logs
4. **Monitoring**: CloudWatch Alarms are set up to alert on error conditions

## Scaling Considerations

The event-driven architecture scales automatically based on event volume:

1. **Lambda Concurrency**: Functions scale based on incoming events
2. **S3 Event Notifications**: S3 can handle high volumes of object creation events
3. **DynamoDB Streams**: Streams scale with the throughput of the table
4. **SNS**: Can handle high volumes of notifications

## Local Testing

You can test the event flow locally using the AWS SAM CLI:

```bash
# Test the complete event flow
sam local invoke IngestionFunction --event events/ingestion-event.json
```

This will trigger the Ingestion Lambda, which would normally trigger the S3 event. Since this is local testing, you'll need to manually invoke the next function:

```bash
sam local invoke DimensionExtractionFunction --event events/dimension-extraction-event.json
```

## Monitoring the Event Flow

You can monitor the event flow in production using:

1. **CloudWatch Logs**: Each function logs its processing steps
2. **X-Ray Traces**: Trace requests through the entire event flow
3. **CloudWatch Metrics**: Monitor event counts and processing times
4. **CloudWatch Dashboards**: Create dashboards to visualize the event flow

## Benefits for Doc-Tales

The event-driven architecture provides several benefits for Doc-Tales:

1. **Real-time Processing**: Communications are processed as soon as they arrive
2. **Scalability**: The system can handle varying loads of communications
3. **Resilience**: Failures in one component don't affect others
4. **Cost Efficiency**: Resources are only used when events are being processed
5. **Extensibility**: New event handlers can be added without modifying existing components

## Future Enhancements

The event-driven architecture can be enhanced in the future:

1. **Event Bridge**: Use EventBridge for more complex event routing
2. **Step Functions**: Orchestrate multi-step workflows with Step Functions
3. **Kinesis**: Use Kinesis for real-time analytics on communication data
4. **WebSockets**: Implement WebSockets for real-time updates to the frontend
