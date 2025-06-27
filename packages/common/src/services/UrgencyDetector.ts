// Urgency Detection Service
// Specialized service for detecting urgency levels in communications

import { SentimentAnalyzer } from './SentimentAnalyzer';
import { EntityExtractor } from './EntityExtractor';
import { ExtractionInput } from '../types/ml-extraction';

export interface UrgencyResult {
  level: 'high' | 'medium' | 'low';
  score: number;
  indicators: {
    keywords: string[];
    timeReferences: string[];
    sentimentFactors: string[];
    entityFactors: string[];
  };
  confidence: number;
  reasoning: string[];
}

/**
 * Service for detecting urgency levels in communications using ML and rule-based approaches
 */
export class UrgencyDetector {
  private sentimentAnalyzer: SentimentAnalyzer;
  private entityExtractor: EntityExtractor;
  
  private urgencyKeywords = {
    high: ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'crisis', 'deadline today'],
    medium: ['soon', 'priority', 'important', 'deadline', 'time-sensitive', 'rush', 'quick'],
    low: ['when possible', 'eventually', 'sometime', 'no rush', 'low priority']
  };

  private timeKeywords = {
    high: ['now', 'today', 'this morning', 'this afternoon', 'end of day', 'eod'],
    medium: ['tomorrow', 'this week', 'by friday', 'next few days', 'soon'],
    low: ['next week', 'next month', 'when convenient', 'no deadline']
  };

  constructor(region?: string) {
    this.sentimentAnalyzer = new SentimentAnalyzer(region);
    this.entityExtractor = new EntityExtractor(region);
  }

  /**
   * Detect urgency level from communication text
   */
  async detectUrgency(text: string, metadata?: any): Promise<UrgencyResult> {
    try {
      const input: ExtractionInput = { text, metadata };
      
      // Get ML analysis
      const [sentimentAnalysis, entityMappings] = await Promise.all([
        this.sentimentAnalyzer.analyzeSentiment(input),
        this.entityExtractor.extractEntities(input)
      ]);

      // Analyze different urgency factors
      const keywordAnalysis = this.analyzeKeywords(text);
      const timeAnalysis = this.analyzeTimeReferences(text);
      const sentimentFactors = this.analyzeSentimentForUrgency(sentimentAnalysis);
      const entityFactors = this.analyzeEntitiesForUrgency(entityMappings, text);
      const contextFactors = this.analyzeContextForUrgency(text, metadata);

      // Calculate overall urgency score
      const score = this.calculateUrgencyScore({
        keywordScore: keywordAnalysis.score,
        timeScore: timeAnalysis.score,
        sentimentScore: sentimentFactors.score,
        entityScore: entityFactors.score,
        contextScore: contextFactors.score
      });

      // Determine urgency level
      const level = this.determineUrgencyLevel(score);
      
      // Calculate confidence
      const confidence = this.calculateConfidence({
        keywordAnalysis,
        timeAnalysis,
        sentimentFactors,
        entityFactors,
        contextFactors
      });

      // Generate reasoning
      const reasoning = this.generateReasoning({
        level,
        keywordAnalysis,
        timeAnalysis,
        sentimentFactors,
        entityFactors,
        contextFactors
      });

      return {
        level,
        score,
        indicators: {
          keywords: keywordAnalysis.foundKeywords,
          timeReferences: timeAnalysis.foundReferences,
          sentimentFactors: sentimentFactors.factors,
          entityFactors: entityFactors.factors
        },
        confidence,
        reasoning
      };

    } catch (error) {
      console.error('Error detecting urgency:', error);
      return this.getDefaultUrgencyResult();
    }
  }

  /**
   * Analyze urgency keywords in text
   */
  private analyzeKeywords(text: string): { score: number; foundKeywords: string[]; level: 'high' | 'medium' | 'low' } {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];
    let highCount = 0, mediumCount = 0, lowCount = 0;

    // Check high urgency keywords
    this.urgencyKeywords.high.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        highCount++;
      }
    });

    // Check medium urgency keywords
    this.urgencyKeywords.medium.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        mediumCount++;
      }
    });

    // Check low urgency keywords
    this.urgencyKeywords.low.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        lowCount++;
      }
    });

    // Calculate score
    let score = 0;
    let level: 'high' | 'medium' | 'low' = 'low';

    if (highCount > 0) {
      score = 0.8 + (highCount * 0.1);
      level = 'high';
    } else if (mediumCount > 0) {
      score = 0.5 + (mediumCount * 0.1);
      level = 'medium';
    } else if (lowCount > 0) {
      score = 0.2;
      level = 'low';
    } else {
      score = 0.3; // Default medium-low
      level = 'low';
    }

    return { score: Math.min(1, score), foundKeywords, level };
  }

  /**
   * Analyze time references for urgency
   */
  private analyzeTimeReferences(text: string): { score: number; foundReferences: string[]; level: 'high' | 'medium' | 'low' } {
    const lowerText = text.toLowerCase();
    const foundReferences: string[] = [];
    let highCount = 0, mediumCount = 0, lowCount = 0;

    // Check high urgency time references
    this.timeKeywords.high.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundReferences.push(keyword);
        highCount++;
      }
    });

    // Check medium urgency time references
    this.timeKeywords.medium.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundReferences.push(keyword);
        mediumCount++;
      }
    });

    // Check low urgency time references
    this.timeKeywords.low.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundReferences.push(keyword);
        lowCount++;
      }
    });

    let score = 0.3; // Default
    let level: 'high' | 'medium' | 'low' = 'low';

    if (highCount > 0) {
      score = 0.9;
      level = 'high';
    } else if (mediumCount > 0) {
      score = 0.6;
      level = 'medium';
    } else if (lowCount > 0) {
      score = 0.1;
      level = 'low';
    }

    return { score, foundReferences, level };
  }

  /**
   * Analyze sentiment for urgency indicators
   */
  private analyzeSentimentForUrgency(sentimentAnalysis: any): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0.3; // Default

    if (sentimentAnalysis.emotionalTone.includes('urgent')) {
      factors.push('urgent tone detected');
      score += 0.4;
    }

    if (sentimentAnalysis.emotionalTone.includes('concerned')) {
      factors.push('concerned tone');
      score += 0.2;
    }

    if (sentimentAnalysis.emotionalTone.includes('frustrated')) {
      factors.push('frustrated tone');
      score += 0.3;
    }

    if (sentimentAnalysis.overall === 'negative' && sentimentAnalysis.confidence > 0.7) {
      factors.push('strong negative sentiment');
      score += 0.2;
    }

    return { score: Math.min(1, score), factors };
  }

  /**
   * Analyze entities for urgency indicators
   */
  private analyzeEntitiesForUrgency(entityMappings: any, text: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0.3; // Default
    const lowerText = text.toLowerCase();

    // Check for deadline-related dates
    if (entityMappings.dates.length > 0) {
      factors.push(`${entityMappings.dates.length} date(s) mentioned`);
      score += 0.2;
    }

    // Check for authority figures
    const authorityKeywords = ['manager', 'director', 'ceo', 'president', 'boss', 'supervisor'];
    const hasAuthority = authorityKeywords.some(keyword => lowerText.includes(keyword));
    if (hasAuthority) {
      factors.push('authority figure mentioned');
      score += 0.3;
    }

    // Check for escalation keywords
    const escalationKeywords = ['escalate', 'escalation', 'complaint', 'issue', 'problem'];
    const hasEscalation = escalationKeywords.some(keyword => lowerText.includes(keyword));
    if (hasEscalation) {
      factors.push('escalation indicators');
      score += 0.4;
    }

    return { score: Math.min(1, score), factors };
  }

  /**
   * Analyze context for urgency
   */
  private analyzeContextForUrgency(text: string, metadata?: any): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0.3; // Default

    // Check subject line for urgency (if available)
    if (metadata?.subject) {
      const subjectLower = metadata.subject.toLowerCase();
      if (subjectLower.includes('urgent') || subjectLower.includes('asap')) {
        factors.push('urgent subject line');
        score += 0.4;
      }
    }

    // Check for multiple exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 2) {
      factors.push('multiple exclamation marks');
      score += 0.2;
    }

    // Check for ALL CAPS sections
    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 2) {
      factors.push('excessive capitalization');
      score += 0.2;
    }

    return { score: Math.min(1, score), factors };
  }

  /**
   * Calculate overall urgency score
   */
  private calculateUrgencyScore(scores: {
    keywordScore: number;
    timeScore: number;
    sentimentScore: number;
    entityScore: number;
    contextScore: number;
  }): number {
    // Weighted average with keywords and time being most important
    return (
      scores.keywordScore * 0.3 +
      scores.timeScore * 0.3 +
      scores.sentimentScore * 0.2 +
      scores.entityScore * 0.1 +
      scores.contextScore * 0.1
    );
  }

  /**
   * Determine urgency level from score
   */
  private determineUrgencyLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence in urgency detection
   */
  private calculateConfidence(analysis: any): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence if multiple factors agree
    const levels = [
      analysis.keywordAnalysis.level,
      analysis.timeAnalysis.level,
      analysis.sentimentFactors.factors.length > 0 ? 'high' : 'low'
    ];

    const highCount = levels.filter(l => l === 'high').length;
    const mediumCount = levels.filter(l => l === 'medium').length;

    if (highCount >= 2) confidence = 0.9;
    else if (highCount >= 1 && mediumCount >= 1) confidence = 0.8;
    else if (mediumCount >= 2) confidence = 0.7;

    return confidence;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(analysis: any): string[] {
    const reasoning: string[] = [];

    if (analysis.keywordAnalysis.foundKeywords.length > 0) {
      reasoning.push(`Found urgency keywords: ${analysis.keywordAnalysis.foundKeywords.join(', ')}`);
    }

    if (analysis.timeAnalysis.foundReferences.length > 0) {
      reasoning.push(`Time references indicate ${analysis.timeAnalysis.level} urgency: ${analysis.timeAnalysis.foundReferences.join(', ')}`);
    }

    if (analysis.sentimentFactors.factors.length > 0) {
      reasoning.push(`Sentiment analysis: ${analysis.sentimentFactors.factors.join(', ')}`);
    }

    if (analysis.entityFactors.factors.length > 0) {
      reasoning.push(`Context factors: ${analysis.entityFactors.factors.join(', ')}`);
    }

    if (reasoning.length === 0) {
      reasoning.push('No strong urgency indicators found, defaulting to low urgency');
    }

    return reasoning;
  }

  /**
   * Get default urgency result for error cases
   */
  private getDefaultUrgencyResult(): UrgencyResult {
    return {
      level: 'low',
      score: 0.3,
      indicators: {
        keywords: [],
        timeReferences: [],
        sentimentFactors: [],
        entityFactors: []
      },
      confidence: 0.5,
      reasoning: ['Unable to analyze urgency, defaulting to low']
    };
  }
}
