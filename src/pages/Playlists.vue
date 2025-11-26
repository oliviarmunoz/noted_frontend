<template>
  <div class="page">
    <div class="playlists-container">
      <h1 class="page-title">MY PLAYLISTS</h1>

      <!-- Favorites Section -->
      <div class="playlist-section">
        <div class="playlist-header">
          <h2 class="playlist-title">FAVORITES</h2>
          <span class="playlist-count" v-if="!loadingFavorites">
            ({{ favoritesItems.length }})
          </span>
        </div>

        <div v-if="loadingFavorites" class="loading-state">Loading favorites...</div>
        <div v-else-if="favoritesError" class="error-state">{{ favoritesError }}</div>
        <div v-else-if="favoritesItems.length === 0" class="empty-state">
          <p>No favorites yet. Start adding songs to your favorites!</p>
        </div>
        <ul v-else class="playlist-items">
          <li
            v-for="item in favoritesItems"
            :key="item.item"
            class="playlist-item"
          >
            <div class="item-content" @click="navigateToReview(item)">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="item-thumbnail"
              />
              <div v-else class="item-thumbnail-placeholder">
                {{ item.name?.charAt(0) || "?" }}
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name || "Unknown" }}</div>
                <div class="item-artist">{{ item.artist || "" }}</div>
              </div>
            </div>
            <button
              class="remove-item-btn"
              @click.stop="removeFromPlaylist(item, 'Favorites')"
              title="Remove from Favorites"
            >
              ×
            </button>
          </li>
        </ul>
      </div>

      <!-- Listen Later Section -->
      <div class="playlist-section">
        <div class="playlist-header">
          <h2 class="playlist-title">LISTEN LATER</h2>
          <span class="playlist-count" v-if="!loadingListenLater">
            ({{ listenLaterItems.length }})
          </span>
        </div>

        <div v-if="loadingListenLater" class="loading-state">Loading listen later...</div>
        <div v-else-if="listenLaterError" class="error-state">{{ listenLaterError }}</div>
        <div v-else-if="listenLaterItems.length === 0" class="empty-state">
          <p>No songs in your listen later list. Add songs to listen to later!</p>
        </div>
        <ul v-else class="playlist-items">
          <li
            v-for="item in listenLaterItems"
            :key="item.item"
            class="playlist-item"
          >
            <div class="item-content" @click="navigateToReview(item)">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="item-thumbnail"
              />
              <div v-else class="item-thumbnail-placeholder">
                {{ item.name?.charAt(0) || "?" }}
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name || "Unknown" }}</div>
                <div class="item-artist">{{ item.artist || "" }}</div>
              </div>
            </div>
            <button
              class="remove-item-btn"
              @click.stop="removeFromPlaylist(item, 'Listen Later')"
              title="Remove from Listen Later"
            >
              ×
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePlaylists } from "../composables/usePlaylists.js";
import { useToast } from "../composables/useToast.js";
import { usePlaylistEvents } from "../composables/usePlaylistEvents.js";
import { useAuth } from "../composables/useAuth.js";

export default {
  name: "Playlists",
  setup() {
    const router = useRouter();
    const { currentUser } = useAuth();
    
    // Get userId from authenticated user
    const userId = ref(null);
    
    // Update userId when currentUser changes
    watch(
      () => currentUser.value,
      (user) => {
        // currentUser might be the user object or just the user ID string
        userId.value = user?._id || user || null;
      },
      { immediate: true }
    );

    const favoritesItems = ref([]);
    const listenLaterItems = ref([]);
    const loadingFavorites = ref(false);
    const loadingListenLater = ref(false);
    const favoritesError = ref(null);
    const listenLaterError = ref(null);

    // Use composables
    const { loadPlaylistItems, removeItemFromPlaylist } = usePlaylists();
    const { showToastNotification } = useToast();
    const { playlistUpdateEvent } = usePlaylistEvents();

    // Load favorites
    const loadFavorites = async () => {
      if (!userId.value) {
        favoritesItems.value = [];
        return;
      }
      
      loadingFavorites.value = true;
      favoritesError.value = null;

      try {
        const playlistComposable = getPlaylistComposable();
        const result = await playlistComposable.loadPlaylistItems("Favorites");
        if (result.error) {
          favoritesError.value = result.error;
          favoritesItems.value = [];
        } else {
          favoritesItems.value = result.items;
        }
      } catch (error) {
        console.error("[Playlists] Error loading favorites:", error);
        favoritesError.value = error.message || "Failed to load favorites";
        favoritesItems.value = [];
      } finally {
        loadingFavorites.value = false;
      }
    };

    // Load listen later
    const loadListenLater = async () => {
      if (!userId.value) {
        listenLaterItems.value = [];
        return;
      }
      
      loadingListenLater.value = true;
      listenLaterError.value = null;

      try {
        const playlistComposable = getPlaylistComposable();
        const result = await playlistComposable.loadPlaylistItems("Listen Later");
        if (result.error) {
          listenLaterError.value = result.error;
          listenLaterItems.value = [];
        } else {
          listenLaterItems.value = result.items;
        }
      } catch (error) {
        console.error("[Playlists] Error loading listen later:", error);
        listenLaterError.value = error.message || "Failed to load listen later";
        listenLaterItems.value = [];
      } finally {
        loadingListenLater.value = false;
      }
    };

    // Navigate to review page
    const navigateToReview = (item) => {
      if (!item.uri) {
        console.error("Item missing URI:", item);
        return;
      }

      const encodedUri = encodeURIComponent(item.uri);
      router.push(`/review/${encodedUri}`);
    };

    // Remove item from playlist
    const removeFromPlaylist = async (item, playlistName) => {
      if (!userId.value) {
        showToastNotification("Error: User not authenticated");
        return;
      }
      
      if (!item.item) {
        showToastNotification("Error: Item ID not found");
        return;
      }

      try {
        const playlistComposable = getPlaylistComposable();
        const result = await playlistComposable.removeItemFromPlaylist(item.item, playlistName);
        
        if (!result.success) {
          showToastNotification(result.error || `Error removing from ${playlistName}`);
          return;
        }

        showToastNotification(`Removed from ${playlistName}`);
        
        // Reload the playlist
        if (playlistName === "Favorites") {
          await loadFavorites();
        } else {
          await loadListenLater();
        }
      } catch (error) {
        console.error(`[Playlists] Error removing from ${playlistName}:`, error);
        showToastNotification(`Error removing from ${playlistName}`);
      }
    };

    // Watch for playlist updates from other components
    watch(
      () => playlistUpdateEvent.value,
      (update) => {
        if (update) {
          // Refresh the playlist that was updated
          if (update.playlistName === "Favorites") {
            loadFavorites();
          } else if (update.playlistName === "Listen Later") {
            loadListenLater();
          }
        }
      }
    );

    // Load playlists on mount
    onMounted(() => {
      loadFavorites();
      loadListenLater();
    });

    return {
      favoritesItems,
      listenLaterItems,
      loadingFavorites,
      loadingListenLater,
      favoritesError,
      listenLaterError,
      navigateToReview,
      removeFromPlaylist,
    };
  },
};
</script>

<style scoped>
.page {
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.playlists-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 3rem 0;
  letter-spacing: -0.02em;
}

.playlist-section {
  margin-bottom: 4rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.playlist-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(123, 140, 168, 0.2);
}

.playlist-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
}

.playlist-count {
  color: #7b8ca8;
  font-size: 1rem;
  font-weight: 600;
}

.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #7b8ca8;
}

.error-state {
  color: #ff6b9d;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.playlist-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.playlist-item:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.3);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.item-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-thumbnail-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 0.95rem;
  color: #7b8ca8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-item-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 6px;
  color: #ff6b9d;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-item-btn:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: #ff6b9d;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .playlist-section {
    padding: 1.5rem;
  }

  .playlist-title {
    font-size: 1.2rem;
  }
}
</style>

