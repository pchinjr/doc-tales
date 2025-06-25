import { Communication, SourceType, ProjectType, ArchetypeType } from "../types/communication";
import { SourceAdapter } from "./SourceAdapter";
export interface CommunicationFilter {
    sources?: SourceType[];
    projects?: ProjectType[];
    startDate?: Date;
    endDate?: Date;
    senders?: string[];
    categories?: string[];
    tags?: string[];
    urgency?: ("high" | "medium" | "low")[];
    hasRelationships?: boolean;
    relationshipTypes?: string[];
    dimensionScores?: {
        temporal?: number;
        relationship?: number;
        visual?: number;
        analytical?: number;
    };
    searchText?: string;
}
export interface DataSourceStatus {
    sourceType: SourceType;
    isConnected: boolean;
    lastRefresh: Date | null;
    communicationCount: number;
    errorCount: number;
}
export declare class UnifiedDataService {
    private static instance;
    private ingestionPipeline;
    private communications;
    private ingestionResults;
    private isLoading;
    private lastRefresh;
    private sourceStatus;
    private constructor();
    static getInstance(): UnifiedDataService;
    /**
     * Register a new source adapter
     */
    registerAdapter(adapter: SourceAdapter): void;
    /**
     * Remove a source adapter
     */
    removeAdapter(sourceType: SourceType): void;
    /**
     * Get all registered adapters
     */
    getAdapters(): SourceAdapter[];
    /**
     * Get status for all data sources
     */
    getSourceStatus(): DataSourceStatus[];
    /**
     * Load data from all registered adapters
     */
    loadAllData(): Promise<void>;
    /**
     * Update status for all data sources
     */
    private updateSourceStatus;
    /**
     * Get ingestion statistics
     */
    getIngestionStatistics(): {
        totalProcessed: number;
        successCount: number;
        errorCount: number;
        averageProcessingTime: number;
        bySource: Record<string, number>;
        byProject: Record<string, number>;
        stepFailures: Record<string, number>;
    };
    /**
     * Get all communications
     */
    getCommunications(): Communication[];
    /**
     * Get communications filtered by source
     */
    getCommunicationsBySource(source: SourceType): Communication[];
    /**
     * Get communications filtered by project
     */
    getCommunicationsByProject(project: ProjectType): Communication[];
    /**
     * Get communications filtered by date range
     */
    getCommunicationsByDateRange(startDate: Date, endDate: Date): Communication[];
    /**
     * Get communications with advanced filtering
     */
    filterCommunications(filter: CommunicationFilter): Communication[];
    /**
     * Get communications optimized for a specific archetype
     */
    getCommunicationsForArchetype(archetype: ArchetypeType): Communication[];
    /**
     * Get the relationship strength for a communication
     */
    private getRelationshipStrength;
    /**
     * Get communications with cross-project relationships
     */
    getCrossProjectCommunications(): Communication[];
    /**
     * Get related communications for a specific communication
     */
    getRelatedCommunications(communicationId: string): Communication[];
    /**
     * Search communications by text
     */
    searchCommunications(query: string): Communication[];
    /**
     * Get loading status
     */
    isDataLoading(): boolean;
    /**
     * Get last refresh time
     */
    getLastRefreshTime(): Date | null;
    /**
     * Get communications grouped by dimension
     */
    getCommunicationsByDimension(dimensionType: "temporal" | "relationship" | "visual" | "analytical", threshold?: number): Record<string, Communication[]>;
}
