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
        <div
          v-else
          class="playlist-items-container"
          @scroll="handleScroll($event, 'Favorites')"
        >
          <ul class="playlist-items">
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
          <div v-if="favoritesLoadingMore" class="loading-more">Loading more...</div>
          <div v-else-if="!favoritesHasMore && favoritesItems.length > 0" class="end-message">
            All favorites loaded
          </div>
        </div>
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
        <div
          v-else
          class="playlist-items-container"
          @scroll="handleScroll($event, 'Listen Later')"
        >
          <ul class="playlist-items">
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
          <div v-if="listenLaterLoadingMore" class="loading-more">Loading more...</div>
          <div v-else-if="!listenLaterHasMore && listenLaterItems.length > 0" class="end-message">
            All songs loaded
          </div>
        </div>
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
import { getUserId } from "../composables/useAuth.js";

export default {
  name: "Playlists",
  setup() {
    const router = useRouter();
    
    const userId = getUserId();

    const favoritesItems = ref([]);
    const listenLaterItems = ref([]);
    const loadingFavorites = ref(false);
    const loadingListenLater = ref(false);
    const favoritesError = ref(null);
    const listenLaterError = ref(null);
    const favoritesHasMore = ref(false);
    const listenLaterHasMore = ref(false);
    const favoritesLoadingMore = ref(false);
    const listenLaterLoadingMore = ref(false);
    const ITEMS_PER_PAGE = 20;

    // Use composables
    const { loadPlaylistItems, removeItemFromPlaylist } = usePlaylists();
    const { showToastNotification } = useToast();
    const { playlistUpdateEvent } = usePlaylistEvents();

    // Load favorites
    const loadFavorites = async (loadMore = false) => {
      if (loadMore) {
        favoritesLoadingMore.value = true;
      } else {
        loadingFavorites.value = true;
        favoritesError.value = null;
        favoritesItems.value = [];
      }

      try {
        const offset = loadMore ? favoritesItems.value.length : 0;
        const result = await loadPlaylistItems("Favorites", ITEMS_PER_PAGE, offset);
        if (result.error) {
          favoritesError.value = result.error;
          if (!loadMore) {
            favoritesItems.value = [];
          }
        } else {
          if (loadMore) {
            favoritesItems.value = [...favoritesItems.value, ...result.items];
          } else {
            favoritesItems.value = result.items;
          }
          favoritesHasMore.value = result.hasMore;
        }
      } catch (error) {
        console.error("[Playlists] Error loading favorites:", error);
        favoritesError.value = error.message || "Failed to load favorites";
        if (!loadMore) {
          favoritesItems.value = [];
        }
      } finally {
        loadingFavorites.value = false;
        favoritesLoadingMore.value = false;
      }
    };

    // Load listen later
    const loadListenLater = async (loadMore = false) => {
      if (loadMore) {
        listenLaterLoadingMore.value = true;
      } else {
        loadingListenLater.value = true;
        listenLaterError.value = null;
        listenLaterItems.value = [];
      }

      try {
        const offset = loadMore ? listenLaterItems.value.length : 0;
        const result = await loadPlaylistItems("Listen Later", ITEMS_PER_PAGE, offset);
        if (result.error) {
          listenLaterError.value = result.error;
          if (!loadMore) {
            listenLaterItems.value = [];
          }
        } else {
          if (loadMore) {
            listenLaterItems.value = [...listenLaterItems.value, ...result.items];
          } else {
            listenLaterItems.value = result.items;
          }
          listenLaterHasMore.value = result.hasMore;
        }
      } catch (error) {
        console.error("[Playlists] Error loading listen later:", error);
        listenLaterError.value = error.message || "Failed to load listen later";
        if (!loadMore) {
          listenLaterItems.value = [];
        }
      } finally {
        loadingListenLater.value = false;
        listenLaterLoadingMore.value = false;
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
      if (!item.item) {
        showToastNotification("Error: Item ID not found");
        return;
      }

      try {
        const result = await removeItemFromPlaylist(item.item, playlistName);
        
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

    // Handle scroll for infinite loading
    const handleScroll = (event, playlistName) => {
      const target = event.target;
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      
      // Load more when within 200px of bottom
      if (scrollBottom < 200) {
        if (playlistName === "Favorites" && favoritesHasMore.value && !favoritesLoadingMore.value && !loadingFavorites.value) {
          loadFavorites(true);
        } else if (playlistName === "Listen Later" && listenLaterHasMore.value && !listenLaterLoadingMore.value && !loadingListenLater.value) {
          loadListenLater(true);
        }
      }
    };

    return {
      favoritesItems,
      listenLaterItems,
      loadingFavorites,
      loadingListenLater,
      favoritesError,
      listenLaterError,
      favoritesHasMore,
      listenLaterHasMore,
      favoritesLoadingMore,
      listenLaterLoadingMore,
      navigateToReview,
      removeFromPlaylist,
      handleScroll,
      loadFavorites,
      loadListenLater,
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

.playlist-items-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.playlist-items-container::-webkit-scrollbar {
  width: 8px;
}

.playlist-items-container::-webkit-scrollbar-track {
  background: rgba(10, 14, 26, 0.3);
  border-radius: 4px;
}

.playlist-items-container::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 4px;
}

.playlist-items-container::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.5);
}

.playlist-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-more,
.end-message {
  padding: 1rem;
  text-align: center;
  color: #7b8ca8;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.loading-more {
  color: #4a9eff;
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