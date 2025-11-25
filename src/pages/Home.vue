<template>
  <div class="page">
    <div class="home-layout">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h2 class="sidebar-title">LISTEN LATER</h2>
          <ul class="song-list">
            <li
              class="song-item"
              v-for="i in 4"
              :key="i"
              @click="$router.push(`/song/${i}`)"
              style="cursor: pointer"
            >
              <input type="checkbox" class="checkbox" @click.stop />
              <div class="song-info">
                <div class="song-name">Song / Album Name</div>
                <div class="song-artist">Artist</div>
              </div>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">FAVORITES</h2>
          <ul class="song-list">
            <li
              class="song-item"
              v-for="i in 4"
              :key="i"
              @click="$router.push(`/song/${i + 10}`)"
              style="cursor: pointer"
            >
              <input type="checkbox" class="checkbox" @click.stop />
              <div class="song-info">
                <div class="song-name">Song / Album Name</div>
                <div class="song-artist">Artist</div>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Main Feed -->
      <main class="feed">
        <div v-if="loading" class="loading">Loading feed...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="reviews.length === 0" class="no-reviews">
          No reviews from friends yet. Start following people to see their
          reviews!
        </div>
        <template v-else>
          <div class="review-card" v-for="review in reviews" :key="review.id">
            <div class="review-header">
              <div class="user-icon">👤</div>
              <div class="review-meta">
                <span class="reviewer-name"
                  >{{ review.reviewer }} reviewed</span
                >
              </div>
            </div>
            <div
              class="song-details"
              @click="$router.push(`/song/${review.songId}`)"
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
        </template>
      </main>
    </div>
  </div>
</template>

<script>
import { friending, review, musicDiscovery, auth } from "../api/api.js";

export default {
  name: "Home",
  data() {
    return {
      reviews: [],
      loading: true,
      error: null,
    };
  },
  async mounted() {
    await this.loadFeed();
  },
  methods: {
    async loadFeed() {
      this.loading = true;
      this.error = null;

      try {
        // TODO: Replace with actual current user later
        const currentUser = "user1";

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
            for (const reviewData of userReviews) {
              try {
                const target = reviewData.target;
                let entityInfo = null;

                // Try to get entity details from the target
                if (target) {
                  try {
                    // Try as external ID first
                    const entityResponse = await musicDiscovery.getEntityFromId(
                      target
                    );
                    if (
                      entityResponse &&
                      !entityResponse.error &&
                      entityResponse.length > 0
                    ) {
                      entityInfo = entityResponse[0];
                    }
                  } catch (e) {
                    // If that fails, try as URI
                    try {
                      const entityResponse =
                        await musicDiscovery.getEntityFromUri(target);
                      if (
                        entityResponse &&
                        !entityResponse.error &&
                        entityResponse.length > 0
                      ) {
                        entityInfo = entityResponse[0];
                      }
                    } catch (e2) {
                      console.warn(
                        `Could not get entity info for target ${target}:`,
                        e2
                      );
                    }
                  }
                }

                // Get reviewer username
                let reviewerName = friendId;
                try {
                  const usernameResponse = await auth.getUsername(friendId);
                  if (usernameResponse && !usernameResponse.error) {
                    reviewerName = usernameResponse.username || friendId;
                  }
                } catch (e) {
                  console.warn(
                    `Could not get username for user ${friendId}:`,
                    e
                  );
                }

                allReviews.push({
                  id: reviewData.review,
                  reviewer: reviewerName,
                  song: entityInfo?.name || "Unknown Song",
                  artist:
                    entityInfo?.artistName ||
                    entityInfo?.artist ||
                    "Unknown Artist",
                  rating: reviewData.rating || 0,
                  comment: reviewData.text || reviewData.notes || "",
                  songId: target,
                  target: target,
                  entityInfo: entityInfo,
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
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.song-item:hover {
  background-color: rgba(74, 158, 255, 0.1);
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.25rem;
  cursor: pointer;
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
