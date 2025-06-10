# DynamoDB Schema Guide

This document provides details about the DynamoDB schema used in the Doc-Tales application, focusing on the key structure and access patterns.

## Communications Table

The `doc-tales-communications-dev` table stores metadata about communications from various sources.

### Key Structure

The table uses a composite key structure:

- **Hash Key (Partition Key)**: `id` (String)
- **Range Key (Sort Key)**: `timestamp` (String)

This composite key structure enables efficient queries but requires special handling in Lambda functions.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | String | Unique identifier for the communication |
| timestamp | String | ISO 8601 timestamp of the communication |
| type | String | Type of communication (email, document, social) |
| source | String | Source of the communication (gmail, dropbox, etc.) |
| subject | String | Subject or title of the communication |
| project | String | Project the communication belongs to |
| sender_id | String | ID of the sender |
| s3Key | String | Path to the full communication in S3 |
| metadata | Map | Additional metadata about the communication |
| dimensions | Map | Extracted dimensions (temporal, relationship, visual, analytical) |

### Global Secondary Indexes (GSIs)

The table has two GSIs to support additional access patterns:

1. **ProjectIndex**
   - Partition Key: `project`
   - Sort Key: `timestamp`
   - Purpose: Query communications by project

2. **SenderIndex**
   - Partition Key: `sender_id`
   - Sort Key: `timestamp`
   - Purpose: Query communications by sender

### Access Patterns

The table supports the following access patterns:

1. Get a specific communication by ID and timestamp
2. Query communications by project
3. Query communications by sender
4. Scan for communications with specific attributes (less efficient)

## User Profiles Table

The `doc-tales-user-profiles-dev` table stores user profile information.

### Key Structure

The table uses a simple key structure:

- **Hash Key (Partition Key)**: `user_id` (String)

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| user_id | String | Unique identifier for the user |
| primaryArchetype | String | User's primary archetype (prioritizer, connector, visualizer, analyst) |
| archetypeConfidence | Map | Confidence scores for each archetype |
| preferences | Map | User preferences and settings |

### Access Patterns

The table supports the following access patterns:

1. Get a user profile by ID
2. Update a user profile

## Common DynamoDB Operations

### Getting an Item with a Composite Key

When retrieving an item with a composite key, both the hash and range keys must be provided:

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Key: {
    id: "communication-id",
    timestamp: "2025-06-10T10:30:00Z"
  }
};

const result = await dynamodb.get(params).promise();
```

### Updating an Item with a Composite Key

Similarly, when updating an item, both keys must be specified:

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Key: {
    id: "communication-id",
    timestamp: "2025-06-10T10:30:00Z"
  },
  UpdateExpression: "set dimensions = :dimensions",
  ExpressionAttributeValues: {
    ":dimensions": dimensions
  },
  ReturnValues: "UPDATED_NEW"
};

await dynamodb.update(params).promise();
```

### Querying by ID When Timestamp is Unknown

When you need to find an item by ID but don't know the timestamp, you can use a scan operation with a filter:

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  FilterExpression: "id = :id",
  ExpressionAttributeValues: {
    ":id": "communication-id"
  }
};

const result = await dynamodb.scan(params).promise();
```

Note that scan operations are less efficient than queries and should be avoided for large tables.

### Querying by Project

To query communications by project, use the ProjectIndex GSI:

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  IndexName: "ProjectIndex",
  KeyConditionExpression: "project = :project",
  ExpressionAttributeValues: {
    ":project": "home-purchase"
  }
};

const result = await dynamodb.query(params).promise();
```

## Best Practices

1. **Always use both keys** when performing get or update operations on items with composite keys
2. **Use GSIs** for common access patterns to avoid scans
3. **Be mindful of key structure** when designing Lambda functions
4. **Handle errors gracefully** when keys are missing or incorrect
5. **Use consistent key naming** across all Lambda functions

## Common Issues and Solutions

### ValidationException: The provided key element does not match the schema

This error occurs when trying to access an item without providing all required key attributes. To fix:

1. Ensure both hash and range keys are included in the Key object
2. If the range key is unknown, use a scan operation with a filter
3. Consider adding a GSI if a particular access pattern is common

### Scan operations are slow or timeout

Scan operations can be inefficient for large tables. To improve:

1. Use GSIs for common access patterns
2. Implement pagination for scan operations
3. Consider denormalizing data to support more efficient queries

### Items not found when using correct keys

If items are not found even when using the correct keys:

1. Check key types (string vs. number)
2. Verify case sensitivity (DynamoDB keys are case-sensitive)
3. Check for leading/trailing whitespace in key values
