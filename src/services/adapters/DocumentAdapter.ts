// Task 3: Implement Source Adapters - Document Adapter
import { BaseSourceAdapter } from '../SourceAdapter';
import { Communication, SourceType } from '../../types/communication';
import { DimensionExtractor } from '../DimensionExtractor';

export class DocumentAdapter extends BaseSourceAdapter {
  private mockData: any[] = [];
  private dimensionExtractor: DimensionExtractor;
  
  constructor(sourceType: SourceType = 'dropbox') {
    super(sourceType, 'document');
    this.dimensionExtractor = new DimensionExtractor();
    this.loadMockData();
  }
  
  private loadMockData(): void {
    // In a real implementation, this would connect to a document storage API
    // For the hackathon MVP, we'll use hardcoded sample data
    this.mockData = [
      {
        id: 'doc-001',
        title: 'Home Inspection Report',
        creator: {
          name: 'Robert Williams',
          email: 'rwilliams@homeinspect.com',
          id: 'contact-005'
        },
        sharedWith: [
          {
            name: 'User',
            email: 'user@example.com',
            id: 'user-001'
          },
          {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@bankofamerica.com',
            id: 'contact-001'
          }
        ],
        dateCreated: '2025-06-03T15:20:00Z',
        dateModified: '2025-06-03T16:45:00Z',
        content: 'This comprehensive inspection report details the condition of the property at 123 Main Street. Several issues were identified that require attention: 1) Roof shingles showing signs of wear, 2) Minor water damage in basement, 3) Electrical panel needs updating. Overall, the property is in good condition with these exceptions.',
        project: 'home-purchase',
        urgency: 'medium',
        category: 'inspection',
        fileType: 'pdf',
        fileSize: 3500000,
        hasImages: true,
        imageCount: 12,
        hasCharts: false,
        hasTables: true,
        tableCount: 3
      },
      {
        id: 'doc-002',
        title: 'Resume - Final Version',
        creator: {
          name: 'User',
          email: 'user@example.com',
          id: 'user-001'
        },
        sharedWith: [
          {
            name: 'Career Coach',
            email: 'coach@careerservices.com',
            id: 'contact-006'
          }
        ],
        dateCreated: '2025-05-28T11:10:00Z',
        dateModified: '2025-06-08T20:15:00Z',
        content: 'Professional resume highlighting 10+ years of experience in software development. Skills include: JavaScript, TypeScript, React, Node.js, AWS, and team leadership. Previous roles at TechCorp, InnovateSoft, and DevStudio with progressive responsibility.',
        project: 'career-change',
        urgency: 'high',
        category: 'application',
        fileType: 'docx',
        fileSize: 450000,
        hasImages: false,
        imageCount: 0,
        hasCharts: false,
        hasTables: true,
        tableCount: 1
      },
      {
        id: 'doc-003',
        title: 'Family Reunion Budget',
        creator: {
          name: 'Uncle Bob',
          email: 'bob.family@gmail.com',
          id: 'contact-004'
        },
        sharedWith: [
          {
            name: 'User',
            email: 'user@example.com',
            id: 'user-001'
          },
          {
            name: 'Aunt Lisa',
            email: 'lisa.family@gmail.com',
            id: 'contact-003'
          }
        ],
        dateCreated: '2025-06-04T14:30:00Z',
        dateModified: '2025-06-04T14:30:00Z',
        content: 'Budget breakdown for family reunion: Venue rental: $500, Food and beverages: $750, Activities and games: $200, Decorations: $150, Photography: $300, Miscellaneous: $100. Total estimated cost: $2,000. Suggested contribution per family: $250.',
        project: 'family-event',
        urgency: 'low',
        category: 'finance',
        fileType: 'xlsx',
        fileSize: 250000,
        hasImages: false,
        imageCount: 0,
        hasCharts: true,
        hasTables: true,
        chartCount: 2,
        tableCount: 3
      }
    ];
    
    this.connected = true;
  }
  
  public async fetchCommunications(): Promise<Communication[]> {
    if (!this.connected) {
      throw new Error('Not connected to document source');
    }
    
    // Transform mock data into standardized Communication objects
    return this.mockData.map(doc => {
      // Create a basic communication object
      const communication: Partial<Communication> = {
        id: doc.id,
        type: 'document',
        source: this.sourceType,
        timestamp: doc.dateModified || doc.dateCreated,
        subject: doc.title,
        content: doc.content,
        project: doc.project,
        sender: {
          id: doc.creator.id,
          name: doc.creator.name,
          email: doc.creator.email,
          projects: [doc.project]
        },
        recipients: doc.sharedWith.map((recipient: any) => ({
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          projects: [doc.project]
        })),
        attachments: [],
        metadata: {
          urgency: doc.urgency,
          category: doc.category,
          read: false,
          flagged: false,
          sourceSpecific: {
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            dateCreated: doc.dateCreated,
            dateModified: doc.dateModified,
            hasImages: doc.hasImages,
            imageCount: doc.imageCount,
            hasCharts: doc.hasCharts,
            chartCount: doc.chartCount,
            hasTables: doc.hasTables,
            tableCount: doc.tableCount
          }
        },
        entities: [],
        relationships: []
      };
      
      // Extract dimensions using the dimension extractor
      const dimensions = this.dimensionExtractor.extractDimensions(communication as Communication);
      
      // Return the complete communication with dimensions
      return {
        ...communication,
        dimensions
      } as Communication;
    });
  }
  
  public async connect(): Promise<boolean> {
    // In a real implementation, this would authenticate with the document provider
    this.connected = true;
    return true;
  }
  
  public async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }
  
  public async refreshData(): Promise<boolean> {
    // In a real implementation, this would fetch fresh data
    this.loadMockData();
    return true;
  }
}
