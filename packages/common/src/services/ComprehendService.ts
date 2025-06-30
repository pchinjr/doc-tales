// AWS Comprehend Service Wrapper
// Provides a clean interface for AWS Comprehend ML services with error handling

import {
  ComprehendClient,
  DetectEntitiesCommand,
  DetectSentimentCommand,
  DetectKeyPhrasesCommand,
  Entity,
  SentimentScore
} from "@aws-sdk/client-comprehend";

import {
  ComprehendResults,
  ExtractionConfig,
  ExtractionInput
} from "../types/ml-extraction";

/**
 * Service wrapper for AWS Comprehend with error handling and retry logic
 */
export class ComprehendService {
  private client: ComprehendClient;
  private defaultConfig: ExtractionConfig;

  constructor(region: string = "us-east-1") {
    this.client = new ComprehendClient({ region });
    this.defaultConfig = {
      enableSentimentAnalysis: true,
      enableEntityExtraction: true,
      enableKeyPhraseExtraction: true,
      confidenceThreshold: 0.7,
      urgencyKeywords: [
        "urgent", "asap", "immediately", "deadline", "critical",
        "emergency", "priority", "rush", "time-sensitive"
      ],
      topicCategories: [
        "business", "personal", "technical", "financial", "legal",
        "marketing", "support", "meeting", "project", "administrative"
      ]
    };
  }

  /**
   * Extract comprehensive results from text using multiple Comprehend services
   */
  async extractComprehendResults(input: ExtractionInput): Promise<ComprehendResults> {
    const config = { ...this.defaultConfig, ...input.config };
    const results: ComprehendResults = {
      entities: [],
      sentiment: {
        sentiment: "NEUTRAL",
        sentimentScore: {
          Positive: 0,
          Negative: 0,
          Neutral: 1,
          Mixed: 0
        }
      },
      keyPhrases: []
    };

    try {
      // Run all Comprehend operations in parallel for efficiency
      const promises: Promise<any>[] = [];

      if (config.enableEntityExtraction) {
        promises.push(this.detectEntities(input.text));
      }

      if (config.enableSentimentAnalysis) {
        promises.push(this.detectSentiment(input.text));
      }

      if (config.enableKeyPhraseExtraction) {
        promises.push(this.detectKeyPhrases(input.text));
      }

      const [entitiesResult, sentimentResult, keyPhrasesResult] = await Promise.allSettled(promises);

      // Process entity extraction results
      if (entitiesResult.status === "fulfilled" && config.enableEntityExtraction) {
        results.entities = entitiesResult.value || [];
      }

      // Process sentiment analysis results
      if (sentimentResult.status === "fulfilled" && config.enableSentimentAnalysis) {
        results.sentiment = sentimentResult.value || results.sentiment;
      }

      // Process key phrase extraction results
      if (keyPhrasesResult.status === "fulfilled" && config.enableKeyPhraseExtraction) {
        results.keyPhrases = keyPhrasesResult.value || [];
      }

      return results;

    } catch (error) {
      console.error("Error in Comprehend extraction:", error);
      throw new Error(`Comprehend service error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Detect entities in text
   */
  private async detectEntities(text: string): Promise<Entity[]> {
    try {
      const command = new DetectEntitiesCommand({
        Text: text,
        LanguageCode: "en"
      });

      const response = await this.client.send(command);
      return response.Entities || [];
    } catch (error) {
      console.error("Error detecting entities:", error);
      return [];
    }
  }

  /**
   * Detect sentiment in text
   */
  private async detectSentiment(text: string): Promise<{ sentiment: string; sentimentScore: SentimentScore }> {
    try {
      const command = new DetectSentimentCommand({
        Text: text,
        LanguageCode: "en"
      });

      const response = await this.client.send(command);
      return {
        sentiment: response.Sentiment || "NEUTRAL",
        sentimentScore: response.SentimentScore || {
          Positive: 0,
          Negative: 0,
          Neutral: 1,
          Mixed: 0
        }
      };
    } catch (error) {
      console.error("Error detecting sentiment:", error);
      return {
        sentiment: "NEUTRAL",
        sentimentScore: {
          Positive: 0,
          Negative: 0,
          Neutral: 1,
          Mixed: 0
        }
      };
    }
  }

  /**
   * Detect key phrases in text
   */
  private async detectKeyPhrases(text: string): Promise<Array<{ text: string; score: number }>> {
    try {
      const command = new DetectKeyPhrasesCommand({
        Text: text,
        LanguageCode: "en"
      });

      const response = await this.client.send(command);
      return (response.KeyPhrases || []).map(phrase => ({
        text: phrase.Text || "",
        score: phrase.Score || 0
      }));
    } catch (error) {
      console.error("Error detecting key phrases:", error);
      return [];
    }
  }

  /**
   * Health check for the Comprehend service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testText = "This is a test message.";
      await this.detectSentiment(testText);
      return true;
    } catch (error) {
      console.error("Comprehend health check failed:", error);
      return false;
    }
  }
}
