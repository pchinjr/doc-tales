"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchetypeService = void 0;
const ApiService_1 = require("./ApiService");
class ArchetypeService {
    constructor() {
        this.interactions = [];
        this.userProfile = {
            id: "default-user",
            primaryArchetype: "connector",
            archetypeConfidence: {
                prioritizer: 0.25,
                connector: 0.25,
                visualizer: 0.25,
                analyst: 0.25
            }
        };
        this.isLoading = false;
        this.changeListeners = [];
        this.interactionWeights = {
            date_click: { prioritizer: 0.15, connector: 0.05, visualizer: 0.05, analyst: 0.05 },
            person_click: { prioritizer: 0.05, connector: 0.15, visualizer: 0.05, analyst: 0.05 },
            image_view: { prioritizer: 0.05, connector: 0.05, visualizer: 0.15, analyst: 0.05 },
            details_view: { prioritizer: 0.05, connector: 0.05, visualizer: 0.05, analyst: 0.15 }
        };
        // Debounce API updates to avoid too many calls
        this.apiUpdateTimeout = null;
        this.apiService = ApiService_1.ApiService.getInstance();
        this.loadUserProfile();
    }
    static getInstance() {
        if (!ArchetypeService.instance) {
            ArchetypeService.instance = new ArchetypeService();
        }
        return ArchetypeService.instance;
    }
    async loadUserProfile() {
        try {
            this.isLoading = true;
            const profile = await this.apiService.getUserProfile();
            this.userProfile = profile;
            this.notifyListeners();
        }
        catch (error) {
            console.error("Failed to load user profile:", error);
            // Keep using default profile
        }
        finally {
            this.isLoading = false;
        }
    }
    async trackInteraction(event) {
        this.interactions.push(event);
        // Update confidence scores immediately for real-time feedback
        this.updateConfidenceScores(event);
        // Notify listeners of the change
        this.notifyListeners();
        // Debounce the API update to avoid too many calls
        this.debounceApiUpdate();
    }
    updateConfidenceScores(event) {
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
                newConfidence[key] /= sum;
            });
            // Update local state
            this.userProfile.archetypeConfidence = newConfidence;
            // Find the archetype with highest confidence
            let maxConfidence = 0;
            let primaryArchetype = this.userProfile.primaryArchetype;
            Object.entries(newConfidence).forEach(([archetype, confidence]) => {
                if (confidence > maxConfidence) {
                    maxConfidence = confidence;
                    primaryArchetype = archetype;
                }
            });
            // Only update primary archetype if it's changed and confidence is significantly higher
            if (primaryArchetype !== this.userProfile.primaryArchetype &&
                newConfidence[primaryArchetype] > newConfidence[this.userProfile.primaryArchetype] * 1.2) {
                this.userProfile.primaryArchetype = primaryArchetype;
            }
        }
    }
    debounceApiUpdate() {
        if (this.apiUpdateTimeout) {
            clearTimeout(this.apiUpdateTimeout);
        }
        this.apiUpdateTimeout = setTimeout(async () => {
            try {
                await this.apiService.updateUserProfile(this.userProfile);
            }
            catch (error) {
                console.error("Failed to update user profile:", error);
            }
        }, 2000); // Wait 2 seconds before updating the API
    }
    notifyListeners() {
        this.changeListeners.forEach(listener => {
            listener({ ...this.userProfile });
        });
    }
    addChangeListener(listener) {
        this.changeListeners.push(listener);
    }
    removeChangeListener(listener) {
        this.changeListeners = this.changeListeners.filter(l => l !== listener);
    }
    getUserProfile() {
        return { ...this.userProfile };
    }
    getPrimaryArchetype() {
        return this.userProfile.primaryArchetype;
    }
    getArchetypeConfidence() {
        return { ...this.userProfile.archetypeConfidence };
    }
    async setArchetype(archetype) {
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
        }
        catch (error) {
            console.error("Failed to update user profile:", error);
        }
    }
    async resetInteractions() {
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
        }
        catch (error) {
            console.error("Failed to update user profile:", error);
        }
    }
    isProfileLoading() {
        return this.isLoading;
    }
}
exports.ArchetypeService = ArchetypeService;
//# sourceMappingURL=ArchetypeService.js.map