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
          <button
            @click="handleToggleFavorite"
            class="favorite-btn"
            :class="{ 'is-favorite': isFavorite }"
            :title="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
          >
            <span class="heart-icon">{{ isFavorite ? "♥" : "♡" }}</span>
            <span class="favorite-text">
              {{ isFavorite ? "Favorite" : "Favorite" }}
            </span>
          </button>
        </div>

        <div class="song-info">
          <h1 class="song-title">{{ songInfo.name || "Unknown Song" }}</h1>
          <p class="song-artist">
            {{ songInfo.artist || "Unknown Artist" }}
          </p>

          <div class="rating-section">
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
            <button
              v-if="hasReview"
              @click="handleDeleteReview"
              class="delete-review-btn"
            >
              Delete Review
            </button>
          </div>

          <div class="song-meta">
            <p v-if="songInfo.album">
              <span class="meta-label">Album:</span> {{ songInfo.album }}
            </p>
            <p v-if="songInfo.releaseDate">
              <span class="meta-label">Release Date:</span>
              {{ formatReleaseDate(songInfo.releaseDate) }}
            </p>
          </div>

          <div class="notes-section">
            <label class="notes-label">Notes</label>
            <textarea
              class="notes-textarea"
              placeholder="Add your notes here..."
              v-model="myNotes"
            ></textarea>
          </div>
          <div class="action-buttons">
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
              <span class="activity-text">{{ review.userId }}</span>
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
                <span class="comment-user">{{ comment.commenter }}:</span>
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
      </div>

      <transition name="toast">
        <div v-if="showToast" class="toast-notification">
          <span class="toast-icon">✓</span>
          <span class="toast-message">{{ toastMessage }}</span>
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
import { useRoute } from "vue-router";
import { playlist, review, musicDiscovery } from "../api/api.js";

export default {
  name: "Review",
  setup() {
    const route = useRoute();

    // State management
    const loading = ref(true);
    const loadingReviews = ref(false);
    const error = ref(null);
    const savingReview = ref(false);
    const reviewError = ref(null);
    const reviewsError = ref(null);
    const hoverRating = ref(0);
    const commentInputs = ref({});
    const showToast = ref(false);
    const toastMessage = ref("");
    const newlyAddedReviewId = ref(null);
    const reviewsSection = ref(null);
    const isFavorite = ref(false);
    const showDeleteModal = ref(false);
    const deleteModalType = ref(null); // 'review' or 'comment'
    const deleteModalData = ref(null);

    // TODO: FIX WHEN USER API IS IMPLEMENTED temporary user IDs
    const uri = computed(() => route.params.id);
    const userId = "user1";

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
    const otherReviews = computed(() => {
      if (!allReviews.value || !userId) return [];
      return allReviews.value;
    });

    const hasReview = computed(() => myReview.value !== null);

    const loadMyReview = async () => {
      try {
        // see if there is a review for this item and user
        const reviews = await review.getReviewByItemAndUser(
          itemId.value,
          userId
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

            const reviewId = r._id || r.review || r.id;

            if (!reviewId) {
              console.error("Review missing ID field:", r);
              return null;
            }

            // Load comments for each review
            let comments = [];
            try {
              const reviewComments = await review.getReviewComments(reviewId);
              if (reviewComments && reviewComments.error) {
                console.error(`Error loading comments:`, reviewComments.error);
              } else {
                comments = reviewComments || [];
              }
            } catch (err) {
              console.error(
                `Error loading comments for review ${reviewId}:`,
                err
              );
            }
            return {
              id: reviewId,
              userId: r.user || r.author,
              rating: r.rating,
              notes: r.notes || r.text,
              comments: comments,
            };
          })
        );
        // Filter out any null reviews (from errors)
        allReviews.value = allReviews.value.filter((r) => r !== null);
      } catch (err) {
        console.error("Error loading reviews:", err);
        reviewsError.value = err.message || "Failed to load reviews";
        allReviews.value = [];
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

        await loadFavoriteStatus();
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

    // Show toast notification
    const showToastNotification = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };

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
        if (hasReview.value) {
          // Get the review ID
          const reviewData = await review.getReviewByItemAndUser(
            itemId.value,
            userId
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
            userId,
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
        await loadReviews();
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
        await loadReviews();
      } catch (err) {
        reviewError.value = err.message || "Failed to delete review";
        console.error("Error deleting review:", err);
      } finally {
        savingReview.value = false;
      }
    };

    // Add comment to a review
    const handleAddComment = async (reviewId) => {
      const commentText = commentInputs.value[reviewId];
      if (!commentText || !commentText.trim()) return;

      try {
        // Add comment to review
        const result = await review.addComment(
          reviewId,
          userId,
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
              targetReview.comments = updatedComments || [];
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
              targetReview.comments = updatedComments || [];
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

    // reload favorite status when itemId changes
    watch(
      () => uri.value,
      async () => {
        if (uri.value) {
          await loadFavoriteStatus();
        }
      }
    );

    const getFavoritesPlaylist = async () => {
      try {
        const playlists = await playlist.getUserPlaylists(userId);

        if (playlists && playlists.error) {
          console.error("Error getting playlists:", playlists.error);
          return null;
        }

        const favoritesPlaylist = (playlists || []).find(
          (p) => p.name === "Favorites"
        );

        return favoritesPlaylist?._id || null;
      } catch (err) {
        console.error("Error getting Favorites playlist:", err);
        return null;
      }
    };

    // toggle favorite status
    const handleToggleFavorite = async () => {
      try {
        const favoritesPlaylistId = await getFavoritesPlaylist();

        if (!favoritesPlaylistId) {
          reviewError.value = "Favorites playlist not found";
          return;
        }

        if (isFavorite.value) {
          // Remove item from Favorites playlist
          const result = await playlist.removePlaylistItem(
            favoritesPlaylistId,
            userId,
            itemId.value
          );

          if (result && result.error) {
            reviewError.value = result.error;
            return;
          }

          isFavorite.value = false;
        } else {
          // Add item to Favorites playlist
          const result = await playlist.addPlaylistItem(
            favoritesPlaylistId,
            userId,
            itemId.value
          );

          if (result && result.error) {
            reviewError.value = result.error;
            return;
          }

          isFavorite.value = true;
        }
      } catch (err) {
        reviewError.value = err.message || "Failed to update favorite status";
        console.error("Error toggling favorite:", err);
      }
    };

    // load favorite status
    const loadFavoriteStatus = async () => {
      try {
        const favoritesPlaylistId = await getFavoritesPlaylist();

        if (!favoritesPlaylistId) {
          isFavorite.value = false;
          return;
        }

        // Get all items in the Favorites playlist
        const items = await playlist.getPlaylistItems(userId, "Favorites");

        isFavorite.value = items.some((item) => item.item === itemId.value);
      } catch (err) {
        console.error("Error loading favorite status:", err);
        isFavorite.value = false;
      }
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

    return {
      itemId,
      userId,
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
      isFavorite,
      handleRatingChange,
      handleSaveReview,
      handleDeleteReview,
      handleToggleFavorite,
      formatReleaseDate,
      commentInputs,
      handleAddComment,
      handleDeleteComment,
      showDeleteModal,
      deleteModalType,
      confirmDelete,
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
  gap: 1rem;
  width: 200px;
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
}

.song-title {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.song-artist {
  font-size: 1.5rem;
  color: #7b8ca8;
  margin: 0;
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

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.favorite-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
  transform: translateY(-1px);
}

.favorite-btn.is-favorite {
  background: rgba(255, 107, 157, 0.1);
  border-color: rgba(255, 107, 157, 0.3);
  color: #ff6b9d;
}

.favorite-btn.is-favorite:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: #ff6b9d;
}

.heart-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.favorite-text {
  font-size: 0.9rem;
}

.rating-section {
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
  margin-left: 1rem;
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
  justify-content: flex-end;
}

.action-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.activity-rating {
  display: flex;
  gap: 0.25rem;
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
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
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
}
</style>
