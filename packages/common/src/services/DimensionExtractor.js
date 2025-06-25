"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimensionExtractor = void 0;
class DimensionExtractor {
    /**
     * Extract all dimensions from a communication
     */
    extractDimensions(communication) {
        const temporal = this.extractTemporalDimension(communication);
        const relationship = this.extractRelationshipDimension(communication);
        const visual = this.extractVisualDimension(communication);
        const analytical = this.extractAnalyticalDimension(communication);
        // Calculate confidence scores based on available data
        const confidenceScores = {
            temporal: this.calculateTemporalConfidence(temporal),
            relationship: this.calculateRelationshipConfidence(relationship),
            visual: this.calculateVisualConfidence(visual),
            analytical: this.calculateAnalyticalConfidence(analytical)
        };
        return {
            temporal,
            relationship,
            visual,
            analytical,
            confidenceScores
        };
    }
    /**
     * Extract temporal dimensions from a communication
     */
    extractTemporalDimension(communication) {
        // Extract deadline from content using simple pattern matching
        const deadlineMatch = communication.content.match(/deadline[:\s]*([\w\s,]+)/i);
        const deadline = deadlineMatch ? deadlineMatch[1].trim() : undefined;
        // Calculate days until deadline if it exists
        let daysUntilDeadline;
        if (deadline) {
            try {
                const deadlineDate = new Date(deadline);
                const today = new Date();
                const diffTime = deadlineDate.getTime() - today.getTime();
                daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            catch (e) {
                // If we can't parse the date, leave it undefined
            }
        }
        // Determine if this requires action based on content and urgency
        const requiresAction = communication.metadata.urgency === "high" ||
            communication.content.toLowerCase().includes("please") ||
            communication.content.toLowerCase().includes("need") ||
            communication.content.toLowerCase().includes("required") ||
            communication.content.toLowerCase().includes("action");
        // Create the temporal dimension
        return {
            deadline,
            urgency: communication.metadata.urgency,
            chronology: {
                created: communication.timestamp,
                lastUpdated: communication.timestamp,
                followUpDate: deadline
            },
            timeContext: {
                isRecent: this.isRecent(communication.timestamp),
                isPast: this.isPast(communication.timestamp),
                requiresAction,
                daysUntilDeadline
            }
        };
    }
    /**
     * Extract relationship dimensions from a communication
     */
    extractRelationshipDimension(communication) {
        // Determine connection strength based on communication patterns
        // In a real implementation, this would analyze communication history
        let connectionStrength = "medium";
        // For the MVP, use simple rules
        if (communication.commType === "email" && communication.metadata.category === "finance") {
            connectionStrength = "strong"; // Financial communications are important
        }
        else if (communication.commType === "social") {
            connectionStrength = "weak"; // Social media connections are typically weaker
        }
        // Determine frequency based on metadata
        // In a real implementation, this would analyze communication history
        let frequency = "occasional";
        // For the MVP, use the source type to guess frequency
        if (communication.commType === "email") {
            frequency = "frequent";
        }
        else if (communication.commType === "document") {
            frequency = "occasional";
        }
        else {
            frequency = "rare";
        }
        // Determine context based on project and content
        const personal = communication.project === "Family Event" ||
            communication.content.toLowerCase().includes("family") ||
            communication.content.toLowerCase().includes("friend");
        const professional = communication.project === "Career Change" ||
            communication.content.toLowerCase().includes("work") ||
            communication.content.toLowerCase().includes("job") ||
            communication.content.toLowerCase().includes("interview");
        const projectSpecific = communication.project === "Home Purchase" ||
            communication.content.toLowerCase().includes("house") ||
            communication.content.toLowerCase().includes("property");
        return {
            connectionStrength,
            frequency,
            lastInteraction: communication.timestamp,
            networkPosition: {
                isDirectConnection: true,
                sharedConnections: 0,
                relevanceScore: this.calculateRelevanceScore(communication)
            },
            context: {
                personal,
                professional,
                projectSpecific
            }
        };
    }
    /**
     * Extract visual dimensions from a communication
     */
    extractVisualDimension(communication) {
        // Determine if the communication has images
        const hasImages = Boolean(communication.metadata &&
            typeof communication.metadata === "object" &&
            "hasImages" in communication.metadata &&
            communication.metadata.hasImages);
        // Get document type if available
        const documentType = communication.metadata &&
            typeof communication.metadata === "object" &&
            "fileType" in communication.metadata ?
            String(communication.metadata.fileType) : undefined;
        // Count visual elements
        const charts = communication.metadata &&
            typeof communication.metadata === "object" &&
            "chartCount" in communication.metadata ?
            Number(communication.metadata.chartCount) : 0;
        const tables = communication.metadata &&
            typeof communication.metadata === "object" &&
            "tableCount" in communication.metadata ?
            Number(communication.metadata.tableCount) : 0;
        const images = communication.metadata &&
            typeof communication.metadata === "object" &&
            "imageCount" in communication.metadata ?
            Number(communication.metadata.imageCount) :
            (communication.metadata &&
                typeof communication.metadata === "object" &&
                "hasImages" in communication.metadata &&
                communication.metadata.hasImages ? 1 : 0);
        const attachments = communication.metadata &&
            typeof communication.metadata === "object" &&
            "attachments" in communication.metadata ?
            Number(communication.metadata.attachments) : 0;
        // Determine visual category
        let visualCategory = "text-only";
        if (charts > 0 && tables > 0) {
            visualCategory = "mixed";
        }
        else if (charts > 0) {
            visualCategory = "chart";
        }
        else if (images > 0) {
            visualCategory = "image";
        }
        else if (documentType) {
            visualCategory = "document";
        }
        // Extract location if available
        const location = communication.metadata &&
            typeof communication.metadata === "object" &&
            "location" in communication.metadata ?
            String(communication.metadata.location) : undefined;
        return {
            hasImages,
            documentType,
            visualElements: {
                charts,
                tables,
                images,
                attachments
            },
            spatialContext: location ? {
                location,
                coordinates: undefined,
                relatedLocations: undefined
            } : undefined,
            visualCategory
        };
    }
    /**
     * Extract analytical dimensions from a communication
     */
    extractAnalyticalDimension(communication) {
        // Extract categories and tags
        const categories = [communication.metadata.category];
        // Extract tags using simple keyword matching
        const tags = [];
        if (communication.content.toLowerCase().includes("urgent"))
            tags.push("urgent");
        if (communication.content.toLowerCase().includes("follow up"))
            tags.push("follow-up");
        if (communication.content.toLowerCase().includes("review"))
            tags.push("review");
        if (communication.content.toLowerCase().includes("approve"))
            tags.push("approval");
        if (communication.content.toLowerCase().includes("meeting"))
            tags.push("meeting");
        // Add project as a tag
        tags.push(communication.project);
        // Determine sentiment using simple keyword matching
        let sentiment = "neutral";
        const positiveWords = ["good", "great", "excellent", "happy", "pleased", "excited"];
        const negativeWords = ["bad", "issue", "problem", "concerned", "disappointed", "urgent"];
        const contentLower = communication.content.toLowerCase();
        const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
        if (positiveCount > negativeCount) {
            sentiment = "positive";
        }
        else if (negativeCount > positiveCount) {
            sentiment = "negative";
        }
        // Extract entities using simple pattern matching
        // In a real implementation, this would use NLP
        const people = [communication.senderName];
        const organizations = [];
        // Extract locations using simple pattern matching
        const locations = [];
        if (communication.metadata &&
            typeof communication.metadata === "object" &&
            "location" in communication.metadata) {
            locations.push(String(communication.metadata.location));
        }
        // Extract dates using simple pattern matching
        const dates = [communication.timestamp];
        // Extract concepts using simple keyword matching
        const concepts = [];
        if (communication.project === "Home Purchase") {
            concepts.push("real estate", "mortgage", "property");
        }
        else if (communication.project === "Career Change") {
            concepts.push("job search", "interview", "resume");
        }
        else if (communication.project === "Family Event") {
            concepts.push("reunion", "planning", "family");
        }
        // Calculate metrics
        const wordCount = communication.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed
        // Determine complexity
        let complexity = "medium";
        if (wordCount > 300) {
            complexity = "high";
        }
        else if (wordCount < 50) {
            complexity = "low";
        }
        // Calculate information density
        const informationDensity = (entities) => {
            return entities.length / wordCount * 100;
        };
        // Determine structure
        const hasHeadings = communication.content.match(/^#+\s+.+$/m) !== null;
        const hasBulletPoints = communication.content.match(/^[*-]\s+.+$/m) !== null;
        const hasNumberedLists = communication.content.match(/^\d+\.\s+.+$/m) !== null;
        const paragraphCount = communication.content.split(/\n\s*\n/).length;
        return {
            categories,
            tags,
            sentiment,
            entities: {
                people,
                organizations,
                locations,
                dates,
                concepts
            },
            metrics: {
                wordCount,
                readingTime,
                complexity,
                informationDensity: informationDensity([...people, ...organizations, ...locations, ...concepts])
            },
            structure: {
                hasHeadings,
                hasBulletPoints,
                hasNumberedLists,
                paragraphCount
            }
        };
    }
    /**
     * Helper methods for dimension extraction
     */
    isRecent(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7; // Within the last week
    }
    isPast(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        return date < now;
    }
    calculateRelevanceScore(communication) {
        // Simple relevance calculation based on urgency and recency
        let score = 0.5; // Start with neutral score
        // Adjust based on urgency
        if (communication.metadata.urgency === "high")
            score += 0.3;
        if (communication.metadata.urgency === "low")
            score -= 0.1;
        // Adjust based on recency
        if (this.isRecent(communication.timestamp))
            score += 0.2;
        // Adjust based on project
        if (communication.project === "Home Purchase")
            score += 0.1;
        // Ensure score is between 0 and 1
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Calculate confidence scores for each dimension
     */
    calculateTemporalConfidence(temporal) {
        let score = 0.5; // Start with neutral score
        if (temporal.deadline)
            score += 0.2;
        if (temporal.timeContext.requiresAction)
            score += 0.1;
        if (temporal.timeContext.daysUntilDeadline !== undefined)
            score += 0.2;
        return Math.max(0, Math.min(1, score));
    }
    calculateRelationshipConfidence(relationship) {
        let score = 0.5; // Start with neutral score
        if (relationship.connectionStrength === "strong")
            score += 0.2;
        if (relationship.frequency === "frequent")
            score += 0.1;
        if (relationship.networkPosition.sharedConnections > 0)
            score += 0.1;
        if (relationship.context.personal || relationship.context.professional)
            score += 0.1;
        return Math.max(0, Math.min(1, score));
    }
    calculateVisualConfidence(visual) {
        var _a;
        let score = 0.5; // Start with neutral score
        if (visual.hasImages)
            score += 0.2;
        if (visual.visualElements.charts > 0)
            score += 0.1;
        if (visual.visualElements.tables > 0)
            score += 0.1;
        if ((_a = visual.spatialContext) === null || _a === void 0 ? void 0 : _a.location)
            score += 0.1;
        return Math.max(0, Math.min(1, score));
    }
    calculateAnalyticalConfidence(analytical) {
        let score = 0.5; // Start with neutral score
        if (analytical.tags.length > 2)
            score += 0.1;
        if (analytical.entities.concepts.length > 0)
            score += 0.1;
        if (analytical.metrics.complexity === "high")
            score += 0.1;
        if (analytical.structure.hasHeadings ||
            analytical.structure.hasBulletPoints ||
            analytical.structure.hasNumberedLists)
            score += 0.1;
        if (analytical.metrics.wordCount > 100)
            score += 0.1;
        return Math.max(0, Math.min(1, score));
    }
}
exports.DimensionExtractor = DimensionExtractor;
//# sourceMappingURL=DimensionExtractor.js.map