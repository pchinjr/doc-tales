import { DocumentParser, RawDocument } from "../DocumentParser";
import * as fs from "fs";
import * as path from "path";

describe("DocumentParser", () => {
  const parser = new DocumentParser();
  
  // Helper function to read test data files
  const readTestFile = (filename: string): string => {
    return fs.readFileSync(path.join(__dirname, "test-data", filename), "utf-8");
  };
  
  test("parses a text document correctly", async () => {
    const rawDocument: RawDocument = {
      id: "doc-001",
      filename: "Home-Inspection-Report.pdf",
      contentType: "application/pdf",
      size: 350000,
      content: readTestFile("document-text.txt"),
      source: "Google Drive",
      metadata: {
        title: "Home Inspection Report",
        author: "Robert Williams",
        authorEmail: "rwilliams@homeinspect.com",
        dateCreated: "2025-06-03T15:20:00Z",
        dateModified: "2025-06-03T16:45:00Z",
        pageCount: 15,
        hasImages: true,
        imageCount: 12,
        tableCount: 3,
        location: "123 Main Street, Springfield"
      }
    };
    
    const result = await parser.parseDocument(rawDocument);
    
    expect(result.id).toBe("doc-001");
    expect(result.commType).toBe("document");
    expect(result.source).toBe("Google Drive");
    expect(result.subject).toBe("Home Inspection Report");
    expect(result.sender).toBe("rwilliams@homeinspect.com");
    expect(result.senderName).toBe("Robert Williams");
    expect(result.content).toContain("This comprehensive inspection report");
    expect(result.content).toContain("Roof shingles showing signs of wear");
    expect(result.metadata.fileType).toBe("PDF");
    expect(result.metadata.fileSize).toBe(350000);
    expect(result.metadata.hasImages).toBe(true);
    expect(result.metadata.imageCount).toBe(12);
    expect(result.metadata.tableCount).toBe(3);
    expect(result.metadata.pageCount).toBe(15);
    expect(result.metadata.location).toBe("123 Main Street, Springfield");
  });
  
  test("parses a resume document correctly", async () => {
    const rawDocument: RawDocument = {
      id: "doc-002",
      filename: "Resume-Final-Version.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 450000,
      content: readTestFile("document-resume.txt"),
      source: "Email Attachment",
      metadata: {
        title: "Resume - Final Version",
        author: "John Smith",
        authorEmail: "john.smith@example.com",
        dateCreated: "2025-05-28T11:10:00Z",
        dateModified: "2025-06-08T20:15:00Z",
        pageCount: 2,
        hasImages: false,
        imageCount: 0,
        tableCount: 1
      }
    };
    
    const result = await parser.parseDocument(rawDocument);
    
    expect(result.id).toBe("doc-002");
    expect(result.commType).toBe("document");
    expect(result.source).toBe("Email Attachment");
    expect(result.subject).toBe("Resume - Final Version");
    expect(result.sender).toBe("john.smith@example.com");
    expect(result.senderName).toBe("John Smith");
    expect(result.content).toContain("Software Developer");
    expect(result.content).toContain("PROFESSIONAL EXPERIENCE");
    expect(result.metadata.fileType).toBe("Word");
    expect(result.metadata.fileSize).toBe(450000);
    expect(result.metadata.hasImages).toBe(false);
    expect(result.metadata.imageCount).toBe(0);
    expect(result.metadata.tableCount).toBe(1);
    expect(result.metadata.pageCount).toBe(2);
    expect(result.metadata.wordCount).toBeGreaterThan(300);
  });
  
  test("parses a budget document correctly", async () => {
    const rawDocument: RawDocument = {
      id: "doc-003",
      filename: "Family-Reunion-Budget.xlsx",
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 250000,
      content: readTestFile("document-budget.txt"),
      source: "Google Drive",
      metadata: {
        title: "Family Reunion Budget",
        author: "Uncle Bob",
        authorEmail: "bob.family@gmail.com",
        dateCreated: "2025-06-04T14:30:00Z",
        dateModified: "2025-06-04T14:30:00Z",
        pageCount: 1,
        hasImages: false,
        imageCount: 0,
        chartCount: 2,
        tableCount: 3
      }
    };
    
    const result = await parser.parseDocument(rawDocument);
    
    expect(result.id).toBe("doc-003");
    expect(result.commType).toBe("document");
    expect(result.source).toBe("Google Drive");
    expect(result.subject).toBe("Family Reunion Budget");
    expect(result.sender).toBe("bob.family@gmail.com");
    expect(result.senderName).toBe("Uncle Bob");
    expect(result.content).toContain("FAMILY REUNION BUDGET");
    expect(result.content).toContain("Total Estimated Cost: $2,000");
    expect(result.metadata.fileType).toBe("Excel");
    expect(result.metadata.fileSize).toBe(250000);
    expect(result.metadata.hasImages).toBe(false);
    expect(result.metadata.chartCount).toBe(2);
    expect(result.metadata.tableCount).toBe(3);
    expect(result.metadata.category).toBe("finance");
  });
  
  test("handles documents with missing metadata", async () => {
    const rawDocument: RawDocument = {
      id: "doc-004",
      filename: "simple-text.txt",
      contentType: "text/plain",
      size: 1024,
      content: "This is a simple text document with no metadata.",
      source: "Google Drive"
    };
    
    const result = await parser.parseDocument(rawDocument);
    
    expect(result.id).toBe("doc-004");
    expect(result.commType).toBe("document");
    expect(result.source).toBe("Google Drive");
    expect(result.subject).toBe("simple-text");
    expect(result.sender).toBe("unknown@example.com");
    expect(result.senderName).toBe("Unknown Author");
    expect(result.content).toBe("This is a simple text document with no metadata.");
    expect(result.metadata.fileType).toBe("Text");
    expect(result.metadata.fileSize).toBe(1024);
    expect(result.metadata.hasImages).toBe(false);
  });
  
  test("determines document type correctly from filename", async () => {
    const testCases = [
      { filename: "document.pdf", expectedType: "PDF" },
      { filename: "document.docx", expectedType: "Word" },
      { filename: "document.doc", expectedType: "Word" },
      { filename: "spreadsheet.xlsx", expectedType: "Excel" },
      { filename: "spreadsheet.xls", expectedType: "Excel" },
      { filename: "presentation.pptx", expectedType: "PowerPoint" },
      { filename: "presentation.ppt", expectedType: "PowerPoint" },
      { filename: "image.jpg", expectedType: "Image" },
      { filename: "image.png", expectedType: "Image" },
      { filename: "unknown.xyz", expectedType: "Unknown" }
    ];
    
    for (const testCase of testCases) {
      const rawDocument: RawDocument = {
        id: `doc-${testCase.filename}`,
        filename: testCase.filename,
        contentType: "application/octet-stream",
        size: 1024,
        content: "Test content",
        source: "Google Drive"
      };
      
      const result = await parser.parseDocument(rawDocument);
      expect(result.metadata.fileType).toBe(testCase.expectedType);
    }
  });
  
  test("determines urgency correctly", async () => {
    // High urgency document
    const highUrgencyDoc: RawDocument = {
      id: "urgent-doc",
      filename: "urgent-document.txt",
      contentType: "text/plain",
      size: 1024,
      content: "This document is URGENT and requires immediate attention!",
      source: "Email Attachment"
    };
    
    const highResult = await parser.parseDocument(highUrgencyDoc);
    expect(highResult.metadata.urgency).toBe("high");
    
    // Low urgency document
    const lowUrgencyDoc: RawDocument = {
      id: "low-urgency-doc",
      filename: "fyi-document.txt",
      contentType: "text/plain",
      size: 1024,
      content: "This is just for your information, no rush.",
      source: "Email Attachment"
    };
    
    const lowResult = await parser.parseDocument(lowUrgencyDoc);
    expect(lowResult.metadata.urgency).toBe("low");
    
    // Document with explicit urgency in metadata
    const metadataUrgencyDoc: RawDocument = {
      id: "metadata-urgency-doc",
      filename: "document.txt",
      contentType: "text/plain",
      size: 1024,
      content: "Regular content",
      source: "Email Attachment",
      metadata: {
        urgency: "high"
      }
    };
    
    const metadataResult = await parser.parseDocument(metadataUrgencyDoc);
    expect(metadataResult.metadata.urgency).toBe("high");
  });
});
