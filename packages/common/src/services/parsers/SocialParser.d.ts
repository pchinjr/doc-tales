import { Communication, SourceType } from "../../types/communication";
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
    isRetweet?: boolean;
    retweetedFrom?: string;
    location?: string;
    metadata?: Record<string, any>;
}
export declare class SocialParser {
    /**
     * Parse a raw social media post into a structured Communication object
     */
    parseSocialPost(rawPost: RawSocialPost): Promise<Partial<Communication>>;
    /**
     * Generate a subject from the post content
     */
    private generateSubject;
    /**
     * Determine the urgency of a social post based on content and metadata
     */
    private determineUrgency;
    /**
     * Determine the category of a social post based on content and metadata
     */
    private determineCategory;
}
