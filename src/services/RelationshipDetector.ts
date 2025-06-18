// RelationshipDetector.ts
// Detects relationships between communications across projects

import { Communication } from "../types/communication";
import { Dimensions } from "../types/dimensions";

export interface Relationship {
  type: "person" | "topic" | "location" | "time" | "document" | "project";
  value: string;
  strength: number; // 0-1 scale
  relatedCommunicationIds?: string[];
  metadata?: Record<string, any>;
}

export class RelationshipDetector {
  // In-memory cache of processed communications for relationship detection
  private communicationCache: Map<string, Communication> = new Map();
  
  /**
   * Detect relationships for a communication
   */
  public async detectRelationships(
    communication: Communication,
    dimensions: Dimensions
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];
    
    // Add communication to cache for future relationship detection
    this.communicationCache.set(communication.id, communication);
    
    // Detect person-based relationships
    this.detectPersonRelationships(communication, dimensions, relationships);
    
    // Detect topic-based relationships
    this.detectTopicRelationships(communication, dimensions, relationships);
    
    // Detect location-based relationships
    this.detectLocationRelationships(communication, dimensions, relationships);
    
    // Detect time-based relationships
    this.detectTimeRelationships(communication, dimensions, relationships);
    
    // Detect document-based relationships
    this.detectDocumentRelationships(communication, dimensions, relationships);
    
    // Detect cross-project relationships
    this.detectCrossProjectRelationships(communication, dimensions, relationships);
    
    return relationships;
  }
  
  /**
   * Detect relationships based on people
   */
  private detectPersonRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationship for the sender
    if (communication.senderName) {
      relationships.push({
        type: "person",
        value: communication.senderName,
        strength: 0.8, // Direct sender has high relationship strength
        metadata: {
          role: "sender",
          email: communication.sender
        }
      });
    }
    
    // Add relationships for people mentioned in the content
    if (dimensions.analytical?.entities?.people) {
      for (const person of dimensions.analytical.entities.people) {
        // Skip the sender to avoid duplication
        if (person === communication.senderName) continue;
        
        relationships.push({
          type: "person",
          value: person,
          strength: 0.6, // Mentioned people have medium relationship strength
          metadata: {
            role: "mentioned",
            context: this.extractContextForPerson(communication, person)
          }
        });
      }
    }
    
    // Find related communications from the same sender
    const relatedBySender = Array.from(this.communicationCache.values())
      .filter(comm => 
        comm.id !== communication.id && 
        comm.senderName === communication.senderName
      )
      .map(comm => comm.id);
    
    if (relatedBySender.length > 0 && communication.senderName) {
      // Update the sender relationship with related communications
      const senderRelationship = relationships.find(
        r => r.type === "person" && r.value === communication.senderName
      );
      
      if (senderRelationship) {
        senderRelationship.relatedCommunicationIds = relatedBySender;
      }
    }
  }
  
  /**
   * Extract context for a person mentioned in a communication
   */
  private extractContextForPerson(communication: Communication, person: string): string {
    const content = communication.content;
    const personIndex = content.indexOf(person);
    
    if (personIndex === -1) return "";
    
    // Extract a snippet of text around the person mention
    const start = Math.max(0, personIndex - 50);
    const end = Math.min(content.length, personIndex + person.length + 50);
    
    return content.substring(start, end).trim();
  }
  
  /**
   * Detect relationships based on topics
   */
  private detectTopicRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationship for the category
    if (communication.metadata?.category) {
      relationships.push({
        type: "topic",
        value: communication.metadata.category,
        strength: 0.7,
        metadata: {
          type: "category"
        }
      });
    }
    
    // Add relationships for concepts
    if (dimensions.analytical?.entities?.concepts) {
      for (const concept of dimensions.analytical.entities.concepts) {
        relationships.push({
          type: "topic",
          value: concept,
          strength: 0.6,
          metadata: {
            type: "concept"
          }
        });
      }
    }
    
    // Add relationships for tags
    if (dimensions.analytical?.tags) {
      for (const tag of dimensions.analytical.tags) {
        relationships.push({
          type: "topic",
          value: tag,
          strength: 0.5,
          metadata: {
            type: "tag"
          }
        });
      }
    }
    
    // Find related communications with the same topics
    const topics = relationships
      .filter(r => r.type === "topic")
      .map(r => r.value);
    
    if (topics.length > 0) {
      const relatedByTopic = Array.from(this.communicationCache.values())
        .filter(comm => {
          if (comm.id === communication.id) return false;
          
          // Check if the communication has any of the same topics
          if (comm.metadata?.category && topics.includes(comm.metadata.category)) {
            return true;
          }
          
          if (comm.dimensions?.analytical?.tags) {
            for (const tag of comm.dimensions.analytical.tags) {
              if (topics.includes(tag)) return true;
            }
          }
          
          if (comm.dimensions?.analytical?.entities?.concepts) {
            for (const concept of comm.dimensions.analytical.entities.concepts) {
              if (topics.includes(concept)) return true;
            }
          }
          
          return false;
        })
        .map(comm => comm.id);
      
      // Update topic relationships with related communications
      for (const relationship of relationships) {
        if (relationship.type === "topic") {
          relationship.relatedCommunicationIds = relatedByTopic;
        }
      }
    }
  }
  
  /**
   * Detect relationships based on locations
   */
  private detectLocationRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationships for locations
    if (dimensions.visual?.spatialContext?.location) {
      relationships.push({
        type: "location",
        value: dimensions.visual.spatialContext.location,
        strength: 0.7,
        metadata: {
          coordinates: dimensions.visual.spatialContext.coordinates
        }
      });
    }
    
    if (dimensions.analytical?.entities?.locations) {
      for (const location of dimensions.analytical.entities.locations) {
        // Skip if already added from spatial context
        if (dimensions.visual?.spatialContext?.location === location) continue;
        
        relationships.push({
          type: "location",
          value: location,
          strength: 0.6
        });
      }
    }
    
    // Find related communications with the same locations
    const locations = relationships
      .filter(r => r.type === "location")
      .map(r => r.value);
    
    if (locations.length > 0) {
      const relatedByLocation = Array.from(this.communicationCache.values())
        .filter(comm => {
          if (comm.id === communication.id) return false;
          
          // Check if the communication has any of the same locations
          if (comm.dimensions?.visual?.spatialContext?.location && 
              locations.includes(comm.dimensions.visual.spatialContext.location)) {
            return true;
          }
          
          if (comm.dimensions?.analytical?.entities?.locations) {
            for (const location of comm.dimensions.analytical.entities.locations) {
              if (locations.includes(location)) return true;
            }
          }
          
          return false;
        })
        .map(comm => comm.id);
      
      // Update location relationships with related communications
      for (const relationship of relationships) {
        if (relationship.type === "location") {
          relationship.relatedCommunicationIds = relatedByLocation;
        }
      }
    }
  }
  
  /**
   * Detect relationships based on time
   */
  private detectTimeRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationship for the timestamp
    const date = new Date(communication.timestamp);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    relationships.push({
      type: "time",
      value: dateString,
      strength: 0.5,
      metadata: {
        fullTimestamp: communication.timestamp
      }
    });
    
    // Add relationship for the deadline if it exists
    if (dimensions.temporal?.deadline) {
      relationships.push({
        type: "time",
        value: dimensions.temporal.deadline,
        strength: 0.8,
        metadata: {
          type: "deadline",
          daysUntil: dimensions.temporal.timeContext?.daysUntilDeadline
        }
      });
    }
    
    // Find related communications with the same date or deadline
    const timeValues = relationships
      .filter(r => r.type === "time")
      .map(r => r.value);
    
    if (timeValues.length > 0) {
      const relatedByTime = Array.from(this.communicationCache.values())
        .filter(comm => {
          if (comm.id === communication.id) return false;
          
          // Check if the communication has the same date
          const commDate = new Date(comm.timestamp);
          const commDateString = commDate.toISOString().split('T')[0];
          
          if (timeValues.includes(commDateString)) {
            return true;
          }
          
          // Check if the communication has the same deadline
          if (comm.dimensions?.temporal?.deadline && 
              timeValues.includes(comm.dimensions.temporal.deadline)) {
            return true;
          }
          
          return false;
        })
        .map(comm => comm.id);
      
      // Update time relationships with related communications
      for (const relationship of relationships) {
        if (relationship.type === "time") {
          relationship.relatedCommunicationIds = relatedByTime;
        }
      }
    }
  }
  
  /**
   * Detect relationships based on documents
   */
  private detectDocumentRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationship for the document type if it exists
    if (dimensions.visual?.documentType) {
      relationships.push({
        type: "document",
        value: dimensions.visual.documentType,
        strength: 0.6,
        metadata: {
          hasImages: dimensions.visual.hasImages,
          visualElements: dimensions.visual.visualElements
        }
      });
    }
    
    // Find related communications with the same document type
    if (dimensions.visual?.documentType) {
      const relatedByDocumentType = Array.from(this.communicationCache.values())
        .filter(comm => 
          comm.id !== communication.id && 
          comm.dimensions?.visual?.documentType === dimensions.visual.documentType
        )
        .map(comm => comm.id);
      
      // Update document relationship with related communications
      const documentRelationship = relationships.find(
        r => r.type === "document" && r.value === dimensions.visual.documentType
      );
      
      if (documentRelationship) {
        documentRelationship.relatedCommunicationIds = relatedByDocumentType;
      }
    }
  }
  
  /**
   * Detect cross-project relationships
   */
  private detectCrossProjectRelationships(
    communication: Communication,
    dimensions: Dimensions,
    relationships: Relationship[]
  ): void {
    // Add relationship for the project
    if (communication.project) {
      relationships.push({
        type: "project",
        value: communication.project,
        strength: 0.9,
        metadata: {
          primary: true
        }
      });
    }
    
    // Check for cross-project relationships
    const content = communication.content.toLowerCase();
    const subject = communication.subject.toLowerCase();
    const combinedText = `${subject} ${content}`;
    
    // Define cross-project keywords
    const crossProjectKeywords: Record<string, string[]> = {
      "Home Purchase": [
        "house", "property", "mortgage", "real estate", "loan", "inspection", 
        "closing", "escrow", "agent", "broker", "home", "purchase", "buy"
      ],
      "Career Change": [
        "job", "interview", "resume", "cover letter", "application", "position",
        "career", "employment", "hiring", "recruiter", "salary", "offer"
      ],
      "Family Event": [
        "family", "event", "reunion", "party", "celebration", "gathering",
        "invitation", "rsvp", "guest", "venue", "catering", "decoration"
      ]
    };
    
    // Check for keywords from other projects
    for (const [project, keywords] of Object.entries(crossProjectKeywords)) {
      // Skip the current project
      if (project === communication.project) continue;
      
      // Check if any keywords from this project are in the text
      const matchingKeywords = keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      if (matchingKeywords.length > 0) {
        relationships.push({
          type: "project",
          value: project,
          strength: 0.4 + (matchingKeywords.length * 0.05), // Increase strength with more matches
          metadata: {
            primary: false,
            matchingKeywords
          }
        });
      }
    }
    
    // Find related communications from other projects
    const crossProjectRelationships = relationships.filter(
      r => r.type === "project" && r.value !== communication.project
    );
    
    for (const relationship of crossProjectRelationships) {
      const relatedByProject = Array.from(this.communicationCache.values())
        .filter(comm => 
          comm.id !== communication.id && 
          comm.project === relationship.value
        )
        .map(comm => comm.id);
      
      relationship.relatedCommunicationIds = relatedByProject;
    }
  }
  
  /**
   * Clear the communication cache
   */
  public clearCache(): void {
    this.communicationCache.clear();
  }
  
  /**
   * Add a batch of communications to the cache
   */
  public addToCache(communications: Communication[]): void {
    for (const communication of communications) {
      this.communicationCache.set(communication.id, communication);
    }
  }
}
