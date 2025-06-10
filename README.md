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

## Tech Stack

- **Frontend**: React with TypeScript
- **AWS Services**:
  - Lambda for serverless processing
  - S3 for document storage
  - DynamoDB for metadata and user profiles
  - Comprehend for entity extraction
  - Textract for document processing
  - API Gateway for frontend communication

## Getting Started

### Prerequisites

- Node.js 18.x or later
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
│   └── types/                     # TypeScript type definitions
└── infrastructure/                # Infrastructure as code (future)
```

## Key Documentation

- [Hackathon Master Plan](docs/planning/hackathon-master-plan.md)
- [Technical Architecture](docs/technical/technical-architecture.md)
- [Demo Implementation Guide](docs/technical/demo-implementation-guide.md)

## Current Progress

- ✅ Defined archetype-based personalization concept
- ✅ Created TypeScript type definitions
- ✅ Implemented service layer for data and archetype detection
- ✅ Built four archetype-specific views
- ✅ Created sample dataset with cross-project elements
- ✅ Implemented interaction tracking and archetype detection
- ✅ Built adaptive dashboard that changes based on archetype

## Next Steps

1. **AWS Integration**:
   - Implement Lambda functions for document processing
   - Create DynamoDB tables for user profiles and metadata
   - Set up S3 buckets for document storage

2. **Enhanced Interaction Tracking**:
   - Improve archetype detection algorithm
   - Add more interaction types to track
   - Implement confidence threshold for archetype switching

3. **UI Enhancements**:
   - Add animations for archetype transitions
   - Implement relationship visualization with D3.js
   - Create project timeline visualization

4. **Demo Flow**:
   - Implement guided tour experience
   - Create "Time Travel Inbox" demo
   - Add demo state management

## Development Notes

- The current implementation uses a simplified rule-based approach for archetype detection instead of ML
- Sample data is loaded from a local JSON file rather than AWS services
- UI components are functional but need visual polish
- Type assertions are used in DataService to handle JSON data

## License

MIT License
