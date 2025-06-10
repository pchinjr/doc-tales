import { Communication, Project, Contact, ProjectType } from '../types/communication';

export class DataService {
  private static instance: DataService;
  private communications: Communication[] = [];
  private projects: Project[] = [];
  private contacts: Contact[] = [];

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
      const data = await import('../data/sampleData.json');
      this.communications = data.communications;
      this.projects = data.projects;
      this.contacts = data.contacts;
    } catch (error) {
      console.error('Failed to load sample data:', error);
      throw error;
    }
  }

  public getCommunications(): Communication[] {
    return this.communications;
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public getContacts(): Contact[] {
    return this.contacts;
  }

  public getCommunicationsByProject(projectId: ProjectType): Communication[] {
    return this.communications.filter(comm => comm.project === projectId);
  }
  
  public getCommunicationById(id: string): Communication | undefined {
    return this.communications.find(comm => comm.id === id);
  }
  
  public getProjectById(id: ProjectType): Project | undefined {
    return this.projects.find(project => project.id === id);
  }
  
  public getContactById(id: string): Contact | undefined {
    return this.contacts.find(contact => contact.id === id);
  }
  
  public getRelatedCommunications(communicationId: string): Communication[] {
    const communication = this.getCommunicationById(communicationId);
    if (!communication) return [];
    
    const relatedIds = communication.relationships.map(rel => rel.targetId);
    return this.communications.filter(comm => relatedIds.includes(comm.id));
  }
}
