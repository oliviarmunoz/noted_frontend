<template>
  <div class="page">
    <div class="item-detail-container">
      <div v-if="loading" class="loading">Loading track information...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="songInfo" class="song-content">
        <div class="album-section">
          <div class="album-art">
            <img
              v-if="songInfo.albumArt"
              :src="songInfo.albumArt"
              :alt="songInfo.album"
              class="album-image"
            />
            <div v-else class="album-number">
              {{ songInfo.name?.charAt(0) || "?" }}
            </div>
          </div>
          <div class="playlist-buttons">
            <button
              @click="handleTogglePlaylist('Favorites')"
              class="playlist-action-btn favorites-btn"
              :class="{ 'is-active': isInFavorites }"
              :title="
                isInFavorites ? 'Remove from Favorites' : 'Add to Favorites'
              "
            >
              <svg
                v-if="isInFavorites"
                class="playlist-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              <svg
                v-else
                class="playlist-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
              <span class="playlist-text">Favorites</span>
            </button>
            <button
              @click="handleTogglePlaylist('Listen Later')"
              class="playlist-action-btn listen-later-btn"
              :class="{ 'is-active': isInListenLater }"
              :title="
                isInListenLater
                  ? 'Remove from Listen Later'
                  : 'Add to Listen Later'
              "
            >
              <svg
                class="playlist-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="playlist-text">Listen Later</span>
            </button>
            <button
              @click="showFriendRecommendModal = true"
              class="playlist-action-btn friend-recommend-btn"
              title="Recommend to Friend"
            >
              <svg
                class="playlist-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6M23 11h-6"></path>
              </svg>
              <span class="playlist-text">Recommend to Friend</span>
            </button>
          </div>
        </div>

        <div class="song-info">
          <div class="title-row">
            <h1 class="song-title">{{ songInfo.name || "Unknown Song" }}</h1>
            <button
              v-if="hasReview"
              @click="handleDeleteReview"
              class="delete-review-btn"
            >
              Delete Review
            </button>
          </div>
          <p class="song-artist">
            {{ songInfo.artist || "Unknown Artist" }}
          </p>
          <p v-if="songInfo.album" class="song-album">
            {{ songInfo.album }}
          </p>

          <div class="rating-section">
            <div class="rating-group">
              <span class="rating-label">My Rating:</span>
              <div class="rating">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= (hoverRating || myRating) }"
                  @click="handleRatingChange(i)"
                  @mouseenter="hoverRating = i"
                  @mouseleave="hoverRating = 0"
                >
                  ★
                </span>
              </div>
            </div>
            <div class="action-buttons">
              <button
                v-if="songInfo.externalURL"
                class="spotify-btn"
                @click="openInSpotify"
              >
                <svg
                  class="spotify-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"
                  />
                </svg>
                <span class="spotify-label">Open in Spotify</span>
              </button>
              <button
                class="action-btn"
                @click="handleSaveReview"
                :disabled="savingReview"
              >
                <span class="action-label">{{
                  hasReview ? "Update Review" : "Submit Review"
                }}</span>
              </button>
            </div>
          </div>

          <div class="notes-section">
            <label class="notes-label">Notes</label>
            <textarea
              class="notes-textarea"
              placeholder="Add your notes here..."
              v-model="myNotes"
            ></textarea>
          </div>
          <div v-if="reviewError" class="review-error">{{ reviewError }}</div>
        </div>
      </div>

      <div class="other-reviews" v-if="!loadingReviews" ref="reviewsSection">
        <h2 class="activity-title">OTHER REVIEWS</h2>
        <div v-if="reviewsError" class="error">{{ reviewsError }}</div>
        <div v-else-if="otherReviews.length === 0" class="no-reviews">
          No other reviews yet. Be the first to review!
        </div>
        <transition-group name="review-fade" tag="div">
          <div
            class="activity-card"
            v-for="review in otherReviews"
            :key="review.id"
            :class="{ 'newly-added': newlyAddedReviewId === review.id }"
          >
            <div class="activity-header">
              <span
                class="activity-text clickable-username"
                @click="navigateToUserProfile(review.userId)"
                v-if="review.userId"
              >
                {{ review.username || review.userId }}
              </span>
              <span class="activity-text" v-else>{{
                review.username || review.userId
              }}</span>
            </div>
            <div class="activity-rating">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= (review.rating || 0) }"
              >
                ★
              </span>
            </div>
            <p v-if="review.notes" class="activity-comment">
              {{ review.notes }}
            </p>
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
                <span class="comment-text">{{
                  comment.notes || comment.comment
                }}</span>
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
        </transition-group>
        <div v-if="reviewsHasMore" class="load-more-reviews">
          <button
            @click="loadMoreReviews"
            class="load-more-btn"
            :disabled="loadingMoreReviews"
          >
            {{ loadingMoreReviews ? "Loading..." : "Load More Reviews" }}
          </button>
        </div>
      </div>

      <transition name="toast">
        <div v-if="showToast" class="toast-notification">
          <span class="toast-icon">✓</span>
          <span class="toast-message">{{ toastMessage }}</span>
        </div>
      </transition>

      <!-- Friend Recommendation Modal -->
      <transition name="modal">
        <div
          v-if="showFriendRecommendModal"
          class="modal-overlay"
          @click.self="showFriendRecommendModal = false"
        >
          <div class="modal-content">
            <h3 class="modal-title">Recommend to Friend</h3>
            <button class="modal-close" @click="showFriendRecommendModal = false">
              ×
            </button>
            <div class="friend-recommend-content">
              <div v-if="loadingFriends" class="loading-text">
                Loading friends...
              </div>
              <div v-else-if="friendsError" class="error-text">
                {{ friendsError }}
              </div>
              <div v-else-if="friends.length === 0" class="empty-message">
                You don't have any friends yet. Add friends from your profile!
              </div>
              <div v-else class="friends-list-modal">
                <input
                  type="text"
                  v-model="friendSearchQuery"
                  placeholder="Search friends..."
                  class="friend-search-input"
                  @input="filterFriends"
                />
                <div class="friends-scrollable">
                  <div
                    v-for="friend in filteredFriends"
                    :key="friend.friend"
                    class="friend-item-modal"
                    @click="handleRecommendToFriend(friend)"
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
                      <div class="friend-name">
                        {{ friend.friendName || friend.friend }}
                      </div>
                    </div>
                    <button
                      class="recommend-btn"
                      @click.stop="handleRecommendToFriend(friend)"
                      :disabled="recommendingToFriend === friend.friend"
                    >
                      {{ recommendingToFriend === friend.friend ? "..." : "Recommend" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Delete Confirmation Modal -->
      <transition name="modal">
        <div
          v-if="showDeleteModal"
          class="modal-overlay"
          @click.self="showDeleteModal = false"
        >
          <div class="modal-content">
            <h3 class="modal-title">
              {{
                deleteModalType === "comment"
                  ? "Delete Comment"
                  : "Delete Review"
              }}
            </h3>
            <p class="modal-message">
              {{
                deleteModalType === "comment"
                  ? "Are you sure you want to delete this comment?"
                  : "Are you sure you want to delete your review?"
              }}
            </p>
            <div class="modal-buttons">
              <button
                class="modal-btn modal-btn-cancel"
                @click="showDeleteModal = false"
              >
                Cancel
              </button>
              <button
                class="modal-btn modal-btn-confirm"
                @click="confirmDelete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { review, musicDiscovery, auth, playlist, friending, userProfile } from "../api/api.js";
import { usePlaylists } from "../composables/usePlaylists.js";
import { useToast } from "../composables/useToast.js";
import { usePlaylistEvents } from "../composables/usePlaylistEvents.js";
import { useAuth } from "../composables/useAuth.js";

export default {
  name: "Review",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { currentUser, currentSession } = useAuth();

    // State management
    const loading = ref(true);
    const loadingReviews = ref(false);
    const error = ref(null);
    const savingReview = ref(false);
    const reviewError = ref(null);
    const reviewsError = ref(null);
    const reviewsLimit = ref(20);
    const reviewsHasMore = ref(false);
    const loadingMoreReviews = ref(false);
    const hoverRating = ref(0);
    const commentInputs = ref({});
    const newlyAddedReviewId = ref(null);
    const reviewsSection = ref(null);
    const isInFavorites = ref(false);
    const isInListenLater = ref(false);
    const showDeleteModal = ref(false);
    const deleteModalType = ref(null); // 'review' or 'comment'
    const deleteModalData = ref(null);
    const showFriendRecommendModal = ref(false);
    const friends = ref([]);
    const loadingFriends = ref(false);
    const friendsError = ref(null);
    const friendSearchQuery = ref("");
    const filteredFriends = ref([]);
    const recommendingToFriend = ref(null);

    const uri = computed(() => route.params.id);

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

    const { toastMessage, showToast, showToastNotification } = useToast();
    const { triggerPlaylistUpdate } = usePlaylistEvents();

    // Wrapper functions for playlist operations that handle userId being null
    const getPlaylistComposable = () => {
      if (!userId.value) {
        throw new Error("User not authenticated");
      }
      return usePlaylists(userId.value);
    };

    const itemId = ref(null);
    const songInfo = ref(null);

    const loadEntityDetails = async () => {
      try {
        const entity = await musicDiscovery.getEntityFromUri(uri.value);

        if (entity && entity.error) {
          reviewError.value = entity.error;
          error.value = entity.error;
          return;
        }

        if (!entity || (Array.isArray(entity) && entity.length === 0)) {
          error.value = "Song not found in database";
          reviewError.value = "Song not found in database";
          return;
        }

        // Extract musicEntity from the response array
        let musicEntity = null;
        if (Array.isArray(entity) && entity.length > 0) {
          musicEntity = entity[0].musicEntity;
        } else if (entity.musicEntity) {
          musicEntity = entity.musicEntity;
        } else {
          musicEntity = entity;
        }

        if (musicEntity) {
          itemId.value = musicEntity._id || musicEntity.externalId;
          songInfo.value = {
            name: musicEntity.name || "",
            artist: musicEntity.artistName || "",
            album: musicEntity.album || musicEntity.albumName || "",
            albumArt: musicEntity.imageUrl || null,
            releaseDate: musicEntity.releaseDate || null,
            externalId: musicEntity.externalId || null,
            externalURL: musicEntity.externalURL || null,
          };
        }
      } catch (err) {
        console.error("Error loading entity details:", err);
        error.value = "Song not found in database";
        reviewError.value = "Song not found in database";
      }
    };

    const myReview = ref(null);
    const myRating = ref(0);
    const myNotes = ref("");

    // All reviews for this item
    const allReviews = ref([]);
    const displayedReviews = ref([]);
    const otherReviews = computed(() => {
      if (!displayedReviews.value || !userId.value) return [];
      return displayedReviews.value;
    });

    const hasReview = computed(() => myReview.value !== null);

    const loadMyReview = async () => {
      if (!userId.value) {
        return; // User not authenticated, skip loading review
      }

      try {
        // see if there is a review for this item and user
        const reviews = await review.getReviewByItemAndUser(
          itemId.value,
          userId.value
        );
        // if no review is found, set the review data to null
        if (!reviews) {
          myReview.value = null;
          myRating.value = 0;
          myNotes.value = "";
          return;
        }
        // if review is found, set the review data
        myReview.value = reviews;
        myRating.value = reviews.rating;
        myNotes.value = reviews.notes || "";
      } catch (err) {
        console.error("Error loading item reviews:", err);
        reviewError.value = err.message || "Failed to load your review";
      }
    };

    // Helper function to fetch usernames for comments
    const enrichCommentsWithUsernames = async (comments) => {
      if (!comments || comments.length === 0) return [];

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
              // Keep the userId as fallback
              commenterUsername = comment.commenter;
            }
          }
          return {
            ...comment,
            commenterUsername: commenterUsername,
            notes: comment.comment || comment.notes, // Support both 'comment' and 'notes' fields
          };
        })
      );
    };

    // Load all reviews for this item
    const loadAllReviews = async () => {
      loadingReviews.value = true;
      reviewError.value = null;
      reviewsError.value = null;
      try {
        const reviews = await review.getItemReviews(itemId.value);

        if (reviews && reviews.error) {
          reviewsError.value = reviews.error;
          allReviews.value = [];
          return;
        }

        allReviews.value = await Promise.all(
          (reviews || []).map(async (r) => {
            if (r.error) {
              console.error(`Error in review ${r.review}:`, r.error);
              return null;
            }

            const reviewId = r._id;

            if (!reviewId) {
              console.error("Review missing ID field:", r);
              return null;
            }

            const reviewUserId = r.user || r.author;

            // Get username for the reviewer using _getUsername API
            let username = reviewUserId;
            if (reviewUserId) {
              try {
                const usernameResponse = await auth.getUsername(reviewUserId);
                if (usernameResponse && !usernameResponse.error) {
                  if (
                    Array.isArray(usernameResponse) &&
                    usernameResponse.length > 0
                  ) {
                    username = usernameResponse[0].username || reviewUserId;
                  } else if (usernameResponse.username) {
                    username = usernameResponse.username;
                  }
                }
              } catch (err) {
                console.warn(
                  `Could not get username for user ${reviewUserId}:`,
                  err
                );
                // Keep the userId as fallback
                username = reviewUserId;
              }
            }

            // Load comments for each review
            let comments = [];
            try {
              const reviewComments = await review.getReviewComments(reviewId);
              if (reviewComments && reviewComments.error) {
                console.error(`Error loading comments:`, reviewComments.error);
              } else {
                // Fetch usernames for each commenter
                comments = await enrichCommentsWithUsernames(
                  reviewComments || []
                );
              }
            } catch (err) {
              console.error(
                `Error loading comments for review ${reviewId}:`,
                err
              );
            }

            return {
              id: reviewId,
              userId: reviewUserId,
              username: username,
              rating: r.rating,
              notes: r.notes || r.text,
              comments: comments,
            };
          })
        );
        // Filter out any null reviews (from errors)
        allReviews.value = allReviews.value.filter((r) => r !== null);

        // Limit displayed reviews
        reviewsHasMore.value = allReviews.value.length > reviewsLimit.value;
        displayedReviews.value = allReviews.value.slice(0, reviewsLimit.value);
      } catch (err) {
        console.error("Error loading reviews:", err);
        reviewsError.value = err.message || "Failed to load reviews";
        allReviews.value = [];
        displayedReviews.value = [];
      } finally {
        loadingReviews.value = false;
      }
    };

    // Load all data
    const loadReviews = async () => {
      loading.value = true;
      error.value = null;

      try {
        // Load entity details first to get itemId and songInfo
        await loadEntityDetails();

        if (!itemId.value) {
          error.value = "Error loading song details";
          loading.value = false;
          return;
        }

        await loadPlaylistStatus();
        await Promise.all([loadMyReview(), loadAllReviews()]);
      } catch (err) {
        error.value = err.message || "Failed to load reviews";
        console.error("Error loading reviews:", err);
      } finally {
        loading.value = false;
      }
    };

    // Handle rating change
    const handleRatingChange = (rating) => {
      myRating.value = rating;
    };

    // Note: showToastNotification is now from useToast composable

    // Save or update review
    const handleSaveReview = async () => {
      if (myRating.value === 0) {
        reviewError.value = "Please select a rating";
        return;
      }

      savingReview.value = true;
      reviewError.value = null;
      newlyAddedReviewId.value = null;

      try {
        let newReviewId = null;
        if (!userId.value) {
          reviewError.value = "User not authenticated";
          return;
        }

        if (hasReview.value) {
          // Get the review ID
          const reviewData = await review.getReviewByItemAndUser(
            itemId.value,
            userId.value
          );

          if (reviewData && reviewData.error) {
            reviewError.value = reviewData.error;
            return;
          }

          const reviewId = reviewData?._id;

          if (!reviewId) {
            reviewError.value = "Could not find review ID";
            return;
          }

          // Update existing review
          const result = await review.updateReview(
            reviewId,
            parseInt(myRating.value),
            myNotes.value
          );

          if (result && result.error) {
            reviewError.value = result.error;
            return;
          }

          showToastNotification("Review updated successfully!");
        } else {
          // Create new review
          const result = await review.postReview(
            itemId.value,
            userId.value,
            parseInt(myRating.value),
            myNotes.value
          );

          if (result && result.error) {
            reviewError.value = result.error;
            return;
          }

          newReviewId = result?.review || null;
          showToastNotification("Review submitted successfully!");
        }

        // reload all reviews
        await loadAllReviews();
        reviewError.value = null;

        // new review, highlight it in the reviews section
        if (newReviewId) {
          newlyAddedReviewId.value = newReviewId;
          // scroll to reviews section smoothly after a brief delay
          setTimeout(() => {
            if (reviewsSection.value) {
              reviewsSection.value.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 300);
          // remove highlight after animation completes
          setTimeout(() => {
            newlyAddedReviewId.value = null;
          }, 2500);
        } else if (hasReview.value) {
          // for updates, also scroll to show the updated review
          setTimeout(() => {
            if (reviewsSection.value && myReview.value) {
              reviewsSection.value.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 300);
        }
      } catch (err) {
        reviewError.value = err.message || "Failed to save review";
        console.error("Error saving review:", err);
      } finally {
        savingReview.value = false;
      }
    };

    // Delete review
    const handleDeleteReview = () => {
      deleteModalType.value = "review";
      deleteModalData.value = null;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      showDeleteModal.value = false;

      if (deleteModalType.value === "comment") {
        await confirmDeleteComment();
      } else {
        await confirmDeleteReview();
      }
    };

    // Confirm delete review
    const confirmDeleteReview = async () => {
      if (!myReview.value) return;

      savingReview.value = true;
      reviewError.value = null;

      try {
        const reviewId = myReview.value._id || myReview.value.id;

        if (!reviewId) {
          reviewError.value = "Could not find review ID";
          return;
        }

        // Delete review
        const result = await review.deleteReview(reviewId);

        if (result && result.error) {
          reviewError.value = result.error;
          return;
        }

        // Clear myReview after successful deletion
        myReview.value = null;
        myRating.value = 0;
        myNotes.value = "";

        // reload all reviews
        await loadAllReviews();
      } catch (err) {
        reviewError.value = err.message || "Failed to delete review";
        console.error("Error deleting review:", err);
      } finally {
        savingReview.value = false;
      }
    };

    // Add comment to a review
    const handleAddComment = async (reviewId) => {
      if (!userId.value) {
        reviewError.value = "User not authenticated";
        return;
      }

      const commentText = commentInputs.value[reviewId];
      if (!commentText || !commentText.trim()) return;

      try {
        // Add comment to review
        const result = await review.addComment(
          reviewId,
          userId.value,
          commentText.trim()
        );

        if (result && result.error) {
          reviewError.value = result.error;
          return;
        }

        // Clear the input
        commentInputs.value[reviewId] = "";

        // Reload comments
        const targetReview = allReviews.value.find((r) => r.id === reviewId);
        if (targetReview) {
          try {
            const updatedComments = await review.getReviewComments(reviewId);
            if (updatedComments && updatedComments.error) {
              console.error(`Error reloading comments:`, updatedComments.error);
            } else {
              // Fetch usernames for the updated comments
              targetReview.comments = await enrichCommentsWithUsernames(
                updatedComments || []
              );
            }
          } catch (err) {
            console.error(
              `Error reloading comments for review ${reviewId}:`,
              err
            );
            await loadAllReviews();
          }
        } else {
          await loadAllReviews();
        }
        // Update displayed reviews after reload
        reviewsHasMore.value = allReviews.value.length > reviewsLimit.value;
        displayedReviews.value = allReviews.value.slice(0, reviewsLimit.value);
      } catch (err) {
        reviewError.value = err.message || "Failed to add comment";
        console.error("Error adding comment:", err);
      }
    };

    // Delete comment
    const handleDeleteComment = (reviewId, commentId) => {
      deleteModalType.value = "comment";
      deleteModalData.value = { reviewId, commentId };
      showDeleteModal.value = true;
    };

    // Confirm delete comment
    const confirmDeleteComment = async () => {
      const { reviewId, commentId } = deleteModalData.value || {};

      if (!reviewId || !commentId) {
        reviewError.value = "Could not find review or comment ID";
        return;
      }

      reviewError.value = null;

      try {
        // Delete comment
        const result = await review.deleteComment(reviewId, commentId);

        if (result && result.error) {
          reviewError.value = result.error;
          return;
        }

        const targetReview = allReviews.value.find((r) => r.id === reviewId);
        if (targetReview) {
          try {
            const updatedComments = await review.getReviewComments(reviewId);
            if (updatedComments && updatedComments.error) {
              console.error(`Error reloading comments:`, updatedComments.error);
            } else {
              // Fetch usernames for the updated comments
              targetReview.comments = await enrichCommentsWithUsernames(
                updatedComments || []
              );
            }
          } catch (err) {
            console.error(
              `Error reloading comments for review ${reviewId}:`,
              err
            );
            await loadAllReviews();
          }
        } else {
          await loadAllReviews();
        }
        // Update displayed reviews after reload
        reviewsHasMore.value = allReviews.value.length > reviewsLimit.value;
        displayedReviews.value = allReviews.value.slice(0, reviewsLimit.value);
      } catch (err) {
        reviewError.value = err.message || "Failed to delete comment";
        console.error("Error deleting comment:", err);
      }
    };

    // initialize on mount
    onMounted(() => {
      loadReviews();
    });

    // reload when route changes
    watch(
      () => route.params.id,
      () => {
        loadReviews();
      }
    );

    // reload playlist status when itemId changes
    watch(
      () => uri.value,
      async () => {
        if (uri.value) {
          await loadPlaylistStatus();
        }
      }
    );

    // Toggle item in playlist (add or remove)
    const handleTogglePlaylist = async (playlistName) => {
      if (!userId.value) {
        showToastNotification("Error: User not authenticated");
        return;
      }

      if (!songInfo.value?.externalId && !itemId.value) {
        showToastNotification("Error: Song ID not found");
        return;
      }

      // Use externalId for playlist operations
      const itemIdToUse = songInfo.value?.externalId || itemId.value;
      const isInPlaylist =
        playlistName === "Favorites"
          ? isInFavorites.value
          : isInListenLater.value;

      try {
        const playlistComposable = getPlaylistComposable();

        if (isInPlaylist) {
          // Remove from playlist
          const result = await playlistComposable.removeItemFromPlaylist(
            itemIdToUse,
            playlistName
          );
          if (!result.success) {
            showToastNotification(
              result.error || `Error removing from ${playlistName}`
            );
            return;
          }
          showToastNotification(`Removed from ${playlistName}`);

          // Trigger playlist update event so Home page can refresh
          triggerPlaylistUpdate(playlistName);

          if (playlistName === "Favorites") {
            isInFavorites.value = false;
          } else {
            isInListenLater.value = false;
          }
        } else {
          // Add to playlist
          const result = await playlistComposable.addItemToPlaylist(
            itemIdToUse,
            playlistName
          );
          if (!result.success) {
            // Format error message to show song name instead of ID
            let errorMessage =
              result.error || `Error adding to ${playlistName}`;
            if (
              errorMessage.includes("already in playlist") &&
              songInfo.value?.name
            ) {
              // Replace the item ID with the song name in the error message
              // Handles formats like: Item 'ID' or Item "ID" or just the ID
              errorMessage = errorMessage.replace(
                /Item\s+['"]?[^'"]+['"]?/,
                `"${songInfo.value.name}"`
              );
            }
            showToastNotification(errorMessage);
            return;
          }
          showToastNotification(`Added to ${playlistName}!`);

          // Trigger playlist update event so Home page can refresh
          triggerPlaylistUpdate(playlistName);

          if (playlistName === "Favorites") {
            isInFavorites.value = true;
          } else {
            isInListenLater.value = true;
          }
        }
      } catch (err) {
        console.error(`[Review] Error toggling ${playlistName}:`, err);
        showToastNotification(`Error updating ${playlistName}`);
      }
    };

    // Load playlist status (check if song is in Favorites or Listen Later)
    const loadPlaylistStatus = async () => {
      if (!userId.value) {
        isInFavorites.value = false;
        isInListenLater.value = false;
        return;
      }

      if (!songInfo.value?.externalId && !itemId.value) {
        isInFavorites.value = false;
        isInListenLater.value = false;
        return;
      }

      const itemIdToUse = songInfo.value?.externalId || itemId.value;

      try {
        const playlistComposable = getPlaylistComposable();

        // Check Favorites
        const favoritesResult = await playlistComposable.loadPlaylistItems(
          "Favorites"
        );
        if (!favoritesResult.error) {
          isInFavorites.value = favoritesResult.items.some(
            (item) => item.item === itemIdToUse
          );
        }

        // Check Listen Later
        const listenLaterResult = await playlistComposable.loadPlaylistItems(
          "Listen Later"
        );
        if (!listenLaterResult.error) {
          isInListenLater.value = listenLaterResult.items.some(
            (item) => item.item === itemIdToUse
          );
        }
      } catch (err) {
        console.error("[Review] Error loading playlist status:", err);
        isInFavorites.value = false;
        isInListenLater.value = false;
      }
    };

    // Load more reviews
    const loadMoreReviews = () => {
      if (loadingMoreReviews.value || !reviewsHasMore.value) return;

      loadingMoreReviews.value = true;
      reviewsLimit.value += 20;
      reviewsHasMore.value = allReviews.value.length > reviewsLimit.value;
      displayedReviews.value = allReviews.value.slice(0, reviewsLimit.value);
      loadingMoreReviews.value = false;
    };

    // format release date
    const formatReleaseDate = (dateString) => {
      if (!dateString) return "Unknown";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day:
          dateString.includes("-") && dateString.split("-").length === 3
            ? "numeric"
            : undefined,
      });
    };

    // Open song in Spotify
    const openInSpotify = () => {
      if (songInfo.value?.externalURL) {
        window.open(
          songInfo.value.externalURL,
          "_blank",
          "noopener,noreferrer"
        );
      }
    };

    // Load friends for recommendation
    const loadFriends = async () => {
      if (!userId.value) {
        friends.value = [];
        return;
      }

      loadingFriends.value = true;
      friendsError.value = null;

      try {
        const result = await friending.getFriends(userId.value);

        if (result && result.error) {
          friendsError.value = result.error;
          friends.value = [];
          filteredFriends.value = [];
          return;
        }

        // Load usernames and thumbnails for each friend
        const friendsWithNames = await Promise.all(
          (result || []).map(async (friendItem) => {
            try {
              const [usernameResult, thumbnailResult] = await Promise.all([
                auth.getUsername(friendItem.friend),
                userProfile.getThumbnail(friendItem.friend),
              ]);

              const usernameData =
                Array.isArray(usernameResult) && usernameResult.length > 0
                  ? usernameResult[0]
                  : usernameResult;
              const username = usernameData?.username || friendItem.friend;

              const thumbnailData =
                Array.isArray(thumbnailResult) && thumbnailResult.length > 0
                  ? thumbnailResult[0]
                  : thumbnailResult;
              const thumbnailUrl = thumbnailData?.thumbnailUrl || thumbnailData?.thumbnail || null;

              return {
                ...friendItem,
                friendName: username,
                friendThumbnail: thumbnailUrl,
              };
            } catch (err) {
              console.error(
                `[Review] Error loading username/thumbnail for friend ${friendItem.friend}:`,
                err
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
        filteredFriends.value = friendsWithNames;
      } catch (err) {
        console.error("[Review] Error loading friends:", err);
        friendsError.value = err.message || "Failed to load friends";
        friends.value = [];
        filteredFriends.value = [];
      } finally {
        loadingFriends.value = false;
      }
    };

    // Filter friends based on search query
    const filterFriends = () => {
      const query = friendSearchQuery.value.toLowerCase().trim();
      if (!query) {
        filteredFriends.value = friends.value;
        return;
      }

      filteredFriends.value = friends.value.filter((friend) => {
        const name = (friend.friendName || friend.friend || "").toLowerCase();
        return name.includes(query);
      });
    };

    // Recommend song to friend
    const handleRecommendToFriend = async (friend) => {
      if (!friend || !friend.friend) {
        showToastNotification("Error: Invalid friend selection");
        return;
      }

      if (!songInfo.value?.externalId && !itemId.value) {
        showToastNotification("Error: Song ID not found");
        return;
      }

      const itemIdToUse = songInfo.value?.externalId || itemId.value;
      recommendingToFriend.value = friend.friend;

      try {
        // Use addItem with targetUser parameter to add to friend's playlist
        const result = await playlist.addItem(
          currentSession.value,
          itemIdToUse,
          "Friend Recommendations",
          friend.friend
        );

        if (result && result.error) {
          showToastNotification(
            result.error || "Failed to recommend song to friend"
          );
          return;
        }

        showToastNotification(
          `Recommended "${songInfo.value.name}" to ${friend.friendName || friend.friend}!`
        );
        showFriendRecommendModal.value = false;
        friendSearchQuery.value = "";
      } catch (err) {
        console.error("[Review] Error recommending to friend:", err);
        showToastNotification(
          err.message || "Failed to recommend song to friend"
        );
      } finally {
        recommendingToFriend.value = null;
      }
    };

    // Watch for modal opening to load friends
    watch(
      () => showFriendRecommendModal.value,
      (isOpen) => {
        if (isOpen && friends.value.length === 0 && !loadingFriends.value) {
          loadFriends();
        }
      }
    );

    // Navigate to user profile by username
    const navigateToUserProfile = async (targetUserId) => {
      if (!targetUserId) return;

      try {
        // Get username from userId
        const result = await auth.getUsername(targetUserId);
        if (result && result.error) {
          console.error(
            "[Review] Error getting username for navigation:",
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
            "[Review] Username not found for userId:",
            targetUserId
          );
        }
      } catch (error) {
        console.error("[Review] Error navigating to user profile:", error);
      }
    };

    return {
      itemId,
      userId: computed(() => userId.value),
      songInfo,
      loading,
      loadingReviews,
      error,
      myRating,
      myNotes,
      hasReview,
      savingReview,
      reviewError,
      reviewsError,
      hoverRating,
      otherReviews,
      showToast,
      toastMessage,
      newlyAddedReviewId,
      reviewsSection,
      isInFavorites,
      isInListenLater,
      handleRatingChange,
      handleSaveReview,
      handleDeleteReview,
      handleTogglePlaylist,
      formatReleaseDate,
      openInSpotify,
      commentInputs,
      handleAddComment,
      handleDeleteComment,
      showDeleteModal,
      deleteModalType,
      confirmDelete,
      loadMoreReviews,
      reviewsHasMore,
      loadingMoreReviews,
      navigateToUserProfile,
      showFriendRecommendModal,
      friends,
      loadingFriends,
      friendsError,
      friendSearchQuery,
      filteredFriends,
      recommendingToFriend,
      filterFriends,
      handleRecommendToFriend,
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

.item-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.song-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
}

.album-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
  width: 200px;
  align-items: flex-start;
}

.album-section .playlist-buttons {
  margin-top: 4.5rem;
  align-self: flex-start;
}

.album-art {
  width: 200px;
  height: 200px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-number {
  font-size: 6rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.song-title {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  flex: 1;
}

.song-artist {
  font-size: 1.5rem;
  color: #7b8ca8;
  margin: 0;
}

.song-album {
  font-size: 1.2rem;
  color: #7b8ca8;
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #7b8ca8;
}

.error {
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 4px;
  padding: 1rem 1.5rem;
  color: #ff6b9d;
  font-size: 0.95rem;
  margin: 1rem 0;
  text-align: center;
}

.song-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-meta p {
  margin: 0;
  color: #7b8ca8;
}

.meta-label {
  color: #ffffff;
  font-weight: 600;
  margin-right: 0.5rem;
}

.playlist-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.playlist-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  padding-left: calc(1rem + 18px + 0.5rem);
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
}

.favorites-btn {
  color: #ff6b9d;
}

.favorites-btn:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(255, 107, 157, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.15);
}

.favorites-btn.is-active {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(123, 140, 168, 0.2);
  color: #ff6b9d;
}

.favorites-btn.is-active:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(255, 107, 157, 0.4);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.15);
}

.listen-later-btn {
  color: #7b68ee;
}

.listen-later-btn:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(123, 104, 238, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(123, 104, 238, 0.15);
}

.listen-later-btn.is-active {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(123, 140, 168, 0.2);
  color: #7b68ee;
}

.listen-later-btn.is-active:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(123, 104, 238, 0.4);
  box-shadow: 0 4px 12px rgba(123, 104, 238, 0.15);
}

.friend-recommend-btn {
  color: #4ade80;
}

.friend-recommend-btn:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(74, 222, 128, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.15);
}

.playlist-icon {
  width: 18px;
  height: 18px;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.playlist-text {
  font-size: 0.9rem;
}

.rating-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.rating-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  color: #7b8ca8;
  font-size: 0.9rem;
}

.rating {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.delete-review-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 4px;
  color: #ff6b9d;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-review-btn:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: #ff6b9d;
}

.star {
  color: #4a5568;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star.filled {
  color: #ffd700;
}

.star:hover {
  color: #ffd700;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-btn {
  padding: 0.75rem 2rem;
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #4a9eff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spotify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #1db954;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spotify-btn:hover {
  background: rgba(10, 14, 26, 0.95);
  border-color: rgba(29, 185, 84, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.15);
}

.spotify-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.spotify-label {
  font-size: 0.95rem;
}

.action-label {
  font-size: 1rem;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notes-label {
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.notes-textarea {
  min-height: 150px;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.notes-textarea:focus {
  outline: none;
  border-color: #4a9eff;
}

.notes-textarea::placeholder {
  color: #4a5568;
}

.review-error {
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: #ff6b9d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Toast notification */
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
  z-index: 1000;
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

/* Review fade animation */
.review-fade-enter-active {
  transition: all 0.4s ease-out;
}

.review-fade-leave-active {
  transition: all 0.3s ease-in;
}

.review-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.review-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.activity-card.newly-added {
  animation: highlightPulse 2s ease-out;
  border-color: rgba(74, 158, 255, 0.5);
}

@keyframes highlightPulse {
  0% {
    background: rgba(74, 158, 255, 0.2);
    border-color: rgba(74, 158, 255, 0.6);
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  }
  50% {
    background: rgba(74, 158, 255, 0.15);
    border-color: rgba(74, 158, 255, 0.5);
    box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
  }
  100% {
    background: rgba(10, 14, 26, 0.6);
    border-color: rgba(123, 140, 168, 0.2);
    box-shadow: none;
  }
}

.no-reviews {
  color: #7b8ca8;
  text-align: center;
  padding: 2rem;
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
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 157, 0.2);
  border: 1px solid rgba(255, 107, 157, 0.4);
  border-radius: 4px;
  color: #ff6b9d;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(255, 107, 157, 0.3);
}

.delete-comment-btn:hover {
  background: rgba(255, 107, 157, 0.3);
  border-color: #ff6b9d;
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 107, 157, 0.4);
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

.comment-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(123, 140, 168, 0.1);
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

.activity-comment {
  color: #7b8ca8;
  margin: 0.75rem 0;
  line-height: 1.6;
}

.other-reviews {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.activity-title {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
}

.activity-card {
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  padding: 1.5rem;
}

.activity-header {
  margin-bottom: 1rem;
}

.activity-text {
  color: #ffffff;
  font-weight: 600;
}

.clickable-username {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable-username:hover {
  color: #4a9eff;
}

.activity-rating {
  display: flex;
  gap: 0.25rem;
}

.load-more-reviews {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(123, 140, 168, 0.2);
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
  transform: translateY(-1px);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
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
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(26, 35, 52, 0.95);
  border: 1px solid rgba(123, 140, 168, 0.3);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
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

/* Modal transitions */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-10px);
}

/* Friend Recommendation Modal Styles */
.friend-recommend-content {
  margin-top: 1.5rem;
}

.friend-search-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.friend-search-input:focus {
  outline: none;
  border-color: #4a9eff;
}

.friend-search-input::placeholder {
  color: #4a5568;
}

.friends-list-modal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.friends-scrollable {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.friends-scrollable::-webkit-scrollbar {
  width: 8px;
}

.friends-scrollable::-webkit-scrollbar-track {
  background: rgba(10, 14, 26, 0.3);
  border-radius: 4px;
}

.friends-scrollable::-webkit-scrollbar-thumb {
  background: rgba(123, 140, 168, 0.3);
  border-radius: 4px;
}

.friends-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(123, 140, 168, 0.5);
}

.friend-item-modal {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.friend-item-modal:hover {
  background: rgba(10, 14, 26, 0.8);
  border-color: rgba(74, 158, 255, 0.3);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-icon {
  font-size: 1.5rem;
  color: #7b8ca8;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-btn {
  padding: 0.5rem 1rem;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  color: #4ade80;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.recommend-btn:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
  transform: translateY(-1px);
}

.recommend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .song-content {
    grid-template-columns: 1fr;
  }

  .album-section {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }

  .album-art {
    width: 100%;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }

  .friends-scrollable {
    max-height: 300px;
  }

  .friend-item-modal {
    padding: 0.75rem;
  }
}
</style>
