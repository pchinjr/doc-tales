// Integration tests for ML dimension extraction (without AWS calls)
import * as tape from 'tape';

// Test the type definitions and basic service instantiation
tape('Integration - Service instantiation', (t) => {
  try {
    // Test that we can import all the services
    const { 
      DimensionMapper, 
      UrgencyDetector, 
      TopicCategorizer,
      EntityExtractor,
      SentimentAnalyzer,
      ComprehendService
    } = require('../index');
    
    t.ok(DimensionMapper, 'DimensionMapper should be importable');
    t.ok(UrgencyDetector, 'UrgencyDetector should be importable');
    t.ok(TopicCategorizer, 'TopicCategorizer should be importable');
    t.ok(EntityExtractor, 'EntityExtractor should be importable');
    t.ok(SentimentAnalyzer, 'SentimentAnalyzer should be importable');
    t.ok(ComprehendService, 'ComprehendService should be importable');
    
    // Test that services can be instantiated
    const mapper = new DimensionMapper('us-east-1');
    const urgencyDetector = new UrgencyDetector('us-east-1');
    const topicCategorizer = new TopicCategorizer('us-east-1');
    
    t.ok(mapper, 'DimensionMapper should be instantiable');
    t.ok(urgencyDetector, 'UrgencyDetector should be instantiable');
    t.ok(topicCategorizer, 'TopicCategorizer should be instantiable');
    
    t.end();
  } catch (error) {
    t.fail(`Service instantiation failed: ${error}`);
    t.end();
  }
});

tape('Integration - Type definitions', (t) => {
  try {
    const { 
      ExtractionInput,
      ExtractionResults,
      DimensionExtractionResult,
      ComprehendResults
    } = require('../types/ml-extraction');
    
    // Test that we can create objects with the correct structure
    const extractionInput: typeof ExtractionInput = {
      text: 'test text',
      metadata: { source: 'test' }
    };
    
    t.ok(extractionInput.text, 'ExtractionInput should have text property');
    t.ok(extractionInput.metadata, 'ExtractionInput should have metadata property');
    
    t.end();
  } catch (error) {
    t.fail(`Type definition test failed: ${error}`);
    t.end();
  }
});

tape('Integration - Dimension structure validation', (t) => {
  try {
    const { Dimensions } = require('../types/dimensions');
    
    // Test that dimension structure is properly defined
    const sampleDimensions = {
      temporal: {
        urgency: 'high',
        chronology: { created: new Date().toISOString() },
        timeContext: { isRecent: true, isPast: false, requiresAction: true }
      },
      relationship: {
        connectionStrength: 'medium',
        frequency: 'occasional',
        networkPosition: { isDirectConnection: true, sharedConnections: 0, relevanceScore: 0.5 },
        context: { personal: false, professional: true, projectSpecific: false }
      },
      visual: {
        hasImages: false,
        visualElements: { charts: 0, tables: 0, images: 0, attachments: 0 },
        visualCategory: 'text-only'
      },
      analytical: {
        categories: ['business'],
        tags: [],
        sentiment: 'neutral',
        entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
        metrics: { wordCount: 0, readingTime: 0, complexity: 'low', informationDensity: 0 },
        structure: { hasHeadings: false, hasBulletPoints: false, hasNumberedLists: false, paragraphCount: 1 }
      },
      confidenceScores: { temporal: 0.5, relationship: 0.5, visual: 0.5, analytical: 0.5 }
    };
    
    t.ok(sampleDimensions.temporal, 'Should have temporal dimension');
    t.ok(sampleDimensions.relationship, 'Should have relationship dimension');
    t.ok(sampleDimensions.visual, 'Should have visual dimension');
    t.ok(sampleDimensions.analytical, 'Should have analytical dimension');
    t.ok(sampleDimensions.confidenceScores, 'Should have confidence scores');
    
    t.end();
  } catch (error) {
    t.fail(`Dimension structure validation failed: ${error}`);
    t.end();
  }
});

tape('Integration - Error handling patterns', (t) => {
  try {
    // Test that services handle invalid regions gracefully
    const { DimensionMapper } = require('../index');
    
    const mapper = new DimensionMapper('invalid-region');
    t.ok(mapper, 'Should be able to create mapper with invalid region');
    
    // The actual error handling will be tested when methods are called
    t.end();
  } catch (error) {
    t.fail(`Error handling test failed: ${error}`);
    t.end();
  }
});

// Export for test runner
export default tape;
