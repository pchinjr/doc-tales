// ClassificationService.ts
// Provides classification of communications into projects, categories, and urgency levels

import { Communication, ProjectType } from "../types/communication";
import { Dimensions } from "../types/dimensions";

export interface ClassificationResult {
  project: ProjectType;
  category: string;
  tags: string[];
  urgency: "high" | "medium" | "low";
  confidence: number;
}

export class ClassificationService {
  // Project-specific keywords for classification
  private projectKeywords: Record<ProjectType, string[]> = {
    "Home Purchase": [
      "house", "property", "mortgage", "real estate", "loan", "inspection", 
      "closing", "escrow", "agent", "broker", "home", "purchase", "buy",
      "offer", "appraisal", "insurance", "title", "deed"
    ],
    "Career Change": [
      "job", "interview", "resume", "cover letter", "application", "position",
      "career", "employment", "hiring", "recruiter", "salary", "offer",
      "skills", "experience", "reference", "portfolio", "assessment"
    ],
    "Family Event": [
      "family", "event", "reunion", "party", "celebration", "gathering",
      "invitation", "rsvp", "guest", "venue", "catering", "decoration",
      "schedule", "planning", "organize", "gift", "photo", "memory"
    ]
  };
  
  // Category keywords for classification
  private categoryKeywords: Record<string, string[]> = {
    "finance": [
      "money", "payment", "cost", "budget", "expense", "price", "fee",
      "mortgage", "loan", "interest", "rate", "deposit", "credit", "debit",
      "bank", "financial", "fund", "investment", "tax", "insurance"
    ],
    "planning": [
      "plan", "schedule", "organize", "arrangement", "preparation",
      "timeline", "agenda", "calendar", "date", "time", "coordination",
      "logistics", "strategy", "checklist", "task", "to-do", "reminder"
    ],
    "document": [
      "document", "file", "form", "application", "contract", "agreement",
      "certificate", "report", "statement", "record", "receipt", "invoice",
      "letter", "email", "attachment", "pdf", "spreadsheet", "presentation"
    ],
    "communication": [
      "message", "contact", "call", "phone", "email", "text", "chat",
      "discussion", "conversation", "meeting", "appointment", "conference",
      "interview", "consultation", "feedback", "response", "reply", "follow-up"
    ],
    "social": [
      "social", "friend", "family", "relative", "colleague", "acquaintance",
      "relationship", "connection", "network", "community", "group", "team",
      "gathering", "event", "party", "celebration", "invitation", "guest"
    ]
  };
  
  // Urgency keywords for classification
  private urgencyKeywords: Record<string, string[]> = {
    "high": [
      "urgent", "immediate", "asap", "emergency", "critical", "important",
      "priority", "deadline", "due", "required", "necessary", "essential",
      "crucial", "vital", "pressing", "time-sensitive", "now", "today"
    ],
    "medium": [
      "soon", "next", "upcoming", "approaching", "scheduled", "planned",
      "expected", "anticipated", "pending", "waiting", "follow-up", "reminder",
      "check", "review", "consider", "attention", "notice", "this week"
    ],
    "low": [
      "sometime", "eventually", "when convenient", "no rush", "take your time",
      "optional", "voluntary", "discretionary", "flexible", "casual", "relaxed",
      "leisurely", "whenever", "if possible", "might", "could", "next month"
    ]
  };
  
  /**
   * Classify a communication into a project, category, and urgency level
   */
  public async classifyCommunication(
    communication: Communication, 
    dimensions: Dimensions
  ): Promise<ClassificationResult> {
    // If the communication already has a project, use it
    if (communication.project) {
      return this.enhanceExistingClassification(communication, dimensions);
    }
    
    // Otherwise, classify from scratch
    return this.classifyFromScratch(communication, dimensions);
  }
  
  /**
   * Enhance an existing classification with additional metadata
   */
  private enhanceExistingClassification(
    communication: Communication, 
    dimensions: Dimensions
  ): ClassificationResult {
    // Start with existing project
    const project = communication.project;
    
    // Determine category
    let category = communication.metadata?.category || this.determineCategory(communication, dimensions);
    
    // Extract tags
    const existingTags = Array.isArray(communication.metadata?.tags) 
      ? communication.metadata.tags 
      : [];
    const tags = [...existingTags, ...this.extractTags(communication, dimensions)];
    
    // Determine urgency
    const urgency = communication.metadata?.urgency || this.determineUrgency(communication, dimensions);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(communication, dimensions, project);
    
    return {
      project,
      category,
      tags: [...new Set(tags)], // Remove duplicates
      urgency: urgency as "high" | "medium" | "low",
      confidence
    };
  }
  
  /**
   * Classify a communication from scratch
   */
  private classifyFromScratch(
    communication: Communication, 
    dimensions: Dimensions
  ): ClassificationResult {
    // Determine project
    const project = this.determineProject(communication, dimensions);
    
    // Determine category
    const category = this.determineCategory(communication, dimensions);
    
    // Extract tags
    const tags = this.extractTags(communication, dimensions);
    
    // Determine urgency
    const urgency = this.determineUrgency(communication, dimensions);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(communication, dimensions, project);
    
    return {
      project,
      category,
      tags,
      urgency,
      confidence
    };
  }
  
  /**
   * Determine the project for a communication
   */
  private determineProject(
    communication: Communication, 
    dimensions: Dimensions
  ): ProjectType {
    const content = communication.content.toLowerCase();
    const subject = communication.subject.toLowerCase();
    const combinedText = `${subject} ${content}`;
    
    // Calculate scores for each project
    const scores: Record<ProjectType, number> = {
      "Home Purchase": 0,
      "Career Change": 0,
      "Family Event": 0
    };
    
    // Score based on keyword matches
    for (const [project, keywords] of Object.entries(this.projectKeywords)) {
      for (const keyword of keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          scores[project as ProjectType] += 1;
        }
      }
    }
    
    // Score based on dimensions
    if (dimensions.relationship?.context.personal) {
      scores["Family Event"] += 2;
    }
    
    if (dimensions.relationship?.context.professional) {
      scores["Career Change"] += 2;
    }
    
    if (dimensions.relationship?.context.projectSpecific) {
      scores["Home Purchase"] += 2;
    }
    
    // Check for specific entities in analytical dimension
    if (dimensions.analytical?.entities) {
      const entities = dimensions.analytical.entities;
      
      // Check for home-related locations
      if (entities.locations.some(loc => 
        loc.toLowerCase().includes("house") || 
        loc.toLowerCase().includes("property") ||
        loc.toLowerCase().includes("home")
      )) {
        scores["Home Purchase"] += 2;
      }
      
      // Check for job-related organizations
      if (entities.organizations.some(org => 
        org.toLowerCase().includes("company") || 
        org.toLowerCase().includes("corp") ||
        org.toLowerCase().includes("inc")
      )) {
        scores["Career Change"] += 2;
      }
      
      // Check for family-related concepts
      if (entities.concepts.some(concept => 
        concept.toLowerCase().includes("family") || 
        concept.toLowerCase().includes("reunion") ||
        concept.toLowerCase().includes("gathering")
      )) {
        scores["Family Event"] += 2;
      }
    }
    
    // Find the project with the highest score
    let highestScore = 0;
    let highestProject: ProjectType = "Home Purchase"; // Default
    
    for (const [project, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        highestProject = project as ProjectType;
      }
    }
    
    return highestProject;
  }
  
  /**
   * Determine the category for a communication
   */
  private determineCategory(
    communication: Communication, 
    dimensions: Dimensions
  ): string {
    const content = communication.content.toLowerCase();
    const subject = communication.subject.toLowerCase();
    const combinedText = `${subject} ${content}`;
    
    // Calculate scores for each category
    const scores: Record<string, number> = {};
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      scores[category] = 0;
      
      for (const keyword of keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          scores[category] += 1;
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
  
  /**
   * Extract tags for a communication
   */
  private extractTags(
    communication: Communication, 
    dimensions: Dimensions
  ): string[] {
    const tags: string[] = [];
    
    // Add project as a tag
    if (communication.project) {
      tags.push(communication.project);
    }
    
    // Add category as a tag
    if (communication.metadata?.category) {
      tags.push(communication.metadata.category);
    }
    
    // Add urgency as a tag
    if (communication.metadata?.urgency) {
      tags.push(communication.metadata.urgency);
    }
    
    // Add sender name as a tag
    if (communication.senderName) {
      tags.push(communication.senderName);
    }
    
    // Add analytical dimension tags
    if (dimensions.analytical?.tags) {
      tags.push(...dimensions.analytical.tags);
    }
    
    // Add temporal dimension tags
    if (dimensions.temporal?.urgency) {
      tags.push(dimensions.temporal.urgency);
    }
    
    if (dimensions.temporal?.timeContext?.requiresAction) {
      tags.push("action-required");
    }
    
    if (dimensions.temporal?.timeContext?.isRecent) {
      tags.push("recent");
    }
    
    // Add relationship dimension tags
    if (dimensions.relationship?.connectionStrength) {
      tags.push(dimensions.relationship.connectionStrength);
    }
    
    if (dimensions.relationship?.frequency) {
      tags.push(dimensions.relationship.frequency);
    }
    
    // Add visual dimension tags
    if (dimensions.visual?.visualCategory) {
      tags.push(dimensions.visual.visualCategory);
    }
    
    if (dimensions.visual?.hasImages) {
      tags.push("has-images");
    }
    
    if (dimensions.visual?.documentType) {
      tags.push(dimensions.visual.documentType);
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
  
  /**
   * Determine the urgency for a communication
   */
  private determineUrgency(
    communication: Communication, 
    dimensions: Dimensions
  ): "high" | "medium" | "low" {
    // If temporal dimension has urgency, use it
    if (dimensions.temporal?.urgency) {
      return dimensions.temporal.urgency as "high" | "medium" | "low";
    }
    
    const content = communication.content.toLowerCase();
    const subject = communication.subject.toLowerCase();
    const combinedText = `${subject} ${content}`;
    
    // Calculate scores for each urgency level
    const scores: Record<string, number> = {
      "high": 0,
      "medium": 0,
      "low": 0
    };
    
    // Score based on keyword matches
    for (const [urgency, keywords] of Object.entries(this.urgencyKeywords)) {
      for (const keyword of keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          scores[urgency] += 1;
        }
      }
    }
    
    // Check for deadline in temporal dimension
    if (dimensions.temporal?.deadline) {
      // If deadline is within 3 days, high urgency
      if (dimensions.temporal.timeContext?.daysUntilDeadline !== undefined &&
          dimensions.temporal.timeContext.daysUntilDeadline <= 3) {
        scores["high"] += 3;
      }
      // If deadline is within a week, medium urgency
      else if (dimensions.temporal.timeContext?.daysUntilDeadline !== undefined &&
               dimensions.temporal.timeContext.daysUntilDeadline <= 7) {
        scores["medium"] += 2;
      }
      // Otherwise, low urgency
      else {
        scores["low"] += 1;
      }
    }
    
    // Check if action is required
    if (dimensions.temporal?.timeContext?.requiresAction) {
      scores["high"] += 1;
    }
    
    // Find the urgency with the highest score
    let highestScore = 0;
    let highestUrgency: "high" | "medium" | "low" = "medium"; // Default
    
    for (const [urgency, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        highestUrgency = urgency as "high" | "medium" | "low";
      }
    }
    
    return highestUrgency;
  }
  
  /**
   * Calculate confidence in the classification
   */
  private calculateConfidence(
    communication: Communication, 
    dimensions: Dimensions,
    project: ProjectType
  ): number {
    // Start with a base confidence
    let confidence = 0.5;
    
    // If project was explicitly set, high confidence
    if (communication.project === project) {
      confidence += 0.3;
    }
    
    // Check for strong keyword matches
    const content = communication.content.toLowerCase();
    const subject = communication.subject.toLowerCase();
    const combinedText = `${subject} ${content}`;
    
    let keywordMatches = 0;
    for (const keyword of this.projectKeywords[project]) {
      if (combinedText.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    
    // Adjust confidence based on keyword matches
    if (keywordMatches > 5) {
      confidence += 0.2;
    } else if (keywordMatches > 2) {
      confidence += 0.1;
    }
    
    // Adjust based on dimension confidence scores
    if (dimensions.confidenceScores) {
      // For project-specific adjustments
      switch (project) {
        case "Home Purchase":
          confidence += dimensions.confidenceScores.analytical * 0.1;
          break;
        case "Career Change":
          confidence += dimensions.confidenceScores.temporal * 0.1;
          break;
        case "Family Event":
          confidence += dimensions.confidenceScores.relationship * 0.1;
          break;
      }
    }
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}
