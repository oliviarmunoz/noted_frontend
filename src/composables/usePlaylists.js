import { ref } from "vue";
import { playlist } from "../api/api.js";
import { useEntities } from "./useEntities.js";
import { getSession, getUserId } from "./useAuth.js";

/**
 * Composable for playlist management
 */
export function usePlaylists() {
  const { loadEntityByExternalId } = useEntities();

  /**
   * Add an item to a playlist
   * @param {string} itemId - The externalId (Spotify ID) of the item to add
   * @param {string} playlistName - Name of the playlist
   * @param {string|null} targetUser - Optional target user ID for adding to friend's playlist
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const addItemToPlaylist = async (itemId, playlistName, targetUser = null) => {
    try {
      const session = getSession();
      if (!session) {
        return { success: false, error: 'No session found in localStorage' };
      }

      // Add item to playlist using externalId
      // Note: Backend creates playlists automatically, so we don't need to create them here
      const addResult = await playlist.addItem(session, itemId, playlistName, targetUser);

      if (addResult && addResult.error) {
        return { success: false, error: addResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error(`[usePlaylists] Error adding item to ${playlistName}:`, error);
      return { success: false, error: error.message || "Failed to add item" };
    }
  };

  /**
   * Load items from a playlist with their entity details
   * @param {string} playlistName - Name of the playlist
   * @param {number} limit - Maximum number of items to load (default: 20)
   * @param {number} offset - Number of items to skip (default: 0)
   * @returns {Promise<{items: Array, error: string|null, hasMore: boolean, total: number}>}
   */
  const loadPlaylistItems = async (playlistName, limit = 20, offset = 0) => {
    try {
      const userId = getUserId();
      if (!userId) {
        return { items: [], error: 'No userId found in localStorage', hasMore: false, total: 0 };
      }

      const items = await playlist.getPlaylistItems(userId, playlistName);

      if (items && items.error) {
        return { items: [], error: items.error, hasMore: false, total: 0 };
      }

      const allItems = items || [];
      const total = allItems.length;
      
      // Slice the items based on limit and offset
      const paginatedItems = allItems.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      // Get entity details for each item (only for the paginated subset)
      // Items are stored as externalId (Spotify ID) in the playlist
      const itemDetails = await Promise.all(
        paginatedItems.map(async (itemObj) => {
          const itemId = itemObj.item || itemObj;
          console.log(`[usePlaylists] Loading details for playlist item: ${itemId}`);
          return await loadEntityByExternalId(itemId);
        })
      );

      return { items: itemDetails, error: null, hasMore, total };
    } catch (error) {
      console.error(`[usePlaylists] Error loading ${playlistName} playlist:`, error);
      return { items: [], error: error.message || "Failed to load playlist", hasMore: false, total: 0 };
    }
  };

  /**
   * Get the count of items in a playlist (lightweight - no entity details)
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{count: number, error: string|null}>}
   */
  const getPlaylistCount = async (playlistName) => {
    try {
      const userId = getUserId();
      if (!userId) {
        return { count: 0, error: 'No userId found in localStorage' };
      }

      const items = await playlist.getPlaylistItems(userId, playlistName);

      if (items && items.error) {
        return { count: 0, error: items.error };
      }

      const count = (items || []).length;
      return { count, error: null };
    } catch (error) {
      console.error(`[usePlaylists] Error getting ${playlistName} count:`, error);
      return { count: 0, error: error.message || "Failed to get playlist count" };
    }
  };

  /**
   * Remove an item from a playlist
   * @param {string} itemId - The ID of the item to remove
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const removeItemFromPlaylist = async (itemId, playlistName) => {
    try {
      const session = getSession();
      if (!session) {
        return { success: false, error: 'No session found in localStorage' };
      }

      const result = await playlist.deleteItem(session, itemId, playlistName);
      
      if (result && result.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error(`[usePlaylists] Error removing item from ${playlistName}:`, error);
      return { success: false, error: error.message || "Failed to remove item" };
    }
  };

  return {
    addItemToPlaylist,
    loadPlaylistItems,
    getPlaylistCount,
    removeItemFromPlaylist,
  };
}