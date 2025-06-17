# Doc-Tales Demo Guide

## Introduction
This guide will help you showcase the Doc-Tales application during your hackathon presentation. The application is now fully deployed and functional, demonstrating a personalized communications sorter with archetype-based personalization.

## Demo Setup

### Prerequisites
- AWS CLI configured with appropriate credentials
- Access to the deployed API endpoint: `https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/`
- Sample data already seeded in DynamoDB tables

## Demo Flow

### 1. Introduction to Doc-Tales (2 minutes)
Start by explaining the core concept:
```
"Doc-Tales is a personalized communications sorter that unifies content from diverse sources into a single dashboard. What makes it unique is the archetype-based personalization that adapts to the user's cognitive style."
```

### 2. Demonstrate the Backend Infrastructure (3 minutes)

Show the AWS resources that power the application:

```bash
# List the CloudFormation stack resources
aws cloudformation describe-stack-resources --stack-name doc-tales

# Show the DynamoDB tables
aws dynamodb list-tables | grep doc-tales

# Show the S3 buckets
aws s3 ls | grep doc-tales
```

Explain how the serverless architecture works:
- Lambda functions for processing communications
- DynamoDB for storing communications and user profiles
- S3 buckets for document storage
- API Gateway for frontend communication

### 3. API Endpoint Demonstration (5 minutes)

Show the working API endpoints:

```bash
# Get all communications
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications | jq

# Get user profile with archetype information
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/user-profile | jq

# Get available archetypes
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/archetypes | jq
```

Highlight the different types of communications across projects:
- Home Purchase project communications
- Career Change project communications
- Family Event project communications

### 4. Archetype-Based Personalization (5 minutes)

This is your key differentiator! Demonstrate how the interface adapts based on user archetype:

> **Note:** Before running these commands, ensure the API Lambda function has `DynamoDBCrudPolicy` (not just `DynamoDBReadPolicy`) for the UserProfilesTable in the SAM template. Otherwise, the PUT requests will fail with an AccessDeniedException.

#### Prioritizer View
```bash
# Update user profile to prioritizer archetype
curl -X PUT https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/user-profile \
  -H "Content-Type: application/json" \
  -d '{"id":"default-user","primaryArchetype":"prioritizer","archetypeConfidence":{"prioritizer":0.7,"connector":0.1,"visualizer":0.1,"analyst":0.1}}'

# Get communications with temporal focus
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications | jq
```

Explain how the Prioritizer view organizes information chronologically with urgency indicators.

#### Connector View
```bash
# Update user profile to connector archetype
curl -X PUT https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/user-profile \
  -H "Content-Type: application/json" \
  -d '{"id":"default-user","primaryArchetype":"connector","archetypeConfidence":{"prioritizer":0.1,"connector":0.7,"visualizer":0.1,"analyst":0.1}}' | jq 

# Get communications with relationship focus
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications | jq
```

Explain how the Connector view emphasizes people and relationships.

#### Visualizer View
```bash
# Update user profile to visualizer archetype
curl -X PUT https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/user-profile \
  -H "Content-Type: application/json" \
  -d '{"id":"default-user","primaryArchetype":"visualizer","archetypeConfidence":{"prioritizer":0.1,"connector":0.1,"visualizer":0.7,"analyst":0.1}}' | jq

# Get communications with visual focus
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications | jq
```

Explain how the Visualizer view organizes information spatially.

#### Analyst View
```bash
# Update user profile to analyst archetype
curl -X PUT https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/user-profile \
  -H "Content-Type: application/json" \
  -d '{"id":"default-user","primaryArchetype":"analyst","archetypeConfidence":{"prioritizer":0.1,"connector":0.1,"visualizer":0.1,"analyst":0.7}}' | jq

# Get communications with analytical focus
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications | jq
```

Explain how the Analyst view provides detailed metadata and logical hierarchies.

### 5. Dimension-Based Data Model (3 minutes)

Explain how Doc-Tales extracts four key dimensions from communications:

```bash
# Get a specific communication to show dimensions
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications/comm-001 | jq
```

Highlight the dimensions:
- **Temporal**: Deadlines, urgency, chronology
- **Relationship**: Connection strength, frequency, network position
- **Visual**: Document types, visual elements, spatial organization
- **Analytical**: Categories, tags, sentiment, structure

### 6. Cross-Project Organization (2 minutes)

Demonstrate how Doc-Tales provides a unified view across different life projects:

```bash
# Get communications from different projects
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications?project=Home%20Purchase | jq
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications?project=Career%20Change | jq
curl https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications?project=Family%20Event | jq
```

Explain how this unified view helps users see connections between different aspects of their life.

### 7. Adaptive Dashboard (2 minutes)

Explain how the system tracks user interactions to determine their archetype:
- Clicking on dates increases Prioritizer confidence
- Clicking on people increases Connector confidence
- Viewing visual elements increases Visualizer confidence
- Viewing detailed information increases Analyst confidence

### 8. Future Enhancements (3 minutes)

Briefly mention planned enhancements:
- Machine learning for better archetype detection
- More data source integrations
- Enhanced visualization capabilities
- Mobile application

## Conclusion

Wrap up by emphasizing the key differentiators:
1. **Archetype-based personalization** that adapts to cognitive styles
2. **Unified inbox** for all communications regardless of source
3. **Cross-project organization** to provide a complete picture
4. **Dimension-based data model** for personalized views

This demo showcases a working end-to-end solution with both frontend and backend components, demonstrating technical excellence and innovation in addressing the real problem of information overload across multiple channels.
