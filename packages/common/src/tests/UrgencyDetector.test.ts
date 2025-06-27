// Unit tests for UrgencyDetector service
import * as tape from 'tape';
import { UrgencyDetector } from '../services/UrgencyDetector';

// Mock the ML services
jest.mock('../services/SentimentAnalyzer', () => ({
  SentimentAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeSentiment: jest.fn().mockResolvedValue({
      overall: 'neutral',
      confidence: 0.8,
      emotionalTone: ['professional']
    })
  }))
}));

jest.mock('../services/EntityExtractor', () => ({
  EntityExtractor: jest.fn().mockImplementation(() => ({
    extractEntities: jest.fn().mockResolvedValue({
      people: ['John Doe'],
      organizations: ['Acme Corp'],
      locations: ['San Francisco'],
      dates: ['tomorrow'],
      concepts: ['meeting', 'project']
    })
  }))
}));

tape('UrgencyDetector - High urgency detection', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  const urgentText = "URGENT: This is critical and needs immediate attention ASAP! Emergency situation!";
  
  try {
    const result = await detector.detectUrgency(urgentText);
    
    t.equal(result.level, 'high', 'Should detect high urgency level');
    t.ok(result.score > 0.7, 'High urgency should have score > 0.7');
    t.ok(result.confidence > 0.5, 'Should have reasonable confidence');
    t.ok(result.indicators.keywords.length > 0, 'Should find urgency keywords');
    t.ok(result.reasoning.length > 0, 'Should provide reasoning');
    
    // Check specific keywords
    t.ok(result.indicators.keywords.includes('urgent'), 'Should find "urgent" keyword');
    t.ok(result.indicators.keywords.includes('asap'), 'Should find "asap" keyword');
    t.ok(result.indicators.keywords.includes('critical'), 'Should find "critical" keyword');
    
    t.end();
  } catch (error) {
    t.fail(`Urgency detection failed: ${error}`);
    t.end();
  }
});

tape('UrgencyDetector - Medium urgency detection', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  const mediumText = "This is important and should be done soon. Please prioritize this task.";
  
  const result = await detector.detectUrgency(mediumText);
  
  t.equal(result.level, 'medium', 'Should detect medium urgency level');
  t.ok(result.score >= 0.4 && result.score < 0.7, 'Medium urgency should have score between 0.4 and 0.7');
  t.ok(result.indicators.keywords.includes('important'), 'Should find "important" keyword');
  t.ok(result.indicators.keywords.includes('soon'), 'Should find "soon" keyword');
  
  t.end();
});

tape('UrgencyDetector - Low urgency detection', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  const lowText = "When you have time, please review this document. No rush, whenever convenient.";
  
  const result = await detector.detectUrgency(lowText);
  
  t.equal(result.level, 'low', 'Should detect low urgency level');
  t.ok(result.score < 0.4, 'Low urgency should have score < 0.4');
  t.ok(result.indicators.keywords.includes('no rush'), 'Should find "no rush" keyword');
  
  t.end();
});

tape('UrgencyDetector - Time reference analysis', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  // High urgency time references
  const todayText = "Please complete this today by end of day.";
  const todayResult = await detector.detectUrgency(todayText);
  
  t.ok(todayResult.indicators.timeReferences.includes('today'), 'Should find "today" time reference');
  t.ok(todayResult.score > 0.6, 'Today deadline should increase urgency score');
  
  // Low urgency time references
  const nextWeekText = "Please review this next week when you have time.";
  const nextWeekResult = await detector.detectUrgency(nextWeekText);
  
  t.ok(nextWeekResult.indicators.timeReferences.includes('next week'), 'Should find "next week" time reference');
  t.ok(nextWeekResult.score < 0.5, 'Next week deadline should keep urgency low');
  
  t.end();
});

tape('UrgencyDetector - Context analysis', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  // Test with metadata (urgent subject)
  const textWithUrgentSubject = "Please review the attached document.";
  const metadata = { subject: "URGENT: Action Required" };
  
  const result = await detector.detectUrgency(textWithUrgentSubject, metadata);
  
  t.ok(result.score > 0.5, 'Urgent subject should increase urgency score');
  t.ok(result.reasoning.some(r => r.includes('urgent subject')), 'Should mention urgent subject in reasoning');
  
  t.end();
});

tape('UrgencyDetector - Multiple exclamation marks', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  const exclamationText = "Please help!!! This is really important!!! Need response now!!!";
  
  const result = await detector.detectUrgency(exclamationText);
  
  t.ok(result.score > 0.4, 'Multiple exclamation marks should increase urgency');
  t.ok(result.reasoning.some(r => r.includes('exclamation')), 'Should mention exclamation marks in reasoning');
  
  t.end();
});

tape('UrgencyDetector - ALL CAPS detection', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  const capsText = "PLEASE REVIEW THIS DOCUMENT IMMEDIATELY AND RESPOND TODAY";
  
  const result = await detector.detectUrgency(capsText);
  
  t.ok(result.score > 0.4, 'ALL CAPS should increase urgency');
  t.ok(result.reasoning.some(r => r.includes('capitalization')), 'Should mention capitalization in reasoning');
  
  t.end();
});

tape('UrgencyDetector - Error handling', async (t) => {
  const detector = new UrgencyDetector('invalid-region');
  
  const result = await detector.detectUrgency('test text');
  
  // Should return default result on error
  t.equal(result.level, 'low', 'Should default to low urgency on error');
  t.equal(result.confidence, 0.5, 'Should have default confidence on error');
  t.ok(result.reasoning.some(r => r.includes('Unable to analyze')), 'Should explain error in reasoning');
  
  t.end();
});

tape('UrgencyDetector - Confidence calculation', async (t) => {
  const detector = new UrgencyDetector('us-east-1');
  
  // High confidence scenario (multiple indicators agree)
  const highConfidenceText = "URGENT: Critical deadline today! Please respond ASAP!";
  const highResult = await detector.detectUrgency(highConfidenceText);
  
  t.ok(highResult.confidence > 0.8, 'Multiple agreeing indicators should give high confidence');
  
  // Low confidence scenario (mixed signals)
  const lowConfidenceText = "This is urgent but no rush, whenever you have time next month.";
  const lowResult = await detector.detectUrgency(lowConfidenceText);
  
  t.ok(lowResult.confidence < 0.7, 'Mixed signals should give lower confidence');
  
  t.end();
});

// Export for test runner
export default tape;
