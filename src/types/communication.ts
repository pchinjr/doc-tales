export type CommunicationType = 'email' | 'document' | 'social';
export type ProjectType = 'home-purchase' | 'career-change' | 'family-event';
export type UrgencyLevel = 'high' | 'medium' | 'low';
export type ArchetypeType = 'prioritizer' | 'connector' | 'visualizer' | 'analyst';
export type SourceType = 'gmail' | 'outlook' | 'dropbox' | 'gdrive' | 'twitter' | 'linkedin' | 'slack';

export interface Entity {
  id: string;
  type: string;
  text: string;
  position?: [number, number];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  organization?: string;
  role?: string;
  projects: ProjectType[];
}

export interface Relationship {
  type: string;
  targetId: string;
}

// Import dimensions for Task 2: Build Unified Communication Model
import { Dimensions, TemporalDimension, RelationshipDimension, VisualDimension, AnalyticalDimension } from './dimensions';

export interface Communication {
  id: string;
  type: CommunicationType;
  source: SourceType;
  timestamp: string;
  sender: Contact;
  recipients: Contact[];
  subject: string;
  content: string;
  attachments: Attachment[];
  metadata: {
    urgency: UrgencyLevel;
    category: string;
    read: boolean;
    flagged: boolean;
    sourceSpecific?: Record<string, any>; // For source-specific attributes
  };
  entities: Entity[];
  relationships: Relationship[];
  project: ProjectType;
  
  // Added dimensions as part of Task 2
  dimensions: Dimensions;
}

export interface Project {
  id: ProjectType;
  name: string;
  description: string;
  timelineStart: string;
  timelineEnd: string;
  keyDates: {
    name: string;
    date: string;
    urgency: UrgencyLevel;
  }[];
}

export interface UserProfile {
  id: string;
  primaryArchetype: ArchetypeType;
  archetypeConfidence: Record<ArchetypeType, number>;
  preferences: Record<string, any>;
}
