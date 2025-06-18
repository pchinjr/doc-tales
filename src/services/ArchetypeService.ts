import { ArchetypeType } from "../types/communication";
import { ApiService, UserProfile } from "./ApiService";

export interface InteractionEvent {
  type: string;
  target: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface ArchetypeChangeListener {
  (profile: UserProfile): void;
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
  private isLoading = false;
  private changeListeners: ArchetypeChangeListener[] = [];
  private interactionWeights = {
    date_click: { prioritizer: 0.15, connector: 0.05, visualizer: 0.05, analyst: 0.05 },
    person_click: { prioritizer: 0.05, connector: 0.15, visualizer: 0.05, analyst: 0.05 },
    image_view: { prioritizer: 0.05, connector: 0.05, visualizer: 0.15, analyst: 0.05 },
    details_view: { prioritizer: 0.05, connector: 0.05, visualizer: 0.05, analyst: 0.15 }
  };

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
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Keep using default profile
    } finally {
      this.isLoading = false;
    }
  }

  public async trackInteraction(event: InteractionEvent): Promise<void> {
    this.interactions.push(event);
    
    // Update confidence scores immediately for real-time feedback
    this.updateConfidenceScores(event);
    
    // Notify listeners of the change
    this.notifyListeners();
    
    // Debounce the API update to avoid too many calls
    this.debounceApiUpdate();
  }

  private updateConfidenceScores(event: InteractionEvent): void {
    const eventType = event.type;
    
    // If we have weights for this event type
    if (this.interactionWeights[eventType]) {
      const weights = this.interactionWeights[eventType];
      const currentConfidence = this.userProfile.archetypeConfidence;
      
      // Apply weights with a damping factor to avoid sudden changes
      const dampingFactor = 0.8;
      const newConfidence = {
        prioritizer: currentConfidence.prioritizer * dampingFactor + weights.prioritizer,
        connector: currentConfidence.connector * dampingFactor + weights.connector,
        visualizer: currentConfidence.visualizer * dampingFactor + weights.visualizer,
        analyst: currentConfidence.analyst * dampingFactor + weights.analyst
      };
      
      // Normalize to ensure sum is 1.0
      const sum = Object.values(newConfidence).reduce((a, b) => a + b, 0);
      Object.keys(newConfidence).forEach(key => {
        newConfidence[key as ArchetypeType] /= sum;
      });
      
      // Update local state
      this.userProfile.archetypeConfidence = newConfidence;
      
      // Find the archetype with highest confidence
      let maxConfidence = 0;
      let primaryArchetype: ArchetypeType = this.userProfile.primaryArchetype;
      
      Object.entries(newConfidence).forEach(([archetype, confidence]) => {
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          primaryArchetype = archetype as ArchetypeType;
        }
      });
      
      // Only update primary archetype if it's changed and confidence is significantly higher
      if (primaryArchetype !== this.userProfile.primaryArchetype && 
          newConfidence[primaryArchetype] > newConfidence[this.userProfile.primaryArchetype] * 1.2) {
        this.userProfile.primaryArchetype = primaryArchetype;
      }
    }
  }
  
  // Debounce API updates to avoid too many calls
  private apiUpdateTimeout: NodeJS.Timeout | null = null;
  private debounceApiUpdate(): void {
    if (this.apiUpdateTimeout) {
      clearTimeout(this.apiUpdateTimeout);
    }
    
    this.apiUpdateTimeout = setTimeout(async () => {
      try {
        await this.apiService.updateUserProfile(this.userProfile);
      } catch (error) {
        console.error("Failed to update user profile:", error);
      }
    }, 2000); // Wait 2 seconds before updating the API
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => {
      listener({ ...this.userProfile });
    });
  }
  
  public addChangeListener(listener: ArchetypeChangeListener): void {
    this.changeListeners.push(listener);
  }
  
  public removeChangeListener(listener: ArchetypeChangeListener): void {
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }
  
  private countInteractionsByType(type: string): number {
    return this.interactions.filter(event => event.type === type).length;
  }
  
  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }
  
  public getPrimaryArchetype(): ArchetypeType {
    return this.userProfile.primaryArchetype;
  }
  
  public getArchetypeConfidence(): Record<ArchetypeType, number> {
    return { ...this.userProfile.archetypeConfidence };
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
    
    // Notify listeners
    this.notifyListeners();
    
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
    
    // Notify listeners
    this.notifyListeners();
    
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
