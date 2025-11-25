<template>
  <div id="app">
    <!-- Navigation -->
    <nav v-if="isAuthenticated()" class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">
          <span class="caps">NOTED</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/playlists" class="nav-link">Playlists</router-link>
        </div>
        <div class="nav-search" ref="searchContainer">
          <input
            type="text"
            placeholder="Search song, album, people"
            class="search-input"
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="showResults = true"
            @blur="handleSearchBlur"
          />
          <span class="search-icon">🔍</span>
          <!-- Show loading state when searching -->
          <div v-if="showResults && isSearching" class="search-results">
            <div class="search-loading">Searching...</div>
          </div>
          <!-- Show results when not searching and we have results -->
          <div
            v-else-if="showResults && searchResults.length > 0"
            class="search-results"
          >
            <div
              v-for="result in searchResults"
              :key="result._id || result.uri"
              class="search-result-item"
            >
              <div class="result-main" @mousedown="selectResult(result)">
                <img
                  v-if="result.imageUrl"
                  :src="result.imageUrl"
                  :alt="result.name"
                  class="result-image"
                />
                <div v-else class="result-image-placeholder">
                  {{ result.name?.charAt(0) || "?" }}
                </div>
                <div class="result-info">
                  <div class="result-name">{{ result.name }}</div>
                  <div class="result-artist" v-if="result.artistName">
                    {{ result.artistName }}
                  </div>
                  <div class="result-type">{{ result.type || "track" }}</div>
                </div>
              </div>
              <div class="result-actions">
                <button
                  class="playlist-btn"
                  @click.stop="addToPlaylist(result, 'Favorites')"
                  :disabled="addingToPlaylist[result._id]"
                  title="Add to Favorites"
                >
                  ♥
                </button>
                <button
                  class="playlist-btn"
                  @click.stop="addToPlaylist(result, 'Listen Later')"
                  :disabled="addingToPlaylist[result._id]"
                  title="Add to Listen Later"
                >
                  ⏱
                </button>
              </div>
            </div>
          </div>
          <!-- Show no results when not searching and no results -->
          <div
            v-else-if="
              showResults &&
              searchQuery &&
              searchResults.length === 0 &&
              !isSearching
            "
            class="search-results"
          >
            <div class="search-no-results">No results found</div>
          </div>
        </div>
        <div class="nav-actions">
          <button class="icon-btn">
            <span class="icon">+</span>
          </button>
          <!-- TODO: Add profile page -->
          <router-link to="/profile" class="icon-btn">
            <span class="icon">👤</span>
          </router-link>
          <button
            class="icon-btn logout-btn"
            @click="handleLogout"
            title="Logout"
          >
            <span class="icon">Logout</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <router-view />

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <span class="toast-icon">✓</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { musicDiscovery } from "./api/api.js";
import { usePlaylists } from "./composables/usePlaylists.js";
import { useToast } from "./composables/useToast.js";
import { usePlaylistEvents } from "./composables/usePlaylistEvents.js";
import { useAuth } from "./composables/useAuth.js";

export default {
  name: "App",
  setup() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const searchQuery = ref("");
    const searchResults = ref([]);
    const showResults = ref(false);
    const isSearching = ref(false);
    const searchContainer = ref(null);
    const searchTimeout = ref(null);
    const addingToPlaylist = ref({});

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

    // Wrapper function for playlist operations that handle userId being null
    const getPlaylistComposable = () => {
      if (!userId.value) {
        throw new Error("User not authenticated");
      }
      return usePlaylists(userId.value);
    };
    const { toastMessage, showToast, showToastNotification } = useToast();
    const { triggerPlaylistUpdate } = usePlaylistEvents();
    const { logout, isAuthenticated } = useAuth();

    const performSearch = async (query) => {
      if (!query || query.trim().length === 0) {
        searchResults.value = [];
        isSearching.value = false;
        return;
      }

      // Clear previous results when starting a new search to prevent overlap
      searchResults.value = [];
      isSearching.value = true;

      try {
        if (!userId.value) {
          console.error("[App] Cannot search: User not authenticated");
          searchResults.value = [];
          return;
        }

        const response = await musicDiscovery.search(
          userId.value,
          query.trim()
        );

        if (response && response.error) {
          console.error("Search error:", response.error);
          searchResults.value = [];
          return;
        }

        // Filter to only show tracks (songs) for now
        // You can modify this to show albums/artists too
        const entities = (response?.musicEntities || []).filter(
          (entity) => entity.type === "track" || !entity.type
        );

        // Debug: Log the structure of search results
        if (entities.length > 0) {
          console.log("[App] Search result structure:", {
            firstEntity: entities[0],
            hasExternalId: !!entities[0].externalId,
            has_id: !!entities[0]._id,
            externalId: entities[0].externalId,
            _id: entities[0]._id,
          });
        }

        searchResults.value = entities;
      } catch (error) {
        console.error("Error performing search:", error);
        searchResults.value = [];
      } finally {
        isSearching.value = false;
      }
    };

    const handleSearchInput = () => {
      // Clear existing timeout
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      // Debounce search - wait 300ms after user stops typing
      searchTimeout.value = setTimeout(() => {
        performSearch(searchQuery.value);
      }, 300);
    };

    const selectResult = (result) => {
      if (!result.uri) {
        console.error("Result missing URI:", result);
        return;
      }

      // Use the full URI (e.g., "spotify:track:xxxxx")
      // URL-encode it for the route to handle colons
      const encodedUri = encodeURIComponent(result.uri);

      // Navigate to review page
      router.push(`/review/${encodedUri}`);

      // Clear search
      searchQuery.value = "";
      searchResults.value = [];
      showResults.value = false;
    };

    const handleSearchBlur = (event) => {
      // Delay hiding results to allow click events to fire
      setTimeout(() => {
        // Check if focus moved to search results
        if (
          searchContainer.value &&
          !searchContainer.value.contains(document.activeElement)
        ) {
          showResults.value = false;
        }
      }, 200);
    };

    // Add item to playlist
    const addToPlaylist = async (result, playlistName) => {
      if (!userId.value) {
        showToastNotification("Error: User not authenticated");
        return;
      }

      if (!result._id && !result.externalId) {
        showToastNotification("Error: Song ID not found");
        return;
      }

      // Use externalId for playlist items so we can retrieve them later with getEntityFromId
      // The playlist API stores the item ID, and getEntityFromId expects externalId
      const itemId = result.externalId || result._id;
      const resultKey = result._id || result.uri;

      // Prevent duplicate clicks
      if (addingToPlaylist.value[resultKey]) {
        return;
      }

      addingToPlaylist.value[resultKey] = true;

      try {
        console.log(`[App] Adding item to ${playlistName}:`, {
          itemId,
          externalId: result.externalId,
          _id: result._id,
          name: result.name,
        });

        const playlistComposable = getPlaylistComposable();
        const addResult = await playlistComposable.addItemToPlaylist(
          itemId,
          playlistName
        );

        if (!addResult.success) {
          // Format error message to show song name instead of ID
          let errorMessage =
            addResult.error || `Error adding to ${playlistName}`;
          if (errorMessage.includes("already in playlist") && result.name) {
            // Replace the item ID with the song name in the error message
            // Handles formats like: Item 'ID' or Item "ID" or just the ID
            errorMessage = errorMessage.replace(
              /Item\s+['"]?[^'"]+['"]?/,
              `"${result.name}"`
            );
          }
          showToastNotification(errorMessage);
          return;
        }

        showToastNotification(`Added to ${playlistName}!`);

        // Trigger playlist update event so Home page can refresh
        triggerPlaylistUpdate(playlistName);
      } catch (error) {
        console.error(`[App] Error adding to ${playlistName}:`, error);
        showToastNotification(`Error adding to ${playlistName}`);
      } finally {
        addingToPlaylist.value[resultKey] = false;
      }
    };

    const handleLogout = () => {
      logout();
    };

    // Cleanup timeout on unmount
    onUnmounted(() => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
    });

    return {
      searchQuery,
      searchResults,
      showResults,
      isSearching,
      searchContainer,
      addingToPlaylist,
      toastMessage,
      showToast,
      handleSearchInput,
      selectResult,
      handleSearchBlur,
      addToPlaylist,
      showToastNotification,
      handleLogout,
      isAuthenticated,
    };
  },
};
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.navbar {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(123, 140, 168, 0.2);
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  display: inline-block;
}

.logo .caps {
  letter-spacing: 0.05em;
}

.logo .lowercase {
  font-size: 0.6em;
  font-weight: 400;
  margin-left: 0.1em;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #7b8ca8;
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #4a9eff;
}

.nav-search {
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 200;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.search-input::placeholder {
  color: #4a5568;
}

.search-icon {
  position: absolute;
  right: 1rem;
  color: #7b8ca8;
  font-size: 1rem;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(26, 35, 52, 0.95);
  border: 1px solid rgba(123, 140, 168, 0.3);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  transition: background 0.2s ease;
  border-bottom: 1px solid rgba(123, 140, 168, 0.1);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: rgba(74, 158, 255, 0.1);
}

.result-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.playlist-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  padding: 0;
}

.playlist-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
  transform: scale(1.1);
}

.playlist-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.result-image-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-artist {
  color: #7b8ca8;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-type {
  color: #4a5568;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-no-results,
.search-loading {
  padding: 1.5rem;
  text-align: center;
  color: #7b8ca8;
  font-size: 0.9rem;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.icon-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #7b8ca8;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1.2rem;
}

.logout-btn {
  width: auto;
  min-width: 5.5rem;
  padding: 0 1.25rem;
  height: 2.5rem;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.icon-btn:hover {
  border-color: #4a9eff;
  color: #4a9eff;
  background: rgba(74, 158, 255, 0.1);
}

.icon {
  display: block;
}

/* Footer */
.footer {
  padding: 3rem 2rem;
  border-top: 1px solid rgba(123, 140, 168, 0.2);
  background: rgba(10, 14, 26, 0.8);
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-logo {
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-text {
  font-size: 0.85rem;
  color: #7b8ca8;
  letter-spacing: 0.1em;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(26, 35, 52, 0.95);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 2000;
}

.toast-icon {
  color: #4ade80;
  font-size: 1.2rem;
  font-weight: 900;
}

.toast-message {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-search {
    margin: 1rem 0;
    max-width: 100%;
    order: 3;
    width: 100%;
  }

  .nav-actions {
    order: 2;
  }
}
</style>
