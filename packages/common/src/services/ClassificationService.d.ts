import { Communication, ProjectType } from "../types/communication";
import { Dimensions } from "../types/dimensions";
export interface ClassificationResult {
    project: ProjectType;
    category: string;
    tags: string[];
    urgency: "high" | "medium" | "low";
    confidence: number;
}
export declare class ClassificationService {
    private projectKeywords;
    private categoryKeywords;
    private urgencyKeywords;
    /**
     * Classify a communication into a project, category, and urgency level
     */
    classifyCommunication(communication: Communication, dimensions: Dimensions): Promise<ClassificationResult>;
    /**
     * Enhance an existing classification with additional metadata
     */
    private enhanceExistingClassification;
    /**
     * Classify a communication from scratch
     */
    private classifyFromScratch;
    /**
     * Determine the project for a communication
     */
    private determineProject;
    /**
     * Determine the category for a communication
     */
    private determineCategory;
    /**
     * Extract tags for a communication
     */
    private extractTags;
    /**
     * Determine the urgency for a communication
     */
    private determineUrgency;
    /**
     * Calculate confidence in the classification
     */
    private calculateConfidence;
}
