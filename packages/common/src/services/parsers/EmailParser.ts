// EmailParser.ts
// Transforms raw email data into structured Communication objects

import { Communication, SourceType } from "../../types/communication";

// Simple email parser without external dependencies
export interface RawEmail {
  id: string;
  raw: string | Buffer;
  source: SourceType;
}

interface EmailHeader {
  key: string;
  value: string;
}

interface EmailAttachment {
  filename: string;
  contentType: string;
  contentId?: string;
  size: number;
  isInline: boolean;
}

export class EmailParser {
  /**
   * Parse a raw email into a structured Communication object
   */
  public async parseEmail(rawEmail: RawEmail): Promise<Partial<Communication>> {
    try {
      // Parse the raw email using our simple parser
      const emailString = rawEmail.raw.toString();
      const { headers, body } = this.parseRawEmail(emailString);
      
      // Extract basic email information
      const id = rawEmail.id;
      const timestamp = this.getHeaderValue(headers, "Date") || new Date().toISOString();
      const subject = this.getHeaderValue(headers, "Subject") || "(No Subject)";
      const content = body;
      
      // Extract sender information
      const from = this.getHeaderValue(headers, "From") || "";
      const { senderName, senderEmail } = this.parseSender(from);
      
      // Extract attachments
      const attachments = this.extractAttachments(emailString);
      
      // Create a partial Communication object
      const communication: Partial<Communication> = {
        id,
        commType: "email",
        source: rawEmail.source,
        timestamp,
        subject,
        content,
        sender: senderEmail,
        senderName,
        metadata: {
          urgency: this.determineUrgency(headers, content),
          category: this.determineCategory(subject, content),
          hasImages: this.hasImages(content),
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length,
          recipients: this.extractRecipients(headers),
          headers: this.extractRelevantHeaders(headers)
        }
      };
      
      // Add attachments if present
      if (attachments.length > 0) {
        communication.attachments = attachments;
      }
      
      return communication;
    } catch (error) {
      console.error("Failed to parse email:", error);
      throw new Error(`Email parsing failed: ${error}`);
    }
  }
  
  /**
   * Parse a raw email into headers and body
   */
  private parseRawEmail(rawEmail: string): { headers: EmailHeader[], body: string } {
    // Split the email into headers and body
    const parts = rawEmail.split(/\r?\n\r?\n/);
    const headerSection = parts[0];
    const bodySection = parts.slice(1).join("\n\n");
    
    // Parse headers
    const headers: EmailHeader[] = [];
    const headerLines = headerSection.split(/\r?\n/);
    let currentHeader: EmailHeader | null = null;
    
    for (const line of headerLines) {
      // If the line starts with whitespace, it's a continuation of the previous header
      if (/^\s+/.test(line) && currentHeader) {
        currentHeader.value += " " + line.trim();
        continue;
      }
      
      // Otherwise, it's a new header
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        currentHeader = {
          key: match[1].trim(),
          value: match[2].trim()
        };
        headers.push(currentHeader);
      }
    }
    
    return { headers, body: bodySection };
  }
  
  /**
   * Get the value of a specific header
   */
  private getHeaderValue(headers: EmailHeader[], key: string): string | undefined {
    const header = headers.find(h => h.key.toLowerCase() === key.toLowerCase());
    return header?.value;
  }
  
  /**
   * Parse sender information from a From header
   */
  private parseSender(from: string): { senderName: string, senderEmail: string } {
    let senderName = "";
    let senderEmail = "";
    
    // Try to match "Name <email@example.com>" format
    const match = from.match(/^([^<]+)<([^>]+)>/);
    if (match) {
      senderName = match[1].trim();
      senderEmail = match[2].trim();
    } else {
      // If no match, use the whole string as the email
      senderEmail = from.trim();
      senderName = senderEmail;
    }
    
    return { senderName, senderEmail };
  }
  
  /**
   * Extract attachments from a raw email
   * This is a simplified version that just detects if there are attachments
   */
  private extractAttachments(rawEmail: string): any[] {
    const attachments: EmailAttachment[] = [];
    
    // Check for Content-Type: multipart/mixed
    if (rawEmail.includes("Content-Type: multipart/mixed")) {
      // Find boundary
      const boundaryMatch = rawEmail.match(/boundary="([^"]+)"/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = rawEmail.split("--" + boundary);
        
        // Skip the first part (headers) and the last part (boundary end)
        for (let i = 1; i < parts.length - 1; i++) {
          const part = parts[i];
          
          // Check if this part is an attachment
          if (part.includes("Content-Disposition: attachment") || 
              (part.includes("Content-Type:") && !part.includes("text/plain") && !part.includes("text/html"))) {
            
            // Extract filename
            const filenameMatch = part.match(/filename="([^"]+)"/);
            const filename = filenameMatch ? filenameMatch[1] : "attachment";
            
            // Extract content type
            const contentTypeMatch = part.match(/Content-Type:\s*([^;]+)/);
            const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : "application/octet-stream";
            
            attachments.push({
              filename,
              contentType,
              size: part.length,
              isInline: false
            });
          }
        }
      }
    }
    
    return attachments;
  }
  
  /**
   * Determine if the email has images
   */
  private hasImages(content: string): boolean {
    // Check for HTML img tags
    return content.includes("<img") || content.includes("Content-Type: image/");
  }
  
  /**
   * Extract recipients from headers
   */
  private extractRecipients(headers: EmailHeader[]): any[] {
    const to = this.getHeaderValue(headers, "To") || "";
    return to.split(",").map(recipient => {
      const { senderName, senderEmail } = this.parseSender(recipient);
      return {
        name: senderName,
        email: senderEmail
      };
    }).filter(r => r.email);
  }
  
  /**
   * Extract relevant headers
   */
  private extractRelevantHeaders(headers: EmailHeader[]): Record<string, string> {
    const relevantHeaders: Record<string, string> = {};
    
    // Extract headers that might be useful for classification
    const headerKeys = [
      "importance",
      "priority",
      "x-priority",
      "x-msmail-priority",
      "x-ms-exchange-organization-prioritization"
    ];
    
    for (const header of headers) {
      if (headerKeys.includes(header.key.toLowerCase())) {
        relevantHeaders[header.key] = header.value;
      }
    }
    
    return relevantHeaders;
  }
  
  /**
   * Determine the urgency of an email based on headers and content
   */
  private determineUrgency(headers: EmailHeader[], content: string): "high" | "medium" | "low" {
    // Check priority headers
    for (const header of headers) {
      const key = header.key.toLowerCase();
      const value = header.value.toLowerCase();
      
      if ((key === "importance" || key === "priority" || key === "x-priority") && 
          (value.includes("high") || value.includes("1"))) {
        return "high";
      }
      
      if ((key === "importance" || key === "priority" || key === "x-priority") && 
          (value.includes("low") || value.includes("5"))) {
        return "low";
      }
    }
    
    // Check subject for urgency indicators
    const subject = this.getHeaderValue(headers, "Subject") || "";
    if (subject.toLowerCase().includes("urgent") || 
        subject.toLowerCase().includes("important") || 
        subject.toLowerCase().includes("asap") ||
        subject.toLowerCase().includes("emergency")) {
      return "high";
    }
    
    if (subject.toLowerCase().includes("fyi") || 
        subject.toLowerCase().includes("for your information") ||
        subject.toLowerCase().includes("low priority")) {
      return "low";
    }
    
    // Check content for urgency indicators
    const contentLower = content.toLowerCase();
    if (contentLower.includes("urgent") || 
        contentLower.includes("as soon as possible") || 
        contentLower.includes("emergency") ||
        contentLower.includes("immediate attention")) {
      return "high";
    }
    
    if (contentLower.includes("no rush") || 
        contentLower.includes("when you have time") ||
        contentLower.includes("fyi") ||
        contentLower.includes("for your information")) {
      return "low";
    }
    
    // Default to medium urgency
    return "medium";
  }
  
  /**
   * Determine the category of an email based on content
   */
  private determineCategory(subject: string, content: string): string {
    const combinedText = `${subject} ${content}`.toLowerCase();
    
    // Define category keywords
    const categoryKeywords: Record<string, string[]> = {
      "finance": [
        "invoice", "payment", "bill", "receipt", "transaction", "money",
        "financial", "budget", "expense", "cost", "price", "fee", "tax"
      ],
      "planning": [
        "schedule", "plan", "agenda", "calendar", "event", "meeting",
        "appointment", "reservation", "booking", "itinerary", "timeline"
      ],
      "document": [
        "document", "file", "attachment", "form", "application", "contract",
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
    const scores: Record<string, number> = {};
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      scores[category] = 0;
      
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          scores[category]++;
        }
      }
    }
    
    // Find the category with the highest score
    let highestScore = 0;
    let highestCategory = "general"; // Default
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        highestCategory = category;
      }
    }
    
    return highestCategory;
  }
}
