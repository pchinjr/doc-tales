// CacheService.ts
// Provides caching for API responses to reduce loading flashes

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  
  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist or is expired
    if (!item || Date.now() > item.expiresAt) {
      if (item) {
        // Clean up expired item
        this.cache.delete(key);
      }
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl Time to live in milliseconds (optional, defaults to 5 minutes)
   */
  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }
  
  /**
   * Check if an item exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the item exists and is not expired
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    return !!item && Date.now() <= item.expiresAt;
  }
  
  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  public remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear expired items from the cache
   */
  public clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get or fetch data
   * @param key The cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param ttl Time to live in milliseconds (optional)
   * @returns The cached or fetched data
   */
  public async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = this.get<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in cache, fetch it
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}
