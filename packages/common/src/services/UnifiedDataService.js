"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedDataService = void 0;
const EmailAdapter_1 = require("./adapters/EmailAdapter");
const DocumentAdapter_1 = require("./adapters/DocumentAdapter");
const SocialAdapter_1 = require("./adapters/SocialAdapter");
const IngestionPipeline_1 = require("./IngestionPipeline");
class UnifiedDataService {
    constructor() {
        this.communications = [];
        this.ingestionResults = [];
        this.isLoading = false;
        this.lastRefresh = null;
        this.sourceStatus = new Map();
        // Initialize the ingestion pipeline
        this.ingestionPipeline = new IngestionPipeline_1.IngestionPipeline();
        // Initialize with default adapters
        this.registerAdapter(new EmailAdapter_1.EmailAdapter("Gmail"));
        this.registerAdapter(new DocumentAdapter_1.DocumentAdapter("Email Attachment"));
        this.registerAdapter(new SocialAdapter_1.SocialAdapter("Twitter"));
    }
    static getInstance() {
        if (!UnifiedDataService.instance) {
            UnifiedDataService.instance = new UnifiedDataService();
        }
        return UnifiedDataService.instance;
    }
    /**
     * Register a new source adapter
     */
    registerAdapter(adapter) {
        this.ingestionPipeline.registerAdapter(adapter);
        // Initialize source status
        this.sourceStatus.set(adapter.getSourceType(), {
            sourceType: adapter.getSourceType(),
            isConnected: adapter.isConnected(),
            lastRefresh: null,
            communicationCount: 0,
            errorCount: 0
        });
    }
    /**
     * Remove a source adapter
     */
    removeAdapter(sourceType) {
        this.ingestionPipeline.removeAdapter(sourceType);
        this.sourceStatus.delete(sourceType);
    }
    /**
     * Get all registered adapters
     */
    getAdapters() {
        return this.ingestionPipeline.getAdapters();
    }
    /**
     * Get status for all data sources
     */
    getSourceStatus() {
        return Array.from(this.sourceStatus.values());
    }
    /**
     * Load data from all registered adapters
     */
    async loadAllData() {
        if (this.isLoading) {
            throw new Error("Data loading already in progress");
        }
        try {
            this.isLoading = true;
            // Use the ingestion pipeline to process all sources
            this.ingestionResults = await this.ingestionPipeline.ingestFromAllSources();
            // Extract communications from results
            this.communications = this.ingestionResults
                .filter(result => result.success)
                .map(result => result.communication);
            // Sort by timestamp (newest first)
            this.communications.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            // Update source status
            this.updateSourceStatus();
            this.lastRefresh = new Date();
        }
        catch (error) {
            console.error("Failed to load data:", error);
            throw error;
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Update status for all data sources
     */
    updateSourceStatus() {
        // Group ingestion results by source
        const resultsBySource = new Map();
        for (const result of this.ingestionResults) {
            const source = result.communication.source;
            if (!resultsBySource.has(source)) {
                resultsBySource.set(source, []);
            }
            const sourceResults = resultsBySource.get(source);
            if (sourceResults) {
                sourceResults.push(result);
            }
        }
        // Update status for each source
        for (const [source, results] of resultsBySource.entries()) {
            const status = this.sourceStatus.get(source);
            if (status) {
                status.lastRefresh = this.lastRefresh;
                status.communicationCount = results.length;
                status.errorCount = results.filter(r => !r.success).length;
            }
        }
    }
    /**
     * Get ingestion statistics
     */
    getIngestionStatistics() {
        return this.ingestionPipeline.getStatistics(this.ingestionResults);
    }
    /**
     * Get all communications
     */
    getCommunications() {
        return this.communications;
    }
    /**
     * Get communications filtered by source
     */
    getCommunicationsBySource(source) {
        return this.communications.filter(comm => comm.source === source);
    }
    /**
     * Get communications filtered by project
     */
    getCommunicationsByProject(project) {
        return this.communications.filter(comm => comm.project === project);
    }
    /**
     * Get communications filtered by date range
     */
    getCommunicationsByDateRange(startDate, endDate) {
        return this.communications.filter(comm => {
            const commDate = new Date(comm.timestamp);
            return commDate >= startDate && commDate <= endDate;
        });
    }
    /**
     * Get communications with advanced filtering
     */
    filterCommunications(filter) {
        return this.communications.filter(comm => {
            var _a;
            // Filter by sources
            if (filter.sources && filter.sources.length > 0) {
                if (!filter.sources.includes(comm.source)) {
                    return false;
                }
            }
            // Filter by projects
            if (filter.projects && filter.projects.length > 0) {
                if (!filter.projects.includes(comm.project)) {
                    return false;
                }
            }
            // Filter by date range
            if (filter.startDate || filter.endDate) {
                const commDate = new Date(comm.timestamp);
                if (filter.startDate && commDate < filter.startDate) {
                    return false;
                }
                if (filter.endDate && commDate > filter.endDate) {
                    return false;
                }
            }
            // Filter by senders
            if (filter.senders && filter.senders.length > 0) {
                if (!filter.senders.includes(comm.senderName)) {
                    return false;
                }
            }
            // Filter by categories
            if (filter.categories && filter.categories.length > 0) {
                if (!filter.categories.includes(comm.metadata.category)) {
                    return false;
                }
            }
            // Filter by tags
            if (filter.tags && filter.tags.length > 0) {
                const commTags = Array.isArray(comm.metadata.tags) ? comm.metadata.tags : [];
                if (!filter.tags.some(tag => commTags.includes(tag))) {
                    return false;
                }
            }
            // Filter by urgency
            if (filter.urgency && filter.urgency.length > 0) {
                if (!filter.urgency.includes(comm.metadata.urgency)) {
                    return false;
                }
            }
            // Filter by relationships
            if (filter.hasRelationships) {
                if (!comm.relationships || comm.relationships.length === 0) {
                    return false;
                }
                // Filter by relationship types
                if (filter.relationshipTypes && filter.relationshipTypes.length > 0) {
                    if (!comm.relationships.some(rel => filter.relationshipTypes && filter.relationshipTypes.includes(rel.type))) {
                        return false;
                    }
                }
            }
            // Filter by dimension scores
            if (filter.dimensionScores) {
                const scores = (_a = comm.dimensions) === null || _a === void 0 ? void 0 : _a.confidenceScores;
                if (!scores) {
                    return false;
                }
                if (filter.dimensionScores.temporal !== undefined &&
                    scores.temporal < filter.dimensionScores.temporal) {
                    return false;
                }
                if (filter.dimensionScores.relationship !== undefined &&
                    scores.relationship < filter.dimensionScores.relationship) {
                    return false;
                }
                if (filter.dimensionScores.visual !== undefined &&
                    scores.visual < filter.dimensionScores.visual) {
                    return false;
                }
                if (filter.dimensionScores.analytical !== undefined &&
                    scores.analytical < filter.dimensionScores.analytical) {
                    return false;
                }
            }
            // Filter by search text
            if (filter.searchText) {
                const lowerQuery = filter.searchText.toLowerCase();
                if (!comm.subject.toLowerCase().includes(lowerQuery) &&
                    !comm.content.toLowerCase().includes(lowerQuery) &&
                    !comm.senderName.toLowerCase().includes(lowerQuery)) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Get communications optimized for a specific archetype
     */
    getCommunicationsForArchetype(archetype) {
        // Sort and filter communications based on archetype
        switch (archetype) {
            case "prioritizer":
                // Sort by urgency and deadline
                return [...this.communications].sort((a, b) => {
                    var _a, _b, _c, _d;
                    // First sort by urgency
                    const urgencyOrder = { high: 0, medium: 1, low: 2 };
                    const urgencyDiff = urgencyOrder[a.metadata.urgency] - urgencyOrder[b.metadata.urgency];
                    if (urgencyDiff !== 0)
                        return urgencyDiff;
                    // Then sort by deadline if available
                    if (((_b = (_a = a.dimensions) === null || _a === void 0 ? void 0 : _a.temporal) === null || _b === void 0 ? void 0 : _b.deadline) && ((_d = (_c = b.dimensions) === null || _c === void 0 ? void 0 : _c.temporal) === null || _d === void 0 ? void 0 : _d.deadline)) {
                        const aDeadline = new Date(a.dimensions.temporal.deadline);
                        const bDeadline = new Date(b.dimensions.temporal.deadline);
                        return aDeadline.getTime() - bDeadline.getTime();
                    }
                    // Fall back to timestamp
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                });
            case "connector":
                // Group by sender and relationship strength
                return [...this.communications].sort((a, b) => {
                    // First sort by sender
                    const senderDiff = a.senderName.localeCompare(b.senderName);
                    if (senderDiff !== 0)
                        return senderDiff;
                    // Then sort by relationship strength if available
                    const aStrength = this.getRelationshipStrength(a);
                    const bStrength = this.getRelationshipStrength(b);
                    return bStrength - aStrength; // Higher strength first
                });
            case "visualizer":
                // Group by visual category and project
                return [...this.communications].sort((a, b) => {
                    var _a, _b, _c, _d;
                    // First sort by visual category
                    const aCategory = ((_b = (_a = a.dimensions) === null || _a === void 0 ? void 0 : _a.visual) === null || _b === void 0 ? void 0 : _b.visualCategory) || "text-only";
                    const bCategory = ((_d = (_c = b.dimensions) === null || _c === void 0 ? void 0 : _c.visual) === null || _d === void 0 ? void 0 : _d.visualCategory) || "text-only";
                    const categoryDiff = aCategory.localeCompare(bCategory);
                    if (categoryDiff !== 0)
                        return categoryDiff;
                    // Then sort by project
                    return a.project.localeCompare(b.project);
                });
            case "analyst":
                // Group by category and complexity
                return [...this.communications].sort((a, b) => {
                    var _a, _b, _c, _d, _e, _f;
                    // First sort by category
                    const categoryDiff = a.metadata.category.localeCompare(b.metadata.category);
                    if (categoryDiff !== 0)
                        return categoryDiff;
                    // Then sort by complexity if available
                    const aComplexity = ((_c = (_b = (_a = a.dimensions) === null || _a === void 0 ? void 0 : _a.analytical) === null || _b === void 0 ? void 0 : _b.metrics) === null || _c === void 0 ? void 0 : _c.complexity) || "medium";
                    const bComplexity = ((_f = (_e = (_d = b.dimensions) === null || _d === void 0 ? void 0 : _d.analytical) === null || _e === void 0 ? void 0 : _e.metrics) === null || _f === void 0 ? void 0 : _f.complexity) || "medium";
                    const complexityOrder = { high: 0, medium: 1, low: 2 };
                    return complexityOrder[aComplexity] - complexityOrder[bComplexity];
                });
            default:
                return this.communications;
        }
    }
    /**
     * Get the relationship strength for a communication
     */
    getRelationshipStrength(communication) {
        if (!communication.relationships || communication.relationships.length === 0) {
            return 0;
        }
        // Calculate average relationship strength
        const totalStrength = communication.relationships.reduce((sum, rel) => sum + rel.strength, 0);
        return totalStrength / communication.relationships.length;
    }
    /**
     * Get communications with cross-project relationships
     */
    getCrossProjectCommunications() {
        return this.communications.filter(comm => {
            if (!comm.relationships)
                return false;
            // Find project relationships that aren't the primary project
            return comm.relationships.some(rel => {
                var _a;
                return rel.type === "project" &&
                    rel.value !== comm.project &&
                    ((_a = rel.metadata) === null || _a === void 0 ? void 0 : _a.primary) === false;
            });
        });
    }
    /**
     * Get related communications for a specific communication
     */
    getRelatedCommunications(communicationId) {
        const communication = this.communications.find(comm => comm.id === communicationId);
        if (!communication || !communication.relationships) {
            return [];
        }
        // Collect all related communication IDs
        const relatedIds = new Set();
        for (const relationship of communication.relationships) {
            if (relationship.relatedCommunicationIds) {
                for (const id of relationship.relatedCommunicationIds) {
                    relatedIds.add(id);
                }
            }
        }
        // Find the related communications
        return this.communications.filter(comm => relatedIds.has(comm.id));
    }
    /**
     * Search communications by text
     */
    searchCommunications(query) {
        const lowerQuery = query.toLowerCase();
        return this.communications.filter(comm => comm.subject.toLowerCase().includes(lowerQuery) ||
            comm.content.toLowerCase().includes(lowerQuery) ||
            comm.senderName.toLowerCase().includes(lowerQuery) ||
            (comm.metadata.category && comm.metadata.category.toLowerCase().includes(lowerQuery)) ||
            (Array.isArray(comm.metadata.tags) &&
                comm.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))));
    }
    /**
     * Get loading status
     */
    isDataLoading() {
        return this.isLoading;
    }
    /**
     * Get last refresh time
     */
    getLastRefreshTime() {
        return this.lastRefresh;
    }
    /**
     * Get communications grouped by dimension
     */
    getCommunicationsByDimension(dimensionType, threshold = 0.7) {
        var _a, _b, _c, _d, _e, _f;
        const result = {};
        for (const communication of this.communications) {
            if (!communication.dimensions)
                continue;
            // Check if the dimension confidence exceeds the threshold
            const confidenceScore = (_a = communication.dimensions.confidenceScores) === null || _a === void 0 ? void 0 : _a[dimensionType];
            if (!confidenceScore || confidenceScore < threshold)
                continue;
            // Group by different properties based on dimension type
            let key;
            switch (dimensionType) {
                case "temporal":
                    // Group by urgency
                    key = ((_b = communication.dimensions.temporal) === null || _b === void 0 ? void 0 : _b.urgency) || "unknown";
                    break;
                case "relationship":
                    // Group by connection strength
                    key = ((_c = communication.dimensions.relationship) === null || _c === void 0 ? void 0 : _c.connectionStrength) || "unknown";
                    break;
                case "visual":
                    // Group by visual category
                    key = ((_d = communication.dimensions.visual) === null || _d === void 0 ? void 0 : _d.visualCategory) || "unknown";
                    break;
                case "analytical":
                    // Group by complexity
                    key = ((_f = (_e = communication.dimensions.analytical) === null || _e === void 0 ? void 0 : _e.metrics) === null || _f === void 0 ? void 0 : _f.complexity) || "unknown";
                    break;
                default:
                    key = "unknown";
            }
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(communication);
        }
        return result;
    }
}
exports.UnifiedDataService = UnifiedDataService;
//# sourceMappingURL=UnifiedDataService.js.map