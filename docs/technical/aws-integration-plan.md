# AWS Integration Plan for Doc-Tales

This document outlines the AWS integration strategy for the Doc-Tales hackathon project, focusing on serverless architecture with Lambda functions and event-driven processing.

## Overview

Doc-Tales will leverage AWS services to create a scalable, event-driven architecture for processing communications from various sources. The core of this architecture will be Lambda functions triggered by events, with data stored in S3 and DynamoDB.

## Architecture Diagram

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌─────────────┐
│ API Gateway │────▶│ Ingestion     │────▶│ S3 Raw          │────▶│ Processing  │
│             │     │ Lambda        │     │ Communications   │     │ Lambda      │
└─────────────┘     └───────────────┘     └─────────────────┘     └──────┬──────┘
                                                                         │
                                                                         ▼
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌─────────────┐
│ React       │◀────│ API Lambda    │◀────│ DynamoDB        │◀────│ Dimension   │
│ Frontend    │     │               │     │ Tables          │     │ Extraction  │
└─────────────┘     └───────────────┘     └─────────────────┘     └─────────────┘
                           ▲                                             │
                           │                                             │
                           └─────────────────────────────────────────────┘
```

## Core AWS Services

### Compute
- **AWS Lambda**: Serverless functions for processing communications
- **API Gateway**: RESTful API endpoints for frontend communication

### Storage
- **Amazon S3**: Object storage for raw communications and processed documents
- **Amazon DynamoDB**: NoSQL database for metadata, dimensions, and user profiles

### AI/ML
- **Amazon Comprehend**: Natural language processing for entity and sentiment extraction
- **Amazon Textract**: Document processing and text extraction

### Event Management
- **Amazon EventBridge**: Event bus for coordinating Lambda functions
- **S3 Event Notifications**: Triggers for processing new communications
- **DynamoDB Streams**: React to changes in data

### Messaging
- **Amazon SNS**: Notification service for alerts
- **Amazon SQS**: Message queuing for asynchronous processing

## Lambda Functions

### 1. Ingestion Lambda
**Purpose**: Receive and normalize communications from various sources
**Triggers**:
- API Gateway requests
- S3 object creation events
- Scheduled EventBridge rules

**Process**:
1. Validate incoming data
2. Normalize to standard format
3. Store raw communication in S3
4. Trigger dimension extraction process

**Output**:
- Raw communication stored in S3
- Event published to trigger processing

### 2. Dimension Extraction Lambda
**Purpose**: Extract dimensions from communications
**Triggers**:
- S3 object creation events
- SNS notifications

**Process**:
1. Retrieve communication from S3
2. Extract temporal dimensions
   - Use Comprehend to identify dates, deadlines
   - Calculate urgency based on content and context
3. Extract relationship dimensions
   - Identify people and organizations
   - Determine connection strength and frequency
4. Extract visual dimensions
   - Use Textract to identify document structure
   - Analyze visual elements
5. Extract analytical dimensions
   - Use Comprehend for sentiment analysis
   - Categorize and tag content

**Output**:
- Dimension data stored in DynamoDB
- Event published for notification if needed

### 3. Notification Lambda
**Purpose**: Send alerts for high-priority communications
**Triggers**:
- DynamoDB Streams
- EventBridge rules

**Process**:
1. Evaluate communication urgency
2. Determine notification channel
3. Format notification message
4. Send via SNS/SQS

**Output**:
- Notifications sent to appropriate channels

### 4. API Lambda
**Purpose**: Serve data to frontend
**Triggers**:
- API Gateway requests

**Process**:
1. Authenticate and authorize requests
2. Query DynamoDB for communications and dimensions
3. Format response based on archetype

**Output**:
- JSON responses to frontend requests

## Data Storage

### S3 Buckets
1. **Raw Communications Bucket**
   - Structure: `/{source_type}/{year}/{month}/{day}/{communication_id}`
   - Example: `/email/2025/06/10/email-001.json`

2. **Processed Documents Bucket**
   - Structure: `/{communication_id}/{file_name}`
   - Example: `/email-001/attachment.pdf`

3. **Assets Bucket**
   - Structure: `/{communication_id}/{asset_type}/{asset_id}`
   - Example: `/email-001/images/image-1.jpg`

### DynamoDB Tables

1. **Communications Table**
   - Partition Key: `id` (String)
   - Sort Key: `timestamp` (String)
   - GSI1: `project` (Partition Key), `timestamp` (Sort Key)
   - GSI2: `sender_id` (Partition Key), `timestamp` (Sort Key)
   - Attributes:
     - Basic communication metadata
     - Dimension data (embedded)
     - References to S3 objects

2. **User Profiles Table**
   - Partition Key: `user_id` (String)
   - Attributes:
     - Primary archetype
     - Archetype confidence scores
     - Preferences
     - Interaction history

## Event Flow

1. **New Communication Flow**:
   - Communication arrives via API Gateway
   - Ingestion Lambda processes and stores in S3
   - S3 event triggers Dimension Extraction Lambda
   - Extracted dimensions stored in DynamoDB
   - DynamoDB Stream triggers Notification Lambda if urgent
   - Frontend polls or receives WebSocket notification

2. **User Interaction Flow**:
   - User interacts with communication in frontend
   - Interaction sent to API Gateway
   - API Lambda updates user profile in DynamoDB
   - Archetype confidence scores updated

## Implementation Phases

### Phase 1: Core Infrastructure
- Set up S3 buckets
- Create DynamoDB tables
- Configure IAM roles and policies

### Phase 2: Lambda Functions
- Implement Ingestion Lambda
- Implement Dimension Extraction Lambda
- Implement basic API Lambda

### Phase 3: Event Integration
- Configure S3 event notifications
- Set up DynamoDB Streams
- Implement event handling in Lambda functions

### Phase 4: Frontend Integration
- Update frontend to use API Gateway
- Implement authentication
- Add real-time updates

## Hackathon Demo Scenario

For the hackathon demo, we'll showcase:

1. **Real-time Processing**: Upload a document and show it being processed through the pipeline
2. **Event-Driven Architecture**: Demonstrate how events trigger different Lambda functions
3. **Dimension Extraction**: Show how AWS AI services extract dimensions from communications
4. **Personalized Views**: Display the same communication across different archetype views

## Development Approach

1. **Local Development First**:
   - Use AWS SAM or Serverless Framework for local testing
   - Implement and test Lambda functions locally

2. **Infrastructure as Code**:
   - Define all AWS resources using CloudFormation or AWS CDK
   - Create reusable components for Lambda functions

3. **Continuous Deployment**:
   - Set up GitHub Actions for automated deployment
   - Implement environment-based deployment (dev, staging, prod)

## Conclusion

This AWS integration plan leverages serverless architecture and event-driven processing to create a scalable, responsive system for Doc-Tales. By focusing on Lambda functions and event triggers, we'll demonstrate the power of cloud-native architecture for intelligent document processing.
