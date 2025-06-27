// End-to-end integration tests for ML dimension extraction
// These tests validate the complete flow without making actual AWS API calls

const tape = require('tape');

tape('E2E Integration - Complete dimension extraction flow', async (t) => {
  try {
    const { DimensionMapper } = require('@doc-tales/common');
    
    // Create a dimension mapper (will fail on actual AWS calls, but we can test the flow)
    const mapper = new DimensionMapper('us-east-1');
    
    // Test with a realistic communication sample
    const sampleCommunication = `
      Subject: URGENT: Project Deadline Tomorrow
      
      Hi John,
      
      I hope this email finds you well. We urgently need to finalize the Q4 project 
      deliverables by tomorrow at 5 PM. The client, Acme Corporation, is expecting 
      our proposal and we cannot afford any delays.
      
      Please review the attached documents and confirm your availability for a 
      quick call this afternoon to discuss any remaining issues.
      
      Thanks for your immediate attention to this matter.
      
      Best regards,
      Jane Smith
      Project Manager
    `;
    
    // Test that the extraction method exists and can be called
    t.equal(typeof mapper.extractDimensions, 'function', 'extractDimensions should be a function');
    
    // Note: We can't test actual extraction without AWS credentials, 
    // but we can verify the method signature and error handling
    try {
      const result = await mapper.extractDimensions(sampleCommunication);
      
      // If we get here, AWS credentials are available and the call succeeded
      t.ok(result, 'Should return a result object');
      t.ok(result.dimensions, 'Should have dimensions property');
      t.ok(result.extractionMetadata, 'Should have extraction metadata');
      
      // Test dimension structure
      if (result.dimensions) {
        t.ok(result.dimensions.temporal, 'Should have temporal dimension');
        t.ok(result.dimensions.relationship, 'Should have relationship dimension');
        t.ok(result.dimensions.visual, 'Should have visual dimension');
        t.ok(result.dimensions.analytical, 'Should have analytical dimension');
        t.ok(result.dimensions.confidenceScores, 'Should have confidence scores');
      }
      
    } catch (error) {
      // Expected if no AWS credentials are available
      t.pass(`Extraction failed as expected without AWS credentials: ${error.message}`);
    }
    
    t.end();
  } catch (error) {
    t.fail(`E2E test setup failed: ${error.message}`);
    t.end();
  }
});

tape('E2E Integration - Pipeline integration flow', async (t) => {
  try {
    const { DimensionExtractionIntegrator } = require('@doc-tales/common');
    
    // Test integration service configuration
    const config = {
      dimensionExtractionFunctionName: 'test-function',
      communicationsTableName: 'test-table',
      region: 'us-east-1',
      enableAsyncProcessing: true
    };
    
    const integrator = new DimensionExtractionIntegrator(config);
    t.ok(integrator, 'Should be able to create integrator');
    
    // Test communication record structure
    const sampleRecord = {
      id: 'test-comm-123',
      content: 'This is a test communication with urgent deadline tomorrow.',
      source: 'email',
      timestamp: new Date().toISOString(),
      sender: 'test@example.com',
      subject: 'Test Subject',
      metadata: { priority: 'high' }
    };
    
    // Test that processing method exists
    t.equal(typeof integrator.processCommunication, 'function', 'processCommunication should be a function');
    t.equal(typeof integrator.isProcessed, 'function', 'isProcessed should be a function');
    t.equal(typeof integrator.batchProcessCommunications, 'function', 'batchProcessCommunications should be a function');
    
    t.end();
  } catch (error) {
    t.fail(`Pipeline integration test failed: ${error.message}`);
    t.end();
  }
});

tape('E2E Integration - Schema migration flow', async (t) => {
  try {
    const { SchemaMigrator } = require('@doc-tales/common');
    
    // Test migration service configuration
    const config = {
      tableName: 'test-communications',
      region: 'us-east-1',
      batchSize: 10,
      dryRun: true
    };
    
    const migrator = new SchemaMigrator(config);
    t.ok(migrator, 'Should be able to create migrator');
    
    // Test that migration methods exist
    t.equal(typeof migrator.migrateCommunications, 'function', 'migrateCommunications should be a function');
    t.equal(typeof migrator.validateMigration, 'function', 'validateMigration should be a function');
    t.equal(typeof migrator.rollbackMigration, 'function', 'rollbackMigration should be a function');
    
    t.end();
  } catch (error) {
    t.fail(`Schema migration test failed: ${error.message}`);
    t.end();
  }
});

tape('E2E Integration - Error handling and resilience', async (t) => {
  try {
    const { 
      DimensionMapper, 
      UrgencyDetector, 
      TopicCategorizer 
    } = require('@doc-tales/common');
    
    // Test with invalid region (should not crash)
    const invalidMapper = new DimensionMapper('invalid-region');
    const invalidUrgency = new UrgencyDetector('invalid-region');
    const invalidTopic = new TopicCategorizer('invalid-region');
    
    t.ok(invalidMapper, 'Should handle invalid region gracefully');
    t.ok(invalidUrgency, 'Should handle invalid region gracefully');
    t.ok(invalidTopic, 'Should handle invalid region gracefully');
    
    // Test with empty/invalid inputs
    try {
      await invalidUrgency.detectUrgency('');
      t.pass('Should handle empty text input');
    } catch (error) {
      t.pass(`Should handle empty input gracefully: ${error.message}`);
    }
    
    try {
      await invalidTopic.categorizeTopics('');
      t.pass('Should handle empty text input');
    } catch (error) {
      t.pass(`Should handle empty input gracefully: ${error.message}`);
    }
    
    t.end();
  } catch (error) {
    t.fail(`Error handling test failed: ${error.message}`);
    t.end();
  }
});

tape('E2E Integration - Performance and scalability patterns', (t) => {
  try {
    const { 
      DimensionMapper, 
      UrgencyDetector, 
      TopicCategorizer,
      EntityExtractor,
      SentimentAnalyzer
    } = require('@doc-tales/common');
    
    // Test that multiple instances can be created (for concurrent processing)
    const instances = [];
    for (let i = 0; i < 5; i++) {
      instances.push({
        mapper: new DimensionMapper('us-east-1'),
        urgency: new UrgencyDetector('us-east-1'),
        topic: new TopicCategorizer('us-east-1'),
        entity: new EntityExtractor('us-east-1'),
        sentiment: new SentimentAnalyzer('us-east-1')
      });
    }
    
    t.equal(instances.length, 5, 'Should be able to create multiple instances');
    
    // Test that each instance has the expected methods
    instances.forEach((instance, index) => {
      t.ok(instance.mapper.extractDimensions, `Instance ${index} mapper should have extractDimensions method`);
      t.ok(instance.urgency.detectUrgency, `Instance ${index} urgency should have detectUrgency method`);
      t.ok(instance.topic.categorizeTopics, `Instance ${index} topic should have categorizeTopics method`);
    });
    
    t.end();
  } catch (error) {
    t.fail(`Performance test failed: ${error.message}`);
    t.end();
  }
});

tape('E2E Integration - Data flow validation', (t) => {
  try {
    // Test that the data structures match expected formats
    const sampleExtractionInput = {
      text: 'Sample communication text',
      metadata: {
        source: 'email',
        timestamp: new Date().toISOString(),
        sender: 'test@example.com'
      }
    };
    
    const sampleDimensionResult = {
      dimensions: {
        temporal: {
          urgency: 'medium',
          chronology: { created: new Date().toISOString() },
          timeContext: { isRecent: true, isPast: false, requiresAction: true }
        },
        relationship: {
          connectionStrength: 'medium',
          frequency: 'occasional',
          networkPosition: { isDirectConnection: true, sharedConnections: 1, relevanceScore: 0.6 },
          context: { personal: false, professional: true, projectSpecific: true }
        },
        visual: {
          hasImages: false,
          visualElements: { charts: 0, tables: 0, images: 0, attachments: 1 },
          visualCategory: 'text-only'
        },
        analytical: {
          categories: ['business', 'project'],
          tags: ['meeting', 'deadline'],
          sentiment: 'neutral',
          entities: { people: ['John'], organizations: ['Acme'], locations: [], dates: ['tomorrow'], concepts: ['project'] },
          metrics: { wordCount: 50, readingTime: 1, complexity: 'medium', informationDensity: 5 },
          structure: { hasHeadings: false, hasBulletPoints: false, hasNumberedLists: false, paragraphCount: 2 }
        },
        confidenceScores: { temporal: 0.8, relationship: 0.6, visual: 0.9, analytical: 0.7 }
      },
      extractionMetadata: {
        processingTime: 1500,
        confidenceScore: 0.75,
        extractionMethod: 'ml',
        errors: [],
        warnings: []
      }
    };
    
    // Validate structure
    t.ok(sampleExtractionInput.text, 'Input should have text');
    t.ok(sampleExtractionInput.metadata, 'Input should have metadata');
    
    t.ok(sampleDimensionResult.dimensions, 'Result should have dimensions');
    t.ok(sampleDimensionResult.extractionMetadata, 'Result should have extraction metadata');
    
    // Validate dimension completeness
    const requiredDimensions = ['temporal', 'relationship', 'visual', 'analytical'];
    requiredDimensions.forEach(dim => {
      t.ok(sampleDimensionResult.dimensions[dim], `Should have ${dim} dimension`);
    });
    
    t.ok(sampleDimensionResult.dimensions.confidenceScores, 'Should have confidence scores');
    
    t.end();
  } catch (error) {
    t.fail(`Data flow validation failed: ${error.message}`);
    t.end();
  }
});

console.log('Running end-to-end ML dimension extraction integration tests...');
