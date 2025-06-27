// Unit tests for TopicCategorizer service
import * as tape from 'tape';
import { TopicCategorizer } from '../services/TopicCategorizer';

// Mock the ML services
jest.mock('../services/EntityExtractor', () => ({
  EntityExtractor: jest.fn().mockImplementation(() => ({
    extractEntities: jest.fn().mockImplementation(async (input) => {
      const text = input.text.toLowerCase();
      return {
        people: text.includes('john') ? ['John Doe'] : [],
        organizations: text.includes('acme') ? ['Acme Corp'] : [],
        locations: text.includes('francisco') ? ['San Francisco'] : [],
        dates: text.includes('tomorrow') || text.includes('friday') ? ['tomorrow'] : [],
        concepts: text.includes('project') ? ['project milestone'] : []
      };
    })
  }))
}));

jest.mock('../services/SentimentAnalyzer', () => ({
  SentimentAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeSentiment: jest.fn().mockImplementation(async (input) => {
      const text = input.text.toLowerCase();
      return {
        overall: text.includes('great') || text.includes('excellent') ? 'positive' : 'neutral',
        confidence: 0.8,
        emotionalTone: text.includes('help') ? ['concerned'] : ['professional']
      };
    })
  }))
}));

tape('TopicCategorizer - Business topic detection', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const businessText = "We need to discuss quarterly revenue, market strategy, and sales growth with our business team.";
  
  try {
    const result = await categorizer.categorizeTopics(businessText);
    
    t.equal(result.primary, 'business', 'Should categorize as business topic');
    t.ok(result.confidence > 0.5, 'Should have reasonable confidence');
    t.ok(result.categories.business.score > 0.5, 'Business category should have high score');
    t.ok(result.categories.business.indicators.includes('revenue'), 'Should find business keywords');
    t.ok(result.categories.business.reasoning.length > 0, 'Should provide reasoning');
    
    t.end();
  } catch (error) {
    t.fail(`Topic categorization failed: ${error}`);
    t.end();
  }
});

tape('TopicCategorizer - Technical topic detection', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const technicalText = "We have a bug in the API that's affecting the database. Need to fix the code and deploy to the server.";
  
  const result = await categorizer.categorizeTopics(technicalText);
  
  t.equal(result.primary, 'technical', 'Should categorize as technical topic');
  t.ok(result.categories.technical.indicators.includes('bug'), 'Should find "bug" keyword');
  t.ok(result.categories.technical.indicators.includes('api'), 'Should find "api" keyword');
  t.ok(result.categories.technical.indicators.includes('database'), 'Should find "database" keyword');
  
  t.end();
});

tape('TopicCategorizer - Meeting topic detection', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const meetingText = "Please join our Zoom call tomorrow at 2 PM to review the meeting agenda and schedule.";
  
  const result = await categorizer.categorizeTopics(meetingText);
  
  t.equal(result.primary, 'meeting', 'Should categorize as meeting topic');
  t.ok(result.categories.meeting.indicators.includes('meeting'), 'Should find "meeting" keyword');
  t.ok(result.categories.meeting.indicators.includes('schedule'), 'Should find "schedule" keyword');
  
  t.end();
});

tape('TopicCategorizer - Support topic detection', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const supportText = "I need help with this issue. Can you provide assistance and support to troubleshoot the problem?";
  
  const result = await categorizer.categorizeTopics(supportText);
  
  t.equal(result.primary, 'support', 'Should categorize as support topic');
  t.ok(result.categories.support.indicators.includes('help'), 'Should find "help" keyword');
  t.ok(result.categories.support.indicators.includes('support'), 'Should find "support" keyword');
  t.ok(result.categories.support.indicators.includes('issue'), 'Should find "issue" keyword');
  
  t.end();
});

tape('TopicCategorizer - Project topic detection', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const projectText = "The project milestone is approaching. We need to review the deliverables and update the roadmap.";
  
  const result = await categorizer.categorizeTopics(projectText);
  
  t.equal(result.primary, 'project', 'Should categorize as project topic');
  t.ok(result.categories.project.indicators.includes('project'), 'Should find "project" keyword');
  t.ok(result.categories.project.indicators.includes('milestone'), 'Should find "milestone" keyword');
  t.ok(result.categories.project.indicators.includes('deliverable'), 'Should find "deliverable" keyword');
  
  t.end();
});

tape('TopicCategorizer - Secondary topics', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const mixedText = "We need to schedule a meeting to discuss the technical project requirements and business strategy.";
  
  const result = await categorizer.categorizeTopics(mixedText);
  
  t.ok(result.secondary.length > 0, 'Should identify secondary topics');
  t.ok(result.secondary.includes('technical') || result.secondary.includes('business') || result.secondary.includes('project'), 'Should include relevant secondary topics');
  
  t.end();
});

tape('TopicCategorizer - Metadata analysis', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const text = "Please review this document.";
  const metadata = {
    subject: "Business Strategy Meeting",
    sender: "john@acmecorp.com",
    attachments: [{ name: "proposal.pdf" }]
  };
  
  const result = await categorizer.categorizeTopics(text, metadata);
  
  // Subject should influence categorization
  t.ok(result.categories.business.score > 0.3, 'Business subject should boost business score');
  t.ok(result.categories.meeting.score > 0.3, 'Meeting subject should boost meeting score');
  
  t.end();
});

tape('TopicCategorizer - Confidence scoring', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  // Clear business topic
  const clearText = "We need to discuss revenue, profit, sales, and market strategy for our business growth.";
  const clearResult = await categorizer.categorizeTopics(clearText);
  
  t.ok(clearResult.confidence > 0.7, 'Clear topic should have high confidence');
  
  // Ambiguous topic
  const ambiguousText = "Please review this.";
  const ambiguousResult = await categorizer.categorizeTopics(ambiguousText);
  
  t.ok(ambiguousResult.confidence < 0.7, 'Ambiguous topic should have lower confidence');
  
  t.end();
});

tape('TopicCategorizer - Topic suggestions', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const text = "We need to discuss the technical project requirements in our business meeting.";
  
  const suggestions = await categorizer.getTopicSuggestions(text, 3);
  
  t.equal(suggestions.length, 3, 'Should return requested number of suggestions');
  t.ok(suggestions.includes('technical') || suggestions.includes('project') || suggestions.includes('business') || suggestions.includes('meeting'), 'Should include relevant topics');
  
  t.end();
});

tape('TopicCategorizer - Detailed analysis', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const text = "We urgently need to schedule a technical meeting to discuss the software project with Acme Corp.";
  
  const analysis = await categorizer.getDetailedAnalysis(text);
  
  t.ok(analysis.result, 'Should return categorization result');
  t.ok(analysis.insights, 'Should return insights');
  t.ok(analysis.insights.topKeywords.length > 0, 'Should identify top keywords');
  t.ok(analysis.insights.dominantEntities.length >= 0, 'Should identify dominant entities');
  t.ok(analysis.insights.confidenceFactors.length > 0, 'Should provide confidence factors');
  
  t.end();
});

tape('TopicCategorizer - Error handling', async (t) => {
  const categorizer = new TopicCategorizer('invalid-region');
  
  const result = await categorizer.categorizeTopics('test text');
  
  // Should return default result on error
  t.equal(result.primary, 'business', 'Should default to business topic on error');
  t.equal(result.confidence, 0.5, 'Should have default confidence on error');
  t.ok(result.categories.business.reasoning.some(r => r.includes('error')), 'Should explain error in reasoning');
  
  t.end();
});

tape('TopicCategorizer - Empty text handling', async (t) => {
  const categorizer = new TopicCategorizer('us-east-1');
  
  const result = await categorizer.categorizeTopics('');
  
  t.ok(result.primary, 'Should handle empty text');
  t.ok(result.confidence >= 0, 'Should have non-negative confidence');
  
  t.end();
});

// Export for test runner
export default tape;
