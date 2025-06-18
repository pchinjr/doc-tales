// EmailParser.ts
// Transforms raw email data into structured Communication objects

import { Communication, SourceType } from "../../types/communication";
import { simpleParser, ParsedMail } from 'mailparser';

export interface RawEmail {
  id: string;
  raw: string | Buffer;
  source: SourceType;
}

export class EmailParser {
  /**
   * Parse a raw email into a structured Communication object
   */
  public async parseEmail(rawEmail: RawEmail): Promise<Partial<Communication>> {
    try {
      // Parse the raw email using mailparser
      const parsed = await simpleParser(rawEmail.raw);
      
      // Extract basic email information
      const id = rawEmail.id;
      const timestamp = parsed.date?.toISOString() || new Date().toISOString();
      const subject = parsed.subject || "(No Subject)";
      const content = this.extractContent(parsed);
      
      // Extract sender information
      const { senderName, senderEmail } = this.extractSender(parsed);
      
      // Extract attachments
      const attachments = this.extractAttachments(parsed);
      
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
          urgency: this.determineUrgency(parsed),
          category: this.determineCategory(parsed),
          hasImages: this.hasImages(parsed),
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length,
          recipients: this.extractRecipients(parsed),
          cc: this.extractCC(parsed),
          bcc: this.extractBCC(parsed),
          headers: this.extractRelevantHeaders(parsed),
          messageId: parsed.messageId,
          inReplyTo: parsed.inReplyTo,
          references: parsed.references
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
   * Extract the content from a parsed email
   */
  private extractContent(parsed: ParsedMail): string {
    // Prefer HTML content if available and convert to plain text
    if (parsed.html) {
      // In a real implementation, we would use a library like html-to-text
      // For now, we'll use a simple regex to strip HTML tags
      return this.stripHtml(parsed.html);
    }
    
    // Fall back to plain text
    return parsed.text || "";
  }
  
  /**
   * Strip HTML tags from a string
   */
  private stripHtml(html: string): string {
    // Simple regex to strip HTML tags
    // In a real implementation, we would use a more robust solution
    return html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Extract sender information from a parsed email
   */
  private extractSender(parsed: ParsedMail): { senderName: string, senderEmail: string } {
    let senderName = "";
    let senderEmail = "";
    
    if (parsed.from && parsed.from.value.length > 0) {
      const from = parsed.from.value[0];
      senderName = from.name || from.address || "";
      senderEmail = from.address || "";
    }
    
    return { senderName, senderEmail };
  }
  
  /**
   * Extract attachments from a parsed email
   */
  private extractAttachments(parsed: ParsedMail): any[] {
    if (!parsed.attachments || parsed.attachments.length === 0) {
      return [];
    }
    
    return parsed.attachments.map(attachment => ({
      id: `att-${attachment.contentId || Math.random().toString(36).substring(2, 10)}`,
      filename: attachment.filename || "unnamed-attachment",
      contentType: attachment.contentType,
      size: attachment.size,
      contentId: attachment.contentId,
      isInline: attachment.contentDisposition === "inline"
    }));
  }
  
  /**
   * Determine if the email has images
   */
  private hasImages(parsed: ParsedMail): boolean {
    // Check for inline images in attachments
    if (parsed.attachments && parsed.attachments.some(att => 
      att.contentType.startsWith("image/") && att.contentDisposition === "inline"
    )) {
      return true;
    }
    
    // Check for images in HTML content
    if (parsed.html && /<img[^>]+>/i.test(parsed.html)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Extract recipients from a parsed email
   */
  private extractRecipients(parsed: ParsedMail): any[] {
    if (!parsed.to || !parsed.to.value) {
      return [];
    }
    
    return parsed.to.value.map(recipient => ({
      name: recipient.name || recipient.address,
      email: recipient.address
    }));
  }
  
  /**
   * Extract CC recipients from a parsed email
   */
  private extractCC(parsed: ParsedMail): any[] {
    if (!parsed.cc || !parsed.cc.value) {
      return [];
    }
    
    return parsed.cc.value.map(recipient => ({
      name: recipient.name || recipient.address,
      email: recipient.address
    }));
  }
  
  /**
   * Extract BCC recipients from a parsed email
   */
  private extractBCC(parsed: ParsedMail): any[] {
    if (!parsed.bcc || !parsed.bcc.value) {
      return [];
    }
    
    return parsed.bcc.value.map(recipient => ({
      name: recipient.name || recipient.address,
      email: recipient.address
    }));
  }
  
  /**
   * Extract relevant headers from a parsed email
   */
  private extractRelevantHeaders(parsed: ParsedMail): Record<string, string> {
    const relevantHeaders: Record<string, string> = {};
    
    // Extract headers that might be useful for classification
    const headerKeys = [
      "importance",
      "priority",
      "x-priority",
      "x-msmail-priority",
      "x-ms-exchange-organization-prioritization"
    ];
    
    if (parsed.headerLines) {
      for (const header of parsed.headerLines) {
        if (headerKeys.includes(header.key.toLowerCase())) {
          relevantHeaders[header.key] = header.line;
        }
      }
    }
    
    return relevantHeaders;
  }
  
  /**
   * Determine the urgency of an email based on headers and content
   */
  private determineUrgency(parsed: ParsedMail): "high" | "medium" | "low" {
    // Check priority headers
    if (parsed.headerLines) {
      for (const header of parsed.headerLines) {
        const key = header.key.toLowerCase();
        const value = header.line.toLowerCase();
        
        if ((key === "importance" || key === "priority" || key === "x-priority") && 
            (value.includes("high") || value.includes("1"))) {
          return "high";
        }
        
        if ((key === "importance" || key === "priority" || key === "x-priority") && 
            (value.includes("low") || value.includes("5"))) {
          return "low";
        }
      }
    }
    
    // Check subject for urgency indicators
    if (parsed.subject) {
      const subject = parsed.subject.toLowerCase();
      if (subject.includes("urgent") || 
          subject.includes("important") || 
          subject.includes("asap") ||
          subject.includes("emergency")) {
        return "high";
      }
      
      if (subject.includes("fyi") || 
          subject.includes("for your information") ||
          subject.includes("low priority")) {
        return "low";
      }
    }
    
    // Check content for urgency indicators
    const content = (parsed.text || "").toLowerCase();
    if (content.includes("urgent") || 
        content.includes("as soon as possible") || 
        content.includes("emergency") ||
        content.includes("immediate attention")) {
      return "high";
    }
    
    if (content.includes("no rush") || 
        content.includes("when you have time") ||
        content.includes("fyi") ||
        content.includes("for your information")) {
      return "low";
    }
    
    // Default to medium urgency
    return "medium";
  }
  
  /**
   * Determine the category of an email based on content
   */
  private determineCategory(parsed: ParsedMail): string {
    const subject = (parsed.subject || "").toLowerCase();
    const content = (parsed.text || "").toLowerCase();
    const combinedText = `${subject} ${content}`;
    
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
