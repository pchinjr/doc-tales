# Enhanced Data Ingestion System

## Overview

The enhanced data ingestion system is a key differentiator for Doc-Tales, enabling the application to take the same communication and slice it across multiple dimensions. This document outlines the architecture and components of the enhanced data ingestion system.

## Architecture

The enhanced data ingestion system consists of the following components:

1. **Source Parsers**: Transform raw data from various sources into structured Communication objects.
2. **Source Adapters**: Connect to various data sources (email, documents, social media) and normalize the data.
3. **Ingestion Pipeline**: Orchestrates the data ingestion process from source adapters to dimension extraction and classification.
4. **Dimension Extractor**: Extracts temporal, relationship, visual, and analytical dimensions from communications.
5. **Classification Service**: Categorizes communications into projects, categories, and urgency levels.
6. **Relationship Detector**: Identifies connections between communications across projects.
7. **Unified Data Service**: Provides a unified interface for accessing and filtering communications.

## Source Parsers

The source parsers transform raw data from various sources into structured Communication objects:

### EmailParser

The `EmailParser` class parses raw email data:

- Extracts email headers, body, and attachments
- Determines urgency based on headers and content
- Categorizes emails based on content analysis
- Extracts metadata like recipients, CC, BCC, etc.

### DocumentParser

The `DocumentParser` class parses document files:

- Extracts document content, title, and metadata
- Determines document type based on file extension
- Analyzes content for images, charts, tables, etc.
- Calculates metrics like page count, word count, etc.

### SocialParser

The `SocialParser` class parses social media posts:

- Extracts post content, author, and metadata
- Generates a subject from the post content
- Analyzes hashtags, mentions, and media
- Determines urgency and category based on content and engagement

## Source Adapters

The source adapters connect to various data sources and use the parsers to transform the data:

### EmailAdapter

The `EmailAdapter` class connects to email providers:

- Fetches emails from the provider's API
- Uses the `EmailParser` to transform raw emails into Communications
- Adds project information based on content analysis
- Extracts dimensions using the `DimensionExtractor`

### DocumentAdapter

The `DocumentAdapter` class connects to document storage providers:

- Fetches documents from the provider's API
- Uses the `DocumentParser` to transform raw documents into Communications
- Adds project information based on content analysis
- Extracts dimensions using the `DimensionExtractor`

### SocialAdapter

The `SocialAdapter` class connects to social media platforms:

- Fetches posts from the platform's API
- Uses the `SocialParser` to transform raw posts into Communications
- Adds project information based on content analysis
- Extracts dimensions using the `DimensionExtractor`

## Ingestion Pipeline

The `IngestionPipeline` class is the central component of the enhanced data ingestion system. It:

- Orchestrates the data ingestion process
- Manages source adapters
- Processes communications through dimension extraction, classification, and relationship detection
- Provides statistics and error handling

### Processing Steps

1. **Source Adapter Processing**: Communications are fetched from source adapters.
2. **Dimension Extraction**: Temporal, relationship, visual, and analytical dimensions are extracted.
3. **Classification**: Communications are classified into projects, categories, and urgency levels.
4. **Relationship Detection**: Connections between communications are identified.

## Dimension Extraction

The `DimensionExtractor` class extracts four key dimensions from communications:

1. **Temporal Dimension**: Deadlines, urgency, chronology, follow-up dates
2. **Relationship Dimension**: Connection strength, frequency, network position
3. **Visual Dimension**: Document types, visual elements, spatial organization
4. **Analytical Dimension**: Categories, tags, sentiment, structure

Each dimension has a confidence score that indicates how strongly the communication aligns with that dimension.

## Classification Service

The `ClassificationService` class categorizes communications based on their content and dimensions:

- **Project Classification**: Determines which life project the communication belongs to.
- **Category Classification**: Assigns a category based on content analysis.
- **Tag Extraction**: Identifies relevant tags for the communication.
- **Urgency Determination**: Assesses the urgency level of the communication.

## Relationship Detector

The `RelationshipDetector` class identifies connections between communications:

- **Person Relationships**: Connections based on people mentioned in communications.
- **Topic Relationships**: Connections based on shared topics or categories.
- **Location Relationships**: Connections based on locations mentioned in communications.
- **Time Relationships**: Connections based on shared dates or deadlines.
- **Document Relationships**: Connections based on document types or content.
- **Cross-Project Relationships**: Connections that span multiple life projects.

## Unified Data Service

The enhanced `UnifiedDataService` class provides a unified interface for accessing and filtering communications:

- **Advanced Filtering**: Filter communications by source, project, date, sender, category, tags, urgency, relationships, and dimension scores.
- **Archetype-Specific Views**: Get communications optimized for different archetypes.
- **Cross-Project Analysis**: Identify communications with cross-project relationships.
- **Related Communications**: Find communications related to a specific communication.
- **Dimension-Based Grouping**: Group communications by dimension type and confidence threshold.

## Data Flow

1. **Raw Data Ingestion**:
   - Raw emails, documents, and social media posts are fetched from their respective sources.
   - Source parsers transform the raw data into structured Communication objects.

2. **Dimension Extraction**:
   - The `DimensionExtractor` analyzes each communication to extract temporal, relationship, visual, and analytical dimensions.
   - Confidence scores are calculated for each dimension.

3. **Classification**:
   - The `ClassificationService` categorizes communications into projects, categories, and urgency levels.
   - Tags are extracted based on content and dimensions.

4. **Relationship Detection**:
   - The `RelationshipDetector` identifies connections between communications.
   - Cross-project relationships are detected.

5. **Data Access**:
   - The `UnifiedDataService` provides a unified interface for accessing and filtering communications.
   - Communications can be viewed through different archetype lenses.

## Usage Examples

### Parsing Raw Data

```typescript
// Parse a raw email
const emailParser = new EmailParser();
const rawEmail = {
  id: "email-001",
  source: "Gmail",
  raw: "From: sender@example.com\nTo: recipient@example.com\nSubject: Hello\n\nThis is the email content."
};
const parsedEmail = await emailParser.parseEmail(rawEmail);

// Parse a raw document
const documentParser = new DocumentParser();
const rawDocument = {
  id: "doc-001",
  filename: "report.pdf",
  contentType: "application/pdf",
  size: 1024,
  content: "This is the document content.",
  source: "Google Drive"
};
const parsedDocument = await documentParser.parseDocument(rawDocument);

// Parse a raw social post
const socialParser = new SocialParser();
const rawPost = {
  id: "post-001",
  platform: "Twitter",
  timestamp: "2025-06-01T12:00:00Z",
  author: {
    id: "user-001",
    name: "User",
    username: "@user"
  },
  content: "This is a tweet #hashtag"
};
const parsedPost = await socialParser.parseSocialPost(rawPost);
```

### Basic Ingestion

```typescript
// Get the unified data service
const dataService = UnifiedDataService.getInstance();

// Load data from all sources
await dataService.loadAllData();

// Get all communications
const communications = dataService.getCommunications();
```

### Advanced Filtering

```typescript
// Filter communications
const filteredCommunications = dataService.filterCommunications({
  projects: ["Home Purchase"],
  urgency: ["high"],
  startDate: new Date("2025-06-01"),
  endDate: new Date("2025-06-15"),
  hasRelationships: true,
  relationshipTypes: ["person", "location"]
});
```

### Archetype-Specific Views

```typescript
// Get communications optimized for the prioritizer archetype
const prioritizerView = dataService.getCommunicationsForArchetype("prioritizer");

// Get communications optimized for the connector archetype
const connectorView = dataService.getCommunicationsForArchetype("connector");
```

### Cross-Project Analysis

```typescript
// Get communications with cross-project relationships
const crossProjectCommunications = dataService.getCrossProjectCommunications();

// Get communications related to a specific communication
const relatedCommunications = dataService.getRelatedCommunications("comm-001");
```

### Dimension-Based Grouping

```typescript
// Group communications by temporal dimension with high confidence
const temporalGroups = dataService.getCommunicationsByDimension("temporal", 0.8);

// Group communications by visual dimension with medium confidence
const visualGroups = dataService.getCommunicationsByDimension("visual", 0.6);
```

## Benefits

The enhanced data ingestion system provides several benefits:

1. **Multi-Dimensional Analysis**: View the same communication from different perspectives.
2. **Cross-Project Insights**: Identify connections between different life projects.
3. **Personalized Views**: Optimize the display of communications based on user archetype.
4. **Intelligent Classification**: Automatically categorize and prioritize communications.
5. **Relationship Discovery**: Uncover hidden connections between communications.

## Future Enhancements

1. **Machine Learning Integration**: Replace rule-based classification with ML models.
2. **Natural Language Processing**: Enhance dimension extraction with advanced NLP.
3. **Real-Time Processing**: Process communications in real-time as they arrive.
4. **Feedback Loop**: Incorporate user feedback to improve classification accuracy.
5. **Multi-Modal Analysis**: Extract dimensions from images, audio, and video.
