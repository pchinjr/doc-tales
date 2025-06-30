# ML Dimension Schema Documentation

## Overview

Doc-Tales uses a sophisticated ML-powered dimension extraction system that processes communications and maps them to four key dimensions. This document describes the schema and data flow for the ML dimension extraction process.

## Core Dimension Types

### 1. Temporal Dimension
Captures time-related aspects of communications:

```typescript
interface TemporalDimension {
  deadline?: string;                    // ISO date string for deadlines
  urgency: "high" | "medium" | "low";   // Urgency level
  chronology: {
    created: string;                    // Creation timestamp
    lastUpdated?: string;               // Last modification
    followUpDate?: string;              // Scheduled follow-up
  };
  timeContext: {
    isRecent: boolean;                  // Within last 7 days
    isPast: boolean;                    // Past deadline/date
    requiresAction: boolean;            // Needs immediate action
    daysUntilDeadline?: number;         // Days remaining
  };
}
```

### 2. Relationship Dimension
Analyzes interpersonal and organizational connections:

```typescript
interface RelationshipDimension {
  connectionStrength: "strong" | "medium" | "weak";
  frequency: "frequent" | "occasional" | "rare";
  lastInteraction?: string;
  networkPosition: {
    isDirectConnection: boolean;        // Direct vs indirect contact
    sharedConnections: number;          // Mutual connections
    relevanceScore: number;             // 0-1 relevance score
  };
  context: {
    personal: boolean;                  // Personal relationship
    professional: boolean;             // Work relationship
    projectSpecific: boolean;          // Project-based connection
  };
}
```

### 3. Visual Dimension
Handles visual and spatial aspects of content:

```typescript
interface VisualDimension {
  hasImages: boolean;
  documentType?: string;                // PDF, DOC, etc.
  visualElements: {
    charts: number;                     // Number of charts
    tables: number;                     // Number of tables
    images: number;                     // Number of images
    attachments: number;                // Number of attachments
  };
  spatialContext?: {
    location?: string;                  // Geographic location
    coordinates?: [number, number];     // Lat/lng coordinates
    relatedLocations?: string[];        // Related places
  };
  visualCategory: "document" | "image" | "chart" | "mixed" | "text-only";
}
```

### 4. Analytical Dimension
Provides deep content analysis and categorization:

```typescript
interface AnalyticalDimension {
  categories: string[];                 // Content categories
  tags: string[];                       // Extracted tags
  sentiment: "positive" | "neutral" | "negative";
  entities: {
    people: string[];                   // Person names
    organizations: string[];            // Company/org names
    locations: string[];                // Place names
    dates: string[];                    // Date references
    concepts: string[];                 // Key concepts
  };
  metrics: {
    wordCount: number;                  // Total words
    readingTime: number;                // Estimated reading time (minutes)
    complexity: "high" | "medium" | "low";
    informationDensity: number;         // Information per word ratio
  };
  structure: {
    hasHeadings: boolean;               // Contains headings
    hasBulletPoints: boolean;           // Contains bullet points
    hasNumberedLists: boolean;          // Contains numbered lists
    paragraphCount: number;             // Number of paragraphs
  };
}
```

## ML Processing Pipeline

### Input Schema
```typescript
interface ExtractionInput {
  text: string;                         // Raw text content
  metadata?: {
    source: string;                     // Source system
    timestamp: string;                  // ISO timestamp
    sender?: string;                    // Sender identifier
    subject?: string;                   // Subject/title
  };
  config?: Partial<ExtractionConfig>;  // Processing configuration
}
```

### AWS Comprehend Integration
The system leverages AWS Comprehend for:

- **Entity Extraction**: Identifies people, organizations, locations, dates
- **Sentiment Analysis**: Determines overall sentiment and confidence scores
- **Key Phrase Extraction**: Extracts important phrases and topics

```typescript
interface ComprehendResults {
  entities: Entity[];                   // AWS Comprehend entities
  sentiment: {
    sentiment: string;                  // POSITIVE, NEGATIVE, NEUTRAL, MIXED
    sentimentScore: SentimentScore;     // Confidence scores
  };
  keyPhrases: Array<{
    text: string;                       // Key phrase text
    score: number;                      // Confidence score (0-1)
  }>;
}
```

### Extraction Results
Intermediate processing results before dimension mapping:

```typescript
interface ExtractionResults {
  urgencyIndicators: {
    keywords: string[];                 // Urgency keywords found
    score: number;                      // Urgency score (0-1)
    level: 'high' | 'medium' | 'low';   // Urgency classification
  };
  topicCategories: {
    primary: string;                    // Primary topic
    secondary: string[];                // Secondary topics
    confidence: number;                 // Classification confidence
  };
  entityMappings: {
    people: string[];                   // Extracted person names
    organizations: string[];            // Extracted organizations
    locations: string[];                // Extracted locations
    dates: string[];                    // Extracted dates
    concepts: string[];                 // Extracted concepts
  };
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;                 // Sentiment confidence
    emotionalTone: string[];            // Emotional indicators
  };
  temporalMarkers: {
    deadlines: string[];                // Deadline references
    timeReferences: string[];           // Time-related phrases
    urgencyKeywords: string[];          // Urgency indicators
  };
}
```

### Final Output Schema
```typescript
interface DimensionExtractionResult {
  dimensions: Dimensions;               // Complete dimension analysis
  extractionMetadata: {
    processingTime: number;             // Processing time (ms)
    confidenceScore: number;            // Overall confidence (0-1)
    extractionMethod: 'ml' | 'rule-based' | 'hybrid';
    errors?: string[];                  // Processing errors
    warnings?: string[];                // Processing warnings
  };
  rawResults: ComprehendResults;        // Raw AWS Comprehend output
}
```

## Confidence Scoring

Each dimension includes confidence scores to indicate the reliability of the analysis:

```typescript
confidenceScores: {
  temporal: number;      // 0-1 confidence in temporal analysis
  relationship: number;  // 0-1 confidence in relationship analysis
  visual: number;        // 0-1 confidence in visual analysis
  analytical: number;    // 0-1 confidence in analytical analysis
}
```

## Processing Configuration

The extraction process can be configured per request:

```typescript
interface ExtractionConfig {
  enableSentimentAnalysis: boolean;     // Enable sentiment processing
  enableEntityExtraction: boolean;      // Enable entity extraction
  enableKeyPhraseExtraction: boolean;   // Enable key phrase extraction
  confidenceThreshold: number;          // Minimum confidence threshold
  urgencyKeywords: string[];            // Custom urgency keywords
  topicCategories: string[];            // Custom topic categories
}
```

## Usage Examples

### Basic Extraction
```typescript
const input: ExtractionInput = {
  text: "Urgent: Please review the Q3 budget proposal by Friday",
  metadata: {
    source: "email",
    timestamp: "2025-06-29T10:00:00Z",
    sender: "manager@company.com",
    subject: "Q3 Budget Review"
  }
};

const result = await extractDimensions(input);
```

### Custom Configuration
```typescript
const config: ExtractionConfig = {
  enableSentimentAnalysis: true,
  enableEntityExtraction: true,
  enableKeyPhraseExtraction: true,
  confidenceThreshold: 0.7,
  urgencyKeywords: ["urgent", "asap", "deadline", "critical"],
  topicCategories: ["budget", "project", "meeting", "review"]
};
```

## Integration Points

### Lambda Function
- **Function**: `DimensionExtractionFunction`
- **Trigger**: S3 object creation events
- **Input**: Raw communication content from S3
- **Output**: Processed dimensions stored back to S3 and DynamoDB

### Common Services
- **DimensionMapper**: Maps raw extraction results to dimension schema
- **UrgencyDetector**: Analyzes temporal urgency indicators
- **TopicCategorizer**: Categorizes content by topic
- **EntityExtractor**: Extracts and normalizes entities
- **SentimentAnalyzer**: Analyzes sentiment and emotional tone

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Invalid input schema
- **Processing Errors**: AWS service failures
- **Confidence Warnings**: Low confidence results
- **Timeout Handling**: Long-running processing
- **Fallback Processing**: Rule-based fallbacks when ML fails

## Performance Considerations

- **Batch Processing**: Multiple communications processed together
- **Caching**: Results cached to avoid reprocessing
- **Async Processing**: Non-blocking dimension extraction
- **Rate Limiting**: AWS service rate limit management
- **Cost Optimization**: Efficient use of AWS Comprehend API calls

---

This schema enables Doc-Tales to provide intelligent, context-aware communication processing with archetype-based personalization and sophisticated ML-powered analysis.
