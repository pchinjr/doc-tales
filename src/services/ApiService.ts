import { Communication, ArchetypeType } from "../types/communication";
import { CacheService } from "./CacheService";

// API endpoint URL
const API_BASE_URL = "https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev";

export interface UserProfile {
  id: string;
  primaryArchetype: ArchetypeType;
  archetypeConfidence: Record<ArchetypeType, number>;
  preferences?: Record<string, any>;
  name?: string;
  email?: string;
}

export class ApiService {
  private static instance: ApiService;
  private cacheService: CacheService;
  
  // Private constructor with comment to satisfy ESLint
  private constructor() {
    // Private constructor for singleton pattern
    this.cacheService = CacheService.getInstance();
  }
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  /**
   * Get all communications
   */
  public async getCommunications(project?: string): Promise<Communication[]> {
    const cacheKey = `communications${project ? `-${project}` : ''}`;
    
    return this.cacheService.getOrFetch(
      cacheKey,
      async () => {
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
        } catch (error) {
          console.error("Failed to fetch communications:", error);
          throw error;
        }
      },
      60000 // Cache for 1 minute
    );
  }
  
  /**
   * Get a specific communication by ID
   */
  public async getCommunicationById(id: string): Promise<Communication> {
    const cacheKey = `communication-${id}`;
    
    return this.cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/communications/${id}`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`Failed to fetch communication ${id}:`, error);
          throw error;
        }
      },
      300000 // Cache for 5 minutes
    );
  }
  
  /**
   * Get user profile
   */
  public async getUserProfile(userId = "default-user"): Promise<UserProfile> {
    const cacheKey = `user-profile-${userId}`;
    
    return this.cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/user-profile?userId=${userId}`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          throw error;
        }
      },
      60000 // Cache for 1 minute
    );
  }
  
  /**
   * Update user profile
   */
  public async updateUserProfile(profile: UserProfile): Promise<void> {
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
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  }
  
  /**
   * Get available archetypes
   */
  public async getArchetypes(): Promise<any[]> {
    const cacheKey = 'archetypes';
    
    return this.cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/archetypes`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error("Failed to fetch archetypes:", error);
          throw error;
        }
      },
      3600000 // Cache for 1 hour
    );
  }
  
  /**
   * Clear the cache
   */
  public clearCache(): void {
    this.cacheService.clear();
  }
}
