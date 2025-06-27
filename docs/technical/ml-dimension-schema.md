# ML Dimension Schema Documentation

## Overview

This document describes the DynamoDB schema updates for storing ML-extracted dimensions in the Doc-Tales communications table.

## Schema Changes

The existing single-table design in DynamoDB is flexible enough to accommodate ML dimensions without structural changes. New attributes are added to communication items:

### New Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `dimensions` | String (JSON) | Complete extracted dimensions object |
| `extractionMetadata` | String (JSON) | Metadata about the extraction process |
| `lastProcessed` | String | ISO timestamp of last dimension extraction |
| `status` | String | Processing status: `ingested`, `processing`, `processed`, `failed` |

### Dimension Structure

The `dimensions` attribute stores a JSON string containing:

```json
{
  "temporal": {
    "deadline": "2024-12-31T23:59:59Z",
    "urgency": "high",
    "chronology": {
      "created": "2024-06-27T19:00:00Z",
      "lastUpdated": "2024-06-27T19:30:00Z",
      "followUpDate": "2024-06-28T09:00:00Z"
    },
    "timeContext": {
      "isRecent": true,
      "isPast": false,
      "requiresAction": true,
      "daysUntilDeadline": 5
    }
  },
  "relationship": {
    "connectionStrength": "strong",
    "frequency": "frequent",
    "lastInteraction": "2024-06-27T19:00:00Z",
    "networkPosition": {
      "isDirectConnection": true,
      "sharedConnections": 3,
      "relevanceScore": 0.8
    },
    "context": {
      "personal": false,
      "professional": true,
      "projectSpecific": true
    }
  },
  "visual": {
    "hasImages": false,
    "documentType": "email",
    "visualElements": {
      "charts": 0,
      "tables": 1,
      "images": 0,
      "attachments": 2
    },
    "spatialContext": {
      "location": "San Francisco",
      "coordinates": [37.7749, -122.4194],
      "relatedLocations": ["Oakland", "Berkeley"]
    },
    "visualCategory": "mixed"
  },
  "analytical": {
    "categories": ["business", "project"],
    "tags": ["urgent", "meeting", "deadline"],
    "sentiment": "neutral",
    "entities": {
      "people": ["John Doe", "Jane Smith"],
      "organizations": ["Acme Corp", "Tech Solutions"],
      "locations": ["San Francisco", "New York"],
      "dates": ["2024-06-28", "next Friday"],
      "concepts": ["project milestone", "budget review"]
    },
    "metrics": {
      "wordCount": 250,
      "readingTime": 2,
      "complexity": "medium",
      "informationDensity": 7
    },
    "structure": {
      "hasHeadings": true,
      "hasBulletPoints": true,
      "hasNumberedLists": false,
      "paragraphCount": 4
    }
  },
  "confidenceScores": {
    "temporal": 0.85,
    "relationship": 0.72,
    "visual": 0.90,
    "analytical": 0.88
  }
}
```

### Extraction Metadata Structure

The `extractionMetadata` attribute stores:

```json
{
  "processingTime": 1250,
  "confidenceScore": 0.84,
  "extractionMethod": "ml",
  "errors": [],
  "warnings": ["Low confidence in relationship dimension"],
  "mlServices": {
    "comprehend": {
      "entitiesProcessed": 15,
      "sentimentScore": 0.72,
      "keyPhrasesFound": 8
    }
  },
  "version": "1.0.0",
  "timestamp": "2024-06-27T19:30:00Z"
}
```

## Access Patterns

### Primary Access Patterns

1. **Get Communication with Dimensions**
   - PK: `COMM#{communicationId}`
   - SK: `METADATA`
   - Returns: Full communication record with dimensions

2. **Query by Processing Status**
   - GSI1PK: `STATUS#{status}`
   - GSI1SK: `TIMESTAMP#{timestamp}`
   - Returns: Communications by processing status

3. **Query by Urgency Level**
   - GSI2PK: `URGENCY#{level}`
   - GSI2SK: `TIMESTAMP#{timestamp}`
   - Returns: Communications by urgency level

### New GSI Usage

#### GSI1: Status-based queries
- **GSI1PK**: `STATUS#processed`, `STATUS#pending`, `STATUS#failed`
- **GSI1SK**: `TIMESTAMP#{ISO-timestamp}`
- **Use case**: Find all communications that need processing or have failed

#### GSI2: Dimension-based queries
- **GSI2PK**: `URGENCY#high`, `SENTIMENT#negative`, `TOPIC#business`
- **GSI2SK**: `TIMESTAMP#{ISO-timestamp}`
- **Use case**: Filter communications by extracted dimensions

## Migration Strategy

### Phase 1: Backward Compatibility
- Existing communications continue to work without dimensions
- New `status` field defaults to `ingested` for existing records
- Dimension extraction is optional and additive

### Phase 2: Gradual Processing
- Background job processes existing communications
- New communications are processed immediately
- Failed extractions are retried with exponential backoff

### Phase 3: Full Integration
- All communications have dimensions
- Frontend uses dimensions for filtering and display
- Analytics leverage dimension data

## Performance Considerations

### Storage
- Dimensions add ~2-5KB per communication
- JSON compression reduces storage overhead
- Consider archiving old dimension data

### Query Performance
- GSI queries remain efficient with proper key design
- Dimension filtering uses DynamoDB's native JSON support
- Complex dimension queries may require application-level filtering

### Cost Impact
- Increased storage costs: ~20-30% for dimension data
- Additional GSI queries for dimension-based access patterns
- ML processing costs: ~$0.001 per communication

## Monitoring and Alerting

### Key Metrics
- Dimension extraction success rate
- Processing latency (target: <2 seconds)
- Confidence score distribution
- Error rates by extraction type

### Alerts
- Extraction failure rate >5%
- Processing latency >5 seconds
- Low confidence scores (<0.5) >10%
- DynamoDB throttling on dimension queries

## Example Queries

### Get High-Urgency Communications
```javascript
const params = {
  TableName: 'doc-tales-communications',
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :pk',
  ExpressionAttributeValues: {
    ':pk': 'URGENCY#high'
  },
  ScanIndexForward: false, // Most recent first
  Limit: 20
};
```

### Get Unprocessed Communications
```javascript
const params = {
  TableName: 'doc-tales-communications',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk',
  ExpressionAttributeValues: {
    ':pk': 'STATUS#ingested'
  }
};
```

### Filter by Sentiment and Topic
```javascript
const params = {
  TableName: 'doc-tales-communications',
  FilterExpression: 'contains(dimensions, :sentiment) AND contains(dimensions, :topic)',
  ExpressionAttributeValues: {
    ':sentiment': '"sentiment":"negative"',
    ':topic': '"categories":["support"]'
  }
};
```

## Testing Strategy

### Unit Tests
- Dimension extraction accuracy
- Schema validation
- Error handling

### Integration Tests
- End-to-end dimension processing
- DynamoDB operations
- Performance benchmarks

### Load Tests
- Concurrent dimension extraction
- DynamoDB throughput limits
- ML service rate limits

## Rollback Plan

### Emergency Rollback
1. Disable dimension extraction Lambda
2. Remove dimension-based queries from frontend
3. Fall back to original communication processing

### Data Recovery
- Dimension data is additive and can be regenerated
- Original communication content is preserved
- Reprocessing pipeline can restore dimensions

## Future Enhancements

### Advanced Querying
- ElasticSearch integration for complex dimension queries
- Real-time dimension updates via DynamoDB Streams
- Dimension-based recommendation engine

### ML Improvements
- Custom Comprehend models for domain-specific entities
- Multi-language dimension extraction
- Confidence score tuning based on user feedback
