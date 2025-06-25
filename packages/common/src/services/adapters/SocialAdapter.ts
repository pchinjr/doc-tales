// Enhanced Social Adapter with Social Parser
import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
import { DimensionExtractor } from "../DimensionExtractor";
import { SocialParser, RawSocialPost } from "../parsers/SocialParser";

export class SocialAdapter extends BaseSourceAdapter {
  private mockData: RawSocialPost[] = [];
  private dimensionExtractor: DimensionExtractor;
  private socialParser: SocialParser;
  
  constructor(sourceType: SourceType = "Twitter") {
    super(sourceType, "social");
    this.dimensionExtractor = new DimensionExtractor();
    this.socialParser = new SocialParser();
    this.loadMockData();
  }
  
  private loadMockData(): void {
    // In a real implementation, this would connect to a social media API
    // For the hackathon MVP, we'll use hardcoded sample data
    this.mockData = [
      {
        id: "social-001",
        platform: this.sourceType,
        timestamp: "2025-06-02T13:25:00Z",
        author: {
          id: "user-001",
          name: "User",
          username: "@user",
          profileUrl: "https://twitter.com/user"
        },
        content: "Just toured the house on Maple Street. The neighborhood is perfect! #HouseHunting #DreamHome",
        mediaUrls: [
          "https://example.com/images/house1.jpg",
          "https://example.com/images/house2.jpg"
        ],
        likes: 5,
        shares: 2,
        comments: 3,
        hashtags: ["HouseHunting", "DreamHome"],
        mentions: [],
        urls: [],
        isReply: false,
        location: "Maple Street, Springfield"
      },
      {
        id: "social-002",
        platform: "LinkedIn" as SourceType,
        timestamp: "2025-06-06T10:15:00Z",
        author: {
          id: "user-001",
          name: "User",
          username: "user-linkedin",
          profileUrl: "https://linkedin.com/in/user"
        },
        content: "Excited to share that I'm interviewing for a Senior Developer position at TechCorp next week! Any advice from my network on their interview process? #CareerMove #TechJobs",
        likes: 24,
        shares: 0,
        comments: 8,
        hashtags: ["CareerMove", "TechJobs"],
        mentions: [],
        urls: []
      },
      {
        id: "social-003",
        platform: this.sourceType,
        timestamp: "2025-06-01T18:40:00Z",
        author: {
          id: "user-001",
          name: "User",
          username: "@user",
          profileUrl: "https://twitter.com/user"
        },
        content: "@aunt_lisa Count me in for the family reunion! I can help with the games and activities. #FamilyTime",
        likes: 3,
        shares: 0,
        comments: 2,
        hashtags: ["FamilyTime"],
        mentions: ["aunt_lisa"],
        urls: [],
        isReply: true,
        replyToId: "some-tweet-id",
        replyToUser: "@aunt_lisa"
      }
    ];
    
    this.connected = true;
  }
  
  public async fetchCommunications(): Promise<Communication[]> {
    if (!this.connected) {
      throw new Error("Not connected to social media source");
    }
    
    const communications: Communication[] = [];
    
    // Process each raw social post
    for (const rawPost of this.mockData) {
      try {
        // Parse the raw social post
        const parsedPost = await this.socialParser.parseSocialPost(rawPost);
        
        // Add project information (in a real implementation, this would be determined by classification)
        let project: "Home Purchase" | "Career Change" | "Family Event";
        
        if (rawPost.content.includes("house") || rawPost.hashtags?.includes("HouseHunting")) {
          project = "Home Purchase";
        } else if (rawPost.content.includes("interview") || rawPost.content.includes("job")) {
          project = "Career Change";
        } else {
          project = "Family Event";
        }
        
        parsedPost.project = project;
        
        // Extract dimensions
        const dimensions = this.dimensionExtractor.extractDimensions(parsedPost as Communication);
        
        // Create the final communication object
        const communication: Communication = {
          ...parsedPost as Communication,
          dimensions
        };
        
        communications.push(communication);
      } catch (error) {
        console.error(`Failed to process social post ${rawPost.id}:`, error);
      }
    }
    
    return communications;
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
