<template>
  <div class="page">
    <div class="home-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h2 class="sidebar-title">LISTEN LATER</h2>
          <div v-if="loadingListenLater" class="loading-text">Loading...</div>
          <div v-else-if="listenLaterError" class="error-text">{{ listenLaterError }}</div>
          <ul v-else class="song-list">
            <li
              v-for="item in listenLaterItems"
              :key="item.item"
              class="song-item"
            >
              <div class="song-item-content" @click="navigateToReview(item)">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="song-thumbnail"
                />
                <div v-else class="song-thumbnail-placeholder">
                  {{ item.name?.charAt(0) || "?" }}
                </div>
                <div class="song-info">
                  <div class="song-name">{{ item.name || "Loading..." }}</div>
                  <div class="song-artist">{{ item.artist || "" }}</div>
                </div>
              </div>
              <button
                class="remove-btn"
                @click.stop="removeFromPlaylist(item, 'Listen Later')"
                title="Remove from Listen Later"
              >
                ×
              </button>
            </li>
            <li v-if="listenLaterItems.length === 0" class="empty-message">
              No songs in Listen Later
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">FAVORITES</h2>
          <div v-if="loadingFavorites" class="loading-text">Loading...</div>
          <div v-else-if="favoritesError" class="error-text">{{ favoritesError }}</div>
          <ul v-else class="song-list">
            <li
              v-for="item in favoritesItems"
              :key="item.item"
              class="song-item"
            >
              <div class="song-item-content" @click="navigateToReview(item)">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="song-thumbnail"
                />
                <div v-else class="song-thumbnail-placeholder">
                  {{ item.name?.charAt(0) || "?" }}
                </div>
                <div class="song-info">
                  <div class="song-name">{{ item.name || "Loading..." }}</div>
                  <div class="song-artist">{{ item.artist || "" }}</div>
                </div>
              </div>
              <button
                class="remove-btn"
                @click.stop="removeFromPlaylist(item, 'Favorites')"
                title="Remove from Favorites"
              >
                ×
              </button>
            </li>
            <li v-if="favoritesItems.length === 0" class="empty-message">
              No favorites yet
            </li>
          </ul>
        </div>
      </aside>

      <!-- Main Feed -->
      <main class="feed">
        <div class="review-card" v-for="review in reviews" :key="review.id">
          <div class="review-header">
            <div class="user-icon">👤</div>
            <div class="review-meta">
              <span class="reviewer-name">{{ review.reviewer }} reviewed</span>
            </div>
          </div>
          <div
            class="song-details"
            @click="navigateFromFeed(review)"
            style="cursor: pointer"
          >
            <span class="play-icon">▶</span>
            <div class="song-text">
              <div class="song-title">{{ review.song }}</div>
              <div class="song-artist">{{ review.artist }}</div>
            </div>
          </div>
          <div class="rating">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ filled: i <= review.rating }"
            >
              ★
            </span>
          </div>
          <p class="review-comment">{{ review.comment }}</p>
          <div class="comment-input">
            <span class="comment-icon">👤</span>
            <input
              type="text"
              placeholder="Leave a comment"
              class="comment-field"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePlaylists } from "../composables/usePlaylists.js";
import { useToast } from "../composables/useToast.js";
import { usePlaylistEvents } from "../composables/usePlaylistEvents.js";

export default {
  name: "Home",
  setup() {
    const router = useRouter();
    
    // TODO: Get from session/auth when implemented
    const userId = "user1";

    const favoritesItems = ref([]);
    const listenLaterItems = ref([]);
    const loadingFavorites = ref(false);
    const loadingListenLater = ref(false);
    const favoritesError = ref(null);
    const listenLaterError = ref(null);

    // Use composables
    const { loadPlaylistItems, removeItemFromPlaylist } = usePlaylists(userId);
    const { showToastNotification } = useToast();
    const { playlistUpdateEvent } = usePlaylistEvents();

    // Load favorites
    const loadFavorites = async () => {
      loadingFavorites.value = true;
      favoritesError.value = null;

      try {
        const result = await loadPlaylistItems("Favorites");
        if (result.error) {
          favoritesError.value = result.error;
          favoritesItems.value = [];
        } else {
          favoritesItems.value = result.items;
        }
      } catch (error) {
        console.error("[Home] Error loading favorites:", error);
        favoritesError.value = error.message || "Failed to load favorites";
        favoritesItems.value = [];
      } finally {
        loadingFavorites.value = false;
      }
    };

    // Load listen later
    const loadListenLater = async () => {
      loadingListenLater.value = true;
      listenLaterError.value = null;

      try {
        const result = await loadPlaylistItems("Listen Later");
        if (result.error) {
          listenLaterError.value = result.error;
          listenLaterItems.value = [];
        } else {
          listenLaterItems.value = result.items;
        }
      } catch (error) {
        console.error("[Home] Error loading listen later:", error);
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

    // Navigate from activity feed (uses sample data with songId/uri)
    const navigateFromFeed = (review) => {
      const uri = review.songUri || review.uri;
      
      // Check if we have a valid Spotify URI
      if (!uri || !uri.startsWith("spotify:")) {
        // If it's just a number (sample data), show a message
        if (review.songId && typeof review.songId === "number") {
          showToastNotification("This is sample data. Click on real reviews to view songs.");
          return;
        }
        console.error("Feed item missing valid URI:", review);
        showToastNotification("Cannot navigate: Song URI not available");
        return;
      }
      
      router.push(`/review/${encodeURIComponent(uri)}`);
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
        console.error(`[Home] Error removing from ${playlistName}:`, error);
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
      navigateFromFeed,
      removeFromPlaylist,
    };
  },
  data() {
    return {
      reviews: [
        {
          id: 1,
          reviewer: "Angela",
          song: "22",
          artist: "Taylor Swift",
          rating: 4,
          comment: "I loved this song!",
          songId: 1,
        },
        {
          id: 2,
          reviewer: "Victor",
          song: "Espresso",
          artist: "Sabrina Carpenter",
          rating: 4,
          comment: "Great song!",
          songId: 2,
        },
      ],
    };
  },
};
</script>

<style scoped>
.page {
  width: 100%;
  min-height: calc(100vh - 80px);
}

.home-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-section {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 1rem 0;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.song-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.song-item:hover {
  background-color: rgba(74, 158, 255, 0.1);
}

.song-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.song-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-thumbnail-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
}

.remove-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 4px;
  color: #ff6b9d;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: #ff6b9d;
  transform: scale(1.1);
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.song-artist {
  font-size: 0.85rem;
  color: #7b8ca8;
}

.loading-text,
.error-text {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.loading-text {
  color: #7b8ca8;
}

.error-text {
  color: #ff6b9d;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: #7b8ca8;
  font-size: 0.85rem;
  font-style: italic;
  list-style: none;
}

/* Feed */
.feed {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-card {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(123, 140, 168, 0.1);
}

.user-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.reviewer-name {
  color: #ffffff;
  font-weight: 600;
}

.song-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  transition: opacity 0.2s ease;
}

.song-details:hover {
  opacity: 0.8;
}

.play-icon {
  color: #4a9eff;
  font-size: 1.2rem;
  cursor: pointer;
}

.song-text {
  display: flex;
  flex-direction: column;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.song-artist {
  font-size: 0.9rem;
  color: #7b8ca8;
}

.rating {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star {
  color: #4a5568;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffd700;
}

.review-comment {
  color: #7b8ca8;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.comment-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(123, 140, 168, 0.1);
}

.comment-icon {
  color: #7b8ca8;
  font-size: 1rem;
}

.comment-field {
  flex: 1;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
}

.comment-field:focus {
  outline: none;
  border-color: #4a9eff;
}

.comment-field::placeholder {
  color: #4a5568;
}

@media (max-width: 968px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .feed {
    order: 1;
  }
}

@media (max-width: 768px) {
  .home-layout {
    padding: 1rem;
  }
}
</style>
