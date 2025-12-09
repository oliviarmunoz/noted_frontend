import { ref } from "vue";
import { userProfile } from "../api/api.js";

// In-memory cache for thumbnails
const thumbnailCache = ref(new Map());

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Get thumbnail from cache or load it
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Thumbnail URL or null
 */
export async function getThumbnail(userId) {
  if (!userId) return null;

  // Check cache first
  const cached = thumbnailCache.value.get(userId);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < CACHE_EXPIRY) {
      return cached.url;
    } else {
      // Cache expired, remove it
      thumbnailCache.value.delete(userId);
    }
  }

  // Load from API
  try {
    const result = await userProfile.getThumbnail(userId);
    const thumbnailData =
      Array.isArray(result) && result.length > 0 ? result[0] : result;
    const thumbnailUrl =
      thumbnailData?.thumbnailUrl || thumbnailData?.thumbnail || null;

    // Cache the result (even if null to avoid repeated failed requests)
    thumbnailCache.value.set(userId, {
      url: thumbnailUrl,
      timestamp: Date.now(),
    });

    return thumbnailUrl;
  } catch (error) {
    console.warn(`[ThumbnailCache] Error loading thumbnail for user ${userId}:`, error);
    // Cache null to avoid repeated failed requests (with shorter expiry)
    thumbnailCache.value.set(userId, {
      url: null,
      timestamp: Date.now() - (CACHE_EXPIRY - 60000), // Expire in 1 minute for errors
    });
    return null;
  }
}

/**
 * Load multiple thumbnails with concurrency limit
 * @param {string[]} userIds - Array of user IDs
 * @param {number} concurrency - Max parallel requests (default: 10)
 * @returns {Promise<Map<string, string|null>>} Map of userId -> thumbnailUrl
 */
export async function loadThumbnailsBatch(userIds, concurrency = 10) {
  if (!userIds || userIds.length === 0) return new Map();

  const results = new Map();
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  // Check cache first for all users
  const uncachedUserIds = [];
  for (const userId of uniqueUserIds) {
    const cached = thumbnailCache.value.get(userId);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < CACHE_EXPIRY) {
        results.set(userId, cached.url);
      } else {
        thumbnailCache.value.delete(userId);
        uncachedUserIds.push(userId);
      }
    } else {
      uncachedUserIds.push(userId);
    }
  }

  // Load uncached thumbnails with concurrency limit
  for (let i = 0; i < uncachedUserIds.length; i += concurrency) {
    const batch = uncachedUserIds.slice(i, i + concurrency);
    
    await Promise.all(
      batch.map(async (userId) => {
        const thumbnailUrl = await getThumbnail(userId);
        results.set(userId, thumbnailUrl);
      })
    );
  }

  return results;
}

/**
 * Clear the thumbnail cache
 */
export function clearThumbnailCache() {
  thumbnailCache.value.clear();
}

/**
 * Preload thumbnails for user IDs (non-blocking)
 * @param {string[]} userIds - Array of user IDs
 */
export function preloadThumbnails(userIds) {
  if (!userIds || userIds.length === 0) return;
  
  // Fire and forget - don't wait for results
  loadThumbnailsBatch(userIds, 10).catch((err) => {
    console.warn("[ThumbnailCache] Error preloading thumbnails:", err);
  });
}
