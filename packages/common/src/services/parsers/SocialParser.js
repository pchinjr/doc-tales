"use strict";
// SocialParser.ts
// Transforms social media posts into structured Communication objects
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialParser = void 0;
class SocialParser {
    /**
     * Parse a raw social media post into a structured Communication object
     */
    async parseSocialPost(rawPost) {
        var _a;
        try {
            // Extract basic post information
            const id = rawPost.id;
            const timestamp = rawPost.timestamp;
            const content = rawPost.content;
            // Generate a subject from the content
            const subject = this.generateSubject(rawPost);
            // Create a partial Communication object
            const communication = {
                id,
                commType: "social",
                source: rawPost.platform,
                timestamp,
                subject,
                content,
                sender: rawPost.author.username,
                senderName: rawPost.author.name,
                metadata: {
                    urgency: this.determineUrgency(rawPost),
                    category: this.determineCategory(rawPost),
                    platform: rawPost.platform,
                    authorId: rawPost.author.id,
                    authorUsername: rawPost.author.username,
                    authorProfileUrl: rawPost.author.profileUrl,
                    likes: rawPost.likes,
                    shares: rawPost.shares,
                    comments: rawPost.comments,
                    hashtags: rawPost.hashtags,
                    mentions: rawPost.mentions,
                    urls: rawPost.urls,
                    isReply: rawPost.isReply,
                    replyToId: rawPost.replyToId,
                    replyToUser: rawPost.replyToUser,
                    isRetweet: rawPost.isRetweet,
                    retweetedFrom: rawPost.retweetedFrom,
                    location: rawPost.location,
                    hasImages: (rawPost.mediaUrls && rawPost.mediaUrls.length > 0) || false,
                    imageCount: ((_a = rawPost.mediaUrls) === null || _a === void 0 ? void 0 : _a.length) || 0
                }
            };
            return communication;
        }
        catch (error) {
            console.error("Failed to parse social post:", error);
            throw new Error(`Social post parsing failed: ${error}`);
        }
    }
    /**
     * Generate a subject from the post content
     */
    generateSubject(post) {
        // For social media posts, use the first part of the content as the subject
        const maxLength = 50; // Maximum subject length
        if (post.content.length <= maxLength) {
            return post.content;
        }
        // Try to find a natural break point (period, question mark, exclamation point)
        const breakPoints = [". ", "? ", "! ", "\n"];
        for (const breakPoint of breakPoints) {
            const index = post.content.indexOf(breakPoint, 10); // Start looking after at least 10 chars
            if (index > 0 && index <= maxLength) {
                return post.content.substring(0, index + 1).trim();
            }
        }
        // If no natural break point, just truncate
        return post.content.substring(0, maxLength).trim() + "...";
    }
    /**
     * Determine the urgency of a social post based on content and metadata
     */
    determineUrgency(post) {
        const content = post.content.toLowerCase();
        // Check for urgent hashtags
        if (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes("urgent") ||
            tag.toLowerCase().includes("emergency") ||
            tag.toLowerCase().includes("asap"))) {
            return "high";
        }
        // Check content for urgency indicators
        if (content.includes("urgent") ||
            content.includes("emergency") ||
            content.includes("asap") ||
            content.includes("help needed") ||
            content.includes("immediate")) {
            return "high";
        }
        // Check for high engagement as an indicator of importance
        if ((post.likes && post.likes > 100) ||
            (post.shares && post.shares > 50) ||
            (post.comments && post.comments > 20)) {
            return "medium";
        }
        // Check for FYI or informational content
        if (content.includes("fyi") ||
            content.includes("for your information") ||
            content.includes("just sharing") ||
            content.includes("thought you might like")) {
            return "low";
        }
        // Default to medium urgency
        return "medium";
    }
    /**
     * Determine the category of a social post based on content and metadata
     */
    determineCategory(post) {
        const content = post.content.toLowerCase();
        // Check hashtags for category indicators
        if (post.hashtags) {
            if (post.hashtags.some(tag => tag.toLowerCase().includes("finance") ||
                tag.toLowerCase().includes("money") ||
                tag.toLowerCase().includes("budget") ||
                tag.toLowerCase().includes("invest"))) {
                return "finance";
            }
            if (post.hashtags.some(tag => tag.toLowerCase().includes("plan") ||
                tag.toLowerCase().includes("schedule") ||
                tag.toLowerCase().includes("event") ||
                tag.toLowerCase().includes("calendar"))) {
                return "planning";
            }
            if (post.hashtags.some(tag => tag.toLowerCase().includes("document") ||
                tag.toLowerCase().includes("report") ||
                tag.toLowerCase().includes("file") ||
                tag.toLowerCase().includes("form"))) {
                return "document";
            }
            if (post.hashtags.some(tag => tag.toLowerCase().includes("social") ||
                tag.toLowerCase().includes("party") ||
                tag.toLowerCase().includes("celebration") ||
                tag.toLowerCase().includes("gathering"))) {
                return "social";
            }
        }
        // Define category keywords
        const categoryKeywords = {
            "finance": [
                "money", "payment", "bill", "receipt", "transaction", "financial",
                "budget", "expense", "cost", "price", "fee", "tax", "invest"
            ],
            "planning": [
                "schedule", "plan", "agenda", "calendar", "event", "meeting",
                "appointment", "reservation", "booking", "itinerary", "timeline"
            ],
            "document": [
                "document", "file", "form", "application", "contract",
                "agreement", "report", "statement", "certificate", "license"
            ],
            "communication": [
                "message", "update", "notification", "announcement", "newsletter",
                "bulletin", "alert", "reminder", "follow-up", "response", "reply"
            ],
            "social": [
                "invitation", "party", "celebration", "gathering", "event",
                "rsvp", "congratulations", "thank you", "greeting", "welcome"
            ]
        };
        // Count keyword matches for each category
        const scores = {};
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            scores[category] = 0;
            for (const keyword of keywords) {
                if (content.includes(keyword)) {
                    scores[category]++;
                }
            }
        }
        // Find the category with the highest score
        let highestScore = 0;
        let highestCategory = "social"; // Default for social posts
        for (const [category, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestCategory = category;
            }
        }
        return highestCategory;
    }
}
exports.SocialParser = SocialParser;
//# sourceMappingURL=SocialParser.js.map