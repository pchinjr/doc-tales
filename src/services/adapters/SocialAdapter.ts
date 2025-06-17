// Task 3: Implement Source Adapters - Social Media Adapter
import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
import { DimensionExtractor } from "../DimensionExtractor";

export class SocialAdapter extends BaseSourceAdapter {
  private mockData: any[] = [];
  private dimensionExtractor: DimensionExtractor;
  
  constructor(sourceType: SourceType = "Twitter") {
    super(sourceType, "social");
    this.dimensionExtractor = new DimensionExtractor();
    this.loadMockData();
  }
  
  private loadMockData(): void {
    // In a real implementation, this would connect to a social media API
    // For the hackathon MVP, we'll use hardcoded sample data
    this.mockData = [
      {
        id: "social-001",
        platform: "Twitter",
        content: "Just toured the house on Maple Street. The neighborhood is perfect! #HouseHunting #DreamHome",
        author: {
          name: "User",
          handle: "@user",
          id: "user-001"
        },
        mentions: [],
        timestamp: "2025-06-02T13:25:00Z",
        likes: 5,
        shares: 2,
        comments: 3,
        commenters: [
          {
            name: "Real Estate Agent",
            handle: "@realestateagent",
            id: "contact-007"
          },
          {
            name: "Friend",
            handle: "@friend",
            id: "contact-008"
          }
        ],
        project: "Home Purchase",
        urgency: "low",
        category: "updates",
        hasMedia: true,
        mediaType: "image",
        mediaCount: 2,
        location: "Maple Street, Springfield"
      },
      {
        id: "social-002",
        platform: "LinkedIn",
        content: "Excited to share that I'm interviewing for a Senior Developer position at TechCorp next week! Any advice from my network on their interview process? #CareerMove #TechJobs",
        author: {
          name: "User",
          handle: "user-linkedin",
          id: "user-001"
        },
        mentions: [],
        timestamp: "2025-06-06T10:15:00Z",
        likes: 24,
        shares: 0,
        comments: 8,
        commenters: [
          {
            name: "Former Colleague",
            handle: "former-colleague",
            id: "contact-009"
          },
          {
            name: "Industry Contact",
            handle: "industry-contact",
            id: "contact-010"
          },
          {
            name: "Michael Chen",
            handle: "michael-chen",
            id: "contact-002"
          }
        ],
        project: "Career Change",
        urgency: "medium",
        category: "networking",
        hasMedia: false,
        mediaCount: 0
      },
      {
        id: "social-003",
        platform: "Twitter",
        content: "@aunt_lisa Count me in for the family reunion! I can help with the games and activities. #FamilyTime",
        author: {
          name: "User",
          handle: "@user",
          id: "user-001"
        },
        mentions: [
          {
            name: "Aunt Lisa",
            handle: "@aunt_lisa",
            id: "contact-003"
          }
        ],
        timestamp: "2025-06-01T18:40:00Z",
        likes: 3,
        shares: 0,
        comments: 2,
        commenters: [
          {
            name: "Aunt Lisa",
            handle: "@aunt_lisa",
            id: "contact-003"
          },
          {
            name: "Uncle Bob",
            handle: "@uncle_bob",
            id: "contact-004"
          }
        ],
        project: "Family Event",
        urgency: "low",
        category: "planning",
        hasMedia: false,
        mediaCount: 0
      }
    ];
    
    this.connected = true;
  }
  
  public async fetchCommunications(): Promise<Communication[]> {
    if (!this.connected) {
      throw new Error("Not connected to social media source");
    }
    
    // Transform mock data into standardized Communication objects
    return this.mockData.map(post => {
      // Create a basic communication object
      const communication: Partial<Communication> = {
        id: post.id,
        commType: "social",
        source: this.sourceType,
        timestamp: post.timestamp,
        subject: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
        content: post.content,
        project: post.project,
        sender: post.author.handle,
        senderName: post.author.name,
        metadata: {
          urgency: post.urgency,
          category: post.category,
          platform: post.platform,
          likes: post.likes,
          shares: post.shares,
          comments: post.comments,
          hasMedia: post.hasMedia,
          mediaType: post.mediaType,
          mediaCount: post.mediaCount,
          location: post.location
        }
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
    // In a real implementation, this would authenticate with the social media platform
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
