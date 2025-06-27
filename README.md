# Doc-Tales: Smart Document & Feed Unification Processor

## Project Overview

Doc-Tales is a personalized communications sorter for the intelligent document processing industry. The solution unifies and intelligently processes content from diverse sources (emails, documents, and social media) into a single dashboard with archetype-based personalization that adapts to the user's cognitive style.

### Core Value Proposition

- Archetype-based personalization that adapts the interface to user cognitive styles
- Unified inbox for all communications regardless of source
- Frictionless onboarding for diverse data sources
- Cross-project organization to provide a complete picture

## Repository Structure

This is a monorepo containing all the code for the Doc-Tales application:

```
doc-tales/
├── packages/                      # Packages directory
│   ├── frontend/                  # React frontend application
│   ├── backend/                   # AWS Lambda functions and backend services
│   └── common/                    # Shared code, types, and utilities
├── infrastructure/                # Infrastructure as code
│   ├── sam/                       # AWS SAM templates
│   └── scripts/                   # Deployment scripts
├── scripts/                       # Build and utility scripts
├── docs/                          # Documentation
└── .github/                       # GitHub Actions workflows
```

## Getting Started

### Prerequisites

- Node.js 22.x
- npm 10.x or yarn
- AWS CLI configured with appropriate permissions
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

3. Build all packages:
   ```bash
   npm run build
   ```

4. Start the frontend development server:
   ```bash
   npm run start:frontend
   ```

5. Open your browser to `http://localhost:3000`

## Development Workflow

### Running Tests

```bash
# Run unit tests (with mocked services)
npm test

# Run integration tests (against real AWS infrastructure)
npm run test:integration

# Run tests for a specific package
npm test -w @doc-tales/frontend
npm test -w @doc-tales/backend
npm test -w @doc-tales/common
```

### Demo Environment Management

```bash
# Validate demo environment is ready
npm run demo:validate

# Prepare complete demo environment (clean + seed + test)
npm run demo:prepare

# Seed demo data
npm run demo:seed

# Clean demo data
npm run demo:cleanup
```

### Linting

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

### Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:frontend
npm run build:backend
npm run build:common
```

## Deployment

### Frontend Deployment

```bash
npm run deploy:frontend
```

### Backend Deployment

```bash
# Deploy to development environment
npm run deploy:backend:dev

# Deploy to staging environment
npm run deploy:backend:staging

# Deploy to production environment
npm run deploy:backend:prod
```

### Full Deployment

```bash
npm run deploy:all
```

## CI/CD Pipeline

This repository uses GitHub Actions for CI/CD:

- **CI Workflow**: Runs on every push and pull request to main and develop branches
  - Linting
  - Testing
  - Building

- **CD Development Workflow**: Deploys to development environment when code is pushed to the develop branch
  - Deploys backend to AWS
  - Deploys frontend to S3

- **CD Production Workflow**: Deploys to production environment when code is pushed to the main branch
  - Deploys backend to AWS
  - Deploys frontend to S3

## Documentation

- [Demo Guide](docs/demo-guide.md)
- [Integration Testing Guide](docs/integration-testing.md)
- [AWS SDK v3 Migration Guide](docs/technical/aws-sdk-v3-migration.md) ⭐ **New**
- [Technical Implementation Summary](docs/technical/implementation-summary.md)
- [Technical Architecture](docs/technical/technical-architecture.md)
- [DynamoDB Schema Guide](docs/technical/dynamodb-schema-guide.md)
- [DynamoDB Access Patterns](docs/technical/dynamodb-access-patterns.md)
- [GitHub OIDC Setup Guide](docs/technical/github-oidc-setup-guide.md)
- [Event-Driven Architecture](docs/technical/event-driven-architecture.md)
- [Parser Implementation](docs/technical/parser-implementation.md)

## License

MIT License
