# ML Dimension Extraction Implementation Plan

## Overview
Implement Amazon Comprehend-based dimension extraction for communications to enhance archetype-based personalization in Doc-Tales.

## Implementation Steps (Small Commits)

### Phase 1: Foundation Setup
1. **Step 1.1**: Add AWS Comprehend SDK dependencies
   - Update package.json in backend and common packages
   - Commit: "Add AWS Comprehend SDK dependencies"

2. **Step 1.2**: Create dimension extraction types
   - Define TypeScript interfaces for extracted dimensions
   - Commit: "Define dimension extraction types"

3. **Step 1.3**: Add IAM permissions for Comprehend
   - Update SAM template with Comprehend permissions
   - Commit: "Add Comprehend IAM permissions to SAM template"

### Phase 2: Core ML Service
4. **Step 2.1**: Create Comprehend service wrapper
   - Basic service class with error handling
   - Commit: "Create Comprehend service wrapper"

5. **Step 2.2**: Implement basic entity extraction
   - Extract entities from text using Comprehend
   - Commit: "Implement basic entity extraction"

6. **Step 2.3**: Add sentiment analysis
   - Extract sentiment dimensions
   - Commit: "Add sentiment analysis to dimension extraction"

### Phase 3: Dimension Mapping
7. **Step 3.1**: Create dimension mapper utility
   - Map Comprehend entities to Doc-Tales dimensions
   - Commit: "Create dimension mapper utility"

8. **Step 3.2**: Implement urgency detection
   - Extract urgency level from entities and sentiment
   - Commit: "Implement urgency level detection"

9. **Step 3.3**: Add topic categorization
   - Map entities to topic categories
   - Commit: "Add topic categorization logic"

### Phase 4: Integration
10. **Step 4.1**: Create Lambda function for dimension extraction
    - New Lambda function to process communications
    - Commit: "Create dimension extraction Lambda function"

11. **Step 4.2**: Integrate with existing communication processing
    - Add dimension extraction to communication ingestion flow
    - Commit: "Integrate dimension extraction with communication processing"

12. **Step 4.3**: Update DynamoDB schema for dimensions
    - Add dimension fields to communication items
    - Commit: "Update DynamoDB schema for dimension storage"

### Phase 5: Testing & Validation
13. **Step 5.1**: Add unit tests for dimension extraction
    - Test dimension mapper and service wrapper
    - Commit: "Add unit tests for dimension extraction"

14. **Step 5.2**: Add integration tests
    - Test end-to-end dimension extraction flow
    - Commit: "Add integration tests for ML dimension extraction"

15. **Step 5.3**: Create demo data with dimensions
    - Update demo seed data to include extracted dimensions
    - Commit: "Update demo data with dimension examples"

## Verification Steps for Each Commit

### Testing Strategy
- **Unit Tests**: Test individual functions with mocked AWS services
- **Integration Tests**: Test against real AWS services in dev environment
- **Manual Verification**: Check extracted dimensions make sense for sample communications

### Success Criteria
- Each dimension extraction produces consistent, meaningful results
- Performance remains acceptable (< 2s per communication)
- Error handling gracefully manages API failures
- Extracted dimensions enhance archetype-based personalization

## Rollback Plan
- Each commit is small and reversible
- Feature flag can disable ML processing if needed
- Fallback to existing communication processing without dimensions

## Time Estimates
- Phase 1: 30 minutes
- Phase 2: 45 minutes  
- Phase 3: 60 minutes
- Phase 4: 90 minutes
- Phase 5: 45 minutes
- **Total: ~4.5 hours**

## Next Steps After Implementation
1. Monitor dimension extraction accuracy
2. Tune dimension mapping based on user feedback
3. Consider adding custom Comprehend models for domain-specific entities
4. Explore Amazon Bedrock for more sophisticated dimension extraction
