import { ref } from "vue";
import { playlist } from "../api/api.js";
import { useEntities } from "./useEntities.js";
import { getUserId } from "./useAuth.js";

/**
 * Composable for playlist management
 */
export function usePlaylists() {
  const { loadEntityByExternalId } = useEntities();

  /**
   * Add an item to a playlist
   * @param {string} itemId - The externalId (Spotify ID) of the item to add
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const addItemToPlaylist = async (itemId, playlistName) => {
    try {
      const userId = getUserId();
      if (!userId) {
        return { success: false, error: 'No userId found in localStorage' };
      }

      // Add item to playlist using externalId
      // Note: Backend creates playlists automatically, so we don't need to create them here
      const addResult = await playlist.addItem(userId, itemId, playlistName);

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
   * Remove an item from a playlist
   * @param {string} itemId - The ID of the item to remove
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const removeItemFromPlaylist = async (itemId, playlistName) => {
    try {
      const userId = getUserId();
      if (!userId) {
        return { success: false, error: 'No userId found in localStorage' };
      }

      const result = await playlist.deleteItem(userId, itemId, playlistName);
      
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
    removeItemFromPlaylist,
  };
}