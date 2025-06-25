"use strict";
// RelationshipDetector.ts
// Detects relationships between communications across projects
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipDetector = void 0;
class RelationshipDetector {
    constructor() {
        // In-memory cache of processed communications for relationship detection
        this.communicationCache = new Map();
    }
    /**
     * Detect relationships for a communication
     */
    async detectRelationships(communication, dimensions) {
        const relationships = [];
        // Add communication to cache for future relationship detection
        this.communicationCache.set(communication.id, communication);
        // Detect person-based relationships
        this.detectPersonRelationships(communication, dimensions, relationships);
        // Detect topic-based relationships
        this.detectTopicRelationships(communication, dimensions, relationships);
        // Detect location-based relationships
        this.detectLocationRelationships(communication, dimensions, relationships);
        // Detect time-based relationships
        this.detectTimeRelationships(communication, dimensions, relationships);
        // Detect document-based relationships
        this.detectDocumentRelationships(communication, dimensions, relationships);
        // Detect cross-project relationships
        this.detectCrossProjectRelationships(communication, dimensions, relationships);
        return relationships;
    }
    /**
     * Detect relationships based on people
     */
    detectPersonRelationships(communication, dimensions, relationships) {
        var _a, _b;
        // Add relationship for the sender
        if (communication.senderName) {
            relationships.push({
                type: "person",
                value: communication.senderName,
                strength: 0.8,
                metadata: {
                    role: "sender",
                    email: communication.sender
                }
            });
        }
        // Add relationships for people mentioned in the content
        if ((_b = (_a = dimensions.analytical) === null || _a === void 0 ? void 0 : _a.entities) === null || _b === void 0 ? void 0 : _b.people) {
            for (const person of dimensions.analytical.entities.people) {
                // Skip the sender to avoid duplication
                if (person === communication.senderName)
                    continue;
                relationships.push({
                    type: "person",
                    value: person,
                    strength: 0.6,
                    metadata: {
                        role: "mentioned",
                        context: this.extractContextForPerson(communication, person)
                    }
                });
            }
        }
        // Find related communications from the same sender
        const relatedBySender = Array.from(this.communicationCache.values())
            .filter(comm => comm.id !== communication.id &&
            comm.senderName === communication.senderName)
            .map(comm => comm.id);
        if (relatedBySender.length > 0 && communication.senderName) {
            // Update the sender relationship with related communications
            const senderRelationship = relationships.find(r => r.type === "person" && r.value === communication.senderName);
            if (senderRelationship) {
                senderRelationship.relatedCommunicationIds = relatedBySender;
            }
        }
    }
    /**
     * Extract context for a person mentioned in a communication
     */
    extractContextForPerson(communication, person) {
        const content = communication.content;
        const personIndex = content.indexOf(person);
        if (personIndex === -1)
            return "";
        // Extract a snippet of text around the person mention
        const start = Math.max(0, personIndex - 50);
        const end = Math.min(content.length, personIndex + person.length + 50);
        return content.substring(start, end).trim();
    }
    /**
     * Detect relationships based on topics
     */
    detectTopicRelationships(communication, dimensions, relationships) {
        var _a, _b, _c, _d;
        // Add relationship for the category
        if ((_a = communication.metadata) === null || _a === void 0 ? void 0 : _a.category) {
            relationships.push({
                type: "topic",
                value: communication.metadata.category,
                strength: 0.7,
                metadata: {
                    type: "category"
                }
            });
        }
        // Add relationships for concepts
        if ((_c = (_b = dimensions.analytical) === null || _b === void 0 ? void 0 : _b.entities) === null || _c === void 0 ? void 0 : _c.concepts) {
            for (const concept of dimensions.analytical.entities.concepts) {
                relationships.push({
                    type: "topic",
                    value: concept,
                    strength: 0.6,
                    metadata: {
                        type: "concept"
                    }
                });
            }
        }
        // Add relationships for tags
        if ((_d = dimensions.analytical) === null || _d === void 0 ? void 0 : _d.tags) {
            for (const tag of dimensions.analytical.tags) {
                relationships.push({
                    type: "topic",
                    value: tag,
                    strength: 0.5,
                    metadata: {
                        type: "tag"
                    }
                });
            }
        }
        // Find related communications with the same topics
        const topics = relationships
            .filter(r => r.type === "topic")
            .map(r => r.value);
        if (topics.length > 0) {
            const relatedByTopic = Array.from(this.communicationCache.values())
                .filter(comm => {
                var _a, _b, _c, _d, _e, _f;
                if (comm.id === communication.id)
                    return false;
                // Check if the communication has any of the same topics
                if (((_a = comm.metadata) === null || _a === void 0 ? void 0 : _a.category) && topics.includes(comm.metadata.category)) {
                    return true;
                }
                if ((_c = (_b = comm.dimensions) === null || _b === void 0 ? void 0 : _b.analytical) === null || _c === void 0 ? void 0 : _c.tags) {
                    for (const tag of comm.dimensions.analytical.tags) {
                        if (topics.includes(tag))
                            return true;
                    }
                }
                if ((_f = (_e = (_d = comm.dimensions) === null || _d === void 0 ? void 0 : _d.analytical) === null || _e === void 0 ? void 0 : _e.entities) === null || _f === void 0 ? void 0 : _f.concepts) {
                    for (const concept of comm.dimensions.analytical.entities.concepts) {
                        if (topics.includes(concept))
                            return true;
                    }
                }
                return false;
            })
                .map(comm => comm.id);
            // Update topic relationships with related communications
            for (const relationship of relationships) {
                if (relationship.type === "topic") {
                    relationship.relatedCommunicationIds = relatedByTopic;
                }
            }
        }
    }
    /**
     * Detect relationships based on locations
     */
    detectLocationRelationships(communication, dimensions, relationships) {
        var _a, _b, _c, _d, _e, _f;
        // Add relationships for locations
        if ((_b = (_a = dimensions.visual) === null || _a === void 0 ? void 0 : _a.spatialContext) === null || _b === void 0 ? void 0 : _b.location) {
            relationships.push({
                type: "location",
                value: dimensions.visual.spatialContext.location,
                strength: 0.7,
                metadata: {
                    coordinates: dimensions.visual.spatialContext.coordinates
                }
            });
        }
        if ((_d = (_c = dimensions.analytical) === null || _c === void 0 ? void 0 : _c.entities) === null || _d === void 0 ? void 0 : _d.locations) {
            for (const location of dimensions.analytical.entities.locations) {
                // Skip if already added from spatial context
                if (((_f = (_e = dimensions.visual) === null || _e === void 0 ? void 0 : _e.spatialContext) === null || _f === void 0 ? void 0 : _f.location) === location)
                    continue;
                relationships.push({
                    type: "location",
                    value: location,
                    strength: 0.6
                });
            }
        }
        // Find related communications with the same locations
        const locations = relationships
            .filter(r => r.type === "location")
            .map(r => r.value);
        if (locations.length > 0) {
            const relatedByLocation = Array.from(this.communicationCache.values())
                .filter(comm => {
                var _a, _b, _c, _d, _e, _f;
                if (comm.id === communication.id)
                    return false;
                // Check if the communication has any of the same locations
                if (((_c = (_b = (_a = comm.dimensions) === null || _a === void 0 ? void 0 : _a.visual) === null || _b === void 0 ? void 0 : _b.spatialContext) === null || _c === void 0 ? void 0 : _c.location) &&
                    locations.includes(comm.dimensions.visual.spatialContext.location)) {
                    return true;
                }
                if ((_f = (_e = (_d = comm.dimensions) === null || _d === void 0 ? void 0 : _d.analytical) === null || _e === void 0 ? void 0 : _e.entities) === null || _f === void 0 ? void 0 : _f.locations) {
                    for (const location of comm.dimensions.analytical.entities.locations) {
                        if (locations.includes(location))
                            return true;
                    }
                }
                return false;
            })
                .map(comm => comm.id);
            // Update location relationships with related communications
            for (const relationship of relationships) {
                if (relationship.type === "location") {
                    relationship.relatedCommunicationIds = relatedByLocation;
                }
            }
        }
    }
    /**
     * Detect relationships based on time
     */
    detectTimeRelationships(communication, dimensions, relationships) {
        var _a, _b;
        // Add relationship for the timestamp
        const date = new Date(communication.timestamp);
        const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
        relationships.push({
            type: "time",
            value: dateString,
            strength: 0.5,
            metadata: {
                fullTimestamp: communication.timestamp
            }
        });
        // Add relationship for the deadline if it exists
        if ((_a = dimensions.temporal) === null || _a === void 0 ? void 0 : _a.deadline) {
            relationships.push({
                type: "time",
                value: dimensions.temporal.deadline,
                strength: 0.8,
                metadata: {
                    type: "deadline",
                    daysUntil: (_b = dimensions.temporal.timeContext) === null || _b === void 0 ? void 0 : _b.daysUntilDeadline
                }
            });
        }
        // Find related communications with the same date or deadline
        const timeValues = relationships
            .filter(r => r.type === "time")
            .map(r => r.value);
        if (timeValues.length > 0) {
            const relatedByTime = Array.from(this.communicationCache.values())
                .filter(comm => {
                var _a, _b;
                if (comm.id === communication.id)
                    return false;
                // Check if the communication has the same date
                const commDate = new Date(comm.timestamp);
                const commDateString = commDate.toISOString().split("T")[0];
                if (timeValues.includes(commDateString)) {
                    return true;
                }
                // Check if the communication has the same deadline
                if (((_b = (_a = comm.dimensions) === null || _a === void 0 ? void 0 : _a.temporal) === null || _b === void 0 ? void 0 : _b.deadline) &&
                    timeValues.includes(comm.dimensions.temporal.deadline)) {
                    return true;
                }
                return false;
            })
                .map(comm => comm.id);
            // Update time relationships with related communications
            for (const relationship of relationships) {
                if (relationship.type === "time") {
                    relationship.relatedCommunicationIds = relatedByTime;
                }
            }
        }
    }
    /**
     * Detect relationships based on documents
     */
    detectDocumentRelationships(communication, dimensions, relationships) {
        var _a, _b;
        // Add relationship for the document type if it exists
        if ((_a = dimensions.visual) === null || _a === void 0 ? void 0 : _a.documentType) {
            relationships.push({
                type: "document",
                value: dimensions.visual.documentType,
                strength: 0.6,
                metadata: {
                    hasImages: dimensions.visual.hasImages,
                    visualElements: dimensions.visual.visualElements
                }
            });
        }
        // Find related communications with the same document type
        if ((_b = dimensions.visual) === null || _b === void 0 ? void 0 : _b.documentType) {
            const relatedByDocumentType = Array.from(this.communicationCache.values())
                .filter(comm => {
                var _a, _b;
                return comm.id !== communication.id &&
                    ((_b = (_a = comm.dimensions) === null || _a === void 0 ? void 0 : _a.visual) === null || _b === void 0 ? void 0 : _b.documentType) === dimensions.visual.documentType;
            })
                .map(comm => comm.id);
            // Update document relationship with related communications
            const documentRelationship = relationships.find(r => r.type === "document" && r.value === dimensions.visual.documentType);
            if (documentRelationship) {
                documentRelationship.relatedCommunicationIds = relatedByDocumentType;
            }
        }
    }
    /**
     * Detect cross-project relationships
     */
    detectCrossProjectRelationships(communication, _dimensions, // Use underscore prefix to indicate intentionally unused parameter
    relationships) {
        // Add relationship for the project
        if (communication.project) {
            relationships.push({
                type: "project",
                value: communication.project,
                strength: 0.9,
                metadata: {
                    primary: true
                }
            });
        }
        // Check for cross-project relationships
        const content = communication.content.toLowerCase();
        const subject = communication.subject.toLowerCase();
        const combinedText = `${subject} ${content}`;
        // Define cross-project keywords
        const crossProjectKeywords = {
            "Home Purchase": [
                "house", "property", "mortgage", "real estate", "loan", "inspection",
                "closing", "escrow", "agent", "broker", "home", "purchase", "buy"
            ],
            "Career Change": [
                "job", "interview", "resume", "cover letter", "application", "position",
                "career", "employment", "hiring", "recruiter", "salary", "offer"
            ],
            "Family Event": [
                "family", "event", "reunion", "party", "celebration", "gathering",
                "invitation", "rsvp", "guest", "venue", "catering", "decoration"
            ]
        };
        // Check for keywords from other projects
        for (const [project, keywords] of Object.entries(crossProjectKeywords)) {
            // Skip the current project
            if (project === communication.project)
                continue;
            // Check if any keywords from this project are in the text
            const matchingKeywords = keywords.filter(keyword => combinedText.includes(keyword.toLowerCase()));
            if (matchingKeywords.length > 0) {
                relationships.push({
                    type: "project",
                    value: project,
                    strength: 0.4 + (matchingKeywords.length * 0.05),
                    metadata: {
                        primary: false,
                        matchingKeywords
                    }
                });
            }
        }
        // Find related communications from other projects
        const crossProjectRelationships = relationships.filter(r => r.type === "project" && r.value !== communication.project);
        for (const relationship of crossProjectRelationships) {
            const relatedByProject = Array.from(this.communicationCache.values())
                .filter(comm => comm.id !== communication.id &&
                comm.project === relationship.value)
                .map(comm => comm.id);
            relationship.relatedCommunicationIds = relatedByProject;
        }
    }
    /**
     * Clear the communication cache
     */
    clearCache() {
        this.communicationCache.clear();
    }
    /**
     * Add a batch of communications to the cache
     */
    addToCache(communications) {
        for (const communication of communications) {
            this.communicationCache.set(communication.id, communication);
        }
    }
}
exports.RelationshipDetector = RelationshipDetector;
//# sourceMappingURL=RelationshipDetector.js.map