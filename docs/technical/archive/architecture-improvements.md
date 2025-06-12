# Architecture Improvements

This document outlines proposed improvements to the Doc-Tales serverless architecture to better align with serverless best practices and improve maintainability, scalability, and performance.

## Current Architecture

The current architecture uses a monolithic approach for the API Lambda function, with a single function handling all API routes:

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

## Proposed Architecture

We propose refactoring the API Lambda into multiple single-purpose functions, each handling a specific route:

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

The layers will include:
- **DB Access Layer**: Common database operations
- **Utility Layer**: Helper functions, logging, error handling
- **Validation Layer**: Input validation and schema verification

## Implementation Plan

### Phase 1: Refactor API Lambda

1. Create new Lambda functions for each API route
2. Update API Gateway to route to specific functions
3. Implement proper error handling in each function
4. Add comprehensive logging

### Phase 2: Implement Lambda Layers

1. Extract common code into Lambda Layers
2. Update Lambda functions to use layers
3. Implement versioning for layers

### Phase 3: Optimize Performance

1. Configure provisioned concurrency for critical functions
2. Implement caching where appropriate
3. Optimize Lambda memory settings

## Benefits

This improved architecture will provide several benefits:

1. **Improved performance**: Smaller functions have faster cold starts
2. **Better scalability**: Each function scales independently
3. **Easier maintenance**: Changes to one endpoint don't affect others
4. **Simplified testing**: Test each function in isolation
5. **Cost optimization**: Pay only for the compute time of the specific functions being used
6. **Improved developer experience**: Smaller, focused code is easier to understand and modify

## Considerations

While implementing these changes, we need to consider:

1. **Deployment complexity**: More functions mean more resources to manage
2. **Cross-function communication**: Ensure proper error handling between functions
3. **Monitoring**: Set up proper monitoring for all functions
4. **Cost**: While per-function costs may decrease, the total number of invocations may increase

## Conclusion

Refactoring the current monolithic API Lambda into multiple single-purpose functions aligns better with serverless principles and will make the Doc-Tales application more maintainable, scalable, and performant in the long run.
