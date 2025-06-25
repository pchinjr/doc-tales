"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentAdapter = void 0;
// Enhanced Document Adapter with Document Parser
const SourceAdapter_1 = require("../SourceAdapter");
const DimensionExtractor_1 = require("../DimensionExtractor");
const DocumentParser_1 = require("../parsers/DocumentParser");
class DocumentAdapter extends SourceAdapter_1.BaseSourceAdapter {
    constructor(sourceType = "Email Attachment") {
        super(sourceType, "document");
        this.mockData = [];
        this.dimensionExtractor = new DimensionExtractor_1.DimensionExtractor();
        this.documentParser = new DocumentParser_1.DocumentParser();
        this.loadMockData();
    }
    loadMockData() {
        // In a real implementation, this would connect to a document storage API
        // For the hackathon MVP, we'll use hardcoded sample data
        this.mockData = [
            {
                id: "doc-001",
                filename: "Home-Inspection-Report.pdf",
                contentType: "application/pdf",
                size: 3500000,
                content: "This comprehensive inspection report details the condition of the property at 123 Main Street. Several issues were identified that require attention: 1) Roof shingles showing signs of wear, 2) Minor water damage in basement, 3) Electrical panel needs updating. Overall, the property is in good condition with these exceptions.",
                source: this.sourceType,
                metadata: {
                    title: "Home Inspection Report",
                    author: "Robert Williams",
                    authorEmail: "rwilliams@homeinspect.com",
                    dateCreated: "2025-06-03T15:20:00Z",
                    dateModified: "2025-06-03T16:45:00Z",
                    hasImages: true,
                    imageCount: 12,
                    tableCount: 3,
                    pageCount: 15,
                    location: "123 Main Street"
                }
            },
            {
                id: "doc-002",
                filename: "Resume-Final-Version.docx",
                contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                size: 450000,
                content: "Professional resume highlighting 10+ years of experience in software development. Skills include: JavaScript, TypeScript, React, Node.js, AWS, and team leadership. Previous roles at TechCorp, InnovateSoft, and DevStudio with progressive responsibility.",
                source: this.sourceType,
                metadata: {
                    title: "Resume - Final Version",
                    author: "User",
                    authorEmail: "user@example.com",
                    dateCreated: "2025-05-28T11:10:00Z",
                    dateModified: "2025-06-08T20:15:00Z",
                    hasImages: false,
                    imageCount: 0,
                    tableCount: 1,
                    pageCount: 2
                }
            },
            {
                id: "doc-003",
                filename: "Family-Reunion-Budget.xlsx",
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                size: 250000,
                content: "Budget breakdown for family reunion: Venue rental: $500, Food and beverages: $750, Activities and games: $200, Decorations: $150, Photography: $300, Miscellaneous: $100. Total estimated cost: $2,000. Suggested contribution per family: $250.",
                source: this.sourceType,
                metadata: {
                    title: "Family Reunion Budget",
                    author: "Uncle Bob",
                    authorEmail: "bob.family@gmail.com",
                    dateCreated: "2025-06-04T14:30:00Z",
                    dateModified: "2025-06-04T14:30:00Z",
                    hasImages: false,
                    imageCount: 0,
                    chartCount: 2,
                    tableCount: 3,
                    pageCount: 1
                }
            }
        ];
        this.connected = true;
    }
    async fetchCommunications() {
        if (!this.connected) {
            throw new Error("Not connected to document source");
        }
        const communications = [];
        // Process each raw document
        for (const rawDocument of this.mockData) {
            try {
                // Parse the raw document
                const parsedDocument = await this.documentParser.parseDocument(rawDocument);
                // Add project information (in a real implementation, this would be determined by classification)
                let project;
                if (rawDocument.filename.includes("Inspection")) {
                    project = "Home Purchase";
                }
                else if (rawDocument.filename.includes("Resume")) {
                    project = "Career Change";
                }
                else {
                    project = "Family Event";
                }
                parsedDocument.project = project;
                // Extract dimensions
                const dimensions = this.dimensionExtractor.extractDimensions(parsedDocument);
                // Create the final communication object
                const communication = {
                    ...parsedDocument,
                    dimensions
                };
                communications.push(communication);
            }
            catch (error) {
                console.error(`Failed to process document ${rawDocument.id}:`, error);
            }
        }
        return communications;
    }
    async connect() {
        // In a real implementation, this would authenticate with the document provider
        this.connected = true;
        return true;
    }
    async disconnect() {
        this.connected = false;
        return true;
    }
    async refreshData() {
        // In a real implementation, this would fetch fresh data
        this.loadMockData();
        return true;
    }
}
exports.DocumentAdapter = DocumentAdapter;
//# sourceMappingURL=DocumentAdapter.js.map