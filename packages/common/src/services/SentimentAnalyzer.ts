// Sentiment Analysis Service
// Processes Comprehend sentiment data and maps to Doc-Tales sentiment structure

import { SentimentScore } from '@aws-sdk/client-comprehend';
import { ComprehendService } from './ComprehendService';
import { ExtractionInput, ExtractionResults } from '../types/ml-extraction';

/**
 * Service for analyzing sentiment and emotional tone of communications
 */
export class SentimentAnalyzer {
  private comprehendService: ComprehendService;

  constructor(region?: string) {
    this.comprehendService = new ComprehendService(region);
  }

  /**
   * Analyze sentiment and extract emotional dimensions
   */
  async analyzeSentiment(input: ExtractionInput): Promise<ExtractionResults['sentimentAnalysis']> {
    try {
      const comprehendResults = await this.comprehendService.extractComprehendResults(input);
      return this.processSentimentResults(
        comprehendResults.sentiment.sentiment,
        comprehendResults.sentiment.sentimentScore,
        input.text
      );
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        overall: 'neutral',
        confidence: 0,
        emotionalTone: []
      };
    }
  }

  /**
   * Process raw sentiment results into Doc-Tales format
   */
  private processSentimentResults(
    sentiment: string,
    sentimentScore: SentimentScore,
    text: string
  ): ExtractionResults['sentimentAnalysis'] {
    // Map AWS sentiment to Doc-Tales format
    const overall = this.mapSentimentToDocTales(sentiment);
    
    // Calculate confidence based on the dominant sentiment score
    const confidence = this.calculateSentimentConfidence(sentimentScore);
    
    // Extract emotional tone indicators
    const emotionalTone = this.extractEmotionalTone(text, sentiment, sentimentScore);

    return {
      overall,
      confidence,
      emotionalTone
    };
  }

  /**
   * Map AWS Comprehend sentiment to Doc-Tales format
   */
  private mapSentimentToDocTales(sentiment: string): 'positive' | 'neutral' | 'negative' {
    switch (sentiment.toUpperCase()) {
      case 'POSITIVE':
        return 'positive';
      case 'NEGATIVE':
        return 'negative';
      case 'NEUTRAL':
      case 'MIXED':
      default:
        return 'neutral';
    }
  }

  /**
   * Calculate confidence score from sentiment scores
   */
  private calculateSentimentConfidence(sentimentScore: SentimentScore): number {
    const scores = [
      sentimentScore.Positive || 0,
      sentimentScore.Negative || 0,
      sentimentScore.Neutral || 0,
      sentimentScore.Mixed || 0
    ];
    
    // Return the highest score as confidence
    return Math.max(...scores);
  }

  /**
   * Extract emotional tone indicators from text and sentiment
   */
  private extractEmotionalTone(
    text: string,
    sentiment: string,
    sentimentScore: SentimentScore
  ): string[] {
    const tones: string[] = [];
    const lowerText = text.toLowerCase();

    // Positive tone indicators
    if ((sentimentScore.Positive || 0) > 0.6) {
      if (lowerText.includes('thank') || lowerText.includes('appreciate')) {
        tones.push('grateful');
      }
      if (lowerText.includes('excited') || lowerText.includes('great') || lowerText.includes('excellent')) {
        tones.push('enthusiastic');
      }
      if (lowerText.includes('please') || lowerText.includes('kindly')) {
        tones.push('polite');
      }
    }

    // Negative tone indicators
    if ((sentimentScore.Negative || 0) > 0.6) {
      if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('immediately')) {
        tones.push('urgent');
      }
      if (lowerText.includes('concern') || lowerText.includes('worry') || lowerText.includes('problem')) {
        tones.push('concerned');
      }
      if (lowerText.includes('disappoint') || lowerText.includes('frustrat')) {
        tones.push('frustrated');
      }
    }

    // Neutral/Professional tone indicators
    if ((sentimentScore.Neutral || 0) > 0.7) {
      if (lowerText.includes('meeting') || lowerText.includes('schedule') || lowerText.includes('agenda')) {
        tones.push('professional');
      }
      if (lowerText.includes('update') || lowerText.includes('status') || lowerText.includes('report')) {
        tones.push('informational');
      }
    }

    // Mixed tone indicators
    if ((sentimentScore.Mixed || 0) > 0.5) {
      tones.push('complex');
    }

    return tones.length > 0 ? tones : ['neutral'];
  }

  /**
   * Get detailed sentiment breakdown
   */
  async getDetailedSentiment(text: string): Promise<{
    overall: 'positive' | 'neutral' | 'negative';
    scores: {
      positive: number;
      negative: number;
      neutral: number;
      mixed: number;
    };
    confidence: number;
    emotionalTone: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const input: ExtractionInput = { text };
      const analysis = await this.analyzeSentiment(input);
      const comprehendResults = await this.comprehendService.extractComprehendResults(input);
      const sentimentScore = comprehendResults.sentiment.sentimentScore;

      return {
        overall: analysis.overall,
        scores: {
          positive: sentimentScore.Positive || 0,
          negative: sentimentScore.Negative || 0,
          neutral: sentimentScore.Neutral || 0,
          mixed: sentimentScore.Mixed || 0
        },
        confidence: analysis.confidence,
        emotionalTone: analysis.emotionalTone,
        riskLevel: this.calculateRiskLevel(sentimentScore, text)
      };
    } catch (error) {
      console.error('Error getting detailed sentiment:', error);
      return {
        overall: 'neutral',
        scores: { positive: 0, negative: 0, neutral: 1, mixed: 0 },
        confidence: 0,
        emotionalTone: ['neutral'],
        riskLevel: 'low'
      };
    }
  }

  /**
   * Calculate communication risk level based on sentiment and content
   */
  private calculateRiskLevel(sentimentScore: SentimentScore, text: string): 'low' | 'medium' | 'high' {
    const negativeScore = sentimentScore.Negative || 0;
    const lowerText = text.toLowerCase();
    
    // High risk indicators
    if (negativeScore > 0.8 || 
        lowerText.includes('complaint') || 
        lowerText.includes('legal') || 
        lowerText.includes('lawsuit')) {
      return 'high';
    }
    
    // Medium risk indicators
    if (negativeScore > 0.6 || 
        lowerText.includes('urgent') || 
        lowerText.includes('escalate') || 
        lowerText.includes('manager')) {
      return 'medium';
    }
    
    return 'low';
  }
}
