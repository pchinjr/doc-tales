# Project Cleanup Recommendations

This document identifies redundant files and unused code in the Doc-Tales project that can be safely removed or consolidated.

## Redundant Files

### 1. Duplicate Service Modules

There are two copies of the service modules:
- `/src/lambda/api/services/dynamodb-service.js` and `/src/lambda/api/services/s3-service.js`
- `/src/lambda/services/dynamodb-service.js` and `/src/lambda/services/s3-service.js`

**Recommendation**: Keep the copies in `/src/lambda/api/services/` since they're being used by the API function, and remove the duplicates in `/src/lambda/services/`.

### 2. Archived Documentation

The `/docs/technical/archive/` directory contains outdated documentation that has been superseded by newer documents:

**Recommendation**: Either delete these files or clearly mark them as archived/deprecated.

### 3. Multiple ESLint Configuration Files

There are two ESLint configuration files:
- `.eslintrc.js`
- `.eslintrc.json`

**Recommendation**: Consolidate into a single ESLint configuration file.

## Unused Code

### 1. ENTITY_TYPES Constant

The `ENTITY_TYPES` constant was removed from the API Lambda function but might still be referenced in other Lambda functions.

**Recommendation**: Check other Lambda functions and remove any references to this constant.

### 2. Unused Documentation

Some documentation files are no longer relevant to the current state of the project:
- `/docs/technical/archive/lambda-refactoring-plan.md`
- `/docs/technical/archive/development-progress.md`

**Recommendation**: Remove or update these files.

## Consolidation Opportunities

### 1. Lambda Service Modules

Consider implementing Lambda Layers for shared code like the service modules, which would eliminate the need for duplicating these files in each Lambda function.

### 2. Documentation Structure

The documentation structure could be simplified:
- Move all active technical documentation to `/docs/technical/`
- Remove the `/docs/technical/archive/` directory
- Consolidate similar documents (e.g., merge related AWS implementation guides)

## Implementation Plan

1. Remove duplicate service modules
2. Clean up documentation structure
3. Consolidate ESLint configuration
4. Check for and remove any other unused code
5. Update references in documentation to reflect the current project structure
