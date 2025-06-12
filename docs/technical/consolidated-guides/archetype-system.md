# Archetype-Based Personalization System

This document consolidates information about Doc-Tales' core archetype-based personalization system, including the dimension extraction process and implementation details.

## Table of Contents
- [Archetype Overview](#archetype-overview)
- [Dimension-Based Data Model](#dimension-based-data-model)
- [Archetype Detection System](#archetype-detection-system)
- [Implementation Details](#implementation-details)
- [Testing and Validation](#testing-and-validation)
- [UX Considerations](#ux-considerations)

## Archetype Overview

Doc-Tales uses four distinct archetypes to personalize the user experience:

### 1. Prioritizer
- **Core Focus**: Time-based organization with urgency indicators
- **Key Dimension**: Temporal
- **Interaction Patterns**: Clicks on dates, deadlines, and time-related elements
- **UI Preferences**: Linear lists with clear deadlines and priority indicators

### 2. Connector
- **Core Focus**: People-centric view with relationship mapping
- **Key Dimension**: Relationship
- **Interaction Patterns**: Clicks on people, organizations, and social connections
- **UI Preferences**: Network visualizations and contact-based grouping

### 3. Visualizer
- **Core Focus**: Visual boards with spatial organization
- **Key Dimension**: Visual
- **Interaction Patterns**: Engages with images, diagrams, and visual layouts
- **UI Preferences**: Card-based interfaces with strong visual hierarchy

### 4. Analyst
- **Core Focus**: Detailed metadata view with logical hierarchies
- **Key Dimension**: Analytical
- **Interaction Patterns**: Explores detailed information, categories, and structures
- **UI Preferences**: Table views with sorting and filtering capabilities

## Dimension-Based Data Model

The system extracts four key dimensions from all communications:

### Temporal Dimension
- **Elements**: Deadlines, urgency indicators, chronology, follow-up dates
- **Extraction Methods**: Date/time entity recognition, urgency keyword detection
- **Storage**: Normalized timestamp format with confidence scores

### Relationship Dimension
- **Elements**: Connection strength, frequency, network position, organizational context
- **Extraction Methods**: Named entity recognition, communication frequency analysis
- **Storage**: Graph-based representation with weighted edges

### Visual Dimension
- **Elements**: Document types, visual elements, spatial organization, color schemes
- **Extraction Methods**: Document structure analysis, image detection, layout analysis
- **Storage**: Visual metadata with element positioning and relationships

### Analytical Dimension
- **Elements**: Categories, tags, sentiment, structure, logical organization
- **Extraction Methods**: Topic modeling, sentiment analysis, structural parsing
- **Storage**: Hierarchical category structure with metadata tags

## Archetype Detection System

### Confidence Scoring

The system maintains confidence scores for each archetype based on user interactions:

```typescript
interface ArchetypeConfidence {
  prioritizer: number;  // 0-100
  connector: number;    // 0-100
  visualizer: number;   // 0-100
  analyst: number;      // 0-100
}
```

### Interaction Tracking

User interactions are mapped to archetype confidence adjustments:

| Interaction Type | Archetype Affected | Confidence Adjustment |
|------------------|-------------------|----------------------|
| Click on date    | Prioritizer | +2 |
| Sort by deadline | Prioritizer | +5 |
| Click on person  | Connector | +2 |
| View relationship map | Connector | +5 |
| Engage with image | Visualizer | +2 |
| Rearrange cards | Visualizer | +5 |
| View detailed metadata | Analyst | +2 |
| Apply filters | Analyst | +5 |

### Adaptive Dashboard

The system uses the highest confidence archetype to determine the default dashboard view, with a threshold mechanism to prevent frequent switching:

```typescript
function determineActiveArchetype(confidence: ArchetypeConfidence): Archetype {
  const current = getHighestConfidence(confidence);
  const previous = getPreviousArchetype();
  
  // Only switch if new archetype exceeds previous by threshold
  if (confidence[current] > confidence[previous] + SWITCH_THRESHOLD) {
    return current;
  }
  return previous;
}
```

## Implementation Details

### Core Components

1. **Dimension Extractor**:
   - Processes incoming communications
   - Extracts dimension data using NLP and pattern recognition
   - Stores normalized dimension data in DynamoDB

2. **Interaction Tracker**:
   - Monitors user interactions with the interface
   - Maps interactions to archetype confidence adjustments
   - Updates user profile with new confidence scores

3. **View Selector**:
   - Determines appropriate view based on archetype confidence
   - Manages view transitions and state persistence
   - Provides fallback views when confidence is low

4. **Personalization Engine**:
   - Applies archetype-specific customizations to the interface
   - Manages dimension emphasis based on archetype
   - Provides personalized suggestions and organization

### Technical Implementation

#### Dimension Extraction Pipeline

```
Document/Communication → Parser → Entity Extraction → Dimension Mapping → Storage
```

#### Confidence Scoring Algorithm

```typescript
function updateArchetypeConfidence(
  currentConfidence: ArchetypeConfidence,
  interaction: UserInteraction
): ArchetypeConfidence {
  const adjustment = getAdjustmentForInteraction(interaction);
  const newConfidence = { ...currentConfidence };
  
  // Apply adjustment with decay for other archetypes
  Object.keys(newConfidence).forEach(archetype => {
    if (archetype === adjustment.archetype) {
      newConfidence[archetype] = Math.min(100, newConfidence[archetype] + adjustment.value);
    } else {
      newConfidence[archetype] = Math.max(0, newConfidence[archetype] - (adjustment.value * 0.2));
    }
  });
  
  return newConfidence;
}
```

## Testing and Validation

### Dimension Extraction Testing

Tests were conducted on a sample dataset of 500 communications across various sources:

| Dimension | Accuracy | Precision | Recall | F1 Score |
|-----------|----------|-----------|--------|----------|
| Temporal | 92% | 89% | 94% | 91.4% |
| Relationship | 87% | 85% | 88% | 86.5% |
| Visual | 83% | 80% | 85% | 82.4% |
| Analytical | 89% | 87% | 90% | 88.5% |

### Archetype Detection Validation

User studies with 50 participants showed:
- 78% of users were correctly identified within 10 interactions
- 92% were correctly identified within 20 interactions
- 85% reported that the personalized view matched their preferences

## UX Considerations

### Onboarding Flow

1. **Initial Assessment**: Brief questionnaire to establish baseline archetype confidence
2. **Guided Tour**: Introduction to features with interaction opportunities
3. **Adaptive Period**: First week emphasizes exploration across archetypes
4. **Confirmation**: User feedback to validate detected archetype

### Archetype Transitions

- Gradual UI transitions when switching between archetypes
- Hybrid views when confidence scores are close
- User override option to manually select preferred view
- Periodic reassessment to account for changing preferences

### Feedback Mechanisms

- Subtle indicators of current archetype view
- Options to provide explicit feedback on view usefulness
- Analytics on feature usage by archetype
- A/B testing of archetype-specific features

## Journaling UX Integration

The recently proposed journaling UX features integrate with the archetype system:

### Glyph Tag Engine

- Prioritizer: Emphasizes deadline and urgency glyphs (🔥, ⏰)
- Connector: Highlights relationship glyphs (👤, 🤝)
- Visualizer: Foregrounds visual organization glyphs (🖼️, 📊)
- Analyst: Prioritizes categorization glyphs (🏷️, 📁)

### Daily Cleanse & Smart Daily Log

- Adapts presentation based on user's archetype
- Customizes suggested actions to match archetype preferences
- Provides archetype-specific micro-prompts
- Feeds interaction data back to archetype detection system
