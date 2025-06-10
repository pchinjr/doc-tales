# Doc-Tales: Smart Document & Feed Unification Processor

## Project Overview

Doc-Tales is a Smart Document & Feed Unification Processor developed for the AWS Lambda Hackathon. The solution unifies and intelligently processes content from diverse sources (physical mail via scans, emails, and social media feeds) into a single dashboard with automated processing capabilities.

### Core Value Proposition

- Unified inbox for all communications regardless of source
- Intelligent prioritization and categorization that adapts to user preferences
- Automated processing rules and workflows that reduce cognitive load
- Cross-channel context and relationship mapping to provide a complete picture

## Key Technologies

- **AWS Lambda**: Serverless functions for document and feed processing
- **Amazon S3**: Storage for documents and processing results
- **Amazon DynamoDB**: Metadata storage and relationship mapping
- **Amazon Comprehend**: Natural language processing for document analysis
- **Amazon Textract**: Document text extraction and form processing
- **Amazon EventBridge**: Event-driven architecture orchestration
- **Amazon API Gateway**: RESTful API endpoints for the frontend
- **React**: Frontend dashboard interface

## Repository Structure

```
doc-tales/
├── docs/                          # Project documentation
│   ├── architecture/              # Architecture documentation
│   ├── planning/                  # Project planning documents
│   ├── research/                  # Research documents
│   └── technical/                 # Technical documentation
├── src/                           # Source code
│   ├── functions/                 # Lambda functions
│   ├── layers/                    # Lambda layers for shared code
│   └── frontend/                  # Frontend code for dashboard
├── infrastructure/                # Infrastructure as code
├── tests/                         # Test files
├── scripts/                       # Utility scripts
└── tools/                         # Development tools
    └── amazon-q/                  # Amazon Q setup files
```

For more details on the repository structure and organization guidelines, see [Repository Structure](repo-structure.md).

## Getting Started

### Prerequisites

- AWS Account with appropriate permissions
- Node.js 18.x or later
- AWS CLI configured with your credentials
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

3. Configure AWS credentials:
   ```bash
   aws configure
   ```

4. Deploy to AWS:
   ```bash
   npm run deploy
   ```

## Development Workflow

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Implement your changes

3. Write tests for your changes
   ```bash
   npm test
   ```

4. Submit a pull request to `main`

5. After review, merge your changes

## Key Documentation

- [Project Plan](docs/planning/lambda-hackathon-plan.md)
- [Dynamic Architecture](docs/architecture/dynamic-architecture.md)
- [Competitive Research](docs/research/competitive-research.md)
- [Repository Structure](repo-structure.md)

## Features in Development

- **Document Processor**: Lambda function for processing uploaded documents
- **Feed Connector**: Integration with email and social media APIs
- **Unified Dashboard**: React-based frontend for viewing all communications
- **Smart Categorization**: ML-based document and message categorization
- **Workflow Automation**: Rule-based processing of incoming communications

## License

MIT License
