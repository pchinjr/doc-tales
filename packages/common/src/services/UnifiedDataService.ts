// Enhanced Unified Data Service with Ingestion Pipeline
import { Communication, SourceType, ProjectType, ArchetypeType } from "../types/communication";
import { SourceAdapter } from "./SourceAdapter";
import { EmailAdapter } from "./adapters/EmailAdapter";
import { DocumentAdapter } from "./adapters/DocumentAdapter";
import { SocialAdapter } from "./adapters/SocialAdapter";
import { IngestionPipeline, IngestionResult } from "./IngestionPipeline";

export interface CommunicationFilter {
  sources?: SourceType[];
  projects?: ProjectType[];
  startDate?: Date;
  endDate?: Date;
  senders?: string[];
  categories?: string[];
  tags?: string[];
  urgency?: ("high" | "medium" | "low")[];
  hasRelationships?: boolean;
  relationshipTypes?: string[];
  dimensionScores?: {
    temporal?: number;
    relationship?: number;
    visual?: number;
    analytical?: number;
  };
  searchText?: string;
}

export interface DataSourceStatus {
  sourceType: SourceType;
  isConnected: boolean;
  lastRefresh: Date | null;
  communicationCount: number;
  errorCount: number;
}

export class UnifiedDataService {
  private static instance: UnifiedDataService;
  private ingestionPipeline: IngestionPipeline;
  private communications: Communication[] = [];
  private ingestionResults: IngestionResult[] = [];
  private isLoading = false;
  private lastRefresh: Date | null = null;
  private sourceStatus: Map<SourceType, DataSourceStatus> = new Map();
  
  private constructor() {
    // Initialize the ingestion pipeline
    this.ingestionPipeline = new IngestionPipeline();
    
    // Initialize with default adapters
    this.registerAdapter(new EmailAdapter("Gmail"));
    this.registerAdapter(new DocumentAdapter("Email Attachment"));
    this.registerAdapter(new SocialAdapter("Twitter"));
  }
  
  public static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }
  
  /**
   * Register a new source adapter
   */
  public registerAdapter(adapter: SourceAdapter): void {
    this.ingestionPipeline.registerAdapter(adapter);
    
    // Initialize source status
    this.sourceStatus.set(adapter.getSourceType(), {
      sourceType: adapter.getSourceType(),
      isConnected: adapter.isConnected(),
      lastRefresh: null,
      communicationCount: 0,
      errorCount: 0
    });
  }
  
  /**
   * Remove a source adapter
   */
  public removeAdapter(sourceType: SourceType): void {
    this.ingestionPipeline.removeAdapter(sourceType);
    this.sourceStatus.delete(sourceType);
  }
  
  /**
   * Get all registered adapters
   */
  public getAdapters(): SourceAdapter[] {
    return this.ingestionPipeline.getAdapters();
  }
  
  /**
   * Get status for all data sources
   */
  public getSourceStatus(): DataSourceStatus[] {
    return Array.from(this.sourceStatus.values());
  }
  
  /**
   * Load data from all registered adapters
   */
  public async loadAllData(): Promise<void> {
    if (this.isLoading) {
      throw new Error("Data loading already in progress");
    }
    
    try {
      this.isLoading = true;
      
      // Use the ingestion pipeline to process all sources
      this.ingestionResults = await this.ingestionPipeline.ingestFromAllSources();
      
      // Extract communications from results
      this.communications = this.ingestionResults
        .filter(result => result.success)
        .map(result => result.communication);
      
      // Sort by timestamp (newest first)
      this.communications.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      // Update source status
      this.updateSourceStatus();
      
      this.lastRefresh = new Date();
    } catch (error) {
      console.error("Failed to load data:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Update status for all data sources
   */
  private updateSourceStatus(): void {
    // Group ingestion results by source
    const resultsBySource = new Map<SourceType, IngestionResult[]>();
    
    for (const result of this.ingestionResults) {
      const source = result.communication.source;
      if (!resultsBySource.has(source)) {
        resultsBySource.set(source, []);
      }
      const sourceResults = resultsBySource.get(source);
      if (sourceResults) {
        sourceResults.push(result);
      }
    }
    
    // Update status for each source
    for (const [source, results] of resultsBySource.entries()) {
      const status = this.sourceStatus.get(source);
      if (status) {
        status.lastRefresh = this.lastRefresh;
        status.communicationCount = results.length;
        status.errorCount = results.filter(r => !r.success).length;
      }
    }
  }
  
  /**
   * Get ingestion statistics
   */
  public getIngestionStatistics() {
    return this.ingestionPipeline.getStatistics(this.ingestionResults);
  }
  
  /**
   * Get all communications
   */
  public getCommunications(): Communication[] {
    return this.communications;
  }
  
  /**
   * Get communications filtered by source
   */
  public getCommunicationsBySource(source: SourceType): Communication[] {
    return this.communications.filter(comm => comm.source === source);
  }
  
  /**
   * Get communications filtered by project
   */
  public getCommunicationsByProject(project: ProjectType): Communication[] {
    return this.communications.filter(comm => comm.project === project);
  }
  
  /**
   * Get communications filtered by date range
   */
  public getCommunicationsByDateRange(startDate: Date, endDate: Date): Communication[] {
    return this.communications.filter(comm => {
      const commDate = new Date(comm.timestamp);
      return commDate >= startDate && commDate <= endDate;
    });
  }
  
  /**
   * Get communications with advanced filtering
   */
  public filterCommunications(filter: CommunicationFilter): Communication[] {
    return this.communications.filter(comm => {
      // Filter by sources
      if (filter.sources && filter.sources.length > 0) {
        if (!filter.sources.includes(comm.source)) {
          return false;
        }
      }
      
      // Filter by projects
      if (filter.projects && filter.projects.length > 0) {
        if (!filter.projects.includes(comm.project)) {
          return false;
        }
      }
      
      // Filter by date range
      if (filter.startDate || filter.endDate) {
        const commDate = new Date(comm.timestamp);
        
        if (filter.startDate && commDate < filter.startDate) {
          return false;
        }
        
        if (filter.endDate && commDate > filter.endDate) {
          return false;
        }
      }
      
      // Filter by senders
      if (filter.senders && filter.senders.length > 0) {
        if (!filter.senders.includes(comm.senderName)) {
          return false;
        }
      }
      
      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(comm.metadata.category)) {
          return false;
        }
      }
      
      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        const commTags = Array.isArray(comm.metadata.tags) ? comm.metadata.tags : [];
        if (!filter.tags.some(tag => commTags.includes(tag))) {
          return false;
        }
      }
      
      // Filter by urgency
      if (filter.urgency && filter.urgency.length > 0) {
        if (!filter.urgency.includes(comm.metadata.urgency)) {
          return false;
        }
      }
      
      // Filter by relationships
      if (filter.hasRelationships) {
        if (!comm.relationships || comm.relationships.length === 0) {
          return false;
        }
        
        // Filter by relationship types
        if (filter.relationshipTypes && filter.relationshipTypes.length > 0) {
          if (!comm.relationships.some(rel => 
            filter.relationshipTypes && filter.relationshipTypes.includes(rel.type)
          )) {
            return false;
          }
        }
      }
      
      // Filter by dimension scores
      if (filter.dimensionScores) {
        const scores = comm.dimensions?.confidenceScores;
        
        if (!scores) {
          return false;
        }
        
        if (filter.dimensionScores.temporal !== undefined && 
            scores.temporal < filter.dimensionScores.temporal) {
          return false;
        }
        
        if (filter.dimensionScores.relationship !== undefined && 
            scores.relationship < filter.dimensionScores.relationship) {
          return false;
        }
        
        if (filter.dimensionScores.visual !== undefined && 
            scores.visual < filter.dimensionScores.visual) {
          return false;
        }
        
        if (filter.dimensionScores.analytical !== undefined && 
            scores.analytical < filter.dimensionScores.analytical) {
          return false;
        }
      }
      
      // Filter by search text
      if (filter.searchText) {
        const lowerQuery = filter.searchText.toLowerCase();
        if (!comm.subject.toLowerCase().includes(lowerQuery) && 
            !comm.content.toLowerCase().includes(lowerQuery) && 
            !comm.senderName.toLowerCase().includes(lowerQuery)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Get communications optimized for a specific archetype
   */
  public getCommunicationsForArchetype(archetype: ArchetypeType): Communication[] {
    // Sort and filter communications based on archetype
    switch (archetype) {
      case "prioritizer":
        // Sort by urgency and deadline
        return [...this.communications].sort((a, b) => {
          // First sort by urgency
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          const urgencyDiff = 
            urgencyOrder[a.metadata.urgency] - urgencyOrder[b.metadata.urgency];
          
          if (urgencyDiff !== 0) return urgencyDiff;
          
          // Then sort by deadline if available
          if (a.dimensions?.temporal?.deadline && b.dimensions?.temporal?.deadline) {
            const aDeadline = new Date(a.dimensions.temporal.deadline);
            const bDeadline = new Date(b.dimensions.temporal.deadline);
            return aDeadline.getTime() - bDeadline.getTime();
          }
          
          // Fall back to timestamp
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        
      case "connector":
        // Group by sender and relationship strength
        return [...this.communications].sort((a, b) => {
          // First sort by sender
          const senderDiff = a.senderName.localeCompare(b.senderName);
          if (senderDiff !== 0) return senderDiff;
          
          // Then sort by relationship strength if available
          const aStrength = this.getRelationshipStrength(a);
          const bStrength = this.getRelationshipStrength(b);
          return bStrength - aStrength; // Higher strength first
        });
        
      case "visualizer":
        // Group by visual category and project
        return [...this.communications].sort((a, b) => {
          // First sort by visual category
          const aCategory = a.dimensions?.visual?.visualCategory || "text-only";
          const bCategory = b.dimensions?.visual?.visualCategory || "text-only";
          const categoryDiff = aCategory.localeCompare(bCategory);
          if (categoryDiff !== 0) return categoryDiff;
          
          // Then sort by project
          return a.project.localeCompare(b.project);
        });
        
      case "analyst":
        // Group by category and complexity
        return [...this.communications].sort((a, b) => {
          // First sort by category
          const categoryDiff = a.metadata.category.localeCompare(b.metadata.category);
          if (categoryDiff !== 0) return categoryDiff;
          
          // Then sort by complexity if available
          const aComplexity = a.dimensions?.analytical?.metrics?.complexity || "medium";
          const bComplexity = b.dimensions?.analytical?.metrics?.complexity || "medium";
          const complexityOrder = { high: 0, medium: 1, low: 2 };
          return complexityOrder[aComplexity] - complexityOrder[bComplexity];
        });
        
      default:
        return this.communications;
    }
  }
  
  /**
   * Get the relationship strength for a communication
   */
  private getRelationshipStrength(communication: Communication): number {
    if (!communication.relationships || communication.relationships.length === 0) {
      return 0;
    }
    
    // Calculate average relationship strength
    const totalStrength = communication.relationships.reduce(
      (sum, rel) => sum + rel.strength, 
      0
    );
    
    return totalStrength / communication.relationships.length;
  }
  
  /**
   * Get communications with cross-project relationships
   */
  public getCrossProjectCommunications(): Communication[] {
    return this.communications.filter(comm => {
      if (!comm.relationships) return false;
      
      // Find project relationships that aren't the primary project
      return comm.relationships.some(rel => 
        rel.type === "project" && 
        rel.value !== comm.project &&
        rel.metadata?.primary === false
      );
    });
  }
  
  /**
   * Get related communications for a specific communication
   */
  public getRelatedCommunications(communicationId: string): Communication[] {
    const communication = this.communications.find(comm => comm.id === communicationId);
    if (!communication || !communication.relationships) {
      return [];
    }
    
    // Collect all related communication IDs
    const relatedIds = new Set<string>();
    for (const relationship of communication.relationships) {
      if (relationship.relatedCommunicationIds) {
        for (const id of relationship.relatedCommunicationIds) {
          relatedIds.add(id);
        }
      }
    }
    
    // Find the related communications
    return this.communications.filter(comm => relatedIds.has(comm.id));
  }
  
  /**
   * Search communications by text
   */
  public searchCommunications(query: string): Communication[] {
    const lowerQuery = query.toLowerCase();
    return this.communications.filter(comm => 
      comm.subject.toLowerCase().includes(lowerQuery) || 
      comm.content.toLowerCase().includes(lowerQuery) ||
      comm.senderName.toLowerCase().includes(lowerQuery) ||
      (comm.metadata.category && comm.metadata.category.toLowerCase().includes(lowerQuery)) ||
      (Array.isArray(comm.metadata.tags) && 
       comm.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  
  /**
   * Get loading status
   */
  public isDataLoading(): boolean {
    return this.isLoading;
  }
  
  /**
   * Get last refresh time
   */
  public getLastRefreshTime(): Date | null {
    return this.lastRefresh;
  }
  
  /**
   * Get communications grouped by dimension
   */
  public getCommunicationsByDimension(
    dimensionType: "temporal" | "relationship" | "visual" | "analytical",
    threshold: number = 0.7
  ): Record<string, Communication[]> {
    const result: Record<string, Communication[]> = {};
    
    for (const communication of this.communications) {
      if (!communication.dimensions) continue;
      
      // Check if the dimension confidence exceeds the threshold
      const confidenceScore = communication.dimensions.confidenceScores?.[dimensionType];
      if (!confidenceScore || confidenceScore < threshold) continue;
      
      // Group by different properties based on dimension type
      let key: string;
      
      switch (dimensionType) {
        case "temporal":
          // Group by urgency
          key = communication.dimensions.temporal?.urgency || "unknown";
          break;
          
        case "relationship":
          // Group by connection strength
          key = communication.dimensions.relationship?.connectionStrength || "unknown";
          break;
          
        case "visual":
          // Group by visual category
          key = communication.dimensions.visual?.visualCategory || "unknown";
          break;
          
        case "analytical":
          // Group by complexity
          key = communication.dimensions.analytical?.metrics?.complexity || "unknown";
          break;
          
        default:
          key = "unknown";
      }
      
      if (!result[key]) {
        result[key] = [];
      }
      
      result[key].push(communication);
    }
    
    return result;
  }
}
