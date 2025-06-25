import { Communication } from "../types/communication";
import { Dimensions } from "../types/dimensions";
export declare class DimensionExtractor {
    /**
     * Extract all dimensions from a communication
     */
    extractDimensions(communication: Communication): Dimensions;
    /**
     * Extract temporal dimensions from a communication
     */
    private extractTemporalDimension;
    /**
     * Extract relationship dimensions from a communication
     */
    private extractRelationshipDimension;
    /**
     * Extract visual dimensions from a communication
     */
    private extractVisualDimension;
    /**
     * Extract analytical dimensions from a communication
     */
    private extractAnalyticalDimension;
    /**
     * Helper methods for dimension extraction
     */
    private isRecent;
    private isPast;
    private calculateRelevanceScore;
    /**
     * Calculate confidence scores for each dimension
     */
    private calculateTemporalConfidence;
    private calculateRelationshipConfidence;
    private calculateVisualConfidence;
    private calculateAnalyticalConfidence;
}
