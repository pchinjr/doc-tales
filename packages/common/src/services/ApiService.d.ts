import { Communication, UserProfile } from "../types/communication";
export declare class ApiService {
    private static instance;
    private cacheService;
    private constructor();
    static getInstance(): ApiService;
    /**
     * Get all communications
     */
    getCommunications(project?: string): Promise<Communication[]>;
    /**
     * Get a specific communication by ID
     */
    getCommunicationById(id: string): Promise<Communication>;
    /**
     * Get user profile
     */
    getUserProfile(userId?: string): Promise<UserProfile>;
    /**
     * Update user profile
     */
    updateUserProfile(profile: UserProfile): Promise<void>;
    /**
     * Get available archetypes
     */
    getArchetypes(): Promise<any[]>;
    /**
     * Clear the cache
     */
    clearCache(): void;
}
