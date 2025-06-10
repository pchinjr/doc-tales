// Task 1: Define Dimension Schema
// This file defines the TypeScript interfaces for the four key dimensions

export interface TemporalDimension {
  deadline?: string;
  urgency: 'high' | 'medium' | 'low';
  chronology: {
    created: string;
    lastUpdated?: string;
    followUpDate?: string;
  };
  timeContext: {
    isRecent: boolean;
    isPast: boolean;
    requiresAction: boolean;
    daysUntilDeadline?: number;
  };
}

export interface RelationshipDimension {
  connectionStrength: 'strong' | 'medium' | 'weak';
  frequency: 'frequent' | 'occasional' | 'rare';
  lastInteraction?: string;
  networkPosition: {
    isDirectConnection: boolean;
    sharedConnections: number;
    relevanceScore: number;
  };
  context: {
    personal: boolean;
    professional: boolean;
    projectSpecific: boolean;
  };
}

export interface VisualDimension {
  hasImages: boolean;
  documentType?: string;
  visualElements: {
    charts: number;
    tables: number;
    images: number;
    attachments: number;
  };
  spatialContext?: {
    location?: string;
    coordinates?: [number, number];
    relatedLocations?: string[];
  };
  visualCategory: 'document' | 'image' | 'chart' | 'mixed' | 'text-only';
}

export interface AnalyticalDimension {
  categories: string[];
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    concepts: string[];
  };
  metrics: {
    wordCount: number;
    readingTime: number;
    complexity: 'high' | 'medium' | 'low';
    informationDensity: number;
  };
  structure: {
    hasHeadings: boolean;
    hasBulletPoints: boolean;
    hasNumberedLists: boolean;
    paragraphCount: number;
  };
}

// Combined dimension interface that includes all dimension types
export interface Dimensions {
  temporal: TemporalDimension;
  relationship: RelationshipDimension;
  visual: VisualDimension;
  analytical: AnalyticalDimension;
  confidenceScores: {
    temporal: number;
    relationship: number;
    visual: number;
    analytical: number;
  };
}
