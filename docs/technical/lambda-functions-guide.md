# Lambda Functions Guide for Doc-Tales

This guide provides detailed information about the Lambda functions used in the Doc-Tales application, their purpose, inputs, outputs, and how they interact with other AWS services.

## Overview

Doc-Tales uses four main Lambda functions to implement its serverless backend:

1. **Ingestion Function**: Receives and normalizes communications from various sources
2. **Dimension Extraction Function**: Processes communications to extract dimensions
3. **Notification Function**: Sends alerts for high-priority communications
4. **API Function**: Serves data to the frontend application

## Ingestion Function

### Purpose
The Ingestion Function receives communications from various sources, normalizes them to a standard format, and stores them in S3 and DynamoDB.

### Triggers
- API Gateway POST requests to `/communications`
- Direct invocation from other services

### Inputs
- API Gateway events with communication data in the request body
- Direct invocation events with communication data

Example input:
```json
{
  "content": "Good news! Your mortgage pre-approval has been processed.",
  "subject": "Mortgage Pre-Approval Update",
  "from": {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@bankofamerica.com"
  },
  "to": [
    {
      "name": "User",
      "email": "user@example.com"
    }
  ],
  "timestamp": "2025-06-05T10:30:00Z",
  "project": "home-purchase",
  "urgency": "high",
  "category": "finance",
  "hasAttachments": true,
  "files": [
    {
      "name": "Pre-Approval-Letter.pdf",
      "type": "application/pdf",
      "size": 245000
    }
  ]
}
```

### Processing
1. Validates the incoming data
2. Normalizes the communication to a standard format
3. Generates a unique ID if not provided
4. Determines communication type, source, urgency, and project
5. Normalizes sender, recipients, and attachments
6. Extracts source-specific metadata

### Outputs
- Stores the raw communication in S3
- Stores metadata in DynamoDB
- Returns the communication ID and success message

Example output:
```json
{
  "message": "Communication received successfully",
  "communicationId": "abc123def456"
}
```

### AWS Services Used
- S3: Stores raw communications
- DynamoDB: Stores communication metadata
- API Gateway: Receives HTTP requests

## Dimension Extraction Function

### Purpose
The Dimension Extraction Function processes communications stored in S3, extracts dimensions using AWS Comprehend, and updates the DynamoDB record with the extracted dimensions.

### Triggers
- S3 object creation events
- Direct invocation with communication ID

### Inputs
- S3 event notifications
- Direct invocation events with communication ID

Example S3 event:
```json
{
  "Records": [
    {
      "eventSource": "aws:s3",
      "eventName": "ObjectCreated:Put",
      "s3": {
        "bucket": {
          "name": "doc-tales-raw-communications-dev"
        },
        "object": {
          "key": "email/2025/06/05/email-001.json"
        }
      }
    }
  ]
}
```

### Processing
1. Retrieves the communication from S3
2. Extracts temporal dimensions:
   - Deadlines, urgency, chronology
   - Time context (recent, past, requires action)
   - Detected dates using AWS Comprehend
3. Extracts relationship dimensions:
   - Connection strength, frequency
   - Network position and relevance
   - Context (personal, professional, project-specific)
   - Detected people and organizations using AWS Comprehend
4. Extracts visual dimensions:
   - Document type, visual elements
   - Spatial context and location
   - Visual category
5. Extracts analytical dimensions:
   - Categories, tags, sentiment
   - Entities and concepts
   - Metrics (word count, reading time, complexity)
   - Structure (headings, bullet points, etc.)
6. Calculates confidence scores for each dimension

### Outputs
- Updates the DynamoDB record with extracted dimensions
- Returns success message and dimension data

Example dimension data:
```json
{
  "temporal": {
    "deadline": "2025-06-10",
    "urgency": "high",
    "chronology": {
      "created": "2025-06-05T10:30:00Z",
      "lastUpdated": "2025-06-05T10:30:00Z",
      "followUpDate": "2025-06-10"
    },
    "timeContext": {
      "isRecent": true,
      "isPast": false,
      "requiresAction": true,
      "daysUntilDeadline": 5
    },
    "detectedDates": ["tomorrow", "2pm", "June 10"]
  },
  "relationship": {
    "connectionStrength": "strong",
    "frequency": "frequent",
    "lastInteraction": "2025-06-05T10:30:00Z",
    "networkPosition": {
      "isDirectConnection": true,
      "sharedConnections": 1,
      "relevanceScore": 0.8
    },
    "context": {
      "personal": false,
      "professional": true,
      "projectSpecific": true
    },
    "detectedPeople": ["Sarah Johnson"],
    "detectedOrganizations": ["Bank of America"]
  },
  "visual": {
    "hasImages": true,
    "documentType": "pdf",
    "visualElements": {
      "charts": 0,
      "tables": 0,
      "images": 0,
      "attachments": 1
    },
    "visualCategory": "document"
  },
  "analytical": {
    "categories": ["finance"],
    "tags": ["mortgage", "approval", "follow-up"],
    "sentiment": "positive",
    "entities": {
      "people": ["Sarah Johnson"],
      "organizations": ["Bank of America"],
      "locations": [],
      "dates": ["tomorrow", "2pm"],
      "concepts": ["mortgage", "pre-approval", "follow-up call"]
    },
    "metrics": {
      "wordCount": 25,
      "readingTime": 1,
      "complexity": "low",
      "informationDensity": 20
    },
    "structure": {
      "hasHeadings": false,
      "hasBulletPoints": false,
      "hasNumberedLists": false,
      "paragraphCount": 1
    }
  },
  "confidenceScores": {
    "temporal": 0.8,
    "relationship": 0.7,
    "visual": 0.6,
    "analytical": 0.9
  }
}
```

### AWS Services Used
- S3: Retrieves raw communications
- DynamoDB: Updates communication records with dimensions
- AWS Comprehend: Performs entity recognition, sentiment analysis, and key phrase extraction

## Notification Function

### Purpose
The Notification Function monitors DynamoDB for high-priority communications and sends notifications via SNS.

### Triggers
- DynamoDB Stream events
- Direct invocation with communication ID and message

### Inputs
- DynamoDB Stream events
- Direct invocation events with communication ID and message

Example DynamoDB Stream event:
```json
{
  "Records": [
    {
      "eventName": "MODIFY",
      "dynamodb": {
        "NewImage": {
          "id": { "S": "email-001" },
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

### Processing
1. Determines if a notification should be sent based on:
   - Urgency level
   - Whether action is required
   - Approaching deadlines
2. Creates a notification message with:
   - Subject line
   - Sender information
   - Project context
   - Deadline information
3. Sends the notification via SNS

### Outputs
- Sends notification to SNS topic
- Returns success message

Example notification message:
```json
{
  "subject": "High Priority: Mortgage Pre-Approval Update",
  "message": "You have a high priority communication that requires your attention.\n\nSubject: Mortgage Pre-Approval Update\nFrom: Sarah Johnson\nProject: home purchase\nDeadline: 2025-06-10\n\nPlease review this communication as soon as possible."
}
```

### AWS Services Used
- DynamoDB Streams: Monitors for changes to communications
- SNS: Sends notifications
- CloudWatch Logs: Logs notification activity

## API Function

### Purpose
The API Function serves data to the frontend application, providing endpoints for retrieving communications and user profiles.

### Triggers
- API Gateway requests to various endpoints

### Endpoints
- `GET /communications`: Retrieves communications with optional filtering
- `GET /communications/{id}`: Retrieves a specific communication by ID
- `GET /user-profile`: Retrieves the user profile
- `PUT /user-profile`: Updates the user profile
- `GET /archetypes`: Retrieves available archetypes

### Inputs
- API Gateway events with path, method, and query parameters

Example API Gateway event:
```json
{
  "httpMethod": "GET",
  "path": "/communications",
  "queryStringParameters": {
    "project": "home-purchase",
    "urgency": "high"
  }
}
```

### Processing
1. Routes the request based on path and method
2. Applies filters based on query parameters
3. Queries DynamoDB for communications or user profiles
4. Retrieves full communication content from S3 if needed
5. Formats the response for the frontend

### Outputs
- Returns JSON responses with requested data
- Includes CORS headers for browser access

Example response for `/communications`:
```json
{
  "communications": [
    {
      "id": "email-001",
      "type": "email",
      "source": "gmail",
      "timestamp": "2025-06-05T10:30:00Z",
      "subject": "Mortgage Pre-Approval Update",
      "sender": {
        "id": "contact-001",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@bankofamerica.com"
      },
      "project": "home-purchase",
      "metadata": {
        "urgency": "high",
        "category": "finance"
      },
      "dimensions": {
        // Dimension data here
      }
    }
  ],
  "count": 1,
  "scannedCount": 1
}
```

### AWS Services Used
- API Gateway: Handles HTTP requests
- DynamoDB: Retrieves communication metadata and user profiles
- S3: Retrieves full communication content
- CloudWatch Logs: Logs API activity

## Function Interactions

The Lambda functions interact in the following sequence:

1. **Ingestion Flow**:
   - Frontend or external source sends communication to API Gateway
   - API Gateway triggers Ingestion Function
   - Ingestion Function stores communication in S3
   - S3 event triggers Dimension Extraction Function
   - Dimension Extraction Function updates DynamoDB
   - DynamoDB Stream triggers Notification Function if urgent
   - Notification Function sends notification via SNS

2. **Retrieval Flow**:
   - Frontend requests communications from API Gateway
   - API Gateway triggers API Function
   - API Function queries DynamoDB for communications
   - API Function retrieves full content from S3 if needed
   - API Function returns formatted data to frontend

## Local Testing

You can test the Lambda functions locally using the AWS SAM CLI:

```bash
# Test the Ingestion Function
sam local invoke IngestionFunction --event infrastructure/sam/events/ingestion-event.json

# Test the Dimension Extraction Function
sam local invoke DimensionExtractionFunction --event infrastructure/sam/events/dimension-extraction-event.json

# Test the API Function
sam local invoke ApiFunction --event infrastructure/sam/events/api-get-communications-event.json

# Start the API locally
sam local start-api
```

## Monitoring and Debugging

To monitor and debug the Lambda functions:

1. **CloudWatch Logs**:
   - Each function logs to its own CloudWatch Logs group
   - Log format includes timestamp, log level, and message

2. **X-Ray Tracing**:
   - Enable X-Ray tracing in the SAM template
   - View trace maps in the AWS X-Ray console

3. **CloudWatch Metrics**:
   - Monitor invocation count, duration, and errors
   - Set up alarms for error thresholds

4. **Dead Letter Queues**:
   - Configure DLQs for failed function executions
   - Process failed events for retry or analysis
