# Doc-Tales: 🎶 oo Woo Oo 🎶

## 🏆 Hackathon Project Overview

Doc-Tales is a personalized communications sorter for the intelligent document processing industry. The solution unifies and intelligently processes content from diverse sources (emails, documents, and social media) into a single dashboard with archetype-based personalization that adapts to the user's cognitive style.

## Intro

Between client work and traveling to speak at conferences, I had way more ideas than time to join the AWS Lambda Hackathon. Then Brooke Jamieson convinced me at AWS Community Day Midwest that Q would help solve the time constraint. The next day, Q and I started building doc-tales (oo woo oo)

### Why

A growing pile of mail haunts me, slowly lurching towards me from the side of my desk. My first instinct as a builder is always the same: make a machine to do it for me.

So that’s what I did.

**Doc-Tales** is an event-driven communications pipeline for multi-dimensional analysis. It’s built around the idea of a standardized communication object — once that shape is locked down, you can plug in all kinds of logic: enrichment, filtering, personalization, notifications.

Doc-tales doesn’t wait for a user to tag or categorize their communications; instead, users navigate by dimensions classified within four user archetypes.

- **Prioritizer**: Focus on urgency and importance
- **Connector**: Focus on relationships and networks
- **Visualizer**: Focus on visual data representation
- **Analyst**: Focus on detailed analysis and metrics

## How

I’ve designed the system around four user archetypes. Each archetype displays information in unique ways to match the user's favored cognitive model. To improve discoverability, user interactions are monitored and their archetype is updated, leading to a better default experience and the ability to change with the user. 

Doc-tales starts with **S3 events to trigger Lambda functions when new communication objects are added to S3**. Some of those pipelines use AWS Comprehend and other ML services to extract metadata — things like urgency, relationships, or topics. Other parts route the results to the UI based on the user’s archetype — how they like to think and sort information.

### What I Focused On

Despite the superpowers that Q gives me, I can’t do it all. I focused on my expertise in **cloud architecture** and anticipating system needs. I avoided writing custom ML algorithms or overly engineered frontend logic — not because it’s not important, but because it would have slowed down the parts I wanted to get right first.

- The frontend is scaffolded and deployable, with enough hooks to support dynamic views.
- The backend is separated cleanly by concern. The Lambdas are heavier than I’d like, but I decided not to add complexity like a service router yet. I’ll wait until I actually need one.
- Documentation and commit history are clean and deliberate, not just a hackathon throw away

### Architecture Highlights

- **Event-driven**: S3 → Lambda + Comprehend → DynamoDB pipeline
- **Multi-workspace**: Separate packages for frontend (React/TypeScript), backend (Node.js/Lambda), and common utilities
- **AWS Services**: Comprehend for NLP, DynamoDB for storage, S3 for document storage, API Gateway, and Q Developer CLI

### What I Learned

I started thinking less about what Q could do, and more about what it *should* do — and how I’d monitor, secure, and review the things it touches. Somewhere in that process, I remembered that Q is built on top of Fig — a tool I already trusted. I was honestly surprised at how well Q works.

If you’re an AWS builder and you want something that’s fast, contextual, and close to your stack, I’d recommend it.

The whole experience pushed me to think about what it means to work alongside agentic systems — not just using tools, but **building responsibly with them**. That includes planning for permissions, logging, debugging, and growing a system that might be making decisions you didn’t write directly.

Doc-Tales is my first shot at building something for that kind of future.

It's still early, but it works.

And for now, it even sorts my mail.

### 🎯 Core Value Proposition

- **Archetype-based personalization** that adapts the interface to user cognitive styles
- **Unified inbox** for all communications regardless of source
- **Frictionless onboarding** for diverse data sources
- **Cross-project organization** to provide a complete picture
- **AI-powered processing** using AWS Comprehend for sentiment analysis and entity extraction

## 🏗️ Architecture

This is a **monorepo** containing all the code for the Doc-Tales application:

```
doc-tales/
├── packages/
│   ├── frontend/          # React TypeScript application
│   ├── backend/           # AWS Lambda functions and backend services
│   └── common/            # Shared types, services, and utilities
├── infrastructure/        # AWS SAM templates and deployment scripts
├── scripts/              # Build and utility scripts
└── docs/                 # Essential documentation
```

### 🛠️ Technology Stack

**Frontend:**
- React 18 with TypeScript
- Material-UI for component library
- AWS SDK v3 for direct AWS service integration
- Recharts for data visualization

**Backend:**
- AWS Lambda (Node.js 22.x)
- AWS Comprehend for ML processing
- AWS DynamoDB for data storage
- AWS S3 for document storage

**Infrastructure:**
- AWS SAM for Infrastructure as Code
- AWS CloudFormation for resource management
- Manual deployment scripts for CI/CD

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- npm 10.x or yarn
- AWS CLI configured with appropriate permissions
- Git

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone git@github.com:pchinjr/doc-tales.git
   cd doc-tales
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build all packages:**
   ```bash
   npm run build
   ```

4. **Start the frontend development server:**
   ```bash
   npm run start:frontend
   ```

5. **Open your browser to `http://localhost:3000`**

## 🎮 Demo Environment

### Quick Demo Setup

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

### Available Demo Scripts

- `validate-demo.sh` - Validates AWS environment and permissions
- `seed-demo-data.sh` - Seeds the demo environment with sample data
- `cleanup-demo-data.sh` - Cleans up demo data
- `integration-tests.sh` - Runs integration tests against live AWS infrastructure

## 🧪 Development Workflow

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

### Building and Linting

```bash
# Build all packages
npm run build

# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚢 Deployment

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

## 🤖 AI/ML Features

### AWS Comprehend Integration
- **Sentiment Analysis** - Automatically detects sentiment in communications
- **Entity Extraction** - Identifies people, organizations, locations, and other entities
- **Key Phrase Extraction** - Extracts important phrases and topics
- **Language Detection** - Automatically detects the language of content

### Archetype System
The application includes a sophisticated archetype system that adapts the UI based on user cognitive styles:

- **Analyst** - Data-driven interface with detailed metrics and charts
- **Connector** - Relationship-focused view emphasizing people and connections
- **Prioritizer** - Task-oriented interface with urgency indicators and action items
- **Visualizer** - Visual-first interface with rich graphics and intuitive layouts

## 📊 Key Features Demonstrated

### 1. Unified Communication Processing
- Email parsing and processing
- Document analysis and categorization
- Social media post processing
- Cross-platform content unification

### 2. Intelligent Content Analysis
- Real-time sentiment analysis using AWS Comprehend
- Automatic entity extraction and relationship mapping
- Content categorization and tagging
- Urgency detection and prioritization

### 3. Personalized User Experience
- Archetype-based UI adaptation
- Customizable dashboard layouts
- Intelligent content filtering and sorting
- Context-aware recommendations

### 4. Scalable Architecture
- Serverless backend with AWS Lambda
- Event-driven processing pipeline
- Scalable data storage with DynamoDB
- CDN-optimized frontend delivery

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default

# Application Configuration
NODE_ENV=development
```

### AWS Services Used
- **Lambda** - Serverless compute for backend processing
- **DynamoDB** - NoSQL database for storing communications and user data
- **Comprehend** - Natural language processing and sentiment analysis
- **S3** - Object storage for documents and static assets
- **CloudFormation** - Infrastructure as Code
- **IAM** - Identity and access management

## 📚 Documentation

- [Demo Guide](docs/demo-guide.md) - Complete guide for running the demo
- [Integration Testing Guide](docs/integration-testing.md) - How to run integration tests
- [Technical Architecture](docs/technical/technical-architecture.md) - Detailed system architecture
- [Implementation Summary](docs/technical/implementation-summary.md) - Key implementation details
- [AWS SDK v3 Migration Guide](docs/technical/aws-sdk-v3-migration.md) - Migration notes and best practices

## 🎯 Hackathon Highlights

### Innovation Points
1. **Archetype-based Personalization** - Novel approach to UI adaptation based on cognitive styles
2. **Unified Communication Processing** - Single interface for multiple communication channels
3. **Real-time AI Processing** - Live sentiment analysis and entity extraction
4. **Serverless Architecture** - Fully scalable, cost-effective cloud-native solution

### Technical Achievements
- **Full-stack TypeScript** implementation with shared types
- **AWS SDK v3** integration with modern async/await patterns
- **Comprehensive testing** with both unit and integration tests
- **CI/CD pipeline** with automated deployment
- **Infrastructure as Code** with AWS SAM

### Demo-Ready Features
- Live sentiment analysis of communications
- Real-time archetype switching and UI adaptation
- Interactive data visualization with charts and metrics
- Responsive design that works on desktop and mobile
- Complete AWS integration with live data processing

## 🏃‍♂️ Running the Demo

1. **Start the application:**
   ```bash
   npm run demo:prepare
   npm run start:frontend
   ```

2. **Navigate to `http://localhost:3000`**

3. **Try different archetypes:**
   - Switch between Analyst, Connector, Prioritizer, and Visualizer views
   - Notice how the UI adapts to each cognitive style

4. **Test AI features:**
   - Upload documents or enter text to see sentiment analysis
   - Watch entity extraction in real-time
   - Explore the unified communication dashboard

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a hackathon project, but contributions and feedback are welcome! Please feel free to open issues or submit pull requests.

---

**Built with ❤️ for the AWS Hackathon**