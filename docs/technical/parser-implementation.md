# Parser Implementation Guide

## Overview

This document describes the implementation of source parsers in the Doc-Tales application. These parsers transform raw data from various sources (emails, documents, social media) into structured Communication objects that can be processed by the ingestion pipeline.

## Architecture

The parser system consists of three main components:

1. **Source Parsers**: Transform raw data into structured Communication objects
   - EmailParser: Parses raw email data
   - DocumentParser: Parses document files
   - SocialParser: Parses social media posts

2. **Source Adapters**: Connect to data sources and use parsers to transform data
   - EmailAdapter: Connects to email providers
   - DocumentAdapter: Connects to document storage providers
   - SocialAdapter: Connects to social media platforms

3. **Ingestion Pipeline**: Processes the structured Communications through dimension extraction, classification, and relationship detection

## Parser Implementations

### EmailParser

The `EmailParser` transforms raw email data into structured Communication objects:

```typescript
// EmailParser.ts
export interface RawEmail {
  id: string;
  raw: string | Buffer;
  source: SourceType;
}

export class EmailParser {
  public async parseEmail(rawEmail: RawEmail): Promise<Partial<Communication>> {
    // Parse the raw email
    const { headers, body } = this.parseRawEmail(rawEmail.raw.toString());
    
    // Extract metadata and content
    const subject = this.getHeaderValue(headers, 'Subject') || "(No Subject)";
    const { senderName, senderEmail } = this.parseSender(this.getHeaderValue(headers, 'From') || '');
    
    // Create Communication object
    return {
      id: rawEmail.id,
      commType: "email",
      source: rawEmail.source,
      subject,
      content: body,
      sender: senderEmail,
      senderName,
      metadata: {
        urgency: this.determineUrgency(headers, body),
        category: this.determineCategory(subject, body),
        // Additional metadata...
      }
    };
  }
  
  // Helper methods for parsing...
}
```

### DocumentParser

The `DocumentParser` transforms document files into structured Communication objects:

```typescript
// DocumentParser.ts
export interface RawDocument {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  content: string | Buffer;
  metadata?: Record<string, any>;
  source: SourceType;
}

export class DocumentParser {
  public async parseDocument(rawDocument: RawDocument): Promise<Partial<Communication>> {
    // Extract document information
    const subject = this.extractSubject(rawDocument);
    const content = await this.extractContent(rawDocument);
    const { senderName, senderEmail } = this.extractAuthor(rawDocument);
    
    // Create Communication object
    return {
      id: rawDocument.id,
      commType: "document",
      source: rawDocument.source,
      subject,
      content,
      sender: senderEmail || "unknown@example.com",
      senderName: senderName || "Unknown Author",
      metadata: {
        fileType: this.getFileType(rawDocument),
        urgency: this.determineUrgency(rawDocument),
        category: this.determineCategory(rawDocument),
        // Additional metadata...
      }
    };
  }
  
  // Helper methods for extraction...
}
```

### SocialParser

The `SocialParser` transforms social media posts into structured Communication objects:

```typescript
// SocialParser.ts
export interface RawSocialPost {
  id: string;
  platform: SourceType;
  timestamp: string;
  author: {
    id: string;
    name: string;
    username: string;
    profileUrl?: string;
  };
  content: string;
  mediaUrls?: string[];
  likes?: number;
  shares?: number;
  comments?: number;
  hashtags?: string[];
  mentions?: string[];
  urls?: string[];
  isReply?: boolean;
  replyToId?: string;
  replyToUser?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export class SocialParser {
  public async parseSocialPost(rawPost: RawSocialPost): Promise<Partial<Communication>> {
    // Generate a subject from the content
    const subject = this.generateSubject(rawPost);
    
    // Create Communication object
    return {
      id: rawPost.id,
      commType: "social",
      source: rawPost.platform,
      timestamp: rawPost.timestamp,
      subject,
      content: rawPost.content,
      sender: rawPost.author.username,
      senderName: rawPost.author.name,
      metadata: {
        platform: rawPost.platform,
        urgency: this.determineUrgency(rawPost),
        category: this.determineCategory(rawPost),
        // Additional metadata...
      }
    };
  }
  
  // Helper methods for parsing...
}
```

## Integration with Source Adapters

The source adapters use the parsers to transform raw data into structured Communication objects:

```typescript
// EmailAdapter.ts
export class EmailAdapter extends BaseSourceAdapter {
  private emailParser: EmailParser;
  
  public async fetchCommunications(): Promise<Communication[]> {
    const communications: Communication[] = [];
    
    for (const rawEmail of this.fetchRawEmails()) {
      // Parse the raw email
      const parsedEmail = await this.emailParser.parseEmail(rawEmail);
      
      // Add project information
      parsedEmail.project = this.determineProject(parsedEmail);
      
      // Extract dimensions
      const dimensions = this.dimensionExtractor.extractDimensions(parsedEmail as Communication);
      
      // Create the final communication object
      const communication: Communication = {
        ...parsedEmail as Communication,
        dimensions
      };
      
      communications.push(communication);
    }
    
    return communications;
  }
}
```

## Testing

The parsers are tested with a variety of input data to ensure they can handle different formats and edge cases:

```typescript
// EmailParser.test.ts
describe('EmailParser', () => {
  const parser = new EmailParser();
  
  test('parses a simple email correctly', async () => {
    const rawEmail: RawEmail = {
      id: 'test-email-1',
      source: 'Gmail',
      raw: readTestFile('email-simple.txt')
    };
    
    const result = await parser.parseEmail(rawEmail);
    
    expect(result.subject).toBe('Mortgage Pre-Approval Update');
    expect(result.sender).toBe('sarah.johnson@bankofamerica.com');
    expect(result.senderName).toBe('Sarah Johnson');
    expect(result.metadata?.urgency).toBe('high');
    // Additional assertions...
  });
  
  // Additional tests...
});
```

## Data Flow

1. **Raw Data Ingestion**:
   - Raw emails, documents, and social media posts are fetched from their respective sources.
   - Source parsers transform the raw data into structured Communication objects.

2. **Dimension Extraction**:
   - The `DimensionExtractor` analyzes each communication to extract temporal, relationship, visual, and analytical dimensions.
   - Confidence scores are calculated for each dimension.

3. **Classification**:
   - The `ClassificationService` categorizes communications into projects, categories, and urgency levels.
   - Tags are extracted based on content and dimensions.

4. **Relationship Detection**:
   - The `RelationshipDetector` identifies connections between communications.
   - Cross-project relationships are detected.

5. **Data Access**:
   - The `UnifiedDataService` provides a unified interface for accessing and filtering communications.
   - Communications can be viewed through different archetype lenses.

## Usage Examples

### Parsing Raw Data

```typescript
// Parse a raw email
const emailParser = new EmailParser();
const rawEmail = {
  id: "email-001",
  source: "Gmail",
  raw: "From: sender@example.com\nTo: recipient@example.com\nSubject: Hello\n\nThis is the email content."
};
const parsedEmail = await emailParser.parseEmail(rawEmail);

// Parse a raw document
const documentParser = new DocumentParser();
const rawDocument = {
  id: "doc-001",
  filename: "report.pdf",
  contentType: "application/pdf",
  size: 1024,
  content: "This is the document content.",
  source: "Google Drive"
};
const parsedDocument = await documentParser.parseDocument(rawDocument);

// Parse a raw social post
const socialParser = new SocialParser();
const rawPost = {
  id: "post-001",
  platform: "Twitter",
  timestamp: "2025-06-01T12:00:00Z",
  author: {
    id: "user-001",
    name: "User",
    username: "@user"
  },
  content: "This is a tweet #hashtag"
};
const parsedPost = await socialParser.parseSocialPost(rawPost);
```

## Benefits

1. **Standardization**: All parsers output the same structured Communication format.
2. **Extensibility**: New parsers can be added for additional data sources.
3. **Separation of Concerns**: Each parser is responsible for handling a specific type of raw data.
4. **Error Handling**: Each parser includes robust error handling for its specific data type.
5. **Metadata Extraction**: Each parser extracts source-specific metadata that can be used for classification and dimension extraction.

## Future Enhancements

1. **Advanced Parsing**: Enhance parsers with more sophisticated content analysis.
2. **Performance Optimization**: Optimize parsers for large datasets.
3. **Real-Time Processing**: Process communications in real-time as they arrive.
4. **Multi-Modal Analysis**: Extract dimensions from images, audio, and video.
5. **Machine Learning Integration**: Use ML models for better classification and metadata extraction.
