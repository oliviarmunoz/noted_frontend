import { ref } from "vue";
import { playlist } from "../api/api.js";
import { useEntities } from "./useEntities.js";

/**
 * Composable for playlist management
 */
export function usePlaylists(userId) {
  const { loadEntityByExternalId } = useEntities();

  /**
   * Ensure a playlist exists, creating it if necessary
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<boolean>}
   */
  const ensurePlaylistExists = async (playlistName) => {
    try {
      const playlists = await playlist.getUserPlaylists(userId);
      
      if (playlists && playlists.error) {
        console.error(`[usePlaylists] Error getting playlists:`, playlists.error);
        return false;
      }

      const exists = (playlists || []).some(
        (p) => p.name === playlistName
      );

      if (!exists) {
        const result = await playlist.createPlaylist(userId, playlistName);
        if (result && result.error) {
          // If playlist already exists, that's fine - treat as success
          if (result.error.includes("already exists")) {
            return true;
          }
          console.error(`[usePlaylists] Error creating playlist ${playlistName}:`, result.error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`[usePlaylists] Error ensuring playlist ${playlistName} exists:`, error);
      return false;
    }
  };

  /**
   * Add an item to a playlist
   * @param {string} itemId - The externalId (Spotify ID) of the item to add
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const addItemToPlaylist = async (itemId, playlistName) => {
    try {
      // Ensure playlist exists
      const playlistExists = await ensurePlaylistExists(playlistName);
      if (!playlistExists) {
        return { success: false, error: `Could not create ${playlistName} playlist` };
      }

      // Add item to playlist using externalId
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
   * Load all items from a playlist with their entity details
   * @param {string} playlistName - Name of the playlist
   * @returns {Promise<{items: Array, error: string|null}>}
   */
  const loadPlaylistItems = async (playlistName) => {
    try {
      const items = await playlist.getPlaylistItems(userId, playlistName);

      if (items && items.error) {
        return { items: [], error: items.error };
      }

      // Get entity details for each item
      // Items are stored as externalId (Spotify ID) in the playlist
      const itemDetails = await Promise.all(
        (items || []).map(async (itemObj) => {
          const itemId = itemObj.item || itemObj;
          console.log(`[usePlaylists] Loading details for playlist item: ${itemId}`);
          return await loadEntityByExternalId(itemId);
        })
      );

      return { items: itemDetails, error: null };
    } catch (error) {
      console.error(`[usePlaylists] Error loading ${playlistName} playlist:`, error);
      return { items: [], error: error.message || "Failed to load playlist" };
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
    ensurePlaylistExists,
    addItemToPlaylist,
    loadPlaylistItems,
    removeItemFromPlaylist,
  };
}

