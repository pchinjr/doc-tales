// Task 3: Implement Source Adapters - Email Adapter
import { BaseSourceAdapter } from '../SourceAdapter';
import { Communication, SourceType } from '../../types/communication';
import { DimensionExtractor } from '../DimensionExtractor';

export class EmailAdapter extends BaseSourceAdapter {
  private mockData: any[] = [];
  private dimensionExtractor: DimensionExtractor;
  
  constructor(sourceType: SourceType = 'gmail') {
    super(sourceType, 'email');
    this.dimensionExtractor = new DimensionExtractor();
    this.loadMockData();
  }
  
  private loadMockData(): void {
    // In a real implementation, this would connect to an email API
    // For the hackathon MVP, we'll use hardcoded sample data
    this.mockData = [
      {
        id: 'email-001',
        subject: 'Mortgage Pre-Approval Update',
        from: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@bankofamerica.com',
          id: 'contact-001'
        },
        to: [
          {
            name: 'User',
            email: 'user@example.com',
            id: 'user-001'
          }
        ],
        date: '2025-06-05T10:30:00Z',
        body: 'Good news! Your mortgage pre-approval has been processed. We need to schedule a follow-up call to discuss the details. Are you available tomorrow at 2pm?',
        project: 'home-purchase',
        urgency: 'high',
        category: 'finance',
        hasAttachments: true,
        attachments: [
          {
            id: 'att-001',
            name: 'Pre-Approval-Letter.pdf',
            type: 'application/pdf',
            size: 245000
          }
        ]
      },
      {
        id: 'email-002',
        subject: 'Interview Confirmation',
        from: {
          name: 'Michael Chen',
          email: 'mchen@techcorp.com',
          id: 'contact-002'
        },
        to: [
          {
            name: 'User',
            email: 'user@example.com',
            id: 'user-001'
          }
        ],
        date: '2025-06-07T14:15:00Z',
        body: 'This email confirms your interview for the Senior Developer position on Monday at 10:00 AM. Please prepare a 15-minute presentation on your past projects. Looking forward to meeting you!',
        project: 'career-change',
        urgency: 'high',
        category: 'interviews',
        hasAttachments: false,
        attachments: []
      },
      {
        id: 'email-003',
        subject: 'Family Reunion Planning',
        from: {
          name: 'Aunt Lisa',
          email: 'lisa.family@gmail.com',
          id: 'contact-003'
        },
        to: [
          {
            name: 'User',
            email: 'user@example.com',
            id: 'user-001'
          },
          {
            name: 'Uncle Bob',
            email: 'bob.family@gmail.com',
            id: 'contact-004'
          }
        ],
        date: '2025-06-01T09:45:00Z',
        body: 'Hi everyone! I'm thinking about hosting the family reunion at my place this year. Would July 15th work for everyone? Please let me know your thoughts on food and activities we should plan.',
        project: 'family-event',
        urgency: 'medium',
        category: 'planning',
        hasAttachments: true,
        attachments: [
          {
            id: 'att-002',
            name: 'last-reunion-photos.zip',
            type: 'application/zip',
            size: 15400000
          }
        ]
      }
    ];
    
    this.connected = true;
  }
  
  public async fetchCommunications(): Promise<Communication[]> {
    if (!this.connected) {
      throw new Error('Not connected to email source');
    }
    
    // Transform mock data into standardized Communication objects
    return this.mockData.map(email => {
      // Create a basic communication object
      const communication: Partial<Communication> = {
        id: email.id,
        type: 'email',
        source: this.sourceType,
        timestamp: email.date,
        subject: email.subject,
        content: email.body,
        project: email.project,
        sender: {
          id: email.from.id,
          name: email.from.name,
          email: email.from.email,
          projects: [email.project]
        },
        recipients: email.to.map((recipient: any) => ({
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          projects: [email.project]
        })),
        attachments: email.attachments.map((att: any) => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size
        })),
        metadata: {
          urgency: email.urgency,
          category: email.category,
          read: false,
          flagged: false,
          sourceSpecific: {
            isStarred: email.id === 'email-001', // Example of source-specific data
            folder: email.project === 'home-purchase' ? 'Important' : 'Inbox'
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
    // In a real implementation, this would authenticate with the email provider
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
