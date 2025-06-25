export type CommunicationType = "email" | "document" | "social";
export type ProjectType = "Home Purchase" | "Career Change" | "Family Event";
export type UrgencyLevel = "high" | "medium" | "low";
export type ArchetypeType = "prioritizer" | "connector" | "visualizer" | "analyst";
export type SourceType = "Gmail" | "Outlook" | "Email Attachment" | "Google Drive" | "Twitter" | "LinkedIn" | "Slack";
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
    source: SourceType;
    timestamp: string;
    sender: string;
    senderName: string;
    subject: string;
    content: string;
    metadata: {
        urgency: UrgencyLevel;
        category: string;
        tags?: string[];
        [key: string]: any;
    };
    project: ProjectType;
    _archetypeView?: string;
    _sortKey?: string;
    _highlight?: string;
    _displayFormat?: string;
    dimensions?: Dimensions;
    attachments?: any[];
    relationships?: Relationship[];
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
