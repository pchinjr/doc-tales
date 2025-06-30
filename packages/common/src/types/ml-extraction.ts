// ML Dimension Extraction Types
// Types specific to the ML-powered dimension extraction process

import { Entity, SentimentScore } from "@aws-sdk/client-comprehend";
import { Dimensions } from "./dimensions";

/**
 * Raw output from AWS Comprehend services
 */
export interface ComprehendResults {
  entities: Entity[];
  sentiment: {
    sentiment: string;
    sentimentScore: SentimentScore;
  };
  keyPhrases: Array<{
    text: string;
    score: number;
  }>;
}

/**
 * Intermediate extraction results before mapping to dimensions
 */
export interface ExtractionResults {
  urgencyIndicators: {
    keywords: string[];
    score: number;
    level: "high" | "medium" | "low";
  };
  topicCategories: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  entityMappings: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    concepts: string[];
  };
  sentimentAnalysis: {
    overall: "positive" | "neutral" | "negative";
    confidence: number;
    emotionalTone: string[];
  };
  temporalMarkers: {
    deadlines: string[];
    timeReferences: string[];
    urgencyKeywords: string[];
  };
}

/**
 * Configuration for dimension extraction
 */
export interface ExtractionConfig {
  enableSentimentAnalysis: boolean;
  enableEntityExtraction: boolean;
  enableKeyPhraseExtraction: boolean;
  confidenceThreshold: number;
  urgencyKeywords: string[];
  topicCategories: string[];
}

/**
 * Result of the complete dimension extraction process
 */
export interface DimensionExtractionResult {
  dimensions: Dimensions;
  extractionMetadata: {
    processingTime: number;
    confidenceScore: number;
    extractionMethod: "ml" | "rule-based" | "hybrid";
    errors?: string[];
    warnings?: string[];
  };
  rawResults: ComprehendResults;
}

/**
 * Input for dimension extraction
 */
export interface ExtractionInput {
  text: string;
  metadata?: {
    source: string;
    timestamp: string;
    sender?: string;
    subject?: string;
  };
  config?: Partial<ExtractionConfig>;
}
