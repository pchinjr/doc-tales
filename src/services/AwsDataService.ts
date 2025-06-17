import { Communication, ArchetypeType, ProjectType } from "../types/communication";
import { ApiService } from "./ApiService";

export class AwsDataService {
  private static instance: AwsDataService;
  private communications: Communication[] = [];
  private isLoading = false;
  private lastRefresh: Date | null = null;
  private apiService: ApiService;
  
  private constructor() {
    this.apiService = ApiService.getInstance();
  }
  
  public static getInstance(): AwsDataService {
    if (!AwsDataService.instance) {
      AwsDataService.instance = new AwsDataService();
    }
    return AwsDataService.instance;
  }
  
  /**
   * Load data from API
   */
  public async loadAllData(): Promise<void> {
    if (this.isLoading) {
      throw new Error("Data loading already in progress");
    }
    
    try {
      this.isLoading = true;
      
      // Load communications from API
      this.communications = await this.apiService.getCommunications();
      
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
   * Get communications filtered by project
   */
  public async getCommunicationsByProject(project: ProjectType): Promise<Communication[]> {
    try {
      return await this.apiService.getCommunications(project);
    } catch (error) {
      console.error(`Failed to fetch communications for project ${project}:`, error);
      return [];
    }
  }
  
  /**
   * Get communications optimized for a specific archetype
   */
  public async getCommunicationsForArchetype(archetype: ArchetypeType): Promise<Communication[]> {
    try {
      // First update the user profile to set the archetype
      const archetypeService = await import("./ArchetypeService").then(
        module => module.ArchetypeService.getInstance()
      );
      await archetypeService.setArchetype(archetype);
      
      // Then fetch communications, which will be customized by the API
      return await this.apiService.getCommunications();
    } catch (error) {
      console.error(`Failed to fetch communications for archetype ${archetype}:`, error);
      return this.communications;
    }
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
