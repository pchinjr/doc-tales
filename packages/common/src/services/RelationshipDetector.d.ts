import { Communication } from "../types/communication";
import { Dimensions } from "../types/dimensions";
export interface Relationship {
    type: "person" | "topic" | "location" | "time" | "document" | "project";
    value: string;
    strength: number;
    relatedCommunicationIds?: string[];
    metadata?: Record<string, any>;
}
export declare class RelationshipDetector {
    private communicationCache;
    /**
     * Detect relationships for a communication
     */
    detectRelationships(communication: Communication, dimensions: Dimensions): Promise<Relationship[]>;
    /**
     * Detect relationships based on people
     */
    private detectPersonRelationships;
    /**
     * Extract context for a person mentioned in a communication
     */
    private extractContextForPerson;
    /**
     * Detect relationships based on topics
     */
    private detectTopicRelationships;
    /**
     * Detect relationships based on locations
     */
    private detectLocationRelationships;
    /**
     * Detect relationships based on time
     */
    private detectTimeRelationships;
    /**
     * Detect relationships based on documents
     */
    private detectDocumentRelationships;
    /**
     * Detect cross-project relationships
     */
    private detectCrossProjectRelationships;
    /**
     * Clear the communication cache
     */
    clearCache(): void;
    /**
     * Add a batch of communications to the cache
     */
    addToCache(communications: Communication[]): void;
}
