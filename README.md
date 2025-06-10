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
- **Event-Driven Architecture**: Responsive processing of documents and feeds
- **Machine Learning/AI**: For document classification and prioritization
- **Unified Dashboard**: Single interface for all document and feed sources

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
   # Instructions will be added as the project develops
   ```

3. Deploy to AWS:
   ```bash
   # Instructions will be added as the project develops
   ```

## Development Workflow

1. Create a feature branch from `main`
2. Implement your changes
3. Write tests for your changes
4. Submit a pull request to `main`
5. After review, merge your changes

## Key Documentation

- [Project Plan](docs/planning/lambda-hackathon-plan.md)
- [Dynamic Architecture](docs/architecture/dynamic-architecture.md)
- [Competitive Research](docs/research/competitive-research.md)

## Amazon Q Integration

This project uses Amazon Q for development assistance. To set up Amazon Q:

1. Navigate to the tools directory:
   ```bash
   cd tools/amazon-q
   ```

2. Run the setup script:
   ```bash
   ./q-setup.sh
   ```

3. Start Amazon Q with project context:
   ```bash
   ./start-q.sh
   ```

## License

[License information will be added]

## Contributors

- Paul Chin Jr (@pchinjr)
