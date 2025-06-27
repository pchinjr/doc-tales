// Dimension Mapper Utility
// Maps ML extraction results to Doc-Tales dimension structure

import { Dimensions } from '../types/dimensions';
import { ExtractionResults, DimensionExtractionResult } from '../types/ml-extraction';
import { ComprehendService } from './ComprehendService';
import { EntityExtractor } from './EntityExtractor';
import { SentimentAnalyzer } from './SentimentAnalyzer';

/**
 * Service that maps ML extraction results to Doc-Tales dimensions
 */
export class DimensionMapper {
  private comprehendService: ComprehendService;
  private entityExtractor: EntityExtractor;
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor(region?: string) {
    this.comprehendService = new ComprehendService(region);
    this.entityExtractor = new EntityExtractor(region);
    this.sentimentAnalyzer = new SentimentAnalyzer(region);
  }

  /**
   * Extract complete dimensions from text using ML services
   */
  async extractDimensions(text: string, metadata?: any): Promise<DimensionExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Get ML extraction results
      const extractionResults = await this.getExtractionResults(text);
      
      // Map to Doc-Tales dimensions
      const dimensions = this.mapToDimensions(extractionResults, text, metadata);
      
      // Get raw Comprehend results for metadata
      const rawResults = await this.comprehendService.extractComprehendResults({ text });
      
      const processingTime = Date.now() - startTime;
      
      return {
        dimensions,
        extractionMetadata: {
          processingTime,
          confidenceScore: this.calculateOverallConfidence(dimensions),
          extractionMethod: 'ml',
          errors: [],
          warnings: []
        },
        rawResults
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Error in dimension extraction:', error);
      
      return {
        dimensions: this.getDefaultDimensions(),
        extractionMetadata: {
          processingTime,
          confidenceScore: 0,
          extractionMethod: 'ml',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: ['Falling back to default dimensions']
        },
        rawResults: {
          entities: [],
          sentiment: {
            sentiment: 'NEUTRAL',
            sentimentScore: { Positive: 0, Negative: 0, Neutral: 1, Mixed: 0 }
          },
          keyPhrases: []
        }
      };
    }
  }

  /**
   * Get extraction results from all ML services
   */
  private async getExtractionResults(text: string): Promise<ExtractionResults> {
    const input = { text };
    
    const [entityMappings, sentimentAnalysis] = await Promise.all([
      this.entityExtractor.extractEntities(input),
      this.sentimentAnalyzer.analyzeSentiment(input)
    ]);

    return {
      urgencyIndicators: this.extractUrgencyIndicators(text),
      topicCategories: this.extractTopicCategories(text, entityMappings),
      entityMappings,
      sentimentAnalysis,
      temporalMarkers: this.extractTemporalMarkers(text, entityMappings.dates)
    };
  }

  /**
   * Map extraction results to Doc-Tales dimensions
   */
  private mapToDimensions(results: ExtractionResults, text: string, metadata?: any): Dimensions {
    return {
      temporal: this.mapTemporalDimension(results, text, metadata),
      relationship: this.mapRelationshipDimension(results, metadata),
      visual: this.mapVisualDimension(text, metadata),
      analytical: this.mapAnalyticalDimension(results, text),
      confidenceScores: {
        temporal: this.calculateTemporalConfidence(results),
        relationship: this.calculateRelationshipConfidence(results),
        visual: this.calculateVisualConfidence(metadata),
        analytical: this.calculateAnalyticalConfidence(results)
      }
    };
  }

  /**
   * Map to temporal dimension
   */
  private mapTemporalDimension(results: ExtractionResults, text: string, metadata?: any): any {
    const now = new Date().toISOString();
    
    return {
      deadline: results.temporalMarkers.deadlines[0] || undefined,
      urgency: results.urgencyIndicators.level,
      chronology: {
        created: metadata?.timestamp || now,
        lastUpdated: now,
        followUpDate: this.extractFollowUpDate(results.temporalMarkers.timeReferences)
      },
      timeContext: {
        isRecent: true,
        isPast: false,
        requiresAction: results.urgencyIndicators.level !== 'low',
        daysUntilDeadline: this.calculateDaysUntilDeadline(results.temporalMarkers.deadlines[0])
      }
    };
  }

  /**
   * Map to relationship dimension
   */
  private mapRelationshipDimension(results: ExtractionResults, metadata?: any): any {
    const peopleCount = results.entityMappings.people.length;
    const orgCount = results.entityMappings.organizations.length;
    
    return {
      connectionStrength: this.determineConnectionStrength(metadata?.sender, results.sentimentAnalysis),
      frequency: 'occasional', // Would need historical data to determine
      lastInteraction: metadata?.timestamp,
      networkPosition: {
        isDirectConnection: true,
        sharedConnections: peopleCount,
        relevanceScore: Math.min(0.8, (peopleCount + orgCount) * 0.2)
      },
      context: {
        personal: results.sentimentAnalysis.emotionalTone.includes('grateful') || 
                 results.sentimentAnalysis.emotionalTone.includes('friendly'),
        professional: results.sentimentAnalysis.emotionalTone.includes('professional') ||
                     results.entityMappings.organizations.length > 0,
        projectSpecific: results.topicCategories.primary === 'project' ||
                        results.entityMappings.concepts.some(c => c.toLowerCase().includes('project'))
      }
    };
  }

  /**
   * Map to visual dimension
   */
  private mapVisualDimension(text: string, metadata?: any): any {
    const hasAttachments = metadata?.attachments?.length > 0;
    const hasImages = text.toLowerCase().includes('image') || text.toLowerCase().includes('photo');
    
    return {
      hasImages,
      documentType: metadata?.documentType || 'text',
      visualElements: {
        charts: 0,
        tables: 0,
        images: hasImages ? 1 : 0,
        attachments: metadata?.attachments?.length || 0
      },
      spatialContext: {
        location: undefined,
        coordinates: undefined,
        relatedLocations: []
      },
      visualCategory: hasAttachments ? 'mixed' : 'text-only'
    };
  }

  /**
   * Map to analytical dimension
   */
  private mapAnalyticalDimension(results: ExtractionResults, text: string): any {
    return {
      categories: [results.topicCategories.primary, ...results.topicCategories.secondary],
      tags: [...results.entityMappings.concepts, ...results.sentimentAnalysis.emotionalTone],
      sentiment: results.sentimentAnalysis.overall,
      entities: results.entityMappings,
      metrics: {
        wordCount: text.split(/\s+/).length,
        readingTime: Math.ceil(text.split(/\s+/).length / 200), // 200 words per minute
        complexity: this.calculateComplexity(text),
        informationDensity: results.entityMappings.people.length + 
                           results.entityMappings.organizations.length + 
                           results.entityMappings.concepts.length
      },
      structure: {
        hasHeadings: /^#|\n#/.test(text),
        hasBulletPoints: /[•\-\*]/.test(text),
        hasNumberedLists: /^\d+\./.test(text),
        paragraphCount: text.split(/\n\s*\n/).length
      }
    };
  }

  /**
   * Extract urgency indicators from text
   */
  private extractUrgencyIndicators(text: string): ExtractionResults['urgencyIndicators'] {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline', 'rush'];
    const lowerText = text.toLowerCase();
    
    const foundKeywords = urgentKeywords.filter(keyword => lowerText.includes(keyword));
    const score = foundKeywords.length / urgentKeywords.length;
    
    let level: 'high' | 'medium' | 'low' = 'low';
    if (score > 0.3) level = 'high';
    else if (score > 0.1) level = 'medium';
    
    return {
      keywords: foundKeywords,
      score,
      level
    };
  }

  /**
   * Extract topic categories
   */
  private extractTopicCategories(text: string, entities: any): ExtractionResults['topicCategories'] {
    const categories = ['business', 'technical', 'personal', 'meeting', 'project', 'support'];
    const lowerText = text.toLowerCase();
    
    let primary = 'business';
    const secondary: string[] = [];
    
    if (lowerText.includes('meeting') || lowerText.includes('schedule')) {
      primary = 'meeting';
    } else if (lowerText.includes('project') || lowerText.includes('task')) {
      primary = 'project';
    } else if (lowerText.includes('support') || lowerText.includes('help')) {
      primary = 'support';
    } else if (entities.organizations.length > 0) {
      primary = 'business';
    }
    
    return {
      primary,
      secondary,
      confidence: 0.7
    };
  }

  /**
   * Extract temporal markers
   */
  private extractTemporalMarkers(text: string, dates: string[]): ExtractionResults['temporalMarkers'] {
    const deadlineKeywords = ['deadline', 'due', 'by', 'before'];
    const timeKeywords = ['today', 'tomorrow', 'next week', 'monday', 'friday'];
    const urgencyKeywords = ['urgent', 'asap', 'immediately'];
    
    const lowerText = text.toLowerCase();
    
    return {
      deadlines: dates.filter(date => 
        deadlineKeywords.some(keyword => lowerText.includes(keyword))
      ),
      timeReferences: timeKeywords.filter(keyword => lowerText.includes(keyword)),
      urgencyKeywords: urgencyKeywords.filter(keyword => lowerText.includes(keyword))
    };
  }

  /**
   * Helper methods for calculations
   */
  private calculateOverallConfidence(dimensions: Dimensions): number {
    const scores = Object.values(dimensions.confidenceScores);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateTemporalConfidence(results: ExtractionResults): number {
    return results.urgencyIndicators.score + (results.temporalMarkers.deadlines.length > 0 ? 0.3 : 0);
  }

  private calculateRelationshipConfidence(results: ExtractionResults): number {
    return Math.min(1, results.entityMappings.people.length * 0.2 + 0.5);
  }

  private calculateVisualConfidence(metadata?: any): number {
    return metadata?.attachments?.length > 0 ? 0.8 : 0.3;
  }

  private calculateAnalyticalConfidence(results: ExtractionResults): number {
    return Math.min(1, results.sentimentAnalysis.confidence + 0.2);
  }

  private determineConnectionStrength(sender?: string, sentiment?: any): 'strong' | 'medium' | 'weak' {
    if (sentiment?.emotionalTone.includes('grateful') || sentiment?.overall === 'positive') {
      return 'strong';
    }
    return 'medium';
  }

  private extractFollowUpDate(timeReferences: string[]): string | undefined {
    // Simple implementation - would need more sophisticated date parsing
    return timeReferences.length > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;
  }

  private calculateDaysUntilDeadline(deadline?: string): number | undefined {
    if (!deadline) return undefined;
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      return Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    } catch {
      return undefined;
    }
  }

  private calculateComplexity(text: string): 'high' | 'medium' | 'low' {
    const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
    if (avgWordLength > 6) return 'high';
    if (avgWordLength > 4) return 'medium';
    return 'low';
  }

  private getDefaultDimensions(): Dimensions {
    const now = new Date().toISOString();
    return {
      temporal: {
        urgency: 'low',
        chronology: { created: now },
        timeContext: { isRecent: true, isPast: false, requiresAction: false }
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
      confidenceScores: { temporal: 0.3, relationship: 0.3, visual: 0.3, analytical: 0.3 }
    };
  }
}
