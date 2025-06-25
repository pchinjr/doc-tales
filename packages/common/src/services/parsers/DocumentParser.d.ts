/// <reference types="node" />
import { Communication, SourceType } from "../../types/communication";
export interface RawDocument {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    content: string | Buffer;
    metadata?: Record<string, any>;
    source: SourceType;
}
export declare class DocumentParser {
    /**
     * Parse a raw document into a structured Communication object
     */
    parseDocument(rawDocument: RawDocument): Promise<Partial<Communication>>;
    /**
     * Extract the subject/title from a document
     */
    private extractSubject;
    /**
     * Extract content from a document
     */
    private extractContent;
    /**
     * Extract author information from a document
     */
    private extractAuthor;
    /**
     * Determine if a document has images
     */
    private hasImages;
    /**
     * Get the file type from a document
     */
    private getFileType;
    /**
     * Get the page count from a document
     */
    private getPageCount;
    /**
     * Get the chart count from a document
     */
    private getChartCount;
    /**
     * Get the table count from a document
     */
    private getTableCount;
    /**
     * Get the image count from a document
     */
    private getImageCount;
    /**
     * Get the word count from document content
     */
    private getWordCount;
    /**
     * Determine the urgency of a document based on content and metadata
     */
    private determineUrgency;
    /**
     * Determine the category of a document based on content and metadata
     */
    private determineCategory;
}
