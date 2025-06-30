// Unit tests for DimensionMapper service
import * as tape from "tape";
import { DimensionMapper } from "../services/DimensionMapper";

// Mock AWS SDK clients
const mockComprehendClient = {
  send: async (command: any) => {
    // Mock responses based on command type
    if (command.constructor.name === "DetectEntitiesCommand") {
      return {
        Entities: [
          { Text: "John Doe", Type: "PERSON", Score: 0.95 },
          { Text: "Acme Corp", Type: "ORGANIZATION", Score: 0.88 },
          { Text: "San Francisco", Type: "LOCATION", Score: 0.92 },
          { Text: "tomorrow", Type: "DATE", Score: 0.85 }
        ]
      };
    }
    
    if (command.constructor.name === "DetectSentimentCommand") {
      return {
        Sentiment: "POSITIVE",
        SentimentScore: {
          Positive: 0.8,
          Negative: 0.1,
          Neutral: 0.05,
          Mixed: 0.05
        }
      };
    }
    
    if (command.constructor.name === "DetectKeyPhrasesCommand") {
      return {
        KeyPhrases: [
          { Text: "urgent meeting", Score: 0.9 },
          { Text: "project deadline", Score: 0.85 }
        ]
      };
    }
    
    return {};
  }
};

// Mock the AWS SDK modules
jest.mock("@aws-sdk/client-comprehend", () => ({
  ComprehendClient: jest.fn(() => mockComprehendClient),
  DetectEntitiesCommand: jest.fn(),
  DetectSentimentCommand: jest.fn(),
  DetectKeyPhrasesCommand: jest.fn()
}));

tape("DimensionMapper - Basic dimension extraction", async (t) => {
  const mapper = new DimensionMapper("us-east-1");
  
  const testText = "Hi John, we need to schedule an urgent meeting with Acme Corp tomorrow to discuss the project deadline. Please confirm your availability.";
  
  try {
    const result = await mapper.extractDimensions(testText);
    
    // Test basic structure
    t.ok(result.dimensions, "Should return dimensions object");
    t.ok(result.extractionMetadata, "Should return extraction metadata");
    t.ok(result.rawResults, "Should return raw results");
    
    // Test dimension types
    t.ok(result.dimensions.temporal, "Should have temporal dimension");
    t.ok(result.dimensions.relationship, "Should have relationship dimension");
    t.ok(result.dimensions.visual, "Should have visual dimension");
    t.ok(result.dimensions.analytical, "Should have analytical dimension");
    t.ok(result.dimensions.confidenceScores, "Should have confidence scores");
    
    // Test temporal dimension
    t.equal(result.dimensions.temporal.urgency, "high", "Should detect high urgency from \"urgent\" keyword");
    t.ok(result.dimensions.temporal.chronology.created, "Should have creation timestamp");
    t.equal(result.dimensions.temporal.timeContext.requiresAction, true, "Should require action for urgent items");
    
    // Test analytical dimension
    t.ok(result.dimensions.analytical.entities.people.includes("John Doe"), "Should extract person entity");
    t.ok(result.dimensions.analytical.entities.organizations.includes("Acme Corp"), "Should extract organization entity");
    t.equal(result.dimensions.analytical.sentiment, "positive", "Should map positive sentiment");
    
    // Test confidence scores
    t.ok(result.dimensions.confidenceScores.temporal >= 0 && result.dimensions.confidenceScores.temporal <= 1, "Temporal confidence should be between 0 and 1");
    t.ok(result.dimensions.confidenceScores.analytical >= 0 && result.dimensions.confidenceScores.analytical <= 1, "Analytical confidence should be between 0 and 1");
    
    // Test metadata
    t.ok(result.extractionMetadata.processingTime > 0, "Should have processing time");
    t.equal(result.extractionMetadata.extractionMethod, "ml", "Should use ML extraction method");
    t.ok(result.extractionMetadata.confidenceScore >= 0 && result.extractionMetadata.confidenceScore <= 1, "Overall confidence should be between 0 and 1");
    
    t.end();
  } catch (error) {
    t.fail(`Dimension extraction failed: ${error}`);
    t.end();
  }
});

tape("DimensionMapper - Error handling", async (t) => {
  // Create mapper that will fail
  const mapper = new DimensionMapper("invalid-region");
  
  const result = await mapper.extractDimensions("test text");
  
  // Should return default dimensions on error
  t.ok(result.dimensions, "Should return default dimensions on error");
  t.ok(result.extractionMetadata.errors.length > 0, "Should have error messages");
  t.equal(result.extractionMetadata.confidenceScore, 0, "Should have zero confidence on error");
  
  t.end();
});

tape("DimensionMapper - Empty text handling", async (t) => {
  const mapper = new DimensionMapper("us-east-1");
  
  const result = await mapper.extractDimensions("");
  
  t.ok(result.dimensions, "Should handle empty text");
  t.equal(result.dimensions.analytical.metrics.wordCount, 0, "Should have zero word count for empty text");
  
  t.end();
});

tape("DimensionMapper - Urgency detection", async (t) => {
  const mapper = new DimensionMapper("us-east-1");
  
  // Test high urgency
  const urgentResult = await mapper.extractDimensions("URGENT: This is critical and needs immediate attention ASAP!");
  t.equal(urgentResult.dimensions.temporal.urgency, "high", "Should detect high urgency");
  
  // Test low urgency
  const casualResult = await mapper.extractDimensions("When you have time, please review this document. No rush.");
  t.equal(casualResult.dimensions.temporal.urgency, "low", "Should detect low urgency");
  
  t.end();
});

tape("DimensionMapper - Topic categorization", async (t) => {
  const mapper = new DimensionMapper("us-east-1");
  
  // Test business topic
  const businessResult = await mapper.extractDimensions("We need to discuss the quarterly revenue and market strategy with our sales team.");
  t.ok(businessResult.dimensions.analytical.categories.includes("business"), "Should categorize as business topic");
  
  // Test meeting topic
  const meetingResult = await mapper.extractDimensions("Please join our Zoom call tomorrow at 2 PM to review the agenda.");
  t.ok(meetingResult.dimensions.analytical.categories.includes("meeting"), "Should categorize as meeting topic");
  
  t.end();
});

tape("DimensionMapper - Confidence scoring", async (t) => {
  const mapper = new DimensionMapper("us-east-1");
  
  // Test with rich content (should have high confidence)
  const richResult = await mapper.extractDimensions(`
    Dear John Smith,
    
    I hope this email finds you well. We urgently need to schedule a meeting with Acme Corporation 
    tomorrow to discuss the Q4 project deadline. The client is expecting our proposal by Friday.
    
    Please confirm your availability for 2 PM PST.
    
    Best regards,
    Jane Doe
  `);
  
  // Rich content should have higher confidence scores
  t.ok(richResult.dimensions.confidenceScores.temporal > 0.5, "Rich content should have good temporal confidence");
  t.ok(richResult.dimensions.confidenceScores.analytical > 0.5, "Rich content should have good analytical confidence");
  t.ok(richResult.extractionMetadata.confidenceScore > 0.5, "Overall confidence should be good for rich content");
  
  t.end();
});

// Export for test runner
export default tape;
