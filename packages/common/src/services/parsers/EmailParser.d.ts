/// <reference types="node" />
import { Communication, SourceType } from "../../types/communication";
export interface RawEmail {
    id: string;
    raw: string | Buffer;
    source: SourceType;
}
export declare class EmailParser {
    /**
     * Parse a raw email into a structured Communication object
     */
    parseEmail(rawEmail: RawEmail): Promise<Partial<Communication>>;
    /**
     * Parse a raw email into headers and body
     */
    private parseRawEmail;
    /**
     * Get the value of a specific header
     */
    private getHeaderValue;
    /**
     * Parse sender information from a From header
     */
    private parseSender;
    /**
     * Extract attachments from a raw email
     * This is a simplified version that just detects if there are attachments
     */
    private extractAttachments;
    /**
     * Determine if the email has images
     */
    private hasImages;
    /**
     * Extract recipients from headers
     */
    private extractRecipients;
    /**
     * Extract relevant headers
     */
    private extractRelevantHeaders;
    /**
     * Determine the urgency of an email based on headers and content
     */
    private determineUrgency;
    /**
     * Determine the category of an email based on content
     */
    private determineCategory;
}
