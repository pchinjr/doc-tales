// IngestionPipeline.ts
// Orchestrates the data ingestion process from source adapters to dimension extraction and classification

import { Communication, SourceType } from "../types/communication";
import { SourceAdapter } from "./SourceAdapter";
import { DimensionExtractor } from "./DimensionExtractor";
import { ClassificationService } from "./ClassificationService";
import { RelationshipDetector } from "./RelationshipDetector";
import { Dimensions } from "../types/dimensions";

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

export class IngestionPipeline {
  private dimensionExtractor: DimensionExtractor;
  private classificationService: ClassificationService;
  private relationshipDetector: RelationshipDetector;
  private adapters: Map<SourceType, SourceAdapter> = new Map();
  
  constructor() {
    this.dimensionExtractor = new DimensionExtractor();
    this.classificationService = new ClassificationService();
    this.relationshipDetector = new RelationshipDetector();
  }
  
  /**
   * Register a source adapter with the pipeline
   */
  public registerAdapter(adapter: SourceAdapter): void {
    this.adapters.set(adapter.getSourceType(), adapter);
  }
  
  /**
   * Remove a source adapter from the pipeline
   */
  public removeAdapter(sourceType: SourceType): void {
    this.adapters.delete(sourceType);
  }
  
  /**
   * Get all registered adapters
   */
  public getAdapters(): SourceAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Process a single communication through the pipeline
   */
  public async processCommunication(communication: Partial<Communication>): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const processingSteps = {
      adapter: "skipped", // If communication is already provided
      dimensions: "pending",
      classification: "pending",
      relationships: "pending"
    };
    
    try {
      // Step 1: Extract dimensions
      let dimensions: Dimensions;
      try {
        dimensions = this.dimensionExtractor.extractDimensions(communication as Communication);
        processingSteps.dimensions = "completed";
      } catch (error) {
        errors.push(`Dimension extraction failed: ${error}`);
        processingSteps.dimensions = "failed";
        dimensions = {} as Dimensions;
      }
      
      // Step 2: Apply classification
      try {
        const classification = await this.classificationService.classifyCommunication(
          communication as Communication, 
          dimensions
        );
        processingSteps.classification = "completed";
        
        // Update communication with classification results
        communication.project = classification.project;
        communication.metadata = {
          ...communication.metadata,
          category: classification.category,
          tags: classification.tags,
          urgency: classification.urgency
        };
      } catch (error) {
        errors.push(`Classification failed: ${error}`);
        processingSteps.classification = "failed";
      }
      
      // Step 3: Detect relationships
      try {
        const relationships = await this.relationshipDetector.detectRelationships(
          communication as Communication,
          dimensions
        );
        processingSteps.relationships = "completed";
        
        // Update communication with relationship results
        communication.relationships = relationships;
      } catch (error) {
        errors.push(`Relationship detection failed: ${error}`);
        processingSteps.relationships = "failed";
      }
      
      // Finalize the communication object
      const finalCommunication = {
        ...communication,
        dimensions,
        processingMetadata: {
          processedAt: new Date().toISOString(),
          processingSteps
        }
      } as Communication;
      
      return {
        communication: finalCommunication,
        processingTime: Date.now() - startTime,
        processingSteps,
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        communication: communication as Communication,
        processingTime: Date.now() - startTime,
        processingSteps,
        success: false,
        errors: [`Pipeline execution failed: ${error}`]
      };
    }
  }
  
  /**
   * Ingest communications from all registered adapters
   */
  public async ingestFromAllSources(): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];
    
    // Process each adapter
    for (const adapter of this.adapters.values()) {
      if (!adapter.isConnected()) {
        try {
          if (adapter.connect) {
            await adapter.connect();
          }
        } catch (error) {
          console.error(`Failed to connect to adapter ${adapter.getSourceType()}: ${error}`);
          continue;
        }
      }
      
      try {
        // Fetch communications from the adapter
        const communications = await adapter.fetchCommunications();
        
        // Process each communication
        for (const communication of communications) {
          const result = await this.processCommunication(communication);
          results.push(result);
        }
      } catch (error) {
        console.error(`Failed to process adapter ${adapter.getSourceType()}: ${error}`);
      }
    }
    
    return results;
  }
  
  /**
   * Ingest a batch of communications
   */
  public async ingestBatch(communications: Partial<Communication>[]): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];
    
    for (const communication of communications) {
      const result = await this.processCommunication(communication);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Get statistics about the ingestion process
   */
  public getStatistics(results: IngestionResult[]): {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    averageProcessingTime: number;
    bySource: Record<string, number>;
    byProject: Record<string, number>;
    stepFailures: Record<string, number>;
  } {
    const statistics = {
      totalProcessed: results.length,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
      bySource: {} as Record<string, number>,
      byProject: {} as Record<string, number>,
      stepFailures: {
        dimensions: 0,
        classification: 0,
        relationships: 0
      }
    };
    
    // Count by source and project
    for (const result of results) {
      const source = result.communication.source;
      const project = result.communication.project;
      
      if (source) {
        statistics.bySource[source] = (statistics.bySource[source] || 0) + 1;
      }
      
      if (project) {
        statistics.byProject[project] = (statistics.byProject[project] || 0) + 1;
      }
      
      // Count step failures
      if (result.processingSteps.dimensions === "failed") {
        statistics.stepFailures.dimensions++;
      }
      if (result.processingSteps.classification === "failed") {
        statistics.stepFailures.classification++;
      }
      if (result.processingSteps.relationships === "failed") {
        statistics.stepFailures.relationships++;
      }
    }
    
    return statistics;
  }
}
