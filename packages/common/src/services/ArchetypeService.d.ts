import { ArchetypeType, UserProfile } from "../types/communication";
export interface InteractionEvent {
    type: string;
    target: string;
    timestamp: number;
    metadata: Record<string, unknown>;
}
export interface ArchetypeChangeListener {
    (profile: UserProfile): void;
}
export declare class ArchetypeService {
    private static instance;
    private interactions;
    private userProfile;
    private apiService;
    private isLoading;
    private changeListeners;
    private interactionWeights;
    private constructor();
    static getInstance(): ArchetypeService;
    private loadUserProfile;
    trackInteraction(event: InteractionEvent): Promise<void>;
    private updateConfidenceScores;
    private apiUpdateTimeout;
    private debounceApiUpdate;
    private notifyListeners;
    addChangeListener(listener: ArchetypeChangeListener): void;
    removeChangeListener(listener: ArchetypeChangeListener): void;
    getUserProfile(): UserProfile;
    getPrimaryArchetype(): ArchetypeType;
    getArchetypeConfidence(): Record<ArchetypeType, number>;
    setArchetype(archetype: ArchetypeType): Promise<void>;
    resetInteractions(): Promise<void>;
    isProfileLoading(): boolean;
}
