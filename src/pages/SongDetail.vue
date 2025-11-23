<template>
  <div class="page">
    <div class="song-detail-container">
      <button class="close-btn" @click="$router.back()">✕</button>

      <div class="song-content">
        <div class="album-art">
          <div class="album-number">22</div>
        </div>

        <div class="song-info">
          <h1 class="song-title">22</h1>
          <p class="song-artist">Taylor Swift</p>

          <div class="rating-section">
            <span class="rating-label">My Rating:</span>
            <div class="rating">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= rating }"
                @click="rating = i"
              >
                ★
              </span>
            </div>
          </div>

          <div class="song-meta">
            <p><span class="meta-label">Release Date:</span> 11/17/2025</p>
            <p><span class="meta-label">Album:</span> Red</p>
            <p><span class="meta-label">Genres:</span> Pop, Country</p>
          </div>

          <button class="spotify-btn">Play on Spotify</button>

          <div class="action-buttons">
            <button class="action-btn">
              <span class="action-icon">+</span>
              <span class="action-label">review</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">♥</span>
              <span class="action-label">favorite</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">▶</span>
              <span class="action-label">listen list</span>
            </button>
          </div>

          <div class="notes-section">
            <label class="notes-label">Notes</label>
            <textarea
              class="notes-textarea"
              placeholder="Add your notes here..."
              v-model="notes"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h2 class="activity-title">RECENT ACTIVITY</h2>
        <div class="activity-card">
          <div class="activity-header">
            <span class="activity-text">Angela reviewed 22 by Taylor Swift</span>
          </div>
          <div class="activity-song">
            <span class="play-icon">▶</span>
            <span class="activity-song-name">22</span>
            <span class="activity-artist">Taylor Swift</span>
          </div>
          <div class="activity-rating">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ filled: i <= 2 }"
            >
              ★
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SongDetail",
  data() {
    return {
      rating: 2,
      notes: "",
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

.song-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.1);
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

.album-art {
  width: 200px;
  height: 200px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.spotify-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.spotify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  padding: 1rem;
  color: #7b8ca8;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.action-btn:hover {
  border-color: #4a9eff;
  color: #4a9eff;
  background: rgba(74, 158, 255, 0.1);
}

.action-icon {
  font-size: 1.5rem;
}

.action-label {
  font-size: 0.85rem;
  text-transform: lowercase;
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

.recent-activity {
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

.activity-song {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.play-icon {
  color: #4a9eff;
  font-size: 1rem;
}

.activity-song-name {
  color: #ffffff;
  font-weight: 600;
}

.activity-artist {
  color: #7b8ca8;
}

.activity-rating {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .song-content {
    grid-template-columns: 1fr;
  }

  .album-art {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
}
</style>

