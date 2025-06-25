"use strict";
// ClassificationService.ts
// Provides classification of communications into projects, categories, and urgency levels
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassificationService = void 0;
class ClassificationService {
    constructor() {
        // Project-specific keywords for classification
        this.projectKeywords = {
            "Home Purchase": [
                "house", "property", "mortgage", "real estate", "loan", "inspection",
                "closing", "escrow", "agent", "broker", "home", "purchase", "buy",
                "offer", "appraisal", "insurance", "title", "deed"
            ],
            "Career Change": [
                "job", "interview", "resume", "cover letter", "application", "position",
                "career", "employment", "hiring", "recruiter", "salary", "offer",
                "skills", "experience", "reference", "portfolio", "assessment"
            ],
            "Family Event": [
                "family", "event", "reunion", "party", "celebration", "gathering",
                "invitation", "rsvp", "guest", "venue", "catering", "decoration",
                "schedule", "planning", "organize", "gift", "photo", "memory"
            ]
        };
        // Category keywords for classification
        this.categoryKeywords = {
            "finance": [
                "money", "payment", "cost", "budget", "expense", "price", "fee",
                "mortgage", "loan", "interest", "rate", "deposit", "credit", "debit",
                "bank", "financial", "fund", "investment", "tax", "insurance"
            ],
            "planning": [
                "plan", "schedule", "organize", "arrangement", "preparation",
                "timeline", "agenda", "calendar", "date", "time", "coordination",
                "logistics", "strategy", "checklist", "task", "to-do", "reminder"
            ],
            "document": [
                "document", "file", "form", "application", "contract", "agreement",
                "certificate", "report", "statement", "record", "receipt", "invoice",
                "letter", "email", "attachment", "pdf", "spreadsheet", "presentation"
            ],
            "communication": [
                "message", "contact", "call", "phone", "email", "text", "chat",
                "discussion", "conversation", "meeting", "appointment", "conference",
                "interview", "consultation", "feedback", "response", "reply", "follow-up"
            ],
            "social": [
                "social", "friend", "family", "relative", "colleague", "acquaintance",
                "relationship", "connection", "network", "community", "group", "team",
                "gathering", "event", "party", "celebration", "invitation", "guest"
            ]
        };
        // Urgency keywords for classification
        this.urgencyKeywords = {
            "high": [
                "urgent", "immediate", "asap", "emergency", "critical", "important",
                "priority", "deadline", "due", "required", "necessary", "essential",
                "crucial", "vital", "pressing", "time-sensitive", "now", "today"
            ],
            "medium": [
                "soon", "next", "upcoming", "approaching", "scheduled", "planned",
                "expected", "anticipated", "pending", "waiting", "follow-up", "reminder",
                "check", "review", "consider", "attention", "notice", "this week"
            ],
            "low": [
                "sometime", "eventually", "when convenient", "no rush", "take your time",
                "optional", "voluntary", "discretionary", "flexible", "casual", "relaxed",
                "leisurely", "whenever", "if possible", "might", "could", "next month"
            ]
        };
    }
    /**
     * Classify a communication into a project, category, and urgency level
     */
    async classifyCommunication(communication, dimensions) {
        // If the communication already has a project, use it
        if (communication.project) {
            return this.enhanceExistingClassification(communication, dimensions);
        }
        // Otherwise, classify from scratch
        return this.classifyFromScratch(communication, dimensions);
    }
    /**
     * Enhance an existing classification with additional metadata
     */
    enhanceExistingClassification(communication, dimensions) {
        var _a, _b, _c;
        // Start with existing project
        const project = communication.project;
        // Determine category
        const category = ((_a = communication.metadata) === null || _a === void 0 ? void 0 : _a.category) || this.determineCategory(communication, dimensions);
        // Extract tags
        const existingTags = Array.isArray((_b = communication.metadata) === null || _b === void 0 ? void 0 : _b.tags)
            ? communication.metadata.tags
            : [];
        const tags = [...existingTags, ...this.extractTags(communication, dimensions)];
        // Determine urgency
        const urgency = ((_c = communication.metadata) === null || _c === void 0 ? void 0 : _c.urgency) || this.determineUrgency(communication, dimensions);
        // Calculate confidence
        const confidence = this.calculateConfidence(communication, dimensions, project);
        return {
            project,
            category,
            tags: [...new Set(tags)],
            urgency: urgency,
            confidence
        };
    }
    /**
     * Classify a communication from scratch
     */
    classifyFromScratch(communication, dimensions) {
        // Determine project
        const project = this.determineProject(communication, dimensions);
        // Determine category
        const category = this.determineCategory(communication, dimensions);
        // Extract tags
        const tags = this.extractTags(communication, dimensions);
        // Determine urgency
        const urgency = this.determineUrgency(communication, dimensions);
        // Calculate confidence
        const confidence = this.calculateConfidence(communication, dimensions, project);
        return {
            project,
            category,
            tags,
            urgency,
            confidence
        };
    }
    /**
     * Determine the project for a communication
     */
    determineProject(communication, dimensions) {
        var _a, _b, _c, _d;
        const content = communication.content.toLowerCase();
        const subject = communication.subject.toLowerCase();
        const combinedText = `${subject} ${content}`;
        // Calculate scores for each project
        const scores = {
            "Home Purchase": 0,
            "Career Change": 0,
            "Family Event": 0
        };
        // Score based on keyword matches
        for (const [project, keywords] of Object.entries(this.projectKeywords)) {
            for (const keyword of keywords) {
                if (combinedText.includes(keyword.toLowerCase())) {
                    scores[project] += 1;
                }
            }
        }
        // Score based on dimensions
        if ((_a = dimensions.relationship) === null || _a === void 0 ? void 0 : _a.context.personal) {
            scores["Family Event"] += 2;
        }
        if ((_b = dimensions.relationship) === null || _b === void 0 ? void 0 : _b.context.professional) {
            scores["Career Change"] += 2;
        }
        if ((_c = dimensions.relationship) === null || _c === void 0 ? void 0 : _c.context.projectSpecific) {
            scores["Home Purchase"] += 2;
        }
        // Check for specific entities in analytical dimension
        if ((_d = dimensions.analytical) === null || _d === void 0 ? void 0 : _d.entities) {
            const entities = dimensions.analytical.entities;
            // Check for home-related locations
            if (entities.locations.some(loc => loc.toLowerCase().includes("house") ||
                loc.toLowerCase().includes("property") ||
                loc.toLowerCase().includes("home"))) {
                scores["Home Purchase"] += 2;
            }
            // Check for job-related organizations
            if (entities.organizations.some(org => org.toLowerCase().includes("company") ||
                org.toLowerCase().includes("corp") ||
                org.toLowerCase().includes("inc"))) {
                scores["Career Change"] += 2;
            }
            // Check for family-related concepts
            if (entities.concepts.some(concept => concept.toLowerCase().includes("family") ||
                concept.toLowerCase().includes("reunion") ||
                concept.toLowerCase().includes("gathering"))) {
                scores["Family Event"] += 2;
            }
        }
        // Find the project with the highest score
        let highestScore = 0;
        let highestProject = "Home Purchase"; // Default
        for (const [project, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestProject = project;
            }
        }
        return highestProject;
    }
    /**
     * Determine the category for a communication
     */
    determineCategory(communication, dimensions) {
        var _a, _b;
        // Use dimensions to enhance category detection if available
        if (((_b = (_a = dimensions.analytical) === null || _a === void 0 ? void 0 : _a.categories) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            return dimensions.analytical.categories[0];
        }
        const content = communication.content.toLowerCase();
        const subject = communication.subject.toLowerCase();
        const combinedText = `${subject} ${content}`;
        // Calculate scores for each category
        const scores = {};
        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            scores[category] = 0;
            for (const keyword of keywords) {
                if (combinedText.includes(keyword.toLowerCase())) {
                    scores[category] += 1;
                }
            }
        }
        // Find the category with the highest score
        let highestScore = 0;
        let highestCategory = "general"; // Default
        for (const [category, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestCategory = category;
            }
        }
        return highestCategory;
    }
    /**
     * Extract tags for a communication
     */
    extractTags(communication, dimensions) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const tags = [];
        // Add project as a tag
        if (communication.project) {
            tags.push(communication.project);
        }
        // Add category as a tag
        if ((_a = communication.metadata) === null || _a === void 0 ? void 0 : _a.category) {
            tags.push(communication.metadata.category);
        }
        // Add urgency as a tag
        if ((_b = communication.metadata) === null || _b === void 0 ? void 0 : _b.urgency) {
            tags.push(communication.metadata.urgency);
        }
        // Add sender name as a tag
        if (communication.senderName) {
            tags.push(communication.senderName);
        }
        // Add analytical dimension tags
        if ((_c = dimensions.analytical) === null || _c === void 0 ? void 0 : _c.tags) {
            tags.push(...dimensions.analytical.tags);
        }
        // Add temporal dimension tags
        if ((_d = dimensions.temporal) === null || _d === void 0 ? void 0 : _d.urgency) {
            tags.push(dimensions.temporal.urgency);
        }
        if ((_f = (_e = dimensions.temporal) === null || _e === void 0 ? void 0 : _e.timeContext) === null || _f === void 0 ? void 0 : _f.requiresAction) {
            tags.push("action-required");
        }
        if ((_h = (_g = dimensions.temporal) === null || _g === void 0 ? void 0 : _g.timeContext) === null || _h === void 0 ? void 0 : _h.isRecent) {
            tags.push("recent");
        }
        // Add relationship dimension tags
        if ((_j = dimensions.relationship) === null || _j === void 0 ? void 0 : _j.connectionStrength) {
            tags.push(dimensions.relationship.connectionStrength);
        }
        if ((_k = dimensions.relationship) === null || _k === void 0 ? void 0 : _k.frequency) {
            tags.push(dimensions.relationship.frequency);
        }
        // Add visual dimension tags
        if ((_l = dimensions.visual) === null || _l === void 0 ? void 0 : _l.visualCategory) {
            tags.push(dimensions.visual.visualCategory);
        }
        if ((_m = dimensions.visual) === null || _m === void 0 ? void 0 : _m.hasImages) {
            tags.push("has-images");
        }
        if ((_o = dimensions.visual) === null || _o === void 0 ? void 0 : _o.documentType) {
            tags.push(dimensions.visual.documentType);
        }
        return [...new Set(tags)]; // Remove duplicates
    }
    /**
     * Determine the urgency for a communication
     */
    determineUrgency(communication, dimensions) {
        var _a, _b, _c, _d, _e, _f;
        // If temporal dimension has urgency, use it
        if ((_a = dimensions.temporal) === null || _a === void 0 ? void 0 : _a.urgency) {
            return dimensions.temporal.urgency;
        }
        const content = communication.content.toLowerCase();
        const subject = communication.subject.toLowerCase();
        const combinedText = `${subject} ${content}`;
        // Calculate scores for each urgency level
        const scores = {
            "high": 0,
            "medium": 0,
            "low": 0
        };
        // Score based on keyword matches
        for (const [urgency, keywords] of Object.entries(this.urgencyKeywords)) {
            for (const keyword of keywords) {
                if (combinedText.includes(keyword.toLowerCase())) {
                    scores[urgency] += 1;
                }
            }
        }
        // Check for deadline in temporal dimension
        if ((_b = dimensions.temporal) === null || _b === void 0 ? void 0 : _b.deadline) {
            // If deadline is within 3 days, high urgency
            if (((_c = dimensions.temporal.timeContext) === null || _c === void 0 ? void 0 : _c.daysUntilDeadline) !== undefined &&
                dimensions.temporal.timeContext.daysUntilDeadline <= 3) {
                scores["high"] += 3;
            }
            // If deadline is within a week, medium urgency
            else if (((_d = dimensions.temporal.timeContext) === null || _d === void 0 ? void 0 : _d.daysUntilDeadline) !== undefined &&
                dimensions.temporal.timeContext.daysUntilDeadline <= 7) {
                scores["medium"] += 2;
            }
            // Otherwise, low urgency
            else {
                scores["low"] += 1;
            }
        }
        // Check if action is required
        if ((_f = (_e = dimensions.temporal) === null || _e === void 0 ? void 0 : _e.timeContext) === null || _f === void 0 ? void 0 : _f.requiresAction) {
            scores["high"] += 1;
        }
        // Find the urgency with the highest score
        let highestScore = 0;
        let highestUrgency = "medium"; // Default
        for (const [urgency, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestUrgency = urgency;
            }
        }
        return highestUrgency;
    }
    /**
     * Calculate confidence in the classification
     */
    calculateConfidence(communication, dimensions, project) {
        // Start with a base confidence
        let confidence = 0.5;
        // If project was explicitly set, high confidence
        if (communication.project === project) {
            confidence += 0.3;
        }
        // Check for strong keyword matches
        const content = communication.content.toLowerCase();
        const subject = communication.subject.toLowerCase();
        const combinedText = `${subject} ${content}`;
        let keywordMatches = 0;
        for (const keyword of this.projectKeywords[project]) {
            if (combinedText.includes(keyword.toLowerCase())) {
                keywordMatches++;
            }
        }
        // Adjust confidence based on keyword matches
        if (keywordMatches > 5) {
            confidence += 0.2;
        }
        else if (keywordMatches > 2) {
            confidence += 0.1;
        }
        // Adjust based on dimension confidence scores
        if (dimensions.confidenceScores) {
            // For project-specific adjustments
            switch (project) {
                case "Home Purchase":
                    confidence += dimensions.confidenceScores.analytical * 0.1;
                    break;
                case "Career Change":
                    confidence += dimensions.confidenceScores.temporal * 0.1;
                    break;
                case "Family Event":
                    confidence += dimensions.confidenceScores.relationship * 0.1;
                    break;
            }
        }
        // Ensure confidence is between 0 and 1
        return Math.max(0, Math.min(1, confidence));
    }
}
exports.ClassificationService = ClassificationService;
//# sourceMappingURL=ClassificationService.js.map