"use strict";
// DocumentParser.ts
// Transforms document files into structured Communication objects
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentParser = void 0;
class DocumentParser {
    /**
     * Parse a raw document into a structured Communication object
     */
    async parseDocument(rawDocument) {
        try {
            // Extract document information
            const id = rawDocument.id;
            const timestamp = new Date().toISOString(); // Use current time or extract from metadata
            const subject = this.extractSubject(rawDocument);
            const content = await this.extractContent(rawDocument);
            // Extract sender information (if available)
            const { senderName, senderEmail } = this.extractAuthor(rawDocument);
            // Create a partial Communication object
            const communication = {
                id,
                commType: "document",
                source: rawDocument.source,
                timestamp,
                subject,
                content,
                sender: senderEmail || "unknown@example.com",
                senderName: senderName || "Unknown Author",
                metadata: {
                    urgency: this.determineUrgency(rawDocument),
                    category: this.determineCategory(rawDocument),
                    fileType: this.getFileType(rawDocument),
                    fileSize: rawDocument.size,
                    filename: rawDocument.filename,
                    contentType: rawDocument.contentType,
                    hasImages: this.hasImages(rawDocument),
                    pageCount: this.getPageCount(rawDocument),
                    chartCount: this.getChartCount(rawDocument),
                    tableCount: this.getTableCount(rawDocument),
                    imageCount: this.getImageCount(rawDocument),
                    wordCount: this.getWordCount(content),
                    ...rawDocument.metadata
                }
            };
            return communication;
        }
        catch (error) {
            console.error("Failed to parse document:", error);
            throw new Error(`Document parsing failed: ${error}`);
        }
    }
    /**
     * Extract the subject/title from a document
     */
    extractSubject(document) {
        var _a;
        // Try to get title from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.title) {
            return document.metadata.title;
        }
        // Fall back to filename without extension
        return document.filename.replace(/\.[^/.]+$/, "");
    }
    /**
     * Extract content from a document
     */
    async extractContent(document) {
        // In a real implementation, we would use different parsers based on file type
        // For example, pdf.js for PDFs, mammoth for Word documents, etc.
        // For now, if content is already a string, return it
        if (typeof document.content === "string") {
            return document.content;
        }
        // If content is a Buffer, convert to string
        if (Buffer.isBuffer(document.content)) {
            // This is a simplification - in reality, we'd need proper parsing based on file type
            return document.content.toString("utf-8");
        }
        // If we can't extract content, return a placeholder
        return `[Content of ${document.filename} could not be extracted]`;
    }
    /**
     * Extract author information from a document
     */
    extractAuthor(document) {
        var _a, _b;
        let senderName = "";
        let senderEmail = "";
        // Try to get author from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.author) {
            senderName = document.metadata.author;
        }
        // Try to get email from metadata
        if ((_b = document.metadata) === null || _b === void 0 ? void 0 : _b.authorEmail) {
            senderEmail = document.metadata.authorEmail;
        }
        return { senderName, senderEmail };
    }
    /**
     * Determine if a document has images
     */
    hasImages(document) {
        var _a;
        // Check metadata for image count
        if (((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.imageCount) && document.metadata.imageCount > 0) {
            return true;
        }
        // Check content type for image types
        if (document.contentType.startsWith("image/")) {
            return true;
        }
        // For PDFs, Word docs, etc., we'd need to parse the content
        // This is a simplification
        return false;
    }
    /**
     * Get the file type from a document
     */
    getFileType(document) {
        var _a;
        // Extract file extension from filename
        const extension = ((_a = document.filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
        // Map common extensions to file types
        const fileTypeMap = {
            "pdf": "PDF",
            "doc": "Word",
            "docx": "Word",
            "xls": "Excel",
            "xlsx": "Excel",
            "ppt": "PowerPoint",
            "pptx": "PowerPoint",
            "txt": "Text",
            "csv": "CSV",
            "jpg": "Image",
            "jpeg": "Image",
            "png": "Image",
            "gif": "Image"
        };
        return fileTypeMap[extension] || "Unknown";
    }
    /**
     * Get the page count from a document
     */
    getPageCount(document) {
        var _a;
        // Try to get page count from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.pageCount) {
            return document.metadata.pageCount;
        }
        // For text content, estimate based on content length
        if (typeof document.content === "string") {
            // Rough estimate: 3000 characters per page
            return Math.ceil(document.content.length / 3000);
        }
        // Default to 1 page
        return 1;
    }
    /**
     * Get the chart count from a document
     */
    getChartCount(document) {
        var _a;
        // Try to get chart count from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.chartCount) {
            return document.metadata.chartCount;
        }
        // In a real implementation, we would analyze the document content
        // For now, return 0
        return 0;
    }
    /**
     * Get the table count from a document
     */
    getTableCount(document) {
        var _a;
        // Try to get table count from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.tableCount) {
            return document.metadata.tableCount;
        }
        // In a real implementation, we would analyze the document content
        // For now, return 0
        return 0;
    }
    /**
     * Get the image count from a document
     */
    getImageCount(document) {
        var _a;
        // Try to get image count from metadata
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.imageCount) {
            return document.metadata.imageCount;
        }
        // If the document itself is an image, count as 1
        if (document.contentType.startsWith("image/")) {
            return 1;
        }
        // In a real implementation, we would analyze the document content
        // For now, return 0
        return 0;
    }
    /**
     * Get the word count from document content
     */
    getWordCount(content) {
        // Simple word count: split by whitespace and count
        return content.split(/\s+/).filter(Boolean).length;
    }
    /**
     * Determine the urgency of a document based on content and metadata
     */
    determineUrgency(document) {
        var _a;
        // Check metadata for urgency
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.urgency) {
            const urgency = document.metadata.urgency.toLowerCase();
            if (urgency === "high" || urgency === "medium" || urgency === "low") {
                return urgency;
            }
        }
        // Check content for urgency indicators
        if (typeof document.content === "string") {
            const content = document.content.toLowerCase();
            if (content.includes("urgent") ||
                content.includes("immediate") ||
                content.includes("asap") ||
                content.includes("emergency")) {
                return "high";
            }
            if (content.includes("no rush") ||
                content.includes("when convenient") ||
                content.includes("fyi") ||
                content.includes("for your information")) {
                return "low";
            }
        }
        // Default to medium urgency
        return "medium";
    }
    /**
     * Determine the category of a document based on content and metadata
     */
    determineCategory(document) {
        var _a;
        // Check metadata for category
        if ((_a = document.metadata) === null || _a === void 0 ? void 0 : _a.category) {
            return document.metadata.category;
        }
        // Check filename and content type for category hints
        const filename = document.filename.toLowerCase();
        if (filename.includes("invoice") ||
            filename.includes("receipt") ||
            filename.includes("payment")) {
            return "finance";
        }
        if (filename.includes("schedule") ||
            filename.includes("plan") ||
            filename.includes("agenda")) {
            return "planning";
        }
        if (filename.includes("contract") ||
            filename.includes("agreement") ||
            filename.includes("form")) {
            return "document";
        }
        // Check content for category indicators
        if (typeof document.content === "string") {
            const content = document.content.toLowerCase();
            // Define category keywords
            const categoryKeywords = {
                "finance": [
                    "invoice", "payment", "bill", "receipt", "transaction", "money",
                    "financial", "budget", "expense", "cost", "price", "fee", "tax"
                ],
                "planning": [
                    "schedule", "plan", "agenda", "calendar", "event", "meeting",
                    "appointment", "reservation", "booking", "itinerary", "timeline"
                ],
                "document": [
                    "document", "file", "form", "application", "contract",
                    "agreement", "report", "statement", "certificate", "license"
                ],
                "communication": [
                    "message", "update", "notification", "announcement", "newsletter",
                    "bulletin", "alert", "reminder", "follow-up", "response", "reply"
                ],
                "social": [
                    "invitation", "party", "celebration", "gathering", "event",
                    "rsvp", "congratulations", "thank you", "greeting", "welcome"
                ]
            };
            // Count keyword matches for each category
            const scores = {};
            for (const [category, keywords] of Object.entries(categoryKeywords)) {
                scores[category] = 0;
                for (const keyword of keywords) {
                    if (content.includes(keyword)) {
                        scores[category]++;
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
        // Default to "document" category
        return "document";
    }
}
exports.DocumentParser = DocumentParser;
//# sourceMappingURL=DocumentParser.js.map