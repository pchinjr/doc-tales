# Technical Architecture for Doc-Tales

## Overview

This document outlines the technical architecture for Doc-Tales, a personalized communications sorter with archetype-based dashboards. The architecture is designed to be serverless, scalable, and cost-effective while supporting the system's core capabilities.

## Core Architecture Components

### 1. Ingestion Layer
- **Document Capture Service**
  - Lambda functions triggered by S3 uploads
  - SES email receiving pipeline
  - API Gateway endpoints for social media webhooks

- **Content Extraction Pipeline**
  - Textract for document text/form extraction
  - Lambda functions for email parsing
  - Custom extractors for social media content
  - S3 for raw content storage

### 2. Processing Layer
- **Entity Extraction Service**
  - Amazon Comprehend for NLP and entity recognition
  - Custom Lambda functions for specialized entity types
  - DynamoDB for entity storage and relationships

- **Classification System**
  - Rule-based classification for the hackathon MVP
  - Lambda functions for categorization
  - Step Functions for multi-stage classification workflows

- **Project Organization Engine**
  - Lambda functions for project relationship detection
  - DynamoDB for storing project metadata
  - EventBridge for cross-project updates

### 3. Archetype System
- **Interaction Tracking Service**
  - API Gateway for capturing UI interactions
  - Lambda functions for behavior analysis
  - DynamoDB for storing interaction patterns

- **Archetype Classification Engine**
  - Rule-based classification for the hackathon MVP
  - Lambda functions for interface adaptation
  - DynamoDB for storing user archetype profiles

- **Adaptive Dashboard Controller**
  - Lambda functions for dashboard configuration
  - API Gateway for UI updates
  - WebSocket API for real-time notifications

### 4. Storage Layer
- **Content Store**
  - S3 for document and media storage
  - Lifecycle policies for tiered storage

- **Metadata Store**
  - DynamoDB for document metadata and user preferences
  - DynamoDB for user archetype profiles

- **Project Store**
  - DynamoDB for project relationships
  - DynamoDB for cross-project elements

### 5. API Layer
- **REST API**
  - API Gateway for all service operations
  - Lambda functions for business logic
  - Standard HTTP request/response patterns

- **WebSockets API**
  - API Gateway WebSocket API for real-time notifications
  - Lambda functions for connection management
  - Simple pub/sub pattern for UI updates

### 6. Frontend Layer
- **Web Application**
  - React components with archetype variations
  - S3 for static asset hosting
  - CloudFront for content delivery

## Adaptive Dashboard Evolution

### Gradual Adaptation Principles

1. **Progressive Enhancement**
   - Incremental changes based on observed patterns
   - Feature highlighting for new organizational elements
   - Contextual adaptations for specific content types

2. **Consistent Core Elements**
   - Primary navigation structure stays consistent
   - All communications remain accessible, just organized differently
   - Core functionality and actions maintain consistent placement

3. **Transparent Adaptation Process**
   - Brief explanations for suggested changes
   - Preview option for adaptations
   - Direct user feedback on adaptation helpfulness

4. **User Control**
   - Opt-in changes for significant layout modifications
   - Ability to undo adaptations
   - Manual customization options alongside AI suggestions

### Multi-dimensional Adaptation Model

- **Primary Archetype**: Determines the main dashboard layout and organization
- **Secondary Influences**: Incorporates elements from other archetypes based on specific behaviors
- **Context Sensitivity**: Different views for different communication types or projects

### Example Adaptation Scenarios

1. **Emerging Prioritizer**
   - System notices user frequently sorts by date and urgency
   - Suggests deadline countdowns for important items
   - Gradually introduces more Prioritizer elements
   - Eventually suggests full Prioritizer view with preview option

2. **Connector/Analyst Hybrid**
   - User shows strong affinity for both people-centric views and detailed metadata
   - System creates hybrid view with relationship graphs and enhanced metadata panels
   - Context-sensitive switching based on content type
   - Custom dashboard combines elements from both archetypes

## AWS Implementation

### Key AWS Services

1. **Compute**
   - Lambda for serverless functions
   - Step Functions for workflow orchestration

2. **Storage**
   - S3 for document and static asset storage
   - DynamoDB for metadata, user profiles, and relationships

3. **AI/ML**
   - Comprehend for entity extraction and text analysis
   - Textract for document processing
   - SageMaker for future ML model development (post-hackathon)

4. **Integration**
   - EventBridge for event-driven architecture
   - SQS for message queuing
   - SES for email processing

5. **API**
   - API Gateway for REST endpoints
   - API Gateway WebSockets for real-time communication

6. **Delivery**
   - CloudFront for content delivery
   - S3 for static website hosting

### Data Flow

1. **Communication Ingestion Flow**
   ```
   Document Upload → S3 → Lambda → Textract → Lambda → DynamoDB/S3
   Email → SES → S3 → Lambda → DynamoDB/S3
   Social Media → API Gateway → Lambda → DynamoDB/S3
   ```

2. **Processing Flow**
   ```
   New Content → EventBridge → Step Functions →
     │
     ├─▶ Entity Extraction (Comprehend + Lambda) → DynamoDB
     │
     ├─▶ Classification (Lambda) → DynamoDB
     │
     └─▶ Project Organization (Lambda) → DynamoDB
   ```

3. **User Interaction Flow**
   ```
   UI Interaction → API Gateway → Lambda → DynamoDB → 
     Lambda → DynamoDB (User Profile)
   ```

4. **Dashboard Personalization Flow**
   ```
   Dashboard Request → API Gateway → Lambda → 
     │
     ├─▶ DynamoDB (User Profile)
     │
     ├─▶ DynamoDB (Content Metadata)
     │
     └─▶ Personalized Response → UI Update
   ```

## Simplified Implementation for Hackathon

For the 2-week hackathon, we'll implement a simplified version of this architecture:

1. **Replace ML with Rules**
   - Use rule-based classification for archetypes
   - Implement pre-defined relationship mapping rules
   - Focus on the appearance of intelligence rather than true ML

2. **Pre-compute Where Possible**
   - Pre-process the sample dataset
   - Pre-compute entity extraction and classification
   - Store results in DynamoDB for quick retrieval

3. **Focus on Demo Experience**
   - Implement only the components needed for the demo flow
   - Create a scripted experience for reliability
   - Use mock implementations where necessary

4. **Serverless Architecture Simplification**
   - Lambda for core processing
   - S3 for document storage
   - DynamoDB for metadata and user profiles
   - API Gateway for frontend communication
   - Textract and Comprehend for basic document processing

## Implementation Timeline

### Days 1-2: Foundation
- Set up AWS environment
- Create S3 buckets and DynamoDB tables
- Implement basic Lambda functions
- Set up API Gateway

### Days 3-7: Core Components
- Implement document processing with Textract
- Create entity extraction with Comprehend
- Build archetype detection system
- Develop dashboard UI components

### Days 8-12: Integration
- Connect all components
- Implement demo flow
- Create project organization features
- Test and debug

### Days 13-14: Polish
- Refine UI
- Optimize performance
- Create presentation materials
- Prepare for demo

## Next Steps

1. Set up the AWS environment
2. Create the sample dataset
3. Implement the base Lambda functions
4. Develop the dashboard UI components
