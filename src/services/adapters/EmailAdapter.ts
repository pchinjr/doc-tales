// Enhanced Email Adapter with Email Parser
import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
import { DimensionExtractor } from "../DimensionExtractor";
import { EmailParser, RawEmail } from "../parsers/EmailParser";

export class EmailAdapter extends BaseSourceAdapter {
  private mockData: RawEmail[] = [];
  private dimensionExtractor: DimensionExtractor;
  private emailParser: EmailParser;
  
  constructor(sourceType: SourceType = "Gmail") {
    super(sourceType, "email");
    this.dimensionExtractor = new DimensionExtractor();
    this.emailParser = new EmailParser();
    this.loadMockData();
  }
  
  private loadMockData(): void {
    // In a real implementation, this would connect to an email API
    // For the hackathon MVP, we'll use hardcoded sample data
    this.mockData = [
      {
        id: "email-001",
        source: this.sourceType,
        raw: `From: Sarah Johnson <sarah.johnson@bankofamerica.com>
To: User <user@example.com>
Subject: Mortgage Pre-Approval Update
Date: Sat, 5 Jun 2025 10:30:00 +0000
Content-Type: text/plain

Good news! Your mortgage pre-approval has been processed. We need to schedule a follow-up call to discuss the details. Are you available tomorrow at 2pm?

Best regards,
Sarah Johnson
Mortgage Specialist
Bank of America`
      },
      {
        id: "email-002",
        source: this.sourceType,
        raw: `From: Michael Chen <mchen@techcorp.com>
To: User <user@example.com>
Subject: Interview Confirmation
Date: Mon, 7 Jun 2025 14:15:00 +0000
Content-Type: text/plain
Importance: High

This email confirms your interview for the Senior Developer position on Monday at 10:00 AM. Please prepare a 15-minute presentation on your past projects. Looking forward to meeting you!

Best regards,
Michael Chen
Hiring Manager
TechCorp`
      },
      {
        id: "email-003",
        source: this.sourceType,
        raw: `From: Aunt Lisa <lisa.family@gmail.com>
To: User <user@example.com>, Uncle Bob <bob.family@gmail.com>
Subject: Family Reunion Planning
Date: Tue, 1 Jun 2025 09:45:00 +0000
Content-Type: text/plain

Hi everyone!

I'm thinking about hosting the family reunion at my place this year. Would July 15th work for everyone? Please let me know your thoughts on food and activities we should plan.

Love,
Aunt Lisa`
      }
    ];
    
    this.connected = true;
  }
  
  public async fetchCommunications(): Promise<Communication[]> {
    if (!this.connected) {
      throw new Error("Not connected to email source");
    }
    
    const communications: Communication[] = [];
    
    // Process each raw email
    for (const rawEmail of this.mockData) {
      try {
        // Parse the raw email
        const parsedEmail = await this.emailParser.parseEmail(rawEmail);
        
        // Add project information (in a real implementation, this would be determined by classification)
        let project: "Home Purchase" | "Career Change" | "Family Event";
        
        if (parsedEmail.subject?.includes("Mortgage")) {
          project = "Home Purchase";
        } else if (parsedEmail.subject?.includes("Interview")) {
          project = "Career Change";
        } else {
          project = "Family Event";
        }
        
        parsedEmail.project = project;
        
        // Extract dimensions
        const dimensions = this.dimensionExtractor.extractDimensions(parsedEmail as Communication);
        
        // Create the final communication object
        const communication: Communication = {
          ...parsedEmail as Communication,
          dimensions
        };
        
        communications.push(communication);
      } catch (error) {
        console.error(`Failed to process email ${rawEmail.id}:`, error);
      }
    }
    
    return communications;
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
