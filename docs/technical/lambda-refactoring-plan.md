# Lambda Refactoring Plan

This document outlines the plan for refactoring the monolithic API Lambda function in the Doc-Tales application into multiple single-purpose functions, following serverless best practices.

## Current Architecture

The current architecture uses a monolithic approach for the API Lambda function:

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ API Lambda    │────▶│ DynamoDB/S3     │
│             │     │ (all routes)  │     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘
```

This approach has several drawbacks:
- Large function size increases cold start times
- All routes scale together, even if only one is heavily used
- Changes to one route affect the entire function
- Testing is more complex as the entire function must be tested

## Target Architecture

We will refactor the API Lambda into multiple single-purpose functions:

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ Get Comms     │────▶│ DynamoDB/S3     │
│ /comms      │     │ Lambda        │     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘

┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ Get Comm By   │────▶│ DynamoDB/S3     │
│ /comms/{id} │     │ ID Lambda     │     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘

┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ Get User      │────▶│ DynamoDB        │
│ /user       │     │ Profile Lambda│     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘

┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ Update User   │────▶│ DynamoDB        │
│ /user (PUT) │     │ Profile Lambda│     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘

┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ API Gateway │────▶│ Get Archetypes│────▶│ Static Data     │
│ /archetypes │     │ Lambda        │     │                 │
└─────────────┘     └───────────────┘     └─────────────────┘
```

## Lambda Layers for Shared Code

To avoid code duplication, we'll implement Lambda Layers for shared functionality:

```
┌─────────────────────────────────────────────────────────┐
│                   Lambda Functions                      │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────┐
│                     Lambda Layers                       │
├─────────────────┬─────────────────┬─────────────────────┤
│ DB Access Layer │ Utility Layer   │ Validation Layer    │
└─────────────────┴─────────────────┴─────────────────────┘
```

## Implementation Plan

### Phase 1: Create Lambda Layers

1. **DB Access Layer**
   - Create a layer with common database operations
   - Include functions for querying, getting, and updating items
   - Implement proper error handling and logging

2. **Utility Layer**
   - Create a layer with common utility functions
   - Include functions for response formatting, CORS headers, etc.
   - Implement logging utilities

3. **Validation Layer**
   - Create a layer with input validation functions
   - Include schema validation for API requests
   - Implement error handling for validation failures

### Phase 2: Create Single-Purpose Lambda Functions

1. **GetCommunicationsFunction**
   - Handle GET requests to `/communications`
   - Support filtering by project, type, urgency, etc.
   - Return paginated results

2. **GetCommunicationByIdFunction**
   - Handle GET requests to `/communications/{id}`
   - Retrieve communication by ID
   - Return full communication details

3. **GetUserProfileFunction**
   - Handle GET requests to `/user-profile`
   - Retrieve user profile by ID
   - Return default profile if not found

4. **UpdateUserProfileFunction**
   - Handle PUT requests to `/user-profile`
   - Update user profile in DynamoDB
   - Validate input before updating

5. **GetArchetypesFunction**
   - Handle GET requests to `/archetypes`
   - Return list of available archetypes
   - Include descriptions and icons

### Phase 3: Update API Gateway Configuration

1. Update API Gateway to route directly to specific Lambda functions
2. Configure appropriate IAM permissions for each function
3. Set up request/response mapping templates if needed
4. Configure CORS for all endpoints

### Phase 4: Testing and Deployment

1. Create unit tests for each Lambda function
2. Create integration tests for API endpoints
3. Deploy Lambda Layers
4. Deploy Lambda Functions
5. Update API Gateway configuration
6. Run end-to-end tests

## Code Structure

```
src/
├── lambda/
│   ├── api/
│   │   ├── get-communications/
│   │   │   └── index.js
│   │   ├── get-communication-by-id/
│   │   │   └── index.js
│   │   ├── get-user-profile/
│   │   │   └── index.js
│   │   ├── update-user-profile/
│   │   │   └── index.js
│   │   └── get-archetypes/
│   │       └── index.js
│   └── layers/
│       ├── db-access/
│       │   └── nodejs/
│       │       └── db-access.js
│       ├── utility/
│       │   └── nodejs/
│       │       └── utility.js
│       └── validation/
│           └── nodejs/
│               └── validation.js
└── tests/
    ├── unit/
    │   ├── get-communications.test.js
    │   ├── get-communication-by-id.test.js
    │   ├── get-user-profile.test.js
    │   ├── update-user-profile.test.js
    │   └── get-archetypes.test.js
    └── integration/
        └── api.test.js
```

## SAM Template Updates

The SAM template will need to be updated to include:

1. Lambda Layers
2. Single-purpose Lambda functions
3. Updated API Gateway configuration

Example:

```yaml
Resources:
  # Lambda Layers
  DbAccessLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: db-access-layer
      Description: Common database access functions
      ContentUri: src/lambda/layers/db-access/
      CompatibleRuntimes:
        - nodejs22.x

  UtilityLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: utility-layer
      Description: Common utility functions
      ContentUri: src/lambda/layers/utility/
      CompatibleRuntimes:
        - nodejs22.x

  ValidationLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: validation-layer
      Description: Input validation functions
      ContentUri: src/lambda/layers/validation/
      CompatibleRuntimes:
        - nodejs22.x

  # Lambda Functions
  GetCommunicationsFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/lambda/api/get-communications/
      Handler: index.handler
      Layers:
        - !Ref DbAccessLayer
        - !Ref UtilityLayer
        - !Ref ValidationLayer
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /communications
            Method: get

  # ... other functions ...

  # API Gateway
  DocTalesApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Environment
      Cors:
        AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowOrigin: "'*'"
```

## Benefits

This refactoring will provide several benefits:

1. **Improved performance**: Smaller functions have faster cold starts
2. **Better scalability**: Each function scales independently
3. **Easier maintenance**: Changes to one endpoint don't affect others
4. **Simplified testing**: Test each function in isolation
5. **Cost optimization**: Pay only for the compute time of the specific functions being used
6. **Improved developer experience**: Smaller, focused code is easier to understand and modify

## Timeline

- **Week 1**: Create Lambda Layers
- **Week 2**: Create single-purpose Lambda functions
- **Week 3**: Update API Gateway configuration and testing
- **Week 4**: Deployment and monitoring

## Conclusion

By refactoring the monolithic API Lambda into multiple single-purpose functions with shared code in Lambda Layers, we will align the Doc-Tales application with serverless best practices, improving performance, maintainability, and scalability.
