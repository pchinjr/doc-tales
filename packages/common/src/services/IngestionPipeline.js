"use strict";
// IngestionPipeline.ts
// Orchestrates the data ingestion process from source adapters to dimension extraction and classification
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionPipeline = void 0;
const DimensionExtractor_1 = require("./DimensionExtractor");
const ClassificationService_1 = require("./ClassificationService");
const RelationshipDetector_1 = require("./RelationshipDetector");
class IngestionPipeline {
    constructor() {
        this.adapters = new Map();
        this.dimensionExtractor = new DimensionExtractor_1.DimensionExtractor();
        this.classificationService = new ClassificationService_1.ClassificationService();
        this.relationshipDetector = new RelationshipDetector_1.RelationshipDetector();
    }
    /**
     * Register a source adapter with the pipeline
     */
    registerAdapter(adapter) {
        this.adapters.set(adapter.getSourceType(), adapter);
    }
    /**
     * Remove a source adapter from the pipeline
     */
    removeAdapter(sourceType) {
        this.adapters.delete(sourceType);
    }
    /**
     * Get all registered adapters
     */
    getAdapters() {
        return Array.from(this.adapters.values());
    }
    /**
     * Process a single communication through the pipeline
     */
    async processCommunication(communication) {
        const startTime = Date.now();
        const errors = [];
        const processingSteps = {
            adapter: "skipped",
            dimensions: "pending",
            classification: "pending",
            relationships: "pending"
        };
        try {
            // Step 1: Extract dimensions
            let dimensions;
            try {
                dimensions = this.dimensionExtractor.extractDimensions(communication);
                processingSteps.dimensions = "completed";
            }
            catch (error) {
                errors.push(`Dimension extraction failed: ${error}`);
                processingSteps.dimensions = "failed";
                dimensions = {};
            }
            // Step 2: Apply classification
            try {
                const classification = await this.classificationService.classifyCommunication(communication, dimensions);
                processingSteps.classification = "completed";
                // Update communication with classification results
                communication.project = classification.project;
                communication.metadata = {
                    ...communication.metadata,
                    category: classification.category,
                    tags: classification.tags,
                    urgency: classification.urgency
                };
            }
            catch (error) {
                errors.push(`Classification failed: ${error}`);
                processingSteps.classification = "failed";
            }
            // Step 3: Detect relationships
            try {
                const relationships = await this.relationshipDetector.detectRelationships(communication, dimensions);
                processingSteps.relationships = "completed";
                // Update communication with relationship results
                communication.relationships = relationships;
            }
            catch (error) {
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
            };
            return {
                communication: finalCommunication,
                processingTime: Date.now() - startTime,
                processingSteps,
                success: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            return {
                communication: communication,
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
    async ingestFromAllSources() {
        const results = [];
        // Process each adapter
        for (const adapter of this.adapters.values()) {
            if (!adapter.isConnected()) {
                try {
                    if (adapter.connect) {
                        await adapter.connect();
                    }
                }
                catch (error) {
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
            }
            catch (error) {
                console.error(`Failed to process adapter ${adapter.getSourceType()}: ${error}`);
            }
        }
        return results;
    }
    /**
     * Ingest a batch of communications
     */
    async ingestBatch(communications) {
        const results = [];
        for (const communication of communications) {
            const result = await this.processCommunication(communication);
            results.push(result);
        }
        return results;
    }
    /**
     * Get statistics about the ingestion process
     */
    getStatistics(results) {
        const statistics = {
            totalProcessed: results.length,
            successCount: results.filter(r => r.success).length,
            errorCount: results.filter(r => !r.success).length,
            averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
            bySource: {},
            byProject: {},
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
exports.IngestionPipeline = IngestionPipeline;
//# sourceMappingURL=IngestionPipeline.js.map