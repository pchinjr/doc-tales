export declare class CacheService {
    private static instance;
    private cache;
    private defaultTTL;
    private constructor();
    static getInstance(): CacheService;
    /**
     * Get an item from the cache
     * @param key The cache key
     * @returns The cached data or null if not found or expired
     */
    get<T>(key: string): T | null;
    /**
     * Set an item in the cache
     * @param key The cache key
     * @param data The data to cache
     * @param ttl Time to live in milliseconds (optional, defaults to 5 minutes)
     */
    set<T>(key: string, data: T, ttl?: number): void;
    /**
     * Check if an item exists in the cache and is not expired
     * @param key The cache key
     * @returns True if the item exists and is not expired
     */
    has(key: string): boolean;
    /**
     * Remove an item from the cache
     * @param key The cache key
     */
    remove(key: string): void;
    /**
     * Clear all items from the cache
     */
    clear(): void;
    /**
     * Clear expired items from the cache
     */
    clearExpired(): void;
    /**
     * Get or fetch data
     * @param key The cache key
     * @param fetchFn Function to fetch data if not in cache
     * @param ttl Time to live in milliseconds (optional)
     * @returns The cached or fetched data
     */
    getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
}
