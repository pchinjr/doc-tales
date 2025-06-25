"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const CacheService_1 = require("./CacheService");
// API endpoint URL
const API_BASE_URL = "https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev";
class ApiService {
    // Private constructor with comment to satisfy ESLint
    constructor() {
        // Private constructor for singleton pattern
        this.cacheService = CacheService_1.CacheService.getInstance();
    }
    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
    /**
     * Get all communications
     */
    async getCommunications(project) {
        const cacheKey = `communications${project ? `-${project}` : ""}`;
        return this.cacheService.getOrFetch(cacheKey, async () => {
            try {
                let url = `${API_BASE_URL}/communications`;
                if (project) {
                    url += `?project=${encodeURIComponent(project)}`;
                }
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data = await response.json();
                return data.communications || [];
            }
            catch (error) {
                console.error("Failed to fetch communications:", error);
                throw error;
            }
        }, 60000 // Cache for 1 minute
        );
    }
    /**
     * Get a specific communication by ID
     */
    async getCommunicationById(id) {
        const cacheKey = `communication-${id}`;
        return this.cacheService.getOrFetch(cacheKey, async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/communications/${id}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return await response.json();
            }
            catch (error) {
                console.error(`Failed to fetch communication ${id}:`, error);
                throw error;
            }
        }, 300000 // Cache for 5 minutes
        );
    }
    /**
     * Get user profile
     */
    async getUserProfile(userId = "default-user") {
        const cacheKey = `user-profile-${userId}`;
        return this.cacheService.getOrFetch(cacheKey, async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user-profile?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return await response.json();
            }
            catch (error) {
                console.error("Failed to fetch user profile:", error);
                throw error;
            }
        }, 60000 // Cache for 1 minute
        );
    }
    /**
     * Update user profile
     */
    async updateUserProfile(profile) {
        try {
            const response = await fetch(`${API_BASE_URL}/user-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(profile)
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            // Update the cache
            const cacheKey = `user-profile-${profile.id}`;
            this.cacheService.set(cacheKey, profile);
        }
        catch (error) {
            console.error("Failed to update user profile:", error);
            throw error;
        }
    }
    /**
     * Get available archetypes
     */
    async getArchetypes() {
        const cacheKey = "archetypes";
        return this.cacheService.getOrFetch(cacheKey, async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/archetypes`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return await response.json();
            }
            catch (error) {
                console.error("Failed to fetch archetypes:", error);
                throw error;
            }
        }, 3600000 // Cache for 1 hour
        );
    }
    /**
     * Clear the cache
     */
    clearCache() {
        this.cacheService.clear();
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=ApiService.js.map