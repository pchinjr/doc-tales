import { ArchetypeType, UserProfile } from "../types/communication";

export interface InteractionEvent {
  type: string;
  target: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export class ArchetypeService {
  private static instance: ArchetypeService;
  private interactions: InteractionEvent[] = [];
  private userProfile: UserProfile = {
    id: "demo-user",
    primaryArchetype: "connector",
    archetypeConfidence: {
      prioritizer: 0.25,
      connector: 0.25,
      visualizer: 0.25,
      analyst: 0.25
    },
    preferences: {}
  };

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ArchetypeService {
    if (!ArchetypeService.instance) {
      ArchetypeService.instance = new ArchetypeService();
    }
    return ArchetypeService.instance;
  }

  public trackInteraction(event: InteractionEvent): void {
    this.interactions.push(event);
    this.updateArchetype();
  }

  private updateArchetype(): void {
    // Simple rule-based classification for hackathon
    // In a real implementation, this would use ML
    
    const dateInteractions = this.countInteractionsByType("date_click");
    const peopleInteractions = this.countInteractionsByType("person_click");
    const visualInteractions = this.countInteractionsByType("image_view");
    const detailInteractions = this.countInteractionsByType("details_view");
    
    const total = Math.max(1, dateInteractions + peopleInteractions + 
                          visualInteractions + detailInteractions);
    
    this.userProfile.archetypeConfidence = {
      prioritizer: dateInteractions / total,
      connector: peopleInteractions / total,
      visualizer: visualInteractions / total,
      analyst: detailInteractions / total
    };
    
    // Find the archetype with highest confidence
    let maxConfidence = 0;
    let primaryArchetype: ArchetypeType = "connector";
    
    Object.entries(this.userProfile.archetypeConfidence).forEach(([archetype, confidence]) => {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        primaryArchetype = archetype as ArchetypeType;
      }
    });
    
    this.userProfile.primaryArchetype = primaryArchetype;
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
  
  public resetInteractions(): void {
    this.interactions = [];
    this.userProfile.archetypeConfidence = {
      prioritizer: 0.25,
      connector: 0.25,
      visualizer: 0.25,
      analyst: 0.25
    };
  }
}
