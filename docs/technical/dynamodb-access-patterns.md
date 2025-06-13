# DynamoDB Access Patterns for Doc-Tales

This document outlines the common access patterns for the Doc-Tales application and how they are implemented using the single-table design.

## Table of Contents
- [Common Access Patterns](#common-access-patterns)
- [Query Examples](#query-examples)
- [Performance Considerations](#performance-considerations)
- [Pagination Strategies](#pagination-strategies)
- [Batch Operations](#batch-operations)

## Common Access Patterns

| Access Pattern | Description | Key Structure | Index |
|----------------|-------------|--------------|-------|
| Get all communications | Retrieve all communications | PK = "COMM" | Base table |
| Get communication by ID | Retrieve a specific communication | PK = "COMM", SK = "COMM#{id}" | Base table |
| Get communications by project | Retrieve all communications for a project | GSI1PK = "PROJ#{projectId}" | GSI1 |
| Get communications by sender | Retrieve all communications from a sender | GSI2PK = "ENTITY#{senderId}" | GSI2 |
| Get user profile | Retrieve a user's profile | PK = "USER#{userId}" | Base table |
| Get project details | Retrieve details about a project | PK = "PROJ#{projectId}" | Base table |
| Get user's projects | Retrieve all projects for a user | GSI1PK = "USER#{userId}" | GSI1 |
| Get entity details | Retrieve details about an entity | PK = "ENTITY#{entityId}" | Base table |

## Query Examples

### Get All Communications

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: {
    ':pk': 'COMM'
  },
  Limit: 100
};

const result = await dynamodb.query(params).promise();
```

### Get Communication by ID

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  KeyConditionExpression: 'PK = :pk AND SK = :sk',
  ExpressionAttributeValues: {
    ':pk': 'COMM',
    ':sk': `COMM#${communicationId}`
  }
};

const result = await dynamodb.query(params).promise();
```

### Get Communications by Project

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :projectPK',
  ExpressionAttributeValues: {
    ':projectPK': `PROJ#${projectId}`
  },
  ScanIndexForward: false, // Sort by timestamp descending
  Limit: 100
};

const result = await dynamodb.query(params).promise();
```

### Get Communications by Sender

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :senderPK',
  ExpressionAttributeValues: {
    ':senderPK': `ENTITY#${senderId}`
  },
  ScanIndexForward: false, // Sort by timestamp descending
  Limit: 100
};

const result = await dynamodb.query(params).promise();
```

### Get User Profile

```javascript
const params = {
  TableName: USER_PROFILES_TABLE,
  Key: {
    'PK': `USER#${userId}`
  }
};

const result = await dynamodb.get(params).promise();
```

### Get User's Projects

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :userPK',
  ExpressionAttributeValues: {
    ':userPK': `USER#${userId}`
  }
};

const result = await dynamodb.query(params).promise();
```

## Performance Considerations

### Query vs. Scan

- **Always use Query operations** instead of Scan operations
- Query operations are more efficient and cost-effective
- Scan operations should only be used for infrequent, administrative tasks

### Filtering

- **Avoid Filter Expressions** when possible
- Filter expressions are applied after items are read, so you still pay for the read capacity
- Design your keys to minimize the need for filtering

### Sparse Indexes

- Use sparse indexes to reduce index size and cost
- Only include items in an index when they have the relevant attributes

Example of a sparse index:

```javascript
// Only communications with high urgency will have this attribute
if (communication.urgency === 'high') {
  communication.GSI3PK = 'URGENT';
  communication.GSI3SK = communication.timestamp;
}
```

## Pagination Strategies

### Using LastEvaluatedKey

```javascript
let lastEvaluatedKey = null;
let allItems = [];

do {
  const params = {
    TableName: COMMUNICATIONS_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': 'COMM'
    },
    Limit: 100
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
  
  const result = await dynamodb.query(params).promise();
  allItems = allItems.concat(result.Items);
  lastEvaluatedKey = result.LastEvaluatedKey;
} while (lastEvaluatedKey);
```

### Client-Side Pagination

```javascript
// Initial query
const params = {
  TableName: COMMUNICATIONS_TABLE,
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: {
    ':pk': 'COMM'
  },
  Limit: 100
};

const result = await dynamodb.query(params).promise();

// Return paginated results to client
return {
  items: result.Items,
  nextPageToken: result.LastEvaluatedKey ? 
    Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : 
    null
};

// For subsequent requests
if (request.pageToken) {
  const lastEvaluatedKey = JSON.parse(
    Buffer.from(request.pageToken, 'base64').toString()
  );
  params.ExclusiveStartKey = lastEvaluatedKey;
}
```

## Batch Operations

### BatchGetItem

```javascript
const params = {
  RequestItems: {
    [COMMUNICATIONS_TABLE]: {
      Keys: [
        { PK: 'COMM', SK: 'COMM#id1' },
        { PK: 'COMM', SK: 'COMM#id2' },
        { PK: 'COMM', SK: 'COMM#id3' }
      ]
    }
  }
};

const result = await dynamodb.batchGet(params).promise();
```

### BatchWriteItem

```javascript
const params = {
  RequestItems: {
    [COMMUNICATIONS_TABLE]: [
      {
        PutRequest: {
          Item: {
            PK: 'COMM',
            SK: 'COMM#id1',
            // other attributes
          }
        }
      },
      {
        PutRequest: {
          Item: {
            PK: 'COMM',
            SK: 'COMM#id2',
            // other attributes
          }
        }
      }
    ]
  }
};

await dynamodb.batchWrite(params).promise();
```

### Handling Unprocessed Items

```javascript
let unprocessedItems = params.RequestItems;

while (Object.keys(unprocessedItems).length > 0) {
  const batchResult = await dynamodb.batchWrite({
    RequestItems: unprocessedItems
  }).promise();
  
  unprocessedItems = batchResult.UnprocessedItems;
  
  if (Object.keys(unprocessedItems).length > 0) {
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## Transactional Operations

### TransactWriteItems

```javascript
const params = {
  TransactItems: [
    {
      Put: {
        TableName: COMMUNICATIONS_TABLE,
        Item: {
          PK: 'COMM',
          SK: 'COMM#id1',
          // other attributes
        }
      }
    },
    {
      Update: {
        TableName: USER_PROFILES_TABLE,
        Key: { PK: 'USER#userId' },
        UpdateExpression: 'SET messageCount = messageCount + :inc',
        ExpressionAttributeValues: { ':inc': 1 }
      }
    }
  ]
};

await dynamodb.transactWrite(params).promise();
```

## Conditional Operations

### Conditional Put

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Item: {
    PK: 'COMM',
    SK: 'COMM#id1',
    // other attributes
  },
  ConditionExpression: 'attribute_not_exists(SK)'
};

try {
  await dynamodb.put(params).promise();
} catch (error) {
  if (error.code === 'ConditionalCheckFailedException') {
    console.log('Item already exists');
  } else {
    throw error;
  }
}
```

### Conditional Update

```javascript
const params = {
  TableName: COMMUNICATIONS_TABLE,
  Key: {
    PK: 'COMM',
    SK: 'COMM#id1'
  },
  UpdateExpression: 'SET metadata.read = :read',
  ConditionExpression: 'metadata.read = :notRead',
  ExpressionAttributeValues: {
    ':read': true,
    ':notRead': false
  }
};

try {
  await dynamodb.update(params).promise();
} catch (error) {
  if (error.code === 'ConditionalCheckFailedException') {
    console.log('Message already read');
  } else {
    throw error;
  }
}
```
