// Task 5: Create Mock Data Service
import { Communication, SourceType, ProjectType, ArchetypeType } from "../types/communication";
import { SourceAdapter } from "./SourceAdapter";
import { EmailAdapter } from "./adapters/EmailAdapter";
import { DocumentAdapter } from "./adapters/DocumentAdapter";
import { SocialAdapter } from "./adapters/SocialAdapter";
import { Dimensions } from "../types/dimensions";

export class UnifiedDataService {
  private static instance: UnifiedDataService;
  private adapters: Map<SourceType, SourceAdapter> = new Map();
  private communications: Communication[] = [];
  private isLoading = false;
  private lastRefresh: Date | null = null;
  
  private constructor() {
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
    this.adapters.set(adapter.getSourceType(), adapter);
  }
  
  /**
   * Remove a source adapter
   */
  public removeAdapter(sourceType: SourceType): void {
    this.adapters.delete(sourceType);
  }
  
  /**
   * Get all registered adapters
   */
  public getAdapters(): SourceAdapter[] {
    return Array.from(this.adapters.values());
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
      this.communications = [];
      
      // Load data from each adapter
      for (const adapter of this.adapters.values()) {
        if (adapter.isConnected()) {
          const adapterData = await adapter.fetchCommunications();
          this.communications = [...this.communications, ...adapterData];
        }
      }
      
      // Sort by timestamp (newest first)
      this.communications.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      this.lastRefresh = new Date();
    } catch (error) {
      console.error("Failed to load data:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
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
          
          // Then sort by timestamp
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        
      case "connector":
        // Group by sender
        return [...this.communications].sort((a, b) => {
          return a.senderName.localeCompare(b.senderName);
        });
        
      case "visualizer":
        // Group by project
        return [...this.communications].sort((a, b) => {
          return a.project.localeCompare(b.project);
        });
        
      case "analyst":
        // Group by category
        return [...this.communications].sort((a, b) => {
          return a.metadata.category.localeCompare(b.metadata.category);
        });
        
      default:
        return this.communications;
    }
  }
  
  /**
   * Search communications by text
   */
  public searchCommunications(query: string): Communication[] {
    const lowerQuery = query.toLowerCase();
    return this.communications.filter(comm => 
      comm.subject.toLowerCase().includes(lowerQuery) || 
      comm.content.toLowerCase().includes(lowerQuery) ||
      comm.senderName.toLowerCase().includes(lowerQuery)
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
}
