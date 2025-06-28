export type CommunicationType = "email" | "document" | "social";
export type ProjectType = "Home Purchase" | "Career Change" | "Family Event";
export type UrgencyLevel = "high" | "medium" | "low";
export type ArchetypeType = "prioritizer" | "connector" | "visualizer" | "analyst";
export type SourceType = "Gmail" | "Outlook" | "Email Attachment" | "Google Drive" | "Twitter" | "LinkedIn" | "Slack";

// Import dimensions for Task 2: Build Unified Communication Model
import { Dimensions } from "./dimensions";
import { Relationship } from "../services/RelationshipDetector";

export interface Communication {
  id: string;
  PK?: string;
  SK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  commType: string;
  source?: SourceType;
  timestamp: string;
  sender: string;
  senderName?: string; // Made optional since it might not always be present
  subject: string;
  content?: string; // Made optional since it might not be loaded from S3
  metadata: {
    urgency: UrgencyLevel;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
  project: string; // Changed from ProjectType to string for flexibility
  
  // Added by the API for archetype-based personalization
  _archetypeView?: string;
  _sortKey?: string;
  _highlight?: string;
  _displayFormat?: string;
  
  // May not be present in all responses
  dimensions?: Dimensions;
  attachments?: any[];
  
  // Added by the relationship detector
  relationships?: Relationship[];
  
  // Added by the ingestion pipeline
  processingMetadata?: {
    processedAt: string;
    processingSteps: {
      adapter: string;
      dimensions: string;
      classification: string;
      relationships: string;
    };
  };
}

export interface UserProfile {
  id: string;
  primaryArchetype: ArchetypeType;
  archetypeConfidence: Record<ArchetypeType, number>;
  preferences?: Record<string, any>;
  name?: string;
  email?: string;
}
