# Development Notes for Doc-Tales

## Current State

Doc-Tales is currently implemented as a React application with TypeScript that demonstrates the core concept of archetype-based personalization. The application includes:

1. **Core TypeScript Structure**
   - Type definitions for Communications, Projects, Contacts, and User Profiles
   - Service layer for data access and archetype detection
   - React components for the dashboard and archetype views

2. **Archetype System**
   - Four distinct archetype views (Prioritizer, Connector, Visualizer, Analyst)
   - Interaction tracking that updates archetype confidence scores
   - Adaptive dashboard that changes based on detected archetype

3. **Sample Dataset**
   - Communications across three life projects (Home Purchase, Career Change, Family Event)
   - Cross-project relationships and elements
   - Realistic metadata and content

## Implementation Details

### TypeScript Services

- **DataService**: Singleton service for loading and accessing sample data
  - Currently loads from local JSON file
  - Future: Will integrate with AWS services

- **ArchetypeService**: Tracks user interactions and determines archetype
  - Uses simple rule-based classification
  - Future: Will use ML-based classification via SageMaker

- **AwsService**: Provides access to AWS services
  - Currently a placeholder with client initialization
  - Future: Will implement actual AWS service calls

### React Components

- **Dashboard**: Main component that manages state and renders archetype views
  - Displays archetype confidence scores
  - Allows manual switching between views

- **Archetype Views**:
  - **PrioritizerView**: Time-based organization with urgency indicators
  - **ConnectorView**: People-centric view with relationship focus
  - **VisualizerView**: Visual boards with spatial organization
  - **AnalystView**: Detailed metadata view with logical hierarchies

## Known Issues

1. **Type Safety**: Using type assertions for JSON data
   - Need to ensure sample data structure matches TypeScript interfaces

2. **AWS Integration**: Placeholder only
   - Need to implement actual AWS service calls

3. **Visualization**: Basic implementation
   - Need to add D3.js for relationship visualization

4. **Styling**: Basic CSS only
   - Need to improve visual design and add animations

## Next Development Tasks

### Priority 1: AWS Integration

1. Create Lambda function for document processing
   - Implement text extraction with Textract
   - Extract entities with Comprehend
   - Store results in DynamoDB

2. Set up S3 bucket for document storage
   - Configure CORS for direct uploads
   - Set up Lambda triggers for processing

3. Create DynamoDB tables
   - User profiles table
   - Communications metadata table
   - Relationships table

### Priority 2: Enhanced Interaction Tracking

1. Improve archetype detection algorithm
   - Add more sophisticated rules
   - Implement confidence thresholds
   - Add hybrid archetype support

2. Add more interaction types
   - Track hover behavior
   - Monitor time spent on different views
   - Analyze navigation patterns

### Priority 3: UI Enhancements

1. Add animations for archetype transitions
   - Smooth transitions between views
   - Visual feedback for interactions

2. Implement relationship visualization
   - D3.js force-directed graph
   - Interactive exploration

3. Create project timeline visualization
   - Gantt chart for project timelines
   - Highlight overlaps and conflicts

### Priority 4: Demo Flow

1. Implement guided tour experience
   - Step-by-step introduction
   - Highlight key features

2. Create "Time Travel Inbox" demo
   - Show before/after transformation
   - Demonstrate value proposition

## Development Environment

- Node.js 18.x
- React 17.x
- TypeScript 4.5.x
- AWS SDK v3

## Testing Strategy

1. **Unit Tests**
   - Test service layer functions
   - Test component rendering

2. **Integration Tests**
   - Test interaction tracking and archetype detection
   - Test data loading and transformation

3. **End-to-End Tests**
   - Test complete user flows
   - Test AWS integration

## Deployment Strategy

1. **Development**
   - Local development server
   - Mock AWS services

2. **Staging**
   - Deploy to AWS
   - Use test data and accounts

3. **Production**
   - Deploy to production AWS account
   - Use real user data
