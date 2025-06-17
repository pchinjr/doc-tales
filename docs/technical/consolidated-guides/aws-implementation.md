# AWS Implementation Guide

This consolidated guide covers all aspects of AWS implementation for the Doc-Tales project, reflecting the current state of the application.

## Table of Contents
- [Integration Strategy](#integration-strategy)
- [Infrastructure Components](#infrastructure-components)
- [Deployment Process](#deployment-process)
- [Lambda Functions](#lambda-functions)
- [DynamoDB Implementation](#dynamodb-implementation)
- [Event-Driven Architecture](#event-driven-architecture)
- [Monitoring and Logging](#monitoring-and-logging)
- [Future Improvements](#future-improvements)

## Integration Strategy

Doc-Tales leverages several AWS services to create a scalable, serverless backend:

- **API Gateway**: Provides RESTful API endpoints for frontend communication
- **Lambda**: Handles serverless processing of documents and user requests
- **DynamoDB**: Stores user profiles, document metadata, and archetype information
- **S3**: Manages document storage and static assets
- **CloudFormation**: Manages infrastructure as code through SAM templates

### Key Integration Points

1. **Frontend to Backend**: React application communicates with API Gateway endpoints
2. **Document Processing Pipeline**: S3 triggers Lambda functions for document analysis
3. **User Profile Management**: DynamoDB stores and retrieves personalization data
4. **Archetype Detection**: API Lambda function customizes responses based on user archetype

## Infrastructure Components

### API Gateway Configuration

- **API Structure**: RESTful design with resource-based endpoints
- **CORS**: Configured for frontend access
- **Integration**: Direct integration with Lambda functions

### Lambda Functions

| Function Name | Purpose | Triggers | Resources Accessed |
|---------------|---------|----------|-------------------|
| `ApiFunction` | Serves data to frontend | API Gateway | DynamoDB, S3 |
| `IngestionFunction` | Receives and normalizes communications | API Gateway | DynamoDB, S3 |
| `DimensionExtractionFunction` | Extracts dimensions from communications | S3 events | DynamoDB, S3 |
| `NotificationFunction` | Sends alerts for high-priority communications | DynamoDB Streams | SNS |
| `SetupS3EventsFunction` | Sets up S3 event notifications | CloudFormation | S3 |

### DynamoDB Tables

- **Communications Table**: Single-table design for communications metadata
  - Partition Key: Entity type (COMM, USER, etc.)
  - Sort Key: Entity ID
  - GSI1: Project-based access patterns
  - GSI2: Sender-based access patterns
- **User Profiles Table**: User profiles and archetype preferences

### S3 Buckets

- **Raw Communications Bucket**: Raw document storage
- **Processed Documents Bucket**: Processed document data

## Deployment Process

### Prerequisites

- AWS CLI configured with appropriate permissions
- SAM CLI installed
- Node.js 22.x

### Deployment Steps

1. **Build the SAM template**:
   ```bash
   cd infrastructure/sam
   sam build
   ```

2. **Deploy the stack**:
   ```bash
   sam deploy --stack-name doc-tales --parameter-overrides Environment=dev AppName=doc-tales
   ```

3. **Seed the database**:
   ```bash
   ./seed-data.sh
   ```

4. **Verify deployment**:
   ```bash
   ./deploy-and-verify.sh
   ```

### CI/CD Pipeline

- GitHub Actions workflow for automated testing and deployment
- GitHub OIDC for secure AWS authentication

## Lambda Functions

### API Function

The API function (`src/lambda/api/index.js`) is the core of the backend, providing endpoints for:

- Getting communications with archetype-based personalization
- Getting individual communications by ID
- Getting and updating user profiles
- Getting available archetypes

Key features:
- Customizes responses based on user archetype
- Supports filtering communications by project
- Adds metadata for frontend rendering
- Provides view descriptions for each archetype

### Ingestion Function

The Ingestion function (`src/lambda/ingestion/index.js`) handles:

- Receiving communications from various sources
- Normalizing data into a standard format
- Storing raw communications in S3
- Creating metadata records in DynamoDB

### Dimension Extraction Function

The Dimension Extraction function (`src/lambda/dimension-extraction/index.js`):

- Is triggered by S3 events when new communications are uploaded
- Extracts temporal, relationship, visual, and analytical dimensions
- Updates metadata in DynamoDB with extracted dimensions

### Notification Function

The Notification function (`src/lambda/notification/index.js`):

- Is triggered by DynamoDB Streams when high-priority communications are added
- Sends alerts through SNS for high-priority communications

### Setup S3 Events Function

The Setup S3 Events function (`src/lambda/setup-s3-events/index.js`):

- Acts as a CloudFormation custom resource
- Configures S3 event notifications to trigger the Dimension Extraction function

## DynamoDB Implementation

### Access Patterns

| Access Pattern              | Description                           | Key Structure                  | Index      |
|----------------------------|---------------------------------------|--------------------------------|------------|
| Get all communications     | Retrieve all communications           | PK = "COMM"                    | Base table |
| Get communication by ID    | Retrieve a specific communication     | PK = "COMM", SK = "COMM#{id}"  | Base table |
| Get communications by project | Retrieve all communications for a project | GSI1PK = "PROJECT#{projectId}" | GSI1       |
| Get communications by sender | Retrieve all communications from a sender | GSI2PK = "ENTITY#{senderId}"  | GSI2       |
| Get user profile           | Retrieve a user's profile             | PK = "USER#{userId}"           | Base table |

### Data Model

The communications table uses a dimension-based data model with four key dimensions:

1. **Temporal**: Deadlines, urgency, chronology, follow-up dates
2. **Relationship**: Connection strength, frequency, network position
3. **Visual**: Document types, visual elements, spatial organization
4. **Analytical**: Categories, tags, sentiment, structure

These dimensions are used to customize the view based on the user's archetype.

## Event-Driven Architecture

Doc-Tales uses an event-driven architecture for asynchronous processing:

1. **S3 Events**: Trigger the Dimension Extraction function when new communications are uploaded
2. **DynamoDB Streams**: Trigger the Notification function when high-priority communications are added

This architecture enables:
- Decoupled, scalable processing
- Real-time updates and notifications
- Efficient resource utilization

## Monitoring and Logging

- CloudWatch Logs for Lambda function logs
- CloudWatch Metrics for performance monitoring
- Custom logging in Lambda functions for debugging

## Future Improvements

1. **Backend Improvements**:
   - Implement Lambda Layers for shared code
   - Add comprehensive error handling and logging
   - Enhance security with proper authentication

2. **Enhanced Interaction Tracking**:
   - Improve archetype detection algorithm
   - Add more interaction types to track

3. **UI Enhancements**:
   - Add animations for archetype transitions
   - Implement relationship visualization with D3.js
   - Create project timeline visualization
   - Connect frontend to deployed AWS backend

4. **Advanced Analytics**:
   - Implement AWS Comprehend for entity extraction
   - Use AWS Textract for document processing
   - Add sentiment analysis for communications
