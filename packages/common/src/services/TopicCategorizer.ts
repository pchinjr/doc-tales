// Topic Categorization Service
// Categorizes communications into topics using ML and rule-based approaches

import { EntityExtractor } from "./EntityExtractor";
import { SentimentAnalyzer } from "./SentimentAnalyzer";
import { ExtractionInput } from "../types/ml-extraction";

export interface TopicResult {
  primary: string;
  secondary: string[];
  confidence: number;
  categories: {
    [category: string]: {
      score: number;
      indicators: string[];
      reasoning: string[];
    };
  };
}

/**
 * Service for categorizing communications into topics
 */
export class TopicCategorizer {
  private entityExtractor: EntityExtractor;
  private sentimentAnalyzer: SentimentAnalyzer;

  private topicKeywords = {
    business: {
      keywords: ["revenue", "profit", "sales", "market", "business", "strategy", "growth", "investment"],
      entities: ["organization", "commercial"],
      weight: 1.0
    },
    technical: {
      keywords: ["code", "software", "system", "bug", "feature", "development", "api", "database", "server"],
      entities: ["technical", "system"],
      weight: 1.0
    },
    meeting: {
      keywords: ["meeting", "call", "conference", "agenda", "schedule", "calendar", "zoom", "teams"],
      entities: ["event", "date"],
      weight: 1.2
    },
    project: {
      keywords: ["project", "task", "milestone", "deadline", "deliverable", "sprint", "roadmap"],
      entities: ["event", "date"],
      weight: 1.1
    },
    support: {
      keywords: ["help", "support", "issue", "problem", "question", "assistance", "troubleshoot"],
      entities: ["person"],
      weight: 1.0
    },
    financial: {
      keywords: ["budget", "cost", "expense", "invoice", "payment", "financial", "accounting", "money"],
      entities: ["quantity", "commercial"],
      weight: 1.0
    },
    legal: {
      keywords: ["contract", "agreement", "legal", "compliance", "regulation", "policy", "terms"],
      entities: ["organization", "person"],
      weight: 1.0
    },
    marketing: {
      keywords: ["campaign", "marketing", "promotion", "brand", "advertising", "social media", "content"],
      entities: ["organization", "commercial"],
      weight: 1.0
    },
    personal: {
      keywords: ["personal", "family", "vacation", "sick", "leave", "birthday", "congratulations"],
      entities: ["person"],
      weight: 0.8
    },
    administrative: {
      keywords: ["admin", "policy", "procedure", "form", "documentation", "compliance", "hr"],
      entities: ["organization"],
      weight: 0.9
    }
  };

  constructor(region?: string) {
    this.entityExtractor = new EntityExtractor(region);
    this.sentimentAnalyzer = new SentimentAnalyzer(region);
  }

  /**
   * Categorize communication into topics
   */
  async categorizeTopics(text: string, metadata?: any): Promise<TopicResult> {
    try {
      const input: ExtractionInput = { text, metadata };
      
      // Get ML analysis
      const [entityMappings, sentimentAnalysis] = await Promise.all([
        this.entityExtractor.extractEntities(input),
        this.sentimentAnalyzer.analyzeSentiment(input)
      ]);

      // Analyze each topic category
      const categories: TopicResult["categories"] = {};
      
      for (const [topicName, topicConfig] of Object.entries(this.topicKeywords)) {
        categories[topicName] = this.analyzeTopicCategory(
          text,
          topicConfig,
          entityMappings,
          sentimentAnalysis,
          metadata
        );
      }

      // Determine primary and secondary topics
      const sortedTopics = Object.entries(categories)
        .sort(([, a], [, b]) => b.score - a.score);

      const primary = sortedTopics[0][0];
      const secondary = sortedTopics
        .slice(1, 4)
        .filter(([, category]) => category.score > 0.3)
        .map(([name]) => name);

      // Calculate overall confidence
      const confidence = this.calculateTopicConfidence(categories, primary);

      return {
        primary,
        secondary,
        confidence,
        categories
      };

    } catch (error) {
      console.error("Error categorizing topics:", error);
      return this.getDefaultTopicResult();
    }
  }

  /**
   * Analyze a specific topic category
   */
  private analyzeTopicCategory(
    text: string,
    topicConfig: any,
    entityMappings: any,
    sentimentAnalysis: any,
    metadata?: any
  ): { score: number; indicators: string[]; reasoning: string[] } {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];
    const reasoning: string[] = [];
    let score = 0;

    // Analyze keywords
    const keywordMatches = topicConfig.keywords.filter((keyword: string) => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches.length > 0) {
      const keywordScore = Math.min(0.6, keywordMatches.length * 0.15);
      score += keywordScore;
      indicators.push(...keywordMatches);
      reasoning.push(`Found ${keywordMatches.length} relevant keywords: ${keywordMatches.join(", ")}`);
    }

    // Analyze entities
    const entityScore = this.analyzeEntitiesForTopic(entityMappings, topicConfig.entities);
    if (entityScore > 0) {
      score += entityScore * 0.3;
      reasoning.push(`Entity analysis contributed ${(entityScore * 0.3).toFixed(2)} to score`);
    }

    // Analyze sentiment relevance
    const sentimentScore = this.analyzeSentimentForTopic(sentimentAnalysis, topicConfig);
    if (sentimentScore > 0) {
      score += sentimentScore * 0.2;
      reasoning.push(`Sentiment analysis contributed ${(sentimentScore * 0.2).toFixed(2)} to score`);
    }

    // Analyze metadata
    const metadataScore = this.analyzeMetadataForTopic(metadata, topicConfig);
    if (metadataScore > 0) {
      score += metadataScore * 0.2;
      reasoning.push(`Metadata analysis contributed ${(metadataScore * 0.2).toFixed(2)} to score`);
    }

    // Apply topic weight
    score *= topicConfig.weight;

    // Normalize score
    score = Math.min(1, score);

    return { score, indicators, reasoning };
  }

  /**
   * Analyze entities for topic relevance
   */
  private analyzeEntitiesForTopic(entityMappings: any, relevantEntityTypes: string[]): number {
    let score = 0;

    // Check organizations for business/legal/marketing topics
    if (relevantEntityTypes.includes("organization") && entityMappings.organizations.length > 0) {
      score += Math.min(0.4, entityMappings.organizations.length * 0.1);
    }

    // Check people for personal/support topics
    if (relevantEntityTypes.includes("person") && entityMappings.people.length > 0) {
      score += Math.min(0.3, entityMappings.people.length * 0.1);
    }

    // Check dates for meeting/project topics
    if (relevantEntityTypes.includes("date") && entityMappings.dates.length > 0) {
      score += Math.min(0.3, entityMappings.dates.length * 0.15);
    }

    // Check concepts for technical topics
    if (relevantEntityTypes.includes("technical") && entityMappings.concepts.length > 0) {
      const technicalConcepts = entityMappings.concepts.filter((concept: string) =>
        ["system", "software", "code", "api", "database"].some(tech => 
          concept.toLowerCase().includes(tech)
        )
      );
      score += Math.min(0.4, technicalConcepts.length * 0.2);
    }

    return score;
  }

  /**
   * Analyze sentiment for topic relevance
   */
  private analyzeSentimentForTopic(sentimentAnalysis: any, topicConfig: any): number {
    let score = 0;

    // Support topics often have concerned or frustrated tones
    if (topicConfig.keywords.includes("support") || topicConfig.keywords.includes("help")) {
      if (sentimentAnalysis.emotionalTone.includes("concerned") || 
          sentimentAnalysis.emotionalTone.includes("frustrated")) {
        score += 0.3;
      }
    }

    // Personal topics often have positive or grateful tones
    if (topicConfig.keywords.includes("personal")) {
      if (sentimentAnalysis.emotionalTone.includes("grateful") || 
          sentimentAnalysis.overall === "positive") {
        score += 0.2;
      }
    }

    // Meeting topics are often neutral/professional
    if (topicConfig.keywords.includes("meeting")) {
      if (sentimentAnalysis.emotionalTone.includes("professional") || 
          sentimentAnalysis.overall === "neutral") {
        score += 0.1;
      }
    }

    return score;
  }

  /**
   * Analyze metadata for topic relevance
   */
  private analyzeMetadataForTopic(metadata: any, topicConfig: any): number {
    let score = 0;

    if (!metadata) return score;

    // Check subject line
    if (metadata.subject) {
      const subjectLower = metadata.subject.toLowerCase();
      const subjectMatches = topicConfig.keywords.filter((keyword: string) =>
        subjectLower.includes(keyword.toLowerCase())
      );
      score += Math.min(0.4, subjectMatches.length * 0.2);
    }

    // Check sender domain for business topics
    if (metadata.sender && topicConfig.keywords.includes("business")) {
      const domain = metadata.sender.split("@")[1];
      if (domain && !["gmail.com", "yahoo.com", "hotmail.com"].includes(domain)) {
        score += 0.2; // Business email domain
      }
    }

    // Check attachments for technical/project topics
    if (metadata.attachments && metadata.attachments.length > 0) {
      if (topicConfig.keywords.includes("technical") || topicConfig.keywords.includes("project")) {
        score += 0.1;
      }
    }

    return score;
  }

  /**
   * Calculate confidence in topic categorization
   */
  private calculateTopicConfidence(categories: TopicResult["categories"], primary: string): number {
    const primaryScore = categories[primary].score;
    const scores = Object.values(categories).map(cat => cat.score);
    const secondHighest = scores.sort((a, b) => b - a)[1];
    
    // Higher confidence if primary score is significantly higher than second
    const scoreDifference = primaryScore - secondHighest;
    let confidence = 0.5 + (scoreDifference * 0.5);
    
    // Boost confidence if primary score is high
    if (primaryScore > 0.7) confidence += 0.2;
    
    // Reduce confidence if scores are very close
    if (scoreDifference < 0.1) confidence -= 0.2;
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Get topic suggestions based on partial text
   */
  async getTopicSuggestions(text: string, limit: number = 3): Promise<string[]> {
    try {
      const result = await this.categorizeTopics(text);
      return [result.primary, ...result.secondary].slice(0, limit);
    } catch (error) {
      console.error("Error getting topic suggestions:", error);
      return ["business", "technical", "meeting"];
    }
  }

  /**
   * Get detailed topic analysis
   */
  async getDetailedAnalysis(text: string, metadata?: any): Promise<{
    result: TopicResult;
    insights: {
      topKeywords: string[];
      dominantEntities: string[];
      sentimentInfluence: string;
      confidenceFactors: string[];
    };
  }> {
    const result = await this.categorizeTopics(text, metadata);
    
    // Extract insights
    const topKeywords = Object.values(result.categories)
      .flatMap(cat => cat.indicators)
      .slice(0, 10);
    
    const dominantEntities = await this.entityExtractor.extractEntities({ text });
    
    const sentimentInfluence = result.categories[result.primary].reasoning
      .find(r => r.includes("sentiment")) || "No significant sentiment influence";
    
    const confidenceFactors = result.categories[result.primary].reasoning;
    
    return {
      result,
      insights: {
        topKeywords,
        dominantEntities: Object.values(dominantEntities).flat().slice(0, 5),
        sentimentInfluence,
        confidenceFactors
      }
    };
  }

  /**
   * Get default topic result for error cases
   */
  private getDefaultTopicResult(): TopicResult {
    return {
      primary: "business",
      secondary: [],
      confidence: 0.5,
      categories: {
        business: {
          score: 0.5,
          indicators: [],
          reasoning: ["Default categorization due to analysis error"]
        }
      }
    };
  }
}
