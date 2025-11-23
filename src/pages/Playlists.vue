<template>
  <div class="page">
    <div class="playlists-container">
      <h1 class="page-title">MY PLAYLISTS</h1>
      <div class="playlists-grid">
        <div class="playlist-card" v-for="i in 6" :key="i">
          <div class="playlist-art">
            <span class="playlist-icon">🎵</span>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">Playlist Name</h3>
            <p class="playlist-count">{{ i * 5 }} songs</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Playlists",
};
</script>

<style scoped>
.page {
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.playlists-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 3rem 0;
  text-align: center;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.playlist-card {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 10px 40px rgba(74, 158, 255, 0.1);
}

.playlist-art {
  width: 100%;
  aspect-ratio: 1;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.playlist-icon {
  font-size: 3rem;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playlist-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.playlist-count {
  font-size: 0.9rem;
  color: #7b8ca8;
  margin: 0;
}

@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }
}
</style>

