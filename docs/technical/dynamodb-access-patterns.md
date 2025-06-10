# DynamoDB Access Patterns Guide

This document provides guidance on efficient DynamoDB access patterns used in the Doc-Tales application, with a focus on avoiding scan operations and using appropriate indexes.

## The Problem with Scan Operations

Scan operations in DynamoDB have several significant drawbacks:

1. **High Consumption of Read Capacity Units (RCUs)**: Scans read every item in the table
2. **Poor Scalability**: Performance degrades as your table grows
3. **Cost Inefficiency**: You pay for every item examined, not just returned
4. **Potential Throttling**: Excessive scans can impact other operations

## Efficient Access Patterns

### 1. Use Queries with Appropriate Indexes

Always use Query operations with appropriate indexes instead of Scan operations:

```javascript
// BAD: Scan operation
const scanParams = {
  TableName: COMMUNICATIONS_TABLE,
  FilterExpression: 'id = :id',
  ExpressionAttributeValues: {
    ':id': id
  }
};
const result = await dynamodb.scan(scanParams).promise();

// GOOD: Query operation with GSI
const queryParams = {
  TableName: COMMUNICATIONS_TABLE,
  IndexName: 'IdOnlyIndex',
  KeyConditionExpression: 'id = :id',
  ExpressionAttributeValues: {
    ':id': id
  }
};
const result = await dynamodb.query(queryParams).promise();
```

### 2. Design Indexes for Access Patterns

Create Global Secondary Indexes (GSIs) to support different access patterns:

| Access Pattern | Index |
|----------------|-------|
| Get by ID | IdOnlyIndex (hash key: id) |
| Get by Project | ProjectIndex (hash key: project, range key: timestamp) |
| Get by Sender | SenderIndex (hash key: sender_id, range key: timestamp) |

### 3. Handle Composite Keys Correctly

When using composite keys (hash + range), ensure all operations include both keys:

```javascript
// BAD: Missing range key
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Key: {
    id: communicationId
  }
};

// GOOD: Including both hash and range keys
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Key: {
    id: communicationId,
    timestamp: timestamp
  }
};
```

### 4. Use GSIs for Single-Key Access

When you need to access items by a single attribute that isn't the primary key, create a GSI:

```javascript
// Create a GSI with just the ID as the hash key
GlobalSecondaryIndexes:
  - IndexName: IdOnlyIndex
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    Projection:
      ProjectionType: ALL
```

## Implemented Access Patterns in Doc-Tales

### 1. Get Communication by ID

```javascript
async function getCommunicationData(id) {
  try {
    // Use GSI to query by ID only
    const queryParams = {
      TableName: COMMUNICATIONS_TABLE,
      IndexName: 'IdOnlyIndex',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    };
    
    const queryResult = await dynamodb.query(queryParams).promise();
    
    if (!queryResult.Items || queryResult.Items.length === 0) {
      console.log(`No communication found with ID: ${id}`);
      return null;
    }
    
    const item = queryResult.Items[0];
    
    // Get the full communication from S3
    try {
      const fullCommunication = await getFullCommunicationFromS3(item);
      return fullCommunication;
    } catch (error) {
      console.error(`Error getting full communication for ${id}:`, error);
      return item;
    }
  } catch (error) {
    console.error(`Error getting communication data for ${id}:`, error);
    throw error;
  }
}
```

### 2. List Communications

```javascript
async function queryCommunications(filters) {
  try {
    let params;
    
    // If filtering by project, use the ProjectIndex GSI
    if (filters.project) {
      params = {
        TableName: COMMUNICATIONS_TABLE,
        IndexName: 'ProjectIndex',
        KeyConditionExpression: 'project = :project',
        ExpressionAttributeValues: {
          ':project': filters.project
        },
        Limit: 100
      };
    } 
    // If filtering by sender, use the SenderIndex GSI
    else if (filters.sender) {
      params = {
        TableName: COMMUNICATIONS_TABLE,
        IndexName: 'SenderIndex',
        KeyConditionExpression: 'sender_id = :sender',
        ExpressionAttributeValues: {
          ':sender': filters.sender
        },
        Limit: 100
      };
    } 
    // If no specific filter, use the IdOnlyIndex GSI to get all communications
    else {
      params = {
        TableName: COMMUNICATIONS_TABLE,
        IndexName: 'IdOnlyIndex',
        Limit: 100
      };
    }
    
    // Add additional filter expressions if needed
    if (filters.type || filters.urgency) {
      let filterExpressions = [];
      let expressionAttributeValues = params.ExpressionAttributeValues || {};
      
      if (filters.type) {
        filterExpressions.push('type = :type');
        expressionAttributeValues[':type'] = filters.type;
      }
      
      if (filters.urgency) {
        filterExpressions.push('metadata.urgency = :urgency');
        expressionAttributeValues[':urgency'] = filters.urgency;
      }
      
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeValues = expressionAttributeValues;
      }
    }
    
    // Execute the query
    const result = await dynamodb.query(params).promise();
    
    // Process results...
  } catch (error) {
    console.error('Error querying communications:', error);
    throw error;
  }
}
```

### 3. Update Item with Composite Key

```javascript
async function updateDynamoDBWithDimensions(communicationId, dimensions) {
  try {
    // First, get the full item to retrieve the timestamp
    const getParams = {
      TableName: COMMUNICATIONS_TABLE,
      IndexName: 'IdOnlyIndex',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': communicationId
      }
    };
    
    const result = await dynamodb.query(getParams).promise();
    if (!result.Items || result.Items.length === 0 || !result.Items[0].timestamp) {
      throw new Error(`Communication not found or missing timestamp: ${communicationId}`);
    }
    
    // Now update with both hash and range keys
    const updateParams = {
      TableName: COMMUNICATIONS_TABLE,
      Key: {
        id: communicationId,
        timestamp: result.Items[0].timestamp
      },
      UpdateExpression: 'set dimensions = :dimensions',
      ExpressionAttributeValues: {
        ':dimensions': dimensions
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    await dynamodb.update(updateParams).promise();
    console.log(`Updated DynamoDB with dimensions for: ${communicationId}`);
  } catch (error) {
    console.error(`Error updating DynamoDB: ${error}`);
    throw error;
  }
}
```

## Performance Considerations

1. **Projection Type**: Use `ProjectionType: ALL` for GSIs only when you need all attributes
2. **Limit Results**: Always use the `Limit` parameter to control the number of items returned
3. **Pagination**: For large result sets, implement pagination using `LastEvaluatedKey`
4. **Filter Expressions**: Use filter expressions sparingly as they are applied after items are read
5. **Consistent Reads**: Use consistent reads only when necessary as they consume more RCUs

## Monitoring and Optimization

1. **CloudWatch Metrics**: Monitor ProvisionedReadCapacityUnits, ConsumedReadCapacityUnits, and ThrottledRequests
2. **X-Ray Tracing**: Enable X-Ray to trace DynamoDB operations and identify bottlenecks
3. **Cost Explorer**: Use AWS Cost Explorer to analyze DynamoDB costs and optimize as needed

## Conclusion

By following these access patterns and best practices, the Doc-Tales application can efficiently interact with DynamoDB, ensuring good performance, cost-effectiveness, and scalability as the application grows.
