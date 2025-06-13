# DynamoDB Schema Guide for Doc-Tales

This document outlines the DynamoDB schema design for the Doc-Tales application, following single-table design principles to optimize for common access patterns.

## Table of Contents
- [Single-Table Design Overview](#single-table-design-overview)
- [Key Structure](#key-structure)
- [Entity Types](#entity-types)
- [Global Secondary Indexes](#global-secondary-indexes)
- [Item Examples](#item-examples)
- [Migration Guide](#migration-guide)

## Single-Table Design Overview

Doc-Tales uses a single-table design pattern for DynamoDB to efficiently support multiple entity types and access patterns. This approach:

- Reduces the number of DynamoDB tables needed
- Enables complex queries with a single request
- Optimizes for the most common access patterns
- Reduces costs by minimizing the number of read operations

## Key Structure

### Primary Key
- **Partition Key (PK)**: Entity type prefix followed by ID (`ENTITY_TYPE#id`)
- **Sort Key (SK)**: Composite key that enables hierarchical data (`ENTITY_TYPE#id`)

### Global Secondary Index 1 (GSI1)
- **GSI1PK**: Project ID (`PROJ#project_id`)
- **GSI1SK**: Timestamp for sorting (`YYYY-MM-DDTHH:MM:SS.sssZ`)

### Global Secondary Index 2 (GSI2)
- **GSI2PK**: Entity ID for relationship queries (`ENTITY#entity_id`)
- **GSI2SK**: Timestamp for sorting (`YYYY-MM-DDTHH:MM:SS.sssZ`)

## Entity Types

### Communications
- **PK**: `COMM` (all communications)
- **SK**: `COMM#comm_id`
- **GSI1PK**: `PROJ#project_id` (for project-based queries)
- **GSI1SK**: Timestamp (for chronological sorting)
- **GSI2PK**: `ENTITY#sender_id` (for sender-based queries)
- **GSI2SK**: Timestamp (for chronological sorting)

### User Profiles
- **PK**: `USER#user_id`
- No SK needed (simple key structure)

### Projects
- **PK**: `PROJ#project_id`
- **SK**: `PROJ#project_id`
- **GSI1PK**: `USER#owner_id` (for user's projects)
- **GSI1SK**: Project name (for alphabetical sorting)

### Entities (People, Organizations)
- **PK**: `ENTITY#entity_id`
- **SK**: `ENTITY#entity_id`
- **GSI1PK**: Various (for flexible queries)
- **GSI1SK**: Various (for flexible sorting)

## Global Secondary Indexes

### GSI1: Project-Based Access
- Primary use: Query all communications for a specific project
- Also used for: Finding all projects for a user

### GSI2: Relationship-Based Access
- Primary use: Query all communications from a specific sender
- Also used for: Finding related entities

## Item Examples

### Communication Item
```json
{
  "PK": "COMM",
  "SK": "COMM#comm-123",
  "GSI1PK": "PROJ#home-purchase",
  "GSI1SK": "2025-06-10T15:30:00.000Z",
  "GSI2PK": "ENTITY#realtor@example.com",
  "GSI2SK": "2025-06-10T15:30:00.000Z",
  "commType": "email",
  "subject": "House Viewing Schedule",
  "timestamp": "2025-06-10T15:30:00.000Z",
  "sender": "Jane Smith",
  "sender_id": "realtor@example.com",
  "project": "home-purchase",
  "s3Key": "raw/emails/comm-123.json",
  "metadata": {
    "urgency": "high",
    "read": false
  },
  "dimensions": {
    "temporal": {
      "deadline": "2025-06-15T09:00:00.000Z",
      "followUp": "2025-06-12T10:00:00.000Z"
    },
    "relationship": {
      "strength": 0.8,
      "frequency": "weekly"
    },
    "visual": {
      "hasAttachments": true,
      "attachmentTypes": ["pdf", "jpg"]
    },
    "analytical": {
      "category": "scheduling",
      "sentiment": "positive",
      "entities": ["house", "viewing", "schedule"]
    }
  }
}
```

### User Profile Item
```json
{
  "PK": "USER#user123",
  "primaryArchetype": "connector",
  "archetypeConfidence": {
    "prioritizer": 0.2,
    "connector": 0.5,
    "visualizer": 0.2,
    "analyst": 0.1
  },
  "preferences": {
    "theme": "light",
    "notifications": true
  }
}
```

### Project Item
```json
{
  "PK": "PROJ#home-purchase",
  "SK": "PROJ#home-purchase",
  "GSI1PK": "USER#user123",
  "GSI1SK": "Home Purchase",
  "name": "Home Purchase",
  "description": "Finding and purchasing a new home",
  "created": "2025-05-01T10:00:00.000Z",
  "status": "active",
  "color": "#4287f5"
}
```

### Entity Item
```json
{
  "PK": "ENTITY#realtor@example.com",
  "SK": "ENTITY#realtor@example.com",
  "name": "Jane Smith",
  "type": "person",
  "email": "realtor@example.com",
  "phone": "555-123-4567",
  "organization": "ABC Realty",
  "projects": ["home-purchase"],
  "relationshipStrength": 0.8
}
```

## Migration Guide

### From Old Schema to New Schema

1. **Create new tables** with the single-table design schema
2. **Write a migration script** that:
   - Reads data from old tables
   - Transforms to new format
   - Writes to new tables
3. **Update Lambda functions** to use the new schema
4. **Test thoroughly** before switching over
5. **Switch application** to use new tables
6. **Monitor** for any issues
7. **Delete old tables** after successful migration

### Migration Script Example

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const OLD_TABLE = 'old-communications-table';
const NEW_TABLE = 'doc-tales-communications-dev';

async function migrateData() {
  // Get all items from old table
  const scanParams = {
    TableName: OLD_TABLE
  };
  
  const scanResult = await dynamodb.scan(scanParams).promise();
  
  // Transform and write to new table
  for (const item of scanResult.Items) {
    const newItem = {
      PK: 'COMM',
      SK: `COMM#${item.id}`,
      GSI1PK: `PROJ#${item.project}`,
      GSI1SK: item.timestamp,
      GSI2PK: `ENTITY#${item.sender_id}`,
      GSI2SK: item.timestamp,
      // Copy all other attributes
      ...item
    };
    
    const putParams = {
      TableName: NEW_TABLE,
      Item: newItem
    };
    
    await dynamodb.put(putParams).promise();
    console.log(`Migrated item ${item.id}`);
  }
}

migrateData().catch(console.error);
```

## Best Practices

1. **Always use query operations** instead of scans
2. **Keep item size small** by storing large content in S3
3. **Use consistent attribute names** across all item types
4. **Include all required attributes** for each access pattern
5. **Use sparse indexes** where appropriate to reduce costs
6. **Consider TTL** for temporary or time-sensitive data
7. **Monitor performance** and adjust indexes as needed
