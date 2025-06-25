import { Communication, SourceType } from "../types/communication";
import { SourceAdapter } from "./SourceAdapter";
export interface IngestionResult {
    communication: Communication;
    processingTime: number;
    processingSteps: {
        adapter: string;
        dimensions: string;
        classification: string;
        relationships: string;
    };
    success: boolean;
    errors?: string[];
}
export declare class IngestionPipeline {
    private dimensionExtractor;
    private classificationService;
    private relationshipDetector;
    private adapters;
    constructor();
    /**
     * Register a source adapter with the pipeline
     */
    registerAdapter(adapter: SourceAdapter): void;
    /**
     * Remove a source adapter from the pipeline
     */
    removeAdapter(sourceType: SourceType): void;
    /**
     * Get all registered adapters
     */
    getAdapters(): SourceAdapter[];
    /**
     * Process a single communication through the pipeline
     */
    processCommunication(communication: Partial<Communication>): Promise<IngestionResult>;
    /**
     * Ingest communications from all registered adapters
     */
    ingestFromAllSources(): Promise<IngestionResult[]>;
    /**
     * Ingest a batch of communications
     */
    ingestBatch(communications: Partial<Communication>[]): Promise<IngestionResult[]>;
    /**
     * Get statistics about the ingestion process
     */
    getStatistics(results: IngestionResult[]): {
        totalProcessed: number;
        successCount: number;
        errorCount: number;
        averageProcessingTime: number;
        bySource: Record<string, number>;
        byProject: Record<string, number>;
        stepFailures: Record<string, number>;
    };
}
