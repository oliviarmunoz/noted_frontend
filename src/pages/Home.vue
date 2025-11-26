<template>
  <div class="page">
    <div class="home-layout">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h2
            class="sidebar-title clickable-title"
            @click="$router.push('/playlists')"
          >
            LISTEN LATER
          </h2>
          <div v-if="loadingListenLater" class="loading-text">Loading...</div>
          <div v-else-if="listenLaterError" class="error-text">
            {{ listenLaterError }}
          </div>
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
          <h2
            class="sidebar-title clickable-title"
            @click="$router.push('/playlists')"
          >
            FAVORITES
          </h2>
          <div v-if="loadingFavorites" class="loading-text">Loading...</div>
          <div v-else-if="favoritesError" class="error-text">
            {{ favoritesError }}
          </div>
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
            <img
              v-if="review.imageUrl"
              :src="review.imageUrl"
              :alt="review.song"
              class="song-thumbnail-feed"
            />
            <div v-else class="song-thumbnail-placeholder-feed">
              {{ review.song?.charAt(0) || "?" }}
            </div>
            <div class="song-text">
              <div class="song-title">{{ review.song }}</div>
              <div class="song-artist">{{ review.artist }}</div>
              <div v-if="review.album" class="song-album">
                {{ review.album }}
              </div>
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
          <div
            class="comments-section"
            v-if="review.comments && review.comments.length > 0"
          >
            <div
              class="comment-item"
              v-for="comment in review.comments"
              :key="comment.commentId"
            >
              <span class="comment-user"
                >{{ comment.commenterUsername || comment.commenter }}:</span
              >
              <span class="comment-text">{{ comment.notes }}</span>
              <button
                v-if="comment.commenter === userId"
                @click="handleDeleteComment(review.id, comment.commentId)"
                class="delete-comment-btn"
                title="Delete comment"
              >
                ×
              </button>
            </div>
          </div>
          <div class="comment-input" v-if="review && review.id">
            <span class="comment-icon">👤</span>
            <input
              type="text"
              placeholder="Leave a comment"
              class="comment-field"
              v-model="commentInputs[review.id]"
              @keyup.enter="handleAddComment(review.id)"
            />
            <button
              @click="handleAddComment(review.id)"
              class="comment-submit-btn"
            >
              Post
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { usePlaylists } from "../composables/usePlaylists.js";
import { useToast } from "../composables/useToast.js";
import { usePlaylistEvents } from "../composables/usePlaylistEvents.js";
import { useAuth } from "../composables/useAuth.js";
import { friending, review, musicDiscovery, auth } from "../api/api.js";

export default {
  name: "Home",
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

    // Load favorites with enhanced entity information
    const loadFavorites = async () => {
      if (!userId.value) {
        favoritesItems.value = [];
        return;
      }

      loadingFavorites.value = true;
      favoritesError.value = null;

      try {
        const result = await loadPlaylistItems("Favorites");
        if (result.error) {
          favoritesError.value = result.error;
          favoritesItems.value = [];
        } else {
          // Enhance items with entity information if not already complete
          favoritesItems.value = await Promise.all(
            (result.items || []).map(async (item) => {
              // If item already has complete info, return as is
              if (
                item.name &&
                item.name !== "Unknown" &&
                item.artist !== undefined
              ) {
                return item;
              }

              // Otherwise, try to get entity information
              const itemId = item.item || item;
              try {
                // Try as external ID first
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
                      `[Home] Could not load entity by URI for ${itemId}:`,
                      e
                    );
                  }
                }

                // Get review information for this item
                let reviewData = null;
                try {
                  const reviewResponse = await review.getReviewByItemAndUser(
                    itemId,
                    userId.value
                  );
                  // API returns array: [{ "review": "string", "rating": "number", "notes": "string" }]
                  if (
                    reviewResponse &&
                    !reviewResponse.error &&
                    Array.isArray(reviewResponse) &&
                    reviewResponse.length > 0
                  ) {
                    reviewData = reviewResponse[0];
                  } else if (
                    reviewResponse &&
                    !reviewResponse.error &&
                    reviewResponse.rating
                  ) {
                    reviewData = reviewResponse;
                  }
                } catch (reviewErr) {
                  console.warn(
                    `[Home] Could not load review for ${itemId}:`,
                    reviewErr
                  );
                }

                // Update item with entity information
                if (musicEntity && !musicEntity.error) {
                  return {
                    item: item.item || itemId,
                    name: musicEntity.name || item.name || "Unknown",
                    artist:
                      musicEntity.artistName ||
                      musicEntity.artist ||
                      item.artist ||
                      "",
                    uri:
                      musicEntity.uri ||
                      musicEntity.externalId ||
                      item.uri ||
                      itemId,
                    imageUrl: musicEntity.imageUrl || item.imageUrl || null,
                    rating: reviewData?.rating || null,
                    reviewNotes: reviewData?.notes || null,
                  };
                }

                // If entity loading failed but we have review data, include it
                if (reviewData) {
                  return {
                    ...item,
                    rating: reviewData.rating || null,
                    reviewNotes: reviewData.notes || null,
                  };
                }
              } catch (err) {
                console.warn(
                  `[Home] Error loading entity info for ${itemId}:`,
                  err
                );
              }

              // Return original item if entity loading failed
              return item;
            })
          );
        }
      } catch (error) {
        console.error("[Home] Error loading favorites:", error);
        favoritesError.value = error.message || "Failed to load favorites";
        favoritesItems.value = [];
      } finally {
        loadingFavorites.value = false;
      }
    };

    // Load listen later with enhanced entity information
    const loadListenLater = async () => {
      if (!userId.value) {
        listenLaterItems.value = [];
        return;
      }

      loadingListenLater.value = true;
      listenLaterError.value = null;

      try {
        const result = await loadPlaylistItems("Listen Later");
        if (result.error) {
          listenLaterError.value = result.error;
          listenLaterItems.value = [];
        } else {
          // Enhance items with entity information if not already complete
          listenLaterItems.value = await Promise.all(
            (result.items || []).map(async (item) => {
              // If item already has complete info, return as is
              if (
                item.name &&
                item.name !== "Unknown" &&
                item.artist !== undefined
              ) {
                return item;
              }

              // Otherwise, try to get entity information
              const itemId = item.item || item;
              try {
                // Try as external ID first
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
                      `[Home] Could not load entity by URI for ${itemId}:`,
                      e
                    );
                  }
                }

                // Get review information for this item
                let reviewData = null;
                try {
                  const reviewResponse = await review.getReviewByItemAndUser(
                    itemId,
                    userId.value
                  );
                  // API returns array: [{ "review": "string", "rating": "number", "notes": "string" }]
                  if (
                    reviewResponse &&
                    !reviewResponse.error &&
                    Array.isArray(reviewResponse) &&
                    reviewResponse.length > 0
                  ) {
                    reviewData = reviewResponse[0];
                  } else if (
                    reviewResponse &&
                    !reviewResponse.error &&
                    reviewResponse.rating
                  ) {
                    reviewData = reviewResponse;
                  }
                } catch (reviewErr) {
                  console.warn(
                    `[Home] Could not load review for ${itemId}:`,
                    reviewErr
                  );
                }

                // Update item with entity information
                if (musicEntity && !musicEntity.error) {
                  return {
                    item: item.item || itemId,
                    name: musicEntity.name || item.name || "Unknown",
                    artist:
                      musicEntity.artistName ||
                      musicEntity.artist ||
                      item.artist ||
                      "",
                    uri:
                      musicEntity.uri ||
                      musicEntity.externalId ||
                      item.uri ||
                      itemId,
                    imageUrl: musicEntity.imageUrl || item.imageUrl || null,
                    rating: reviewData?.rating || null,
                    reviewNotes: reviewData?.notes || null,
                  };
                }

                // If entity loading failed but we have review data, include it
                if (reviewData) {
                  return {
                    ...item,
                    rating: reviewData.rating || null,
                    reviewNotes: reviewData.notes || null,
                  };
                }
              } catch (err) {
                console.warn(
                  `[Home] Error loading entity info for ${itemId}:`,
                  err
                );
              }

              // Return original item if entity loading failed
              return item;
            })
          );
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
          showToastNotification(
            "This is sample data. Click on real reviews to view songs."
          );
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
      if (!userId.value) {
        showToastNotification("Error: User not authenticated");
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

    // Expose userId for use in methods (Options API)
    const getUserId = () => userId.value;

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
      getUserId,
      userId: computed(() => userId.value),
      showToastNotification,
    };
  },
  data() {
    return {
      reviews: [],
      loading: true,
      error: null,
      commentInputs: {},
    };
  },
  async mounted() {
    await this.loadFeed();
  },
  methods: {
    // Helper method to enhance comments with usernames
    async enhanceCommentsWithUsernames(comments) {
      if (!comments || !Array.isArray(comments)) {
        return [];
      }

      return await Promise.all(
        comments.map(async (comment) => {
          let commenterUsername = comment.commenter;
          if (comment.commenter) {
            try {
              const usernameResponse = await auth.getUsername(
                comment.commenter
              );
              // _getUsername returns an array: [{ username: "String" }]
              if (usernameResponse && !usernameResponse.error) {
                if (
                  Array.isArray(usernameResponse) &&
                  usernameResponse.length > 0
                ) {
                  commenterUsername =
                    usernameResponse[0].username || comment.commenter;
                } else if (usernameResponse.username) {
                  commenterUsername = usernameResponse.username;
                }
              }
            } catch (err) {
              console.warn(
                `Could not get username for commenter ${comment.commenter}:`,
                err
              );
              // Keep the commenter ID as fallback
              commenterUsername = comment.commenter;
            }
          }
          return {
            ...comment,
            commenterUsername: commenterUsername,
          };
        })
      );
    },
    async loadFeed() {
      this.loading = true;
      this.error = null;

      try {
        // Get authenticated user ID from setup
        const currentUser = this.getUserId();

        if (!currentUser) {
          this.error = "User not authenticated";
          this.loading = false;
          return;
        }

        // Get friends of the current user
        const friendsResponse = await friending.getFriends(currentUser);

        if (friendsResponse && friendsResponse.error) {
          throw new Error(friendsResponse.error);
        }

        const friends = friendsResponse || [];
        const friendIds = friends.map((f) => f.friend || f);

        // Get reviews from all friends
        const allReviews = [];

        for (const friendId of friendIds) {
          try {
            const userReviewsResponse = await review.getUserReviews(friendId);

            if (userReviewsResponse && userReviewsResponse.error) {
              console.warn(
                `Error fetching reviews for friend ${friendId}:`,
                userReviewsResponse.error
              );
              continue;
            }

            const userReviews = userReviewsResponse || [];

            // Get entity details for each review
            // For each review, get the target field and use it to get the music entity
            for (const reviewData of userReviews) {
              try {
                // Get the target from the review (API spec uses "target", not "item")
                const target = reviewData.item;
                let musicEntity = null;

                // Get the music entity information using getEntityFromId with the target
                if (target) {
                  try {
                    const entityResponse = await musicDiscovery.getEntity(
                      target
                    );
                    console.log("entityResponse", entityResponse);

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
                        musicEntity =
                          firstResponse.musicEntity || firstResponse;
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

                // Get reviewer username using _getUsername API
                let reviewerName = friendId;
                try {
                  const usernameResponse = await auth.getUsername(friendId);
                  // _getUsername returns an array: [{ username: "String" }]
                  if (usernameResponse && !usernameResponse.error) {
                    if (
                      Array.isArray(usernameResponse) &&
                      usernameResponse.length > 0
                    ) {
                      reviewerName = usernameResponse[0].username || friendId;
                    } else if (usernameResponse.username) {
                      reviewerName = usernameResponse.username;
                    }
                  }
                } catch (e) {
                  console.warn(
                    `Could not get username for user ${friendId}:`,
                    e
                  );
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

                // Get review ID
                const reviewId = reviewData.review || reviewData._id;
                console.log("Review data structure:", {
                  reviewData,
                  reviewId,
                  reviewField: reviewData.review,
                  _idField: reviewData._id,
                });

                // Load comments for this review
                let comments = [];
                if (reviewId) {
                  try {
                    const reviewComments = await review.getReviewComments(
                      reviewId
                    );
                    if (reviewComments && reviewComments.error) {
                      console.error(
                        `Error loading comments:`,
                        reviewComments.error
                      );
                    } else {
                      // Enhance comments with usernames
                      comments = await this.enhanceCommentsWithUsernames(
                        reviewComments || []
                      );
                    }
                  } catch (err) {
                    console.error(
                      `Error loading comments for review ${reviewId}:`,
                      err
                    );
                  }
                }

                // Push review with complete music entity information
                allReviews.push({
                  id: reviewId,
                  reviewer: reviewerName,
                  song: songName,
                  artist: songArtist,
                  album: songAlbum,
                  imageUrl: songImageUrl,
                  rating: reviewData.rating || 0,
                  comment: reviewData.notes || "",
                  songId: target,
                  songUri: songUri,
                  uri: songUri,
                  item: target, // Keep for backward compatibility
                  musicEntity: musicEntity,
                  comments: comments,
                });
              } catch (err) {
                console.warn(
                  `Error processing review ${reviewData.review}:`,
                  err
                );
              }
            }
          } catch (err) {
            console.warn(`Error fetching reviews for friend ${friendId}:`, err);
          }
        }

        // Sort reviews by most recent
        this.reviews = allReviews;
      } catch (err) {
        console.error("Error loading feed:", err);
        this.error = err.message || "Failed to load feed";
      } finally {
        this.loading = false;
      }
    },
    async handleAddComment(reviewId) {
      if (!reviewId) {
        console.error("handleAddComment: reviewId is missing", reviewId);
        this.showToastNotification("Error: Review ID not found");
        return;
      }

      const currentUser = this.getUserId();
      if (!currentUser) {
        this.showToastNotification("Error: User not authenticated");
        return;
      }

      const commentText = this.commentInputs[reviewId];
      if (!commentText || !commentText.trim()) {
        console.warn("handleAddComment: comment text is empty");
        return;
      }

      console.log("handleAddComment called with:", {
        reviewId,
        reviewIdType: typeof reviewId,
        currentUser,
        currentUserType: typeof currentUser,
        commentText: commentText.trim(),
        commentInputs: this.commentInputs,
      });

      try {
        // Add comment to review
        const result = await review.addComment(
          reviewId,
          currentUser,
          commentText.trim()
        );
        console.log("addComment result:", result);

        if (result && result.error) {
          this.showToastNotification(result.error);
          return;
        }

        // Clear the input
        this.commentInputs[reviewId] = "";

        // Reload comments for this review
        const targetReview = this.reviews.find((r) => r.id === reviewId);
        if (targetReview) {
          try {
            const updatedComments = await review.getReviewComments(reviewId);
            if (updatedComments && updatedComments.error) {
              console.error(`Error reloading comments:`, updatedComments.error);
            } else {
              // Enhance comments with usernames
              targetReview.comments = await this.enhanceCommentsWithUsernames(
                updatedComments || []
              );
            }
          } catch (err) {
            console.error(
              `Error reloading comments for review ${reviewId}:`,
              err
            );
            // Reload entire feed if single review reload fails
            await this.loadFeed();
          }
        }
      } catch (err) {
        console.error("Error adding comment:", err);
        this.showToastNotification(err.message || "Failed to add comment");
      }
    },
    async handleDeleteComment(reviewId, commentId) {
      const currentUser = this.getUserId();
      if (!currentUser) {
        this.showToastNotification("Error: User not authenticated");
        return;
      }

      try {
        // Delete comment
        const result = await review.deleteComment(reviewId, commentId);

        if (result && result.error) {
          this.showToastNotification(result.error);
          return;
        }

        // Reload comments for this review
        const targetReview = this.reviews.find((r) => r.id === reviewId);
        if (targetReview) {
          try {
            const updatedComments = await review.getReviewComments(reviewId);
            if (updatedComments && updatedComments.error) {
              console.error(`Error reloading comments:`, updatedComments.error);
            } else {
              // Enhance comments with usernames
              targetReview.comments = await this.enhanceCommentsWithUsernames(
                updatedComments || []
              );
            }
          } catch (err) {
            console.error(
              `Error reloading comments for review ${reviewId}:`,
              err
            );
            // Reload entire feed if single review reload fails
            await this.loadFeed();
          }
        }
      } catch (err) {
        console.error("Error deleting comment:", err);
        this.showToastNotification(err.message || "Failed to delete comment");
      }
    },
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

.clickable-title {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable-title:hover {
  color: #4a9eff;
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

.song-album {
  font-size: 0.85rem;
  color: #4a5568;
  margin-top: 0.25rem;
}

.song-thumbnail-feed {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-thumbnail-placeholder-feed {
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

.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(123, 140, 168, 0.1);
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border-radius: 4px;
}

.comment-user {
  color: #4a9eff;
  font-weight: 600;
  margin-right: 0.5rem;
}

.comment-text {
  flex: 1;
  color: #7b8ca8;
}

.delete-comment-btn {
  background: transparent;
  border: none;
  color: #ff6b9d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.delete-comment-btn:hover {
  background: rgba(255, 107, 157, 0.1);
  color: #ff6b9d;
}

.comment-submit-btn {
  padding: 0.5rem 1rem;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-submit-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
}

.loading,
.error,
.no-reviews {
  text-align: center;
  padding: 3rem;
  color: #7b8ca8;
  font-size: 1rem;
}

.error {
  color: #ff6b9d;
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