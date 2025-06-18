# Enhanced Data Ingestion System

## Overview

The enhanced data ingestion system is a key differentiator for Doc-Tales, enabling the application to take the same communication and slice it across multiple dimensions. This document outlines the architecture and components of the enhanced data ingestion system.

## Architecture

The enhanced data ingestion system consists of the following components:

1. **Ingestion Pipeline**: Orchestrates the data ingestion process from source adapters to dimension extraction and classification.
2. **Source Adapters**: Connect to various data sources (email, documents, social media) and normalize the data.
3. **Dimension Extractor**: Extracts temporal, relationship, visual, and analytical dimensions from communications.
4. **Classification Service**: Categorizes communications into projects, categories, and urgency levels.
5. **Relationship Detector**: Identifies connections between communications across projects.
6. **Unified Data Service**: Provides a unified interface for accessing and filtering communications.

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

## Usage Examples

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
