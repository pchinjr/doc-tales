# Doc-Tales Technical Implementation Summary

This document provides a summary of the technical implementation of the Doc-Tales application, focusing on the AWS serverless architecture and key features.

## Architecture Overview

Doc-Tales is implemented as a serverless application using AWS services:

1. **Frontend**: React with TypeScript
2. **Backend**: AWS Lambda functions with API Gateway
3. **Storage**: DynamoDB for metadata and S3 for document storage
4. **Event Processing**: Event-driven architecture with DynamoDB Streams and S3 events

## Key Components

### Lambda Functions

1. **API Function (`src/lambda/api/index.js`)**
   - Serves data to the frontend application
   - Provides endpoints for retrieving communications and user profiles
   - Implements archetype-based personalization
   - Supports cross-project organization

2. **Ingestion Function (`src/lambda/ingestion/index.js`)**
   - Receives and normalizes communications from various sources
   - Stores raw communications in S3 and metadata in DynamoDB

3. **Dimension Extraction Function (`src/lambda/dimension-extraction/index.js`)**
   - Triggered by S3 events when new communications are uploaded
   - Extracts dimensions from communications (temporal, relationship, visual, analytical)
   - Updates metadata in DynamoDB

4. **Notification Function (`src/lambda/notification/index.js`)**
   - Triggered by DynamoDB Streams when high-priority communications are added
   - Sends alerts for high-priority communications

5. **Setup S3 Events Function (`src/lambda/setup-s3-events/index.js`)**
   - CloudFormation custom resource for setting up S3 event notifications

### DynamoDB Tables

1. **Communications Table**
   - Single-table design with composite keys
   - Global Secondary Indexes for efficient queries
   - Stores communication metadata and dimensions

2. **User Profiles Table**
   - Stores user preferences and archetype information
   - Tracks archetype confidence scores

### S3 Buckets

1. **Raw Communications Bucket**
   - Stores raw communications data
   - Triggers dimension extraction function on new uploads

2. **Processed Documents Bucket**
   - Stores processed communications with extracted dimensions

## Key Features

### 1. Archetype-Based Personalization

The API customizes the view based on the user's archetype preference:

- **Prioritizer**: Communications are sorted chronologically with urgency indicators
- **Connector**: Communications are organized by people and relationships
- **Visualizer**: Communications are grouped by project for visual organization
- **Analyst**: Communications are categorized with detailed metadata

Implementation:
- User profiles store the primary archetype and confidence scores
- API function retrieves the user's profile and customizes the response
- Each communication includes additional fields for frontend rendering:
  - `_archetypeView`: Indicates which archetype view is being used
  - `_sortKey`: The key used for sorting in this view
  - `_highlight`: What aspect should be highlighted in this view
  - `_displayFormat`: How the data should be displayed

### 2. Cross-Project Organization

Users can filter communications by project to see only the relevant information:

- API supports filtering by project using GSI1 (Global Secondary Index)
- Communications are tagged with project information
- Frontend can display communications across different projects

### 3. Dimension-Based Data Model

Communications are processed to extract four key dimensions:

- **Temporal**: Deadlines, urgency, chronology, follow-up dates
- **Relationship**: Connection strength, frequency, network position
- **Visual**: Document types, visual elements, spatial organization
- **Analytical**: Categories, tags, sentiment, structure

### 4. Unified Data Ingestion

The application provides a unified interface for data from multiple sources:

- Email communications
- Document attachments
- Social media messages

## Deployment

The application is deployed using AWS SAM (Serverless Application Model):

- Infrastructure as code in `infrastructure/sam/template.yaml`
- CI/CD pipeline using GitHub Actions
- Automated testing and verification

## Testing

The application includes comprehensive testing:

- Unit tests for Lambda functions
- Integration tests for API endpoints
- End-to-end tests for the complete workflow

## Future Enhancements

1. **Machine Learning for Archetype Detection**
   - Replace rule-based approach with ML model
   - Improve confidence threshold for archetype switching

2. **Enhanced Visualization**
   - Implement relationship visualization with D3.js
   - Create project timeline visualization

3. **Mobile Application**
   - Develop companion mobile app for on-the-go access
   - Implement push notifications for high-priority communications
