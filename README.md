# Doc-Tales: Smart Document & Feed Unification Processor

## Project Overview

Doc-Tales is a personalized communications sorter for the intelligent document processing industry. The solution unifies and intelligently processes content from diverse sources (emails, documents, and social media) into a single dashboard with archetype-based personalization that adapts to the user's cognitive style.

### Core Value Proposition

- Archetype-based personalization that adapts the interface to user cognitive styles
- Unified inbox for all communications regardless of source
- Frictionless onboarding for diverse data sources
- Cross-project organization to provide a complete picture

## Current Implementation

The current implementation is a TypeScript-based React application that demonstrates the core concept of archetype-based personalization:

- **Four Archetype Views**:
  - **Prioritizer**: Time-based organization with urgency indicators
  - **Connector**: People-centric view with relationship mapping
  - **Visualizer**: Visual boards with spatial organization
  - **Analyst**: Detailed metadata view with logical hierarchies

- **Sample Dataset**: Includes communications across three life projects:
  - Home Purchase
  - Career Change
  - Family Event

- **Interaction Tracking**: Monitors user behavior to determine their archetype
  - Clicking on dates increases Prioritizer confidence
  - Clicking on people increases Connector confidence
  - Viewing visual elements increases Visualizer confidence
  - Viewing detailed information increases Analyst confidence

- **Adaptive Dashboard**: Changes the organization of information based on detected archetype

- **Dimension-Based Data Model**: Extracts and utilizes four key dimensions from communications
  - **Temporal**: Deadlines, urgency, chronology, follow-up dates
  - **Relationship**: Connection strength, frequency, network position
  - **Visual**: Document types, visual elements, spatial organization
  - **Analytical**: Categories, tags, sentiment, structure

- **Unified Data Ingestion API**: Standardizes data from multiple sources
  - Source-specific adapters for email, documents, and social media
  - Dimension extraction for personalized views
  - Configuration UI for managing data sources

## Tech Stack

- **Frontend**: React with TypeScript
- **Code Quality**: ESLint for code quality and consistency
- **AWS Services** (planned):
  - Lambda for serverless processing
  - S3 for document storage
  - DynamoDB for metadata and user profiles
  - Comprehend for entity extraction
  - Textract for document processing
  - API Gateway for frontend communication

## Getting Started

### Prerequisites

- Node.js 22.x
- npm or yarn
- Git

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone git@github.com:pchinjr/doc-tales.git
   cd doc-tales
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

5. Lint the code (optional):
   ```bash
   npm run lint
   ```

## Project Structure

```
doc-tales/
├── docs/                          # Project documentation
│   ├── planning/                  # Planning documents
│   └── technical/                 # Technical documentation
├── public/                        # Static assets
├── src/                           # Source code
│   ├── components/                # React components
│   │   └── views/                 # Archetype-specific views
│   ├── data/                      # Sample data
│   ├── services/                  # Service layer
│   │   └── adapters/              # Source-specific adapters
│   └── types/                     # TypeScript type definitions
└── infrastructure/                # Infrastructure as code (future)
```

## Documentation

- [Hackathon Master Plan](docs/planning/hackathon-master-plan.md)
- [Technical Architecture](docs/technical/technical-architecture.md)
- [Demo Implementation Guide](docs/technical/demo-implementation-guide.md)
- [Development Progress Report](docs/technical/development-progress.md)
- [Architecture Improvements](docs/technical/architecture-improvements.md)
- [DynamoDB Schema Guide](docs/technical/dynamodb-schema-guide.md)
- [DynamoDB Access Patterns](docs/technical/dynamodb-access-patterns.md)
- [Lambda Refactoring Plan](docs/technical/lambda-refactoring-plan.md)
- [GitHub OIDC Setup Guide](docs/technical/github-oidc-setup-guide.md)

## Current Progress

- ✅ Defined archetype-based personalization concept
- ✅ Created TypeScript type definitions
- ✅ Implemented service layer for data and archetype detection
- ✅ Built four archetype-specific views
- ✅ Created sample dataset with cross-project elements
- ✅ Implemented interaction tracking and archetype detection
- ✅ Built adaptive dashboard that changes based on archetype
- ✅ Implemented dimension-based data model
- ✅ Created unified data ingestion API with source adapters
- ✅ Added configuration UI for data sources
- ✅ Built interactive demo flow for onboarding
- ✅ Set up ESLint for code quality
- ✅ **AWS Integration**:
  - ✅ Created SAM template for infrastructure as code
  - ✅ Implemented Lambda functions for document processing
  - ✅ Created DynamoDB tables for user profiles and metadata
  - ✅ Set up S3 buckets for document storage
  - ✅ Deployed serverless backend to AWS
  - ✅ Created comprehensive test scripts

## Next Steps

1. **Backend Improvements**:
   - Fix DynamoDB composite key handling in Lambda functions
   - Refactor API Lambda into multiple single-purpose functions
   - Implement Lambda Layers for shared code
   - Add comprehensive error handling and logging

2. **Enhanced Interaction Tracking**:
   - Improve archetype detection algorithm
   - Add more interaction types to track
   - Implement confidence threshold for archetype switching

3. **UI Enhancements**:
   - Add animations for archetype transitions
   - Implement relationship visualization with D3.js
   - Create project timeline visualization
   - Connect frontend to deployed AWS backend

4. **Demo Refinement**:
   - Polish the guided tour experience
   - Create "Time Travel Inbox" demo scenario
   - Add more realistic sample data

## Development Notes

- The current implementation uses a simplified rule-based approach for archetype detection instead of ML
- Mock adapters simulate connections to email, document, and social media sources
- Dimension extraction uses simple pattern matching rather than advanced NLP
- UI components are functional but could benefit from additional visual polish

## License

MIT License
