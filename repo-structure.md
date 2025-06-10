# Repository Structure for Doc-Tales

## Current Structure Analysis

The current repository contains a mix of project documentation, Amazon Q setup files, and no clear organization. This makes it difficult to navigate and maintain as the project grows.

## Proposed Repository Structure

```
doc-tales/
├── README.md                      # Project overview, setup instructions, and quick start
├── docs/                          # Project documentation
│   ├── architecture/              # Architecture documentation
│   │   ├── dynamic-architecture.md
│   │   └── system-design.md
│   ├── planning/                  # Project planning documents
│   │   ├── lambda-hackathon-plan.md
│   │   └── milestones.md
│   ├── research/                  # Research documents
│   │   ├── competitive-research.md
│   │   └── user-needs.md
│   └── technical/                 # Technical documentation
│       ├── api-specs.md
│       └── data-models.md
├── src/                           # Source code
│   ├── functions/                 # Lambda functions
│   │   ├── document-processor/
│   │   ├── feed-processor/
│   │   └── notification-handler/
│   ├── layers/                    # Lambda layers for shared code
│   │   └── common-utils/
│   └── frontend/                  # Frontend code for dashboard
│       ├── components/
│       └── pages/
├── infrastructure/                # Infrastructure as code
│   ├── cloudformation/
│   └── terraform/
├── tests/                         # Test files
│   ├── unit/
│   └── integration/
├── scripts/                       # Utility scripts
│   ├── deploy.sh
│   └── local-dev.sh
└── tools/                         # Development tools
    └── amazon-q/                  # Amazon Q setup files
        ├── q-context.txt
        ├── q-setup.sh
        ├── start-q.sh
        ├── update-q-context.sh
        └── Q-SETUP.md
```

## Implementation Plan

### 1. Create the basic directory structure

```bash
mkdir -p docs/{architecture,planning,research,technical}
mkdir -p src/{functions,layers,frontend}
mkdir -p infrastructure/{cloudformation,terraform}
mkdir -p tests/{unit,integration}
mkdir -p scripts
mkdir -p tools/amazon-q
```

### 2. Move existing files to appropriate locations

```bash
# Move documentation files
mv dynamic-architecture.md docs/architecture/
mv lambda-hackathon-plan.md docs/planning/
mv competitive-research.md docs/research/

# Move Amazon Q setup files
mv q-context.txt tools/amazon-q/
mv q-setup.sh tools/amazon-q/
mv start-q.sh tools/amazon-q/
mv update-q-context.sh tools/amazon-q/
mv Q-SETUP.md tools/amazon-q/
```

### 3. Create a README.md file

Create a comprehensive README.md file at the root of the repository that includes:
- Project overview and purpose
- Setup instructions
- Development workflow
- Links to key documentation

### 4. Update paths in scripts

Update any hardcoded paths in the Amazon Q scripts to reflect the new directory structure.

## Documentation Guidelines

For all future documentation:

1. **Use consistent naming**: All documentation files should use kebab-case (e.g., `user-needs.md`)

2. **Follow a template structure**:
   - Title
   - Overview/Purpose
   - Detailed Content
   - Next Steps or Action Items

3. **Cross-reference related documents**: Include links to related documentation

4. **Version history**: Include a version history section for significant documents

5. **Ownership**: Indicate document ownership and last updated date

## Code Organization Guidelines

1. **Function isolation**: Each Lambda function should be in its own directory with its dependencies

2. **Shared code**: Common utilities should be extracted to Lambda layers

3. **Configuration separation**: Keep configuration separate from code

4. **Local development**: Include instructions for local development and testing

## Benefits of This Structure

1. **Scalability**: The structure will accommodate growth as the project expands
2. **Discoverability**: Makes it easy to find specific documents and code
3. **Separation of concerns**: Clearly separates documentation, code, and infrastructure
4. **Onboarding**: Makes it easier for new team members to understand the project
5. **Maintainability**: Reduces the risk of conflicts and makes updates more manageable
