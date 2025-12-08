<template>
  <div class="page">
    <div class="profile-container">
      <!-- User Header -->
      <div class="profile-header">
        <div class="user-avatar">
          <img
            v-if="thumbnailUrl"
            :src="thumbnailUrl"
            alt="Profile picture"
            class="avatar-image"
          />
          <span v-else class="avatar-icon">👤</span>
          <!-- Upload button (only for own profile) -->
          <input
            v-if="isOwnProfile"
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFileSelect"
            style="display: none"
          />
          <button
            v-if="isOwnProfile"
            class="upload-avatar-btn"
            @click="triggerFileInput"
            :disabled="uploadingThumbnail"
            title="Upload profile picture"
          >
            {{ uploadingThumbnail ? "..." : "+" }}
          </button>
        </div>
        <div class="user-info">
          <h1 class="username">{{ username || "Loading..." }}</h1>
          <!-- Bio Section -->
          <div class="bio-section">
            <div v-if="!isEditingBio && !isOwnProfile" class="bio-display">
              <p v-if="bio" class="bio-text">{{ bio }}</p>
            </div>
            <div v-else-if="!isEditingBio && isOwnProfile" class="bio-display">
              <p v-if="bio" class="bio-text">{{ bio }}</p>
              <p v-else class="bio-text bio-empty">
                No bio yet. Click edit to add one!
              </p>
              <div class="bio-display-buttons">
                <button
                  class="edit-bio-btn"
                  @click="startEditingBio"
                  title="Edit bio"
                >
                  {{ bio ? "Edit" : "Add Bio" }}
                </button>
                <button
                  v-if="bio"
                  class="delete-bio-btn"
                  @click="deleteBio"
                  :disabled="savingBio"
                  title="Delete bio"
                >
                  Delete
                </button>
              </div>
            </div>
            <div v-else-if="isEditingBio && isOwnProfile" class="bio-edit">
              <textarea
                v-model="bioEditText"
                class="bio-textarea"
                placeholder="Tell us about yourself..."
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="bio-edit-actions">
                <span class="bio-char-count">{{ bioEditText.length }}/500</span>
                <div class="bio-buttons">
                  <button
                    class="save-bio-btn"
                    @click="saveBio"
                    :disabled="savingBio"
                  >
                    {{ savingBio ? "Saving..." : "Save" }}
                  </button>
                  <button
                    class="cancel-bio-btn"
                    @click="cancelEditingBio"
                    :disabled="savingBio"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ reviews.length }}</span>
              <span class="stat-label">Reviews</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ favoritesCount }}</span>
              <span class="stat-label">Favorites</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ listenLaterCount }}</span>
              <span class="stat-label">Listen Later</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ friends.length }}</span>
              <span class="stat-label">Friends</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="profile-content">
        <!-- Friends Section -->
        <section class="profile-section">
          <div class="friends-header">
            <h2 class="section-title">FRIENDS</h2>
            <button
              v-if="isOwnProfile"
              class="add-friend-btn"
              @click="showAddFriendModal = true"
              title="Add friend"
            >
              + Add Friend
            </button>
          </div>

          <!-- Add Friend Modal (only for own profile) -->
          <div
            v-if="isOwnProfile && showAddFriendModal"
            class="modal-overlay"
            @click="showAddFriendModal = false"
          >
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>Add Friend</h3>
                <button class="modal-close" @click="showAddFriendModal = false">
                  ×
                </button>
              </div>
              <div class="modal-body">
                <input
                  v-model="friendSearchQuery"
                  type="text"
                  placeholder="Enter username"
                  class="friend-search-input"
                  @keyup.enter="searchUser"
                />
                <button
                  class="send-request-btn"
                  @click="searchUser"
                  :disabled="searchingUser || !friendSearchQuery.trim()"
                  style="width: 100%; margin-top: 0.5rem"
                >
                  {{ searchingUser ? "Searching..." : "Search" }}
                </button>
                <div v-if="searchingUser" class="loading-text">
                  Searching...
                </div>
                <div v-if="userSearchError" class="error-text">
                  {{ userSearchError }}
                </div>
                <div v-if="searchedUser" class="searched-user">
                  <div class="searched-user-info">
                    <div class="friend-avatar">
                      <img
                        v-if="searchedUser.thumbnail"
                        :src="searchedUser.thumbnail"
                        :alt="searchedUser.username"
                        class="friend-avatar-image"
                      />
                      <span v-else class="friend-icon">👤</span>
                    </div>
                    <div class="friend-info">
                      <div class="friend-name">{{ searchedUser.username }}</div>
                    </div>
                  </div>
                  <button
                    class="send-request-btn"
                    @click="handleSendFriendRequest"
                    :disabled="sendingRequest"
                  >
                    {{ sendingRequest ? "Sending..." : "Send Request" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="friends-grid">
            <!-- Left Column: Current Friends -->
            <div
              class="friends-column"
              :class="{ 'full-width': !isOwnProfile }"
            >
              <h3 class="subsection-title">Friends</h3>
              <div v-if="loadingFriends" class="loading-text">
                Loading friends...
              </div>
              <div v-else-if="friendsError" class="error-text">
                {{ friendsError }}
              </div>
              <div
                v-else-if="
                  friends.length === 0 &&
                  isOwnProfile &&
                  incomingRequests.length === 0 &&
                  outgoingRequests.length === 0
                "
                class="empty-message"
              >
                No friends yet. Add friends to get started!
              </div>
              <div v-else-if="friends.length === 0" class="empty-message">
                No friends yet
              </div>
              <div v-else class="friends-list">
                <div
                  v-for="friend in friends"
                  :key="friend.friend"
                  class="friend-item"
                >
                  <div class="friend-avatar">
                    <img
                      v-if="friend.friendThumbnail"
                      :src="friend.friendThumbnail"
                      :alt="friend.friendName || friend.friend"
                      class="friend-avatar-image"
                    />
                    <span v-else class="friend-icon">👤</span>
                  </div>
                  <div class="friend-info">
                    <div
                      class="friend-name clickable-name"
                      @click="navigateToUserProfile(friend.friend)"
                    >
                      {{ friend.friendName || friend.friend }}
                    </div>
                  </div>
                  <div v-if="isOwnProfile" class="friend-actions">
                    <button
                      class="remove-friend-btn"
                      @click="handleRemoveFriend(friend)"
                      :disabled="processingRequest"
                      title="Remove Friend"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Friend Requests (only for own profile) -->
            <div v-if="isOwnProfile" class="friends-column">
              <h3 class="subsection-title">Friend Requests</h3>
              <div v-if="loadingRequests" class="loading-text">
                Loading requests...
              </div>
              <div
                v-else-if="
                  incomingRequests.length === 0 && outgoingRequests.length === 0
                "
                class="empty-message"
              >
                No pending requests
              </div>
              <div v-else>
                <!-- Incoming Friend Requests -->
                <div
                  v-if="incomingRequests.length > 0"
                  class="friend-requests-section"
                >
                  <h4 class="subsubsection-title">Incoming</h4>
                  <div class="friends-list">
                    <div
                      v-for="request in incomingRequests"
                      :key="request.request"
                      class="friend-item friend-request-item"
                    >
                      <div class="friend-avatar">
                        <img
                          v-if="request.requesterThumbnail"
                          :src="request.requesterThumbnail"
                          :alt="request.requesterName || request.requester"
                          class="friend-avatar-image"
                        />
                        <span v-else class="friend-icon">👤</span>
                      </div>
                      <div class="friend-info">
                        <div class="friend-name">
                          {{ request.requesterName || request.requester }}
                        </div>
                      </div>
                      <div class="friend-actions">
                        <button
                          class="accept-btn"
                          @click="handleAcceptRequest(request)"
                          :disabled="processingRequest"
                          title="Accept"
                        >
                          ✓
                        </button>
                        <button
                          class="decline-btn"
                          @click="handleDeclineRequest(request)"
                          :disabled="processingRequest"
                          title="Decline"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Outgoing Friend Requests -->
                <div
                  v-if="outgoingRequests.length > 0"
                  class="friend-requests-section"
                >
                  <h4 class="subsubsection-title">Outgoing</h4>
                  <div class="friends-list">
                    <div
                      v-for="request in outgoingRequests"
                      :key="request.request"
                      class="friend-item friend-request-item"
                    >
                      <div class="friend-avatar">
                        <img
                          v-if="request.targetThumbnail"
                          :src="request.targetThumbnail"
                          :alt="request.targetName || request.target"
                          class="friend-avatar-image"
                        />
                        <span v-else class="friend-icon">👤</span>
                      </div>
                      <div class="friend-info">
                        <div class="friend-name">
                          {{ request.targetName || request.target }}
                        </div>
                      </div>
                      <div class="friend-actions">
                        <button
                          class="cancel-btn"
                          @click="handleCancelRequest(request)"
                          :disabled="processingRequest"
                          title="Cancel Request"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Remove Friend Confirmation Modal -->
        <div
          v-if="showRemoveFriendModal && friendToRemove"
          class="modal-overlay"
          @click.self="showRemoveFriendModal = false"
        >
          <div class="modal-content modal-content-confirm">
            <button class="modal-close" @click="showRemoveFriendModal = false">
              ×
            </button>
            <h3 class="modal-title">Remove Friend</h3>
            <p class="modal-message">
              Are you sure you want to remove
              <strong>{{
                friendToRemove.friendName || friendToRemove.friend
              }}</strong>
              as a friend?
            </p>
            <div class="modal-buttons">
              <button
                class="modal-btn modal-btn-cancel"
                @click="showRemoveFriendModal = false"
                :disabled="processingRequest"
              >
                Cancel
              </button>
              <button
                class="modal-btn modal-btn-confirm"
                @click="confirmRemoveFriend"
                :disabled="processingRequest"
              >
                {{ processingRequest ? "Removing..." : "Remove Friend" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Playlists Section (Favorites and Listen Later) -->
        <section class="profile-section">
          <h2 class="section-title">FAVORITES</h2>
          <div v-if="loadingFavorites" class="loading-text">
            Loading favorites...
          </div>
          <div v-else-if="favoritesItems.length === 0" class="empty-message">
            No favorites yet
          </div>
          <div v-else class="playlist-items-list">
            <div
              v-for="item in favoritesItems"
              :key="item.item"
              class="playlist-item"
              @click="navigateToReview(item)"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="playlist-item-thumbnail"
              />
              <div v-else class="playlist-item-thumbnail-placeholder">
                {{ item.name?.charAt(0) || "?" }}
              </div>
              <div class="playlist-item-info">
                <div class="playlist-item-name">
                  {{ item.name || "Unknown" }}
                </div>
                <div class="playlist-item-artist">{{ item.artist || "" }}</div>
              </div>
              <button
                v-if="isOwnProfile"
                class="remove-item-btn"
                @click.stop="removeFromPlaylist(item, 'Favorites')"
                title="Remove from Favorites"
              >
                ×
              </button>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h2 class="section-title">LISTEN LATER</h2>
          <div v-if="loadingListenLater" class="loading-text">
            Loading listen later...
          </div>
          <div v-else-if="listenLaterItems.length === 0" class="empty-message">
            No items in listen later yet
          </div>
          <div v-else class="playlist-items-list">
            <div
              v-for="item in listenLaterItems"
              :key="item.item"
              class="playlist-item"
              @click="navigateToReview(item)"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="playlist-item-thumbnail"
              />
              <div v-else class="playlist-item-thumbnail-placeholder">
                {{ item.name?.charAt(0) || "?" }}
              </div>
              <div class="playlist-item-info">
                <div class="playlist-item-name">
                  {{ item.name || "Unknown" }}
                </div>
                <div class="playlist-item-artist">{{ item.artist || "" }}</div>
              </div>
              <button
                v-if="isOwnProfile"
                class="remove-item-btn"
                @click.stop="removeFromPlaylist(item, 'Listen Later')"
                title="Remove from Listen Later"
              >
                ×
              </button>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h2 class="section-title">FRIEND RECOMMENDATIONS</h2>
          <div v-if="loadingFriendRecommendations" class="loading-text">
            Loading friend recommendations...
          </div>
          <div
            v-else-if="friendRecommendationsItems.length === 0"
            class="empty-message"
          >
            No friend recommendations yet
          </div>
          <div v-else class="playlist-items-list">
            <div
              v-for="item in friendRecommendationsItems"
              :key="item.item"
              class="playlist-item"
              @click="navigateToReview(item)"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="playlist-item-thumbnail"
              />
              <div v-else class="playlist-item-thumbnail-placeholder">
                {{ item.name?.charAt(0) || "?" }}
              </div>
              <div class="playlist-item-info">
                <div class="playlist-item-name">
                  {{ item.name || "Unknown" }}
                </div>
                <div class="playlist-item-artist">{{ item.artist || "" }}</div>
              </div>
              <button
                v-if="isOwnProfile"
                class="remove-item-btn"
                @click.stop="removeFromPlaylist(item, 'Friend Recommendations')"
                title="Remove from Friend Recommendations"
              >
                ×
              </button>
            </div>
          </div>
        </section>

        <!-- Reviews Section -->
        <section class="profile-section">
          <h2 class="section-title">REVIEWS</h2>
          <div v-if="loadingReviews" class="loading-text">
            Loading reviews...
          </div>
          <div v-else-if="reviewsError" class="error-text">
            {{ reviewsError }}
          </div>
          <div v-else-if="reviews.length === 0" class="empty-message">
            No reviews yet
          </div>
          <div v-else class="reviews-list-container">
            <div class="reviews-list">
              <div
                v-for="review in reviews"
                :key="review.review"
                class="review-item"
                @click="navigateToReview(review)"
              >
                <img
                  v-if="review.imageUrl"
                  :src="review.imageUrl"
                  :alt="review.songName"
                  class="review-album-cover"
                />
                <div v-else class="review-album-cover-placeholder">
                  {{ review.songName?.charAt(0) || "?" }}
                </div>
                <div class="review-content-details">
                  <div class="review-song-info">
                    <div class="review-song-name">
                      {{ review.songName || "Unknown Song" }}
                    </div>
                    <div class="review-song-artist">
                      {{ review.songArtist || "Unknown Artist" }}
                    </div>
                  </div>
                  <div class="review-rating">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ filled: i <= (review.rating || 0) }"
                    >
                      ★
                    </span>
                  </div>
                  <p v-if="review.text" class="review-text">
                    {{ review.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  review,
  friending,
  auth,
  musicDiscovery,
  playlist,
  userProfile,
} from "../api/api.js";
import { usePlaylists } from "../composables/usePlaylists.js";
import { useToast } from "../composables/useToast.js";
import { useAuth } from "../composables/useAuth.js";

export default {
  name: "Profile",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { currentUser, currentSession } = useAuth();

    // Get target username from route params
    const targetUsername = computed(() => {
      return route.params.username || null;
    });

    // Get current authenticated user ID and username
    const currentUserId = ref(null);
    const currentUsername = ref("");
    watch(
      () => currentUser.value,
      async (user) => {
        currentUserId.value = user?._id || user || null;
        if (currentUserId.value) {
          try {
            const result = await auth.getUsername(currentUserId.value);
            const usernameData =
              Array.isArray(result) && result.length > 0 ? result[0] : result;
            currentUsername.value =
              usernameData?.username || currentUserId.value;
          } catch (error) {
            console.error("[Profile] Error loading current username:", error);
            currentUsername.value = currentUserId.value;
          }
        }
      },
      { immediate: true }
    );

    // Resolve userId from username if viewing another user's profile
    const userId = ref(null);
    const loadingUserId = ref(false);

    const resolveUserId = async () => {
      if (!targetUsername.value) {
        // No username in route, use current user
        userId.value = currentUserId.value;
        return;
      }

      // If viewing own profile (username matches), use current user ID
      if (targetUsername.value === currentUsername.value) {
        userId.value = currentUserId.value;
        return;
      }

      // Look up userId from username
      loadingUserId.value = true;
      try {
        const result = await auth.getUserByUsername(targetUsername.value);
        if (result && result.error) {
          console.error(
            "[Profile] Error looking up user by username:",
            result.error
          );
          userId.value = null;
          return;
        }

        // API returns an array: [{ "user": "User" }]
        const userData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;
        userId.value = userData?.user || null;
      } catch (error) {
        console.error("[Profile] Error resolving userId from username:", error);
        userId.value = null;
      } finally {
        loadingUserId.value = false;
      }
    };

    // Watch for route changes and resolve userId
    watch(
      [targetUsername, currentUserId, currentUsername],
      () => {
        resolveUserId();
      },
      { immediate: true }
    );

    // Check if viewing own profile
    const isOwnProfile = computed(() => {
      return (
        !targetUsername.value || targetUsername.value === currentUsername.value
      );
    });

    const username = ref("");
    const reviews = ref([]);
    const friends = ref([]);
    const currentUserFriends = ref([]); // Friends of the current logged-in user
    const incomingRequests = ref([]);
    const outgoingRequests = ref([]);

    const favoritesCount = ref(0);
    const listenLaterCount = ref(0);

    const loadingReviews = ref(false);
    const loadingFriends = ref(false);
    const loadingRequests = ref(false);

    const reviewsError = ref(null);
    const friendsError = ref(null);

    // Profile picture state
    const thumbnailUrl = ref(null);
    const uploadingThumbnail = ref(false);
    const fileInput = ref(null);

    // Bio state
    const bio = ref("");
    const isEditingBio = ref(false);
    const bioEditText = ref("");
    const savingBio = ref(false);

    // Friend search and add modal
    const showAddFriendModal = ref(false);
    const friendSearchQuery = ref("");
    const searchedUser = ref(null);
    const searchingUser = ref(false);
    const sendingRequest = ref(false);
    const userSearchError = ref(null);
    const processingRequest = ref(false);

    // Remove friend confirmation modal
    const showRemoveFriendModal = ref(false);
    const friendToRemove = ref(null);

    const { getPlaylistCount, removeItemFromPlaylist } = usePlaylists();
    const { showToastNotification } = useToast();

    // Load profile thumbnail
    const loadThumbnail = async () => {
      if (!userId.value) {
        thumbnailUrl.value = null;
        return;
      }
      try {
        const result = await userProfile.getThumbnail(userId.value);
        const thumbnailData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;
        thumbnailUrl.value =
          thumbnailData?.thumbnailUrl || thumbnailData?.thumbnail || null;
      } catch (error) {
        console.error("[Profile] Error loading thumbnail:", error);
        thumbnailUrl.value = null;
      }
    };

    // Load bio
    const loadBio = async () => {
      if (!userId.value) {
        bio.value = "";
        return;
      }
      try {
        const result = await userProfile.getBio(userId.value);
        const bioData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;
        bio.value = bioData?.bio || "";
      } catch (error) {
        console.error("[Profile] Error loading bio:", error);
        bio.value = "";
      }
    };

    // Start editing bio
    const startEditingBio = () => {
      bioEditText.value = bio.value;
      isEditingBio.value = true;
    };

    // Cancel editing bio
    const cancelEditingBio = () => {
      bioEditText.value = "";
      isEditingBio.value = false;
    };

    // Save bio
    const saveBio = async () => {
      if (savingBio.value) return;

      savingBio.value = true;
      try {
        const result = await userProfile.updateBio(
          currentSession.value,
          bioEditText.value.trim()
        );

        if (result && result.error) {
          showToastNotification(result.error || "Failed to update bio");
          return;
        }

        bio.value = bioEditText.value.trim();
        isEditingBio.value = false;
        showToastNotification("Bio updated successfully!");
      } catch (error) {
        console.error("[Profile] Error saving bio:", error);
        showToastNotification(error.message || "Failed to save bio");
      } finally {
        savingBio.value = false;
      }
    };

    // Delete bio
    const deleteBio = async () => {
      if (savingBio.value) return;

      savingBio.value = true;
      try {
        const result = await userProfile.updateBio(currentSession.value, "");

        if (result && result.error) {
          showToastNotification(result.error || "Failed to delete bio");
          return;
        }

        bio.value = "";
        bioEditText.value = "";
        isEditingBio.value = false;
        showToastNotification("Bio deleted successfully!");
      } catch (error) {
        console.error("[Profile] Error deleting bio:", error);
        showToastNotification(error.message || "Failed to delete bio");
      } finally {
        savingBio.value = false;
      }
    };

    // Trigger file input click
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    // Handle file selection and upload
    const handleFileSelect = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith("image/")) {
        showToastNotification("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showToastNotification("Image must be less than 5MB");
        return;
      }

      uploadingThumbnail.value = true;
      try {
        // Convert file to data URL first so we can use it immediately
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Send to backend (backend expects { session, thumbnailUrl: string })
        const result = await userProfile.updateThumbnail(
          currentSession.value,
          dataUrl
        );
        console.log("[Profile] updateThumbnail response:", result);

        // Backend returns {} on success, so use the data URL we created
        if (!result || !result.error) {
          thumbnailUrl.value = dataUrl;
          showToastNotification("Profile picture updated!");
        } else {
          throw new Error(result.error || "Failed to update thumbnail");
        }
      } catch (error) {
        console.error("[Profile] Error uploading picture:", error);
        console.error("[Profile] Error details:", {
          message: error.message,
          stack: error.stack,
        });
        showToastNotification(
          error.message || "Failed to upload picture. Please try again."
        );
      } finally {
        uploadingThumbnail.value = false;
        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = "";
        }
      }
    };

    // Load username
    const loadUsername = async () => {
      try {
        if (!userId.value) {
          username.value = "User";
          return;
        }

        const result = await auth.getUsername(userId.value);
        console.log("[Profile] getUsername API response:", result);

        if (result && result.error) {
          console.error("[Profile] Error loading username:", result.error);
          username.value = "User";
          return;
        }

        // API returns an array: [{ "username": "String" }]
        const usernameData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;

        if (usernameData && usernameData.username) {
          username.value = usernameData.username;
        } else {
          console.warn("[Profile] Username not found in response:", result);
          username.value = "User";
        }
      } catch (error) {
        console.error("[Profile] Error loading username:", error);
        username.value = "User";
      }
    };

    // Load reviews
    const loadReviews = async () => {
      loadingReviews.value = true;
      reviewsError.value = null;

      try {
        const result = await review.getUserReviews(userId.value);

        if (result && result.error) {
          reviewsError.value = result.error;
          reviews.value = [];
          return;
        }

        const userReviews = result || [];

        // Load entity details for each review
        const reviewsWithDetails = await Promise.all(
          userReviews.map(async (reviewData) => {
            try {
              // Get the target from the review (matching Home.vue logic)
              const target = reviewData.target || reviewData.item;
              let musicEntity = null;

              // Get the music entity information using getEntity with the target
              if (target) {
                try {
                  const entityResponse = await musicDiscovery.getEntity(target);

                  if (entityResponse && entityResponse.error) {
                    console.warn(
                      `Error loading entity for target ${target}:`,
                      entityResponse.error
                    );
                  } else if (entityResponse) {
                    // Extract musicEntity from the response
                    // According to API spec, _getEntityFromId returns:
                    // [{ "musicEntity": {...} }]
                    if (
                      Array.isArray(entityResponse) &&
                      entityResponse.length > 0
                    ) {
                      // Response is an array, get first element
                      const firstResponse = entityResponse[0];
                      musicEntity = firstResponse.musicEntity || firstResponse;
                    } else if (entityResponse.musicEntity) {
                      // Response has musicEntity property
                      musicEntity = entityResponse.musicEntity;
                    } else if (
                      entityResponse._id ||
                      entityResponse.name ||
                      entityResponse.externalId
                    ) {
                      // Response is the entity directly (fallback)
                      musicEntity = entityResponse;
                    }
                  }
                } catch (e) {
                  console.warn(
                    `Error getting entity info for target ${target}:`,
                    e
                  );
                }
              }

              // Extract URI and other info from musicEntity
              const songUri =
                musicEntity?.uri || musicEntity?.externalId || target;
              const songName = musicEntity?.name || "Unknown Song";
              const songArtist =
                musicEntity?.artistName ||
                musicEntity?.artist ||
                "Unknown Artist";
              const songImageUrl = musicEntity?.imageUrl || null;
              const songAlbum =
                musicEntity?.album || musicEntity?.albumName || null;
              const songExternalURL = musicEntity?.externalURL || null;

              return {
                ...reviewData,
                review: reviewData.review,
                songName: songName,
                songArtist: songArtist,
                songUri: songUri,
                uri: songUri,
                imageUrl: songImageUrl,
                album: songAlbum,
                // Ensure text/notes field is properly set (API returns "text" for _getUserReviews)
                text: reviewData.text || reviewData.notes || "",
                rating: reviewData.rating || 0,
                date: reviewData.date, // Preserve date for sorting
                externalURL: songExternalURL,
              };
            } catch (err) {
              console.warn(
                `Error processing review ${reviewData.review}:`,
                err
              );
              // Return review with minimal info if entity loading fails
              return {
                ...reviewData,
                songName: "Unknown Song",
                songArtist: "Unknown Artist",
                text: reviewData.text || reviewData.notes || "",
                rating: reviewData.rating || 0,
                date: reviewData.date, // Preserve date for sorting
              };
            }
          })
        );

        // Sort reviews by most recent first (by date)
        reviewsWithDetails.sort((a, b) => {
          // If both have dates, sort by date (most recent first)
          if (a.date && b.date) {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Most recent first (descending order)
          }
          // If only one has a date, prioritize it
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;
          // If neither has a date, maintain original order
          return 0;
        });

        reviews.value = reviewsWithDetails;
      } catch (error) {
        console.error("[Profile] Error loading reviews:", error);
        reviewsError.value = error.message || "Failed to load reviews";
        reviews.value = [];
      } finally {
        loadingReviews.value = false;
      }
    };

    // Playlist items for display
    const favoritesItems = ref([]);
    const listenLaterItems = ref([]);
    const friendRecommendationsItems = ref([]);
    const loadingFavorites = ref(false);
    const loadingListenLater = ref(false);
    const loadingFriendRecommendations = ref(false);

    // Load playlist counts (lightweight - no entity details)
    const loadPlaylistCounts = async () => {
      try {
        // Only load counts for own profile (requires session)
        if (!isOwnProfile.value || !currentSession.value) {
          favoritesCount.value = 0;
          listenLaterCount.value = 0;
          return;
        }

        const favoritesResult = await playlist.getPlaylistItems(
          userId.value,
          "Favorites"
        );
        if (!favoritesResult || favoritesResult.error) {
          favoritesCount.value = 0;
        } else {
          favoritesCount.value = (favoritesResult || []).length;
        }

        const listenLaterResult = await playlist.getPlaylistItems(
          userId.value,
          "Listen Later"
        );
        if (!listenLaterResult || listenLaterResult.error) {
          listenLaterCount.value = 0;
        } else {
          listenLaterCount.value = (listenLaterResult || []).length;
        }
      } catch (error) {
        console.error("[Profile] Error loading playlist counts:", error);
      }
    };

    // Load playlist items with entity details
    const loadPlaylistItems = async () => {
      if (!userId.value) return;

      // Load Favorites
      loadingFavorites.value = true;
      try {
        const favoritesResult = await playlist.getPlaylistItems(
          userId.value,
          "Favorites"
        );
        if (favoritesResult && !favoritesResult.error) {
          // Load entity details for each item
          favoritesItems.value = await Promise.all(
            (favoritesResult || []).slice(0, 20).map(async (itemObj) => {
              const itemId = itemObj.item || itemObj;
              try {
                // Try as external ID first (playlist items are stored as externalId)
                let entityResponse = await musicDiscovery.getEntityFromId(
                  itemId
                );

                // Extract musicEntity from response
                let musicEntity = null;
                if (
                  Array.isArray(entityResponse) &&
                  entityResponse.length > 0
                ) {
                  musicEntity =
                    entityResponse[0].musicEntity || entityResponse[0];
                } else if (entityResponse?.musicEntity) {
                  musicEntity = entityResponse.musicEntity;
                } else if (entityResponse && !entityResponse.error) {
                  musicEntity = entityResponse;
                }

                // If that didn't work, try as URI
                if (!musicEntity || musicEntity.error) {
                  try {
                    entityResponse = await musicDiscovery.getEntityFromUri(
                      itemId
                    );
                    if (
                      Array.isArray(entityResponse) &&
                      entityResponse.length > 0
                    ) {
                      musicEntity =
                        entityResponse[0].musicEntity || entityResponse[0];
                    } else if (entityResponse?.musicEntity) {
                      musicEntity = entityResponse.musicEntity;
                    } else if (entityResponse && !entityResponse.error) {
                      musicEntity = entityResponse;
                    }
                  } catch (e) {
                    console.warn(
                      `[Profile] Could not load entity by URI for ${itemId}:`,
                      e
                    );
                  }
                }

                if (musicEntity && !musicEntity.error) {
                  return {
                    item: itemId,
                    name: musicEntity.name || "Unknown",
                    artist: musicEntity.artistName || musicEntity.artist || "",
                    uri: musicEntity.uri || musicEntity.externalId || itemId,
                    imageUrl: musicEntity.imageUrl || null,
                  };
                }
                return {
                  item: itemId,
                  name: "Unknown",
                  artist: "",
                  uri: itemId,
                  imageUrl: null,
                };
              } catch (err) {
                console.warn(
                  `[Profile] Error loading entity for favorite ${itemId}:`,
                  err
                );
                return {
                  item: itemId,
                  name: "Unknown",
                  artist: "",
                  uri: itemId,
                  imageUrl: null,
                };
              }
            })
          );
        } else {
          favoritesItems.value = [];
        }
      } catch (error) {
        console.error("[Profile] Error loading favorites:", error);
        favoritesItems.value = [];
      } finally {
        loadingFavorites.value = false;
      }

      // Load Listen Later
      loadingListenLater.value = true;
      try {
        const listenLaterResult = await playlist.getPlaylistItems(
          userId.value,
          "Listen Later"
        );
        if (listenLaterResult && !listenLaterResult.error) {
          // Load entity details for each item
          listenLaterItems.value = await Promise.all(
            (listenLaterResult || []).slice(0, 20).map(async (itemObj) => {
              const itemId = itemObj.item || itemObj;
              try {
                // Try as external ID first (playlist items are stored as externalId)
                let entityResponse = await musicDiscovery.getEntityFromId(
                  itemId
                );

                // Extract musicEntity from response
                let musicEntity = null;
                if (
                  Array.isArray(entityResponse) &&
                  entityResponse.length > 0
                ) {
                  musicEntity =
                    entityResponse[0].musicEntity || entityResponse[0];
                } else if (entityResponse?.musicEntity) {
                  musicEntity = entityResponse.musicEntity;
                } else if (entityResponse && !entityResponse.error) {
                  musicEntity = entityResponse;
                }

                // If that didn't work, try as URI
                if (!musicEntity || musicEntity.error) {
                  try {
                    entityResponse = await musicDiscovery.getEntityFromUri(
                      itemId
                    );
                    if (
                      Array.isArray(entityResponse) &&
                      entityResponse.length > 0
                    ) {
                      musicEntity =
                        entityResponse[0].musicEntity || entityResponse[0];
                    } else if (entityResponse?.musicEntity) {
                      musicEntity = entityResponse.musicEntity;
                    } else if (entityResponse && !entityResponse.error) {
                      musicEntity = entityResponse;
                    }
                  } catch (e) {
                    console.warn(
                      `[Profile] Could not load entity by URI for ${itemId}:`,
                      e
                    );
                  }
                }

                if (musicEntity && !musicEntity.error) {
                  return {
                    item: itemId,
                    name: musicEntity.name || "Unknown",
                    artist: musicEntity.artistName || musicEntity.artist || "",
                    uri: musicEntity.uri || musicEntity.externalId || itemId,
                    imageUrl: musicEntity.imageUrl || null,
                  };
                }
                return {
                  item: itemId,
                  name: "Unknown",
                  artist: "",
                  uri: itemId,
                  imageUrl: null,
                };
              } catch (err) {
                console.warn(
                  `[Profile] Error loading entity for listen later ${itemId}:`,
                  err
                );
                return {
                  item: itemId,
                  name: "Unknown",
                  artist: "",
                  uri: itemId,
                  imageUrl: null,
                };
              }
            })
          );
        } else {
          listenLaterItems.value = [];
        }
      } catch (error) {
        console.error("[Profile] Error loading listen later:", error);
        listenLaterItems.value = [];
      } finally {
        loadingListenLater.value = false;
      }

      // Load Friend Recommendations
      loadingFriendRecommendations.value = true;
      try {
        const friendRecommendationsResult = await playlist.getPlaylistItems(
          userId.value,
          "Friend Recommendations"
        );
        if (friendRecommendationsResult && !friendRecommendationsResult.error) {
          // Load entity details for each item
          friendRecommendationsItems.value = await Promise.all(
            (friendRecommendationsResult || [])
              .slice(0, 20)
              .map(async (itemObj) => {
                const itemId = itemObj.item || itemObj;
                try {
                  // Try as external ID first (playlist items are stored as externalId)
                  let entityResponse = await musicDiscovery.getEntityFromId(
                    itemId
                  );

                  // Extract musicEntity from response
                  let musicEntity = null;
                  if (
                    Array.isArray(entityResponse) &&
                    entityResponse.length > 0
                  ) {
                    musicEntity =
                      entityResponse[0].musicEntity || entityResponse[0];
                  } else if (entityResponse?.musicEntity) {
                    musicEntity = entityResponse.musicEntity;
                  } else if (entityResponse && !entityResponse.error) {
                    musicEntity = entityResponse;
                  }

                  // If that didn't work, try as URI
                  if (!musicEntity || musicEntity.error) {
                    try {
                      entityResponse = await musicDiscovery.getEntityFromUri(
                        itemId
                      );
                      if (
                        Array.isArray(entityResponse) &&
                        entityResponse.length > 0
                      ) {
                        musicEntity =
                          entityResponse[0].musicEntity || entityResponse[0];
                      } else if (entityResponse?.musicEntity) {
                        musicEntity = entityResponse.musicEntity;
                      } else if (entityResponse && !entityResponse.error) {
                        musicEntity = entityResponse;
                      }
                    } catch (e) {
                      console.warn(
                        `[Profile] Could not load entity by URI for ${itemId}:`,
                        e
                      );
                    }
                  }

                  if (musicEntity && !musicEntity.error) {
                    return {
                      item: itemId,
                      name: musicEntity.name || "Unknown",
                      artist:
                        musicEntity.artistName || musicEntity.artist || "",
                      uri: musicEntity.uri || musicEntity.externalId || itemId,
                      imageUrl: musicEntity.imageUrl || null,
                    };
                  }
                  return {
                    item: itemId,
                    name: "Unknown",
                    artist: "",
                    uri: itemId,
                    imageUrl: null,
                  };
                } catch (err) {
                  console.warn(
                    `[Profile] Error loading entity for friend recommendation ${itemId}:`,
                    err
                  );
                  return {
                    item: itemId,
                    name: "Unknown",
                    artist: "",
                    uri: itemId,
                    imageUrl: null,
                  };
                }
              })
          );
        } else {
          friendRecommendationsItems.value = [];
        }
      } catch (error) {
        console.error("[Profile] Error loading friend recommendations:", error);
        friendRecommendationsItems.value = [];
      } finally {
        loadingFriendRecommendations.value = false;
      }
    };

    // Load friends
    const loadFriends = async () => {
      loadingFriends.value = true;
      friendsError.value = null;

      try {
        const result = await friending.getFriends(userId.value);

        if (result && result.error) {
          friendsError.value = result.error;
          friends.value = [];
          return;
        }

        // Load usernames and thumbnails for each friend
        const friendsWithNames = await Promise.all(
          (result || []).map(async (friendItem) => {
            try {
              // Load username and thumbnail in parallel
              const [usernameResult, thumbnailResult] = await Promise.all([
                auth.getUsername(friendItem.friend),
                userProfile.getThumbnail(friendItem.friend),
              ]);

              // API returns an array: [{ "username": "String" }]
              const usernameData =
                Array.isArray(usernameResult) && usernameResult.length > 0
                  ? usernameResult[0]
                  : usernameResult;
              const username =
                usernameData && !usernameData.error && usernameData.username
                  ? usernameData.username
                  : friendItem.friend;

              // Extract thumbnail URL
              const thumbnailData =
                Array.isArray(thumbnailResult) && thumbnailResult.length > 0
                  ? thumbnailResult[0]
                  : thumbnailResult;
              const thumbnailUrl = thumbnailData?.thumbnailUrl || null;

              return {
                ...friendItem,
                friendName: username,
                friendThumbnail: thumbnailUrl,
              };
            } catch (error) {
              console.error(
                `[Profile] Error loading username/thumbnail for friend ${friendItem.friend}:`,
                error
              );
              return {
                ...friendItem,
                friendName: friendItem.friend,
                friendThumbnail: null,
              };
            }
          })
        );

        friends.value = friendsWithNames;
      } catch (error) {
        console.error("[Profile] Error loading friends:", error);
        friendsError.value = error.message || "Failed to load friends";
        friends.value = [];
      } finally {
        loadingFriends.value = false;
      }
    };

    // Load friend requests
    const loadFriendRequests = async () => {
      loadingRequests.value = true;

      try {
        // Load incoming requests
        const incomingResult = await friending.getIncomingRequests(
          userId.value
        );
        if (incomingResult && !incomingResult.error) {
          const incomingWithNames = await Promise.all(
            (incomingResult || []).map(async (request) => {
              try {
                // Load username and thumbnail in parallel
                const [usernameResult, thumbnailResult] = await Promise.all([
                  auth.getUsername(request.requester),
                  userProfile.getThumbnail(request.requester),
                ]);

                // API returns an array: [{ "username": "String" }]
                const usernameData =
                  Array.isArray(usernameResult) && usernameResult.length > 0
                    ? usernameResult[0]
                    : usernameResult;
                const username =
                  usernameData && !usernameData.error && usernameData.username
                    ? usernameData.username
                    : request.requester;

                // Extract thumbnail URL
                const thumbnailData =
                  Array.isArray(thumbnailResult) && thumbnailResult.length > 0
                    ? thumbnailResult[0]
                    : thumbnailResult;
                const thumbnailUrl = thumbnailData?.thumbnailUrl || null;

                return {
                  ...request,
                  requesterName: username,
                  requesterThumbnail: thumbnailUrl,
                };
              } catch (error) {
                console.error(
                  `[Profile] Error loading username/thumbnail for requester ${request.requester}:`,
                  error
                );
                return {
                  ...request,
                  requesterName: request.requester,
                  requesterThumbnail: null,
                };
              }
            })
          );
          incomingRequests.value = incomingWithNames;
        } else {
          incomingRequests.value = [];
        }

        // Load outgoing requests
        const outgoingResult = await friending.getOutgoingRequests(
          userId.value
        );
        if (outgoingResult && !outgoingResult.error) {
          const outgoingWithNames = await Promise.all(
            (outgoingResult || []).map(async (request) => {
              try {
                // Load username and thumbnail in parallel
                const [usernameResult, thumbnailResult] = await Promise.all([
                  auth.getUsername(request.target),
                  userProfile.getThumbnail(request.target),
                ]);

                // API returns an array: [{ "username": "String" }]
                const usernameData =
                  Array.isArray(usernameResult) && usernameResult.length > 0
                    ? usernameResult[0]
                    : usernameResult;
                const username =
                  usernameData && !usernameData.error && usernameData.username
                    ? usernameData.username
                    : request.target;

                // Extract thumbnail URL
                const thumbnailData =
                  Array.isArray(thumbnailResult) && thumbnailResult.length > 0
                    ? thumbnailResult[0]
                    : thumbnailResult;
                const thumbnailUrl = thumbnailData?.thumbnailUrl || null;

                return {
                  ...request,
                  targetName: username,
                  targetThumbnail: thumbnailUrl,
                };
              } catch (error) {
                console.error(
                  `[Profile] Error loading username/thumbnail for target ${request.target}:`,
                  error
                );
                return {
                  ...request,
                  targetName: request.target,
                  targetThumbnail: null,
                };
              }
            })
          );
          outgoingRequests.value = outgoingWithNames;
        } else {
          outgoingRequests.value = [];
        }
      } catch (error) {
        console.error("[Profile] Error loading friend requests:", error);
        incomingRequests.value = [];
        outgoingRequests.value = [];
      } finally {
        loadingRequests.value = false;
      }
    };

    // Search for user by username
    const searchUser = async () => {
      const searchQuery = friendSearchQuery.value.trim();
      console.log("[Profile] Searching for user:", searchQuery);

      if (!searchQuery) {
        userSearchError.value = "Please enter a username";
        return;
      }

      searchingUser.value = true;
      userSearchError.value = null;
      searchedUser.value = null;

      try {
        console.log(
          "[Profile] Calling getUserByUsername API with:",
          searchQuery
        );
        const result = await auth.getUserByUsername(searchQuery);
        console.log("[Profile] getUserByUsername API response:", result);

        if (result && result.error) {
          console.log("[Profile] API returned error:", result.error);
          userSearchError.value = result.error || "User not found";
          searchedUser.value = null;
          return;
        }

        // API returns an array: [{ "user": "User" }]
        const userData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;
        const foundUserId = userData?.user;

        if (foundUserId) {
          console.log("[Profile] User found:", foundUserId);

          // Check if it's the current user
          if (foundUserId === userId.value) {
            console.log("[Profile] User tried to add themselves");
            userSearchError.value = "You cannot add yourself as a friend";
            searchedUser.value = null;
            return;
          }

          // Check if already friends
          const isFriend = friends.value.some((f) => f.friend === foundUserId);
          if (isFriend) {
            console.log("[Profile] User is already a friend");
            userSearchError.value = "You are already friends with this user";
            searchedUser.value = null;
            return;
          }

          // Check if there's a pending request
          const hasIncomingRequest = incomingRequests.value.some(
            (r) => r.requester === foundUserId
          );
          const hasOutgoingRequest = outgoingRequests.value.some(
            (r) => r.target === foundUserId
          );
          if (hasIncomingRequest || hasOutgoingRequest) {
            console.log("[Profile] Pending request exists");
            userSearchError.value = "There is already a pending friend request";
            searchedUser.value = null;
            return;
          }

          console.log("[Profile] User is valid, loading thumbnail");
          // Load thumbnail for searched user
          let thumbnailUrl = null;
          try {
            const thumbnailResult = await userProfile.getThumbnail(foundUserId);
            const thumbnailData =
              Array.isArray(thumbnailResult) && thumbnailResult.length > 0
                ? thumbnailResult[0]
                : thumbnailResult;
            thumbnailUrl = thumbnailData?.thumbnailUrl || null;
          } catch (thumbError) {
            console.warn(
              "[Profile] Error loading thumbnail for searched user:",
              thumbError
            );
          }

          searchedUser.value = {
            user: foundUserId,
            username: searchQuery,
            thumbnail: thumbnailUrl,
          };
        } else {
          console.log(
            "[Profile] User not found in result. Result structure:",
            result
          );
          userSearchError.value = "User not found";
          searchedUser.value = null;
        }
      } catch (error) {
        console.error("[Profile] Error searching user:", error);
        userSearchError.value = error.message || "Failed to search user";
        searchedUser.value = null;
      } finally {
        searchingUser.value = false;
        console.log("[Profile] Search completed");
      }
    };

    // Send friend request
    const handleSendFriendRequest = async () => {
      if (!searchedUser.value) {
        await searchUser();
        return;
      }

      sendingRequest.value = true;
      userSearchError.value = null;

      try {
        const result = await friending.sendFriendRequest(
          currentSession.value,
          searchedUser.value.username
        );

        if (result && result.error) {
          userSearchError.value =
            result.error || "Failed to send friend request";
          return;
        }

        showToastNotification("Friend request sent!");
        showAddFriendModal.value = false;
        friendSearchQuery.value = "";
        searchedUser.value = null;

        // Reload requests
        await loadFriendRequests();
      } catch (error) {
        console.error("[Profile] Error sending friend request:", error);
        userSearchError.value =
          error.message || "Failed to send friend request";
      } finally {
        sendingRequest.value = false;
      }
    };

    // Accept friend request
    const handleAcceptRequest = async (request) => {
      processingRequest.value = true;

      try {
        const result = await friending.acceptFriendRequest(
          currentSession.value,
          request.requester
        );

        if (result && result.error) {
          showToastNotification(
            result.error || "Failed to accept friend request"
          );
          return;
        }

        showToastNotification("Friend request accepted!");

        // Reload friends and requests
        await Promise.all([
          loadFriends(),
          loadFriendRequests(),
          loadCurrentUserFriends(),
        ]);
      } catch (error) {
        console.error("[Profile] Error accepting friend request:", error);
        showToastNotification(
          error.message || "Failed to accept friend request"
        );
      } finally {
        processingRequest.value = false;
      }
    };

    // Decline friend request
    const handleDeclineRequest = async (request) => {
      processingRequest.value = true;

      try {
        const result = await friending.removeFriendRequest(
          currentSession.value,
          request.requester,
          userId.value
        );

        if (result && result.error) {
          showToastNotification(
            result.error || "Failed to decline friend request"
          );
          return;
        }

        showToastNotification("Friend request declined");

        // Reload requests
        await loadFriendRequests();
      } catch (error) {
        console.error("[Profile] Error declining friend request:", error);
        showToastNotification(
          error.message || "Failed to decline friend request"
        );
      } finally {
        processingRequest.value = false;
      }
    };

    // Cancel outgoing friend request
    const handleCancelRequest = async (request) => {
      processingRequest.value = true;

      try {
        const result = await friending.removeFriendRequest(
          currentSession.value,
          userId.value,
          request.target
        );

        if (result && result.error) {
          showToastNotification(
            result.error || "Failed to cancel friend request"
          );
          return;
        }

        showToastNotification("Friend request cancelled");

        // Reload requests
        await loadFriendRequests();
      } catch (error) {
        console.error("[Profile] Error cancelling friend request:", error);
        showToastNotification(
          error.message || "Failed to cancel friend request"
        );
      } finally {
        processingRequest.value = false;
      }
    };

    // Remove friend - show confirmation modal
    const handleRemoveFriend = (friend) => {
      friendToRemove.value = friend;
      showRemoveFriendModal.value = true;
    };

    // Confirm and execute friend removal
    const confirmRemoveFriend = async () => {
      if (!friendToRemove.value) return;

      processingRequest.value = true;

      try {
        const result = await friending.removeFriend(
          currentSession.value,
          friendToRemove.value.friend
        );

        if (result && result.error) {
          showToastNotification(result.error || "Failed to remove friend");
          return;
        }

        const friendName =
          friendToRemove.value.friendName || friendToRemove.value.friend;
        showToastNotification(`You have removed ${friendName} as a friend.`);

        // Close modal and reset
        showRemoveFriendModal.value = false;
        friendToRemove.value = null;

        // Reload friends
        await Promise.all([loadFriends(), loadCurrentUserFriends()]);
      } catch (error) {
        console.error("[Profile] Error removing friend:", error);
        showToastNotification(error.message || "Failed to remove friend");
      } finally {
        processingRequest.value = false;
      }
    };

    // Navigate to review page from review item or playlist item
    const navigateToReview = (item) => {
      const uri = item.songUri || item.uri;
      if (!uri) {
        console.error("Item missing URI:", item);
        return;
      }

      const encodedUri = encodeURIComponent(uri);
      router.push(`/review/${encodedUri}`);
    };

    // Remove item from playlist
    const removeFromPlaylist = async (item, playlistName) => {
      if (!isOwnProfile.value) {
        return;
      }

      if (!item.item) {
        showToastNotification("Error: Item ID not found");
        return;
      }

      try {
        const result = await removeItemFromPlaylist(item.item, playlistName);

        if (!result.success) {
          showToastNotification(
            result.error || `Error removing from ${playlistName}`
          );
          return;
        }

        showToastNotification(`Removed from ${playlistName}`);

        // Reload the playlist
        if (playlistName === "Favorites") {
          await loadPlaylistItems();
        } else if (playlistName === "Listen Later") {
          await loadPlaylistItems();
        } else if (playlistName === "Friend Recommendations") {
          await loadPlaylistItems();
        }
      } catch (error) {
        console.error(`[Profile] Error removing from ${playlistName}:`, error);
        showToastNotification(`Error removing from ${playlistName}`);
      }
    };

    // Delete review
    const handleDeleteReview = async (reviewItem) => {
      if (!reviewItem.review) {
        console.error("Review missing review ID:", reviewItem);
        showToastNotification("Error: Review ID not found");
        return;
      }

      // Confirm deletion
      if (!confirm("Are you sure you want to delete this review?")) {
        return;
      }

      try {
        const result = await review.deleteReview(reviewItem.review);

        if (result && result.error) {
          showToastNotification(result.error || "Failed to delete review");
          return;
        }

        showToastNotification("Review deleted successfully");

        // Remove the review from the list
        reviews.value = reviews.value.filter(
          (r) => r.review !== reviewItem.review
        );
      } catch (error) {
        console.error("[Profile] Error deleting review:", error);
        showToastNotification(error.message || "Failed to delete review");
      }
    };

    // Reset search state when modal closes
    watch(
      () => showAddFriendModal.value,
      (isOpen) => {
        if (!isOpen) {
          friendSearchQuery.value = "";
          searchedUser.value = null;
          userSearchError.value = null;
        }
      }
    );

    // Watch for currentUserId changes to load current user's friends
    watch(
      () => currentUserId.value,
      async () => {
        await loadCurrentUserFriends();
      },
      { immediate: true }
    );

    // Watch for userId changes (after resolution from username)
    watch(
      () => userId.value,
      async () => {
        if (!userId.value && targetUsername.value) {
          // Still loading userId from username
          return;
        }
        if (!userId.value) {
          // No userId available
          return;
        }
        await Promise.all([
          loadUsername(),
          loadThumbnail(),
          loadBio(),
          loadReviews(),
          loadPlaylistCounts(),
          loadPlaylistItems(),
          loadFriends(), // Load friends for all profiles
        ]);
        // Only load friend requests for own profile
        if (isOwnProfile.value) {
          await loadFriendRequests();
        } else {
          incomingRequests.value = [];
          outgoingRequests.value = [];
        }
      },
      { immediate: true }
    );

    // Load current user's friends list (for checking friendship status)
    const loadCurrentUserFriends = async () => {
      if (!currentUserId.value) {
        currentUserFriends.value = [];
        return;
      }

      try {
        const result = await friending.getFriends(currentUserId.value);
        if (result && !result.error) {
          currentUserFriends.value = result || [];
        } else {
          currentUserFriends.value = [];
        }
      } catch (error) {
        console.error("[Profile] Error loading current user's friends:", error);
        currentUserFriends.value = [];
      }
    };

    // Navigate to user profile by username (only if already friends)
    const navigateToUserProfile = async (targetUserId) => {
      if (!targetUserId) return;

      // Check if the target user is in the current logged-in user's friends list
      const isCurrentUserFriend = currentUserFriends.value.some(
        (f) => f.friend === targetUserId || f === targetUserId
      );

      // Also check if the target is in the friends list of the profile being viewed
      // (this allows viewing friends of friends when viewing someone else's profile)
      const isViewedProfileFriend = friends.value.some(
        (f) => f.friend === targetUserId || f === targetUserId
      );

      if (!isCurrentUserFriend && !isViewedProfileFriend) {
        showToastNotification(
          "You can only view profiles of users you are friends with"
        );
        return;
      }

      try {
        // Get username from userId
        const result = await auth.getUsername(targetUserId);
        if (result && result.error) {
          console.error(
            "[Profile] Error getting username for navigation:",
            result.error
          );
          return;
        }

        // API returns an array: [{ "username": "String" }]
        const usernameData =
          Array.isArray(result) && result.length > 0 ? result[0] : result;
        const targetUsername = usernameData?.username;

        if (targetUsername) {
          router.push(`/profile/${encodeURIComponent(targetUsername)}`);
        } else {
          console.error(
            "[Profile] Username not found for userId:",
            targetUserId
          );
        }
      } catch (error) {
        console.error("[Profile] Error navigating to user profile:", error);
      }
    };

    return {
      username,
      reviews,
      favoritesCount,
      listenLaterCount,
      favoritesItems,
      listenLaterItems,
      friendRecommendationsItems,
      loadingFavorites,
      loadingListenLater,
      loadingFriendRecommendations,
      friends,
      incomingRequests,
      outgoingRequests,
      loadingReviews,
      loadingFriends,
      loadingRequests,
      reviewsError,
      friendsError,
      showAddFriendModal,
      friendSearchQuery,
      searchedUser,
      searchingUser,
      sendingRequest,
      userSearchError,
      processingRequest,
      isOwnProfile,
      navigateToReview,
      navigateToUserProfile,
      handleDeleteReview,
      removeFromPlaylist,
      searchUser,
      handleSendFriendRequest,
      handleAcceptRequest,
      handleDeclineRequest,
      handleCancelRequest,
      handleRemoveFriend,
      confirmRemoveFriend,
      showRemoveFriendModal,
      friendToRemove,
      thumbnailUrl,
      uploadingThumbnail,
      fileInput,
      handleFileSelect,
      triggerFileInput,
      bio,
      isEditingBio,
      bioEditText,
      savingBio,
      startEditingBio,
      cancelEditingBio,
      saveBio,
      deleteBio,
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

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  border: 2px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  z-index: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-icon {
  font-size: 3rem;
}

.upload-avatar-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.8);
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.upload-avatar-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 1);
  transform: scale(1.1);
}

.upload-avatar-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

/* Bio Section */
.bio-section {
  margin-bottom: 1rem;
}

.bio-display {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.bio-text {
  color: #7b8ca8;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.bio-text.bio-empty {
  font-style: italic;
  opacity: 0.7;
}

.bio-display-buttons {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: center;
}

.edit-bio-btn {
  padding: 0.5rem 1rem;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.edit-bio-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.5);
}

.bio-edit {
  width: 100%;
}

.bio-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 0.5rem;
}

.bio-textarea:focus {
  outline: none;
  border-color: #4a9eff;
}

.bio-textarea::placeholder {
  color: #4a5568;
}

.bio-edit-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.bio-char-count {
  font-size: 0.85rem;
  color: #7b8ca8;
}

.bio-buttons {
  display: flex;
  gap: 0.5rem;
}

.save-bio-btn,
.cancel-bio-btn,
.delete-bio-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.save-bio-btn {
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: #4a9eff;
}

.save-bio-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.5);
}

.delete-bio-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
}

.delete-bio-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
}

.cancel-bio-btn {
  background: rgba(123, 140, 168, 0.2);
  border: 1px solid rgba(123, 140, 168, 0.3);
  color: #7b8ca8;
}

.cancel-bio-btn:hover:not(:disabled) {
  background: rgba(123, 140, 168, 0.3);
  border-color: rgba(123, 140, 168, 0.5);
}

.save-bio-btn:disabled,
.cancel-bio-btn:disabled,
.delete-bio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a9eff;
}

.stat-label {
  font-size: 0.9rem;
  color: #7b8ca8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.loading-text,
.error-text,
.empty-message {
  padding: 1rem;
  text-align: center;
  color: #7b8ca8;
}

.error-text {
  color: #ff6b6b;
}

/* Reviews List */
.reviews-list-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.reviews-list-container::-webkit-scrollbar {
  width: 8px;
}

.reviews-list-container::-webkit-scrollbar-track {
  background: rgba(10, 14, 26, 0.3);
  border-radius: 4px;
}

.reviews-list-container::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 4px;
}

.reviews-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.5);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.1);
  border-radius: 6px;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.review-item:hover {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(74, 158, 255, 0.3);
}

.review-album-cover {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.review-album-cover-placeholder {
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

.review-content-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.review-song-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-song-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.review-song-artist {
  font-size: 0.9rem;
  color: #7b8ca8;
}

.review-rating {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #4a5568;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffd700;
}

.review-text {
  color: #7b8ca8;
  line-height: 1.6;
  margin: 0;
}

/* Song List (for playlists) */
.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(74, 158, 255, 0.3);
}

.song-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-width: 0;
}

.song-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-thumbnail-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #4a9eff;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.song-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.85rem;
  color: #7b8ca8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #7b8ca8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: #ff6b6b;
}

/* Friends Section */
.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.friends-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.friends-column.full-width {
  grid-column: 1 / -1;
}

.friends-column {
  display: flex;
  flex-direction: column;
  height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.friends-column > .subsection-title {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.friends-column > .friends-list,
.friends-column > .friend-requests-section,
.friends-column > .loading-text,
.friends-column > .error-text,
.friends-column > .empty-message {
  flex-shrink: 0;
}

.friends-column::-webkit-scrollbar {
  width: 6px;
}

.friends-column::-webkit-scrollbar-track {
  background: rgba(10, 14, 26, 0.3);
  border-radius: 3px;
}

.friends-column::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 3px;
}

.friends-column::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.5);
}

.add-friend-btn {
  padding: 0.5rem 1rem;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-friend-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.5);
}

.friend-requests-section {
  margin-bottom: 1.5rem;
}

.friend-requests-section:last-child {
  margin-bottom: 0;
}

.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7b8ca8;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subsubsection-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7b8ca8;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

/* Friends List */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.friend-item:hover {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(74, 158, 255, 0.3);
}

.friend-request-item {
  border-color: rgba(255, 193, 7, 0.2);
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.friend-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.friend-icon {
  font-size: 1.5rem;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.friend-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.clickable-name {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable-name:hover {
  color: #4a9eff;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.accept-btn,
.decline-btn,
.cancel-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.cancel-btn {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.3);
  color: #ff9800;
  width: 4.5rem;
  min-width: 4.5rem;
  max-width: 4.5rem;
}

.accept-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
  width: 2rem;
  min-width: 2rem;
  max-width: 2rem;
  padding: 0.5rem 0;
}

.accept-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.5);
}

.decline-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  width: 2rem;
  min-width: 2rem;
  max-width: 2rem;
  padding: 0.5rem 0;
}

.decline-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
}

.remove-friend-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 2rem;
  min-width: 2rem;
  max-width: 2rem;
  padding: 0.5rem 0;
}

.remove-friend-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
}

.cancel-btn {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.3);
  color: #ff9800;
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 152, 0, 0.3);
  border-color: rgba(255, 152, 0, 0.5);
}

.accept-btn:disabled,
.decline-btn:disabled,
.cancel-btn:disabled,
.remove-friend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(26, 35, 52, 0.95);
  border: 1px solid rgba(123, 140, 168, 0.3);
  border-radius: 8px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  position: relative;
}

.modal-content-confirm {
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(123, 140, 168, 0.2);
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #7b8ca8;
  font-size: 1.5rem;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(123, 140, 168, 0.1);
  color: #ffffff;
}

.modal-body {
  padding: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02em;
}

.modal-message {
  color: #7b8ca8;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.modal-message strong {
  color: #4a9eff;
  font-weight: 600;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn-cancel {
  background: rgba(123, 140, 168, 0.1);
  border: 1px solid rgba(123, 140, 168, 0.3);
  color: #7b8ca8;
}

.modal-btn-cancel:hover {
  background: rgba(123, 140, 168, 0.2);
  border-color: rgba(123, 140, 168, 0.5);
  color: #ffffff;
}

.modal-btn-confirm {
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  color: #ff6b9d;
}

.modal-btn-confirm:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: #ff6b9d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.friend-search-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.friend-search-input:focus {
  outline: none;
  border-color: #4a9eff;
}

.friend-search-input::placeholder {
  color: #4a5568;
}

.searched-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 6px;
  margin-top: 1rem;
}

.searched-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.send-request-btn {
  padding: 0.5rem 1rem;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.send-request-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.5);
}

.send-request-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 968px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
}

/* Playlist Items */
.playlist-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.playlist-items-list::-webkit-scrollbar {
  width: 8px;
}

.playlist-items-list::-webkit-scrollbar-track {
  background: rgba(10, 14, 26, 0.3);
  border-radius: 4px;
}

.playlist-items-list::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 4px;
}

.playlist-items-list::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.5);
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:hover {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(74, 158, 255, 0.3);
}

.playlist-item-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.playlist-item-thumbnail-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
}

.playlist-item-info {
  flex: 1;
  min-width: 0;
}

.playlist-item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item-artist {
  font-size: 0.85rem;
  color: #7b8ca8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-item-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 2rem;
  min-width: 2rem;
  max-width: 2rem;
  padding: 0.5rem 0;
  flex-shrink: 0;
  margin-left: auto;
}

.remove-item-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
}

@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .user-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
