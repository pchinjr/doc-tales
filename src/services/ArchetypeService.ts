import { ArchetypeType } from "../types/communication";
import { ApiService, UserProfile } from "./ApiService";

export interface InteractionEvent {
  type: string;
  target: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export class ArchetypeService {
  private static instance: ArchetypeService;
  private interactions: InteractionEvent[] = [];
  private userProfile: UserProfile = {
    id: "default-user",
    primaryArchetype: "connector",
    archetypeConfidence: {
      prioritizer: 0.25,
      connector: 0.25,
      visualizer: 0.25,
      analyst: 0.25
    }
  };
  private apiService: ApiService;
  private isLoading: boolean = false;

  private constructor() {
    this.apiService = ApiService.getInstance();
    this.loadUserProfile();
  }

  public static getInstance(): ArchetypeService {
    if (!ArchetypeService.instance) {
      ArchetypeService.instance = new ArchetypeService();
    }
    return ArchetypeService.instance;
  }

  private async loadUserProfile(): Promise<void> {
    try {
      this.isLoading = true;
      const profile = await this.apiService.getUserProfile();
      this.userProfile = profile;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Keep using default profile
    } finally {
      this.isLoading = false;
    }
  }

  public async trackInteraction(event: InteractionEvent): Promise<void> {
    this.interactions.push(event);
    await this.updateArchetype();
  }

  private async updateArchetype(): Promise<void> {
    // Simple rule-based classification for hackathon
    // In a real implementation, this would use ML
    
    const dateInteractions = this.countInteractionsByType("date_click");
    const peopleInteractions = this.countInteractionsByType("person_click");
    const visualInteractions = this.countInteractionsByType("image_view");
    const detailInteractions = this.countInteractionsByType("details_view");
    
    const total = Math.max(1, dateInteractions + peopleInteractions + 
                          visualInteractions + detailInteractions);
    
    const newConfidence = {
      prioritizer: Math.max(0.1, dateInteractions / total),
      connector: Math.max(0.1, peopleInteractions / total),
      visualizer: Math.max(0.1, visualInteractions / total),
      analyst: Math.max(0.1, detailInteractions / total)
    };
    
    // Find the archetype with highest confidence
    let maxConfidence = 0;
    let primaryArchetype: ArchetypeType = "connector";
    
    Object.entries(newConfidence).forEach(([archetype, confidence]) => {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        primaryArchetype = archetype as ArchetypeType;
      }
    });
    
    // Update local state
    this.userProfile.archetypeConfidence = newConfidence;
    this.userProfile.primaryArchetype = primaryArchetype;
    
    // Update API
    try {
      await this.apiService.updateUserProfile(this.userProfile);
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }
  
  private countInteractionsByType(type: string): number {
    return this.interactions.filter(event => event.type === type).length;
  }
  
  public getUserProfile(): UserProfile {
    return this.userProfile;
  }
  
  public getPrimaryArchetype(): ArchetypeType {
    return this.userProfile.primaryArchetype;
  }
  
  public getArchetypeConfidence(): Record<ArchetypeType, number> {
    return this.userProfile.archetypeConfidence;
  }
  
  public async setArchetype(archetype: ArchetypeType): Promise<void> {
    // Update confidence to heavily favor the selected archetype
    const newConfidence = {
      prioritizer: 0.1,
      connector: 0.1,
      visualizer: 0.1,
      analyst: 0.1
    };
    newConfidence[archetype] = 0.7;
    
    // Update local state
    this.userProfile.archetypeConfidence = newConfidence;
    this.userProfile.primaryArchetype = archetype;
    
    // Update API
    try {
      await this.apiService.updateUserProfile(this.userProfile);
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }
  
  public async resetInteractions(): Promise<void> {
    this.interactions = [];
    const defaultConfidence = {
      prioritizer: 0.25,
      connector: 0.25,
      visualizer: 0.25,
      analyst: 0.25
    };
    
    // Update local state
    this.userProfile.archetypeConfidence = defaultConfidence;
    
    // Update API
    try {
      await this.apiService.updateUserProfile(this.userProfile);
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }
  
  public isProfileLoading(): boolean {
    return this.isLoading;
  }
}
