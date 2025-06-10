# Doc-Tales Technical Architecture

This document outlines the technical architecture of the Doc-Tales application, focusing on the core components and their interactions.

## System Overview

Doc-Tales is a personalized communications sorter that unifies content from diverse sources into a single dashboard with archetype-based personalization. The system consists of:

1. **Frontend Application**: React-based UI with archetype-specific views
2. **Data Ingestion Layer**: Adapters for different communication sources
3. **Dimension Extraction Engine**: Extracts key dimensions from communications
4. **Archetype Detection System**: Determines user's cognitive style
5. **AWS Serverless Backend**: Processes and stores communications

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
├───────────┬───────────┬────────────┬────────────┬───────────────┤
│ Prioritizer│ Connector │ Visualizer │  Analyst   │Configuration UI│
│   View    │   View    │    View    │    View    │               │
└─────┬─────┴─────┬─────┴─────┬──────┴─────┬──────┴───────┬───────┘
      │           │           │            │              │
      └───────────┴───────────┼────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Service Layer                         │
├─────────────────┬───────────────────────┬─────────────────────┬─┘
│ Unified Data    │ Archetype Detection   │ Dimension Extraction │
│ Service         │ Service               │ Service              │
└────────┬────────┴───────────┬───────────┴──────────┬───────────┘
         │                    │                      │
         ▼                    │                      │
┌──────────────────┐          │                      │
│ Source Adapters  │          │                      │
├──────────────────┤          │                      │
│ - Email Adapter  │          │                      │
│ - Document Adapter          │                      │
│ - Social Adapter │          │                      │
└────────┬─────────┘          │                      │
         │                    │                      │
         └────────────────────┼──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Serverless Backend                     │
├─────────────┬───────────────┬───────────────┬───────────────────┤
│ API Gateway │ Lambda        │ S3            │ DynamoDB          │
│             │ Functions     │ Buckets       │ Tables            │
└─────────────┴───────┬───────┴───────────────┴───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Data Sources                      │
├─────────────┬───────────────┬───────────────┬───────────────────┤
│ Email       │ Document      │ Social Media  │ Other             │
│ Providers   │ Storage       │ Platforms     │ Sources           │
└─────────────┴───────────────┴───────────────┴───────────────────┘
```

## Core Components

### 1. Frontend Application

The frontend is built with React and TypeScript, featuring:

- **Archetype-Specific Views**: Four different UI layouts optimized for different cognitive styles
  - **Prioritizer View**: Time-based organization with urgency indicators
  - **Connector View**: People-centric view with relationship mapping
  - **Visualizer View**: Visual boards with spatial organization
  - **Analyst View**: Detailed metadata view with logical hierarchies

- **Dashboard Component**: Central component that manages state and renders the appropriate view
- **Configuration UI**: Interface for managing data sources and preferences
- **Demo Flow**: Guided tour for onboarding new users

### 2. Data Service Layer

The data service layer manages communication data and user preferences:

- **Unified Data Service**: Central service that coordinates data access
  - Manages source adapters
  - Provides methods for filtering and sorting communications
  - Optimizes data for different archetypes

- **Source Adapters**: Standardize data from different sources
  - **Email Adapter**: Processes email communications
  - **Document Adapter**: Processes document communications
  - **Social Adapter**: Processes social media communications

- **Archetype Service**: Detects and manages user archetypes
  - Tracks user interactions
  - Calculates archetype confidence scores
  - Determines primary archetype

- **Dimension Extraction Service**: Extracts key dimensions from communications
  - **Temporal Dimension**: Deadlines, urgency, chronology
  - **Relationship Dimension**: Connection strength, frequency, network position
  - **Visual Dimension**: Document types, visual elements, spatial organization
  - **Analytical Dimension**: Categories, tags, sentiment, structure

### 3. AWS Serverless Backend

The AWS backend provides scalable, event-driven processing:

- **API Gateway**: RESTful API endpoints for frontend communication
- **Lambda Functions**:
  - **Ingestion Lambda**: Receives and normalizes communications
  - **Dimension Extraction Lambda**: Processes communications to extract dimensions
  - **Notification Lambda**: Sends alerts for high-priority communications
  - **API Lambda**: Serves data to frontend

- **Storage**:
  - **S3 Buckets**: Store raw communications and processed documents
  - **DynamoDB Tables**: Store metadata, dimensions, and user profiles

- **Event Management**:
  - **EventBridge**: Coordinates Lambda functions
  - **S3 Event Notifications**: Triggers for processing new communications
  - **DynamoDB Streams**: React to changes in data

## Data Flow

### Communication Ingestion Flow

1. New communication arrives via API Gateway
2. Ingestion Lambda processes and stores in S3
3. S3 event triggers Dimension Extraction Lambda
4. Extracted dimensions stored in DynamoDB
5. Frontend retrieves communication data via API Lambda

### User Interaction Flow

1. User interacts with communication in frontend
2. Interaction tracked by Archetype Service
3. Archetype confidence scores updated
4. Dashboard updates to reflect new primary archetype if needed

## Dimension Model

The dimension model is central to Doc-Tales' personalization approach:

### Temporal Dimension
- **Deadline**: When action is required
- **Urgency**: How important the communication is
- **Chronology**: When the communication was created and updated
- **Time Context**: Whether the communication is recent, past, or requires action

### Relationship Dimension
- **Connection Strength**: How strong the relationship is
- **Frequency**: How often communication occurs
- **Network Position**: Direct connection or shared connections
- **Context**: Personal, professional, or project-specific

### Visual Dimension
- **Document Type**: What kind of document it is
- **Visual Elements**: Charts, tables, images, attachments
- **Spatial Context**: Location-related information
- **Visual Category**: How the communication is best represented visually

### Analytical Dimension
- **Categories**: High-level groupings
- **Tags**: Specific labels
- **Sentiment**: Positive, neutral, or negative tone
- **Entities**: People, organizations, locations, dates, concepts
- **Metrics**: Word count, reading time, complexity
- **Structure**: Headings, bullet points, numbered lists, paragraphs

## Technology Stack

- **Frontend**:
  - React 17.x
  - TypeScript 4.x
  - ESLint for code quality

- **Backend**:
  - AWS Lambda (Node.js runtime)
  - AWS API Gateway
  - AWS S3
  - AWS DynamoDB
  - AWS Comprehend
  - AWS Textract

- **Development Tools**:
  - Git for version control
  - npm for package management
  - ESLint for code quality
  - AWS SAM for local Lambda development

## Security Considerations

- **Authentication**: User authentication via AWS Cognito
- **Authorization**: Fine-grained access control with IAM roles
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Strict validation of all inputs

## Scalability Considerations

- **Serverless Architecture**: Automatic scaling with Lambda
- **DynamoDB Auto-Scaling**: Adjust capacity based on demand
- **S3 Performance Optimization**: Partitioning strategy for high throughput

## Future Enhancements

- **Machine Learning**: Replace rule-based dimension extraction with ML models
- **Real-time Updates**: WebSocket support for instant updates
- **Mobile Application**: Native mobile apps for iOS and Android
- **Advanced Analytics**: Insights dashboard for communication patterns
- **Integration Ecosystem**: Expand source adapters to more platforms
