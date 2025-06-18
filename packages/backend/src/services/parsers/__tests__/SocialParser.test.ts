import { SocialParser, RawSocialPost } from "../SocialParser";
import * as fs from "fs";
import * as path from "path";

describe("SocialParser", () => {
  const parser = new SocialParser();
  
  // Helper function to read test data files
  const readTestFile = (filename: string): any => {
    const content = fs.readFileSync(path.join(__dirname, "test-data", filename), "utf-8");
    return JSON.parse(content);
  };
  
  test("parses a Twitter post correctly", async () => {
    const rawPost: RawSocialPost = readTestFile("social-twitter.json");
    
    const result = await parser.parseSocialPost(rawPost);
    
    expect(result.id).toBe("tweet-001");
    expect(result.commType).toBe("social");
    expect(result.source).toBe("Twitter");
    expect(result.subject).toContain("Just toured the house on Maple Street");
    expect(result.sender).toBe("@johnsmith");
    expect(result.senderName).toBe("John Smith");
    expect(result.content).toBe("Just toured the house on Maple Street. The neighborhood is perfect! #HouseHunting #DreamHome");
    expect(result.timestamp).toBe("2025-06-02T13:25:00Z");
    expect(result.metadata.platform).toBe("Twitter");
    expect(result.metadata.likes).toBe(5);
    expect(result.metadata.shares).toBe(2);
    expect(result.metadata.comments).toBe(3);
    expect(result.metadata.hashtags).toEqual(["HouseHunting", "DreamHome"]);
    expect(result.metadata.hasImages).toBe(true);
    expect(result.metadata.imageCount).toBe(2);
    expect(result.metadata.location).toBe("Maple Street, Springfield");
  });
  
  test("parses a LinkedIn post correctly", async () => {
    const rawPost: RawSocialPost = readTestFile("social-linkedin.json");
    
    const result = await parser.parseSocialPost(rawPost);
    
    expect(result.id).toBe("linkedin-001");
    expect(result.commType).toBe("social");
    expect(result.source).toBe("LinkedIn");
    expect(result.subject).toContain("Excited to share that I'm interviewing");
    expect(result.sender).toBe("john-smith");
    expect(result.senderName).toBe("John Smith");
    expect(result.content).toContain("Senior Developer position at TechCorp");
    expect(result.timestamp).toBe("2025-06-06T10:15:00Z");
    expect(result.metadata.platform).toBe("LinkedIn");
    expect(result.metadata.likes).toBe(24);
    expect(result.metadata.shares).toBe(0);
    expect(result.metadata.comments).toBe(8);
    expect(result.metadata.hashtags).toEqual(["CareerMove", "TechJobs"]);
    expect(result.metadata.hasImages).toBe(false);
    expect(result.metadata.imageCount).toBe(0);
  });
  
  test("parses a Twitter reply correctly", async () => {
    const rawPost: RawSocialPost = readTestFile("social-twitter-reply.json");
    
    const result = await parser.parseSocialPost(rawPost);
    
    expect(result.id).toBe("tweet-002");
    expect(result.commType).toBe("social");
    expect(result.source).toBe("Twitter");
    expect(result.subject).toContain("@aunt_lisa Count me in for the family reunion");
    expect(result.sender).toBe("@johnsmith");
    expect(result.senderName).toBe("John Smith");
    expect(result.content).toContain("I can help with the games and activities");
    expect(result.timestamp).toBe("2025-06-01T18:40:00Z");
    expect(result.metadata.platform).toBe("Twitter");
    expect(result.metadata.isReply).toBe(true);
    expect(result.metadata.replyToId).toBe("tweet-original");
    expect(result.metadata.replyToUser).toBe("@aunt_lisa");
    expect(result.metadata.mentions).toEqual(["aunt_lisa"]);
    expect(result.metadata.hashtags).toEqual(["FamilyTime"]);
  });
  
  test("generates subject correctly for long content", async () => {
    const longContentPost: RawSocialPost = {
      id: "long-post",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "This is a very long post that exceeds the maximum subject length. It contains a lot of information about various topics and should be truncated when used as a subject. The first sentence ends here. The second sentence should not appear in the subject."
    };
    
    const result = await parser.parseSocialPost(longContentPost);
    
    expect(result.subject.length).toBeLessThanOrEqual(53); // 50 chars + '...'
    expect(result.subject).toBe("This is a very long post that exceeds the maximum...");
  });
  
  test("determines urgency correctly", async () => {
    // High urgency post with urgent hashtag
    const urgentHashtagPost: RawSocialPost = {
      id: "urgent-hashtag",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "Need help with this issue! #urgent",
      hashtags: ["urgent"]
    };
    
    const urgentHashtagResult = await parser.parseSocialPost(urgentHashtagPost);
    expect(urgentHashtagResult.metadata.urgency).toBe("high");
    
    // High urgency post with urgent content
    const urgentContentPost: RawSocialPost = {
      id: "urgent-content",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "URGENT: Need immediate assistance with this issue!"
    };
    
    const urgentContentResult = await parser.parseSocialPost(urgentContentPost);
    expect(urgentContentResult.metadata.urgency).toBe("high");
    
    // Medium urgency post with high engagement
    const highEngagementPost: RawSocialPost = {
      id: "high-engagement",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "Check out this interesting article",
      likes: 150,
      shares: 75,
      comments: 30
    };
    
    const highEngagementResult = await parser.parseSocialPost(highEngagementPost);
    expect(highEngagementResult.metadata.urgency).toBe("medium");
    
    // Low urgency post with FYI content
    const fyiPost: RawSocialPost = {
      id: "fyi-post",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "FYI: Just sharing this interesting article I found"
    };
    
    const fyiResult = await parser.parseSocialPost(fyiPost);
    expect(fyiResult.metadata.urgency).toBe("low");
  });
  
  test("determines category correctly", async () => {
    // Finance category from hashtags
    const financeHashtagPost: RawSocialPost = {
      id: "finance-hashtag",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "Just paid off my mortgage! #finance",
      hashtags: ["finance"]
    };
    
    const financeHashtagResult = await parser.parseSocialPost(financeHashtagPost);
    expect(financeHashtagResult.metadata.category).toBe("finance");
    
    // Planning category from content
    const planningContentPost: RawSocialPost = {
      id: "planning-content",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "Working on my schedule for next week. Need to plan several meetings."
    };
    
    const planningContentResult = await parser.parseSocialPost(planningContentPost);
    expect(planningContentResult.metadata.category).toBe("planning");
    
    // Social category (default for social posts with no clear category)
    const generalPost: RawSocialPost = {
      id: "general-post",
      platform: "Twitter",
      timestamp: "2025-06-10T12:00:00Z",
      author: {
        id: "user-001",
        name: "John Smith",
        username: "@johnsmith"
      },
      content: "Having a great day today!"
    };
    
    const generalResult = await parser.parseSocialPost(generalPost);
    expect(generalResult.metadata.category).toBe("social");
  });
});
