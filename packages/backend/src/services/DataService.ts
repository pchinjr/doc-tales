import { Communication, ProjectType } from "@doc-tales/common";

export class DataService {
  private static instance: DataService;
  private communications: Communication[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async loadSampleData(): Promise<void> {
    try {
      // In a real implementation, this would load from API/AWS
      // For hackathon, we'll load from local JSON
      const { sampleData } = await import("@doc-tales/common");
      
      // Type assertion to match our interfaces
      this.communications = sampleData.communications as unknown as Communication[];
    } catch (error) {
      console.error("Failed to load sample data:", error);
      throw error;
    }
  }

  public getCommunications(): Communication[] {
    return this.communications;
  }

  public getCommunicationsByProject(projectId: ProjectType): Communication[] {
    return this.communications.filter(comm => comm.project === projectId);
  }
  
  public getCommunicationById(id: string): Communication | undefined {
    return this.communications.find(comm => comm.id === id);
  }
}
