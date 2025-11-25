import { ref } from "vue";

/**
 * Simple event system for playlist updates
 * This allows components to communicate when playlists change
 */
const playlistUpdateEvent = ref(null);

export function usePlaylistEvents() {
  const triggerPlaylistUpdate = (playlistName) => {
    playlistUpdateEvent.value = {
      playlistName,
      timestamp: Date.now(),
    };
  };

  const onPlaylistUpdate = (callback) => {
    // Watch for changes to playlistUpdateEvent
    return () => {
      if (playlistUpdateEvent.value) {
        callback(playlistUpdateEvent.value.playlistName);
        playlistUpdateEvent.value = null; // Reset after handling
      }
    };
  };

  return {
    triggerPlaylistUpdate,
    onPlaylistUpdate,
    playlistUpdateEvent,
  };
}

