<template>
  <div class="page">
    <div class="profile-layout">
      <!-- Main Profile Content -->
      <main class="profile-main">
        <div class="profile-header">
          <div class="avatar">👤</div>
          <div class="profile-info">
            <h1 class="profile-name">Angela Chen</h1>
            <p class="profile-username">@angelajc</p>
            <p class="profile-bio">Bio placeholder</p>
            <button class="request-btn">Request</button>
          </div>
        </div>

        <div class="recent-activity-section">
          <h2 class="section-title">RECENT ACTIVITY</h2>
          <div
            class="activity-card"
            v-for="activity in activities"
            :key="activity.id"
          >
            <div class="activity-header">
              <span class="activity-text"
                >{{ activity.user }} reviewed {{ activity.song }} by
                {{ activity.artist }}</span
              >
            </div>
            <div class="activity-song">
              <span class="play-icon">▶</span>
              <span class="activity-song-name">{{ activity.song }}</span>
              <span class="activity-artist">{{ activity.artist }}</span>
            </div>
            <div class="activity-rating">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= activity.rating }"
              >
                ★
              </span>
            </div>
            <p class="activity-comment">{{ activity.comment }}</p>
            <div class="comment-input">
              <span class="comment-icon">👤</span>
              <input
                type="text"
                placeholder="Leave a comment"
                class="comment-field"
              />
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="profile-sidebar">
        <div class="sidebar-section">
          <h2 class="sidebar-title">REQUESTS</h2>
          <div class="request-item">
            <div class="request-user">
              <span class="user-icon-small">👤</span>
              <span class="request-name">John Smith</span>
            </div>
            <button class="accept-btn">Accept</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">ANGELA'S FRIENDS</h2>
          <div
            class="friend-item"
            v-for="friend in friends"
            :key="friend.id"
          >
            <div class="friend-user">
              <span class="user-icon-small">👤</span>
              <span class="friend-name">{{ friend.name }}</span>
            </div>
            <button class="request-btn-small">Request</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">FAVORITE SONGS</h2>
          <ul class="favorite-list">
            <li class="favorite-item" v-for="i in 4" :key="i">
              <input type="checkbox" class="checkbox" />
              <div class="favorite-info">
                <div class="favorite-name">Song / Album Name</div>
                <div class="favorite-artist">Artist</div>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: "Profile",
  data() {
    return {
      activities: [
        {
          id: 1,
          user: "Angela",
          song: "22",
          artist: "Taylor Swift",
          rating: 5,
          comment: "I loved this song!",
        },
        {
          id: 2,
          user: "Angela",
          song: "22",
          artist: "Taylor Swift",
          rating: 4,
          comment: "Great track!",
        },
      ],
      friends: [
        { id: 1, name: "Lara Gomez" },
        { id: 2, name: "Olivia Munoz" },
        { id: 3, name: "Victor Rosales" },
      ],
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

.profile-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Profile Main */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-name {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
}

.profile-username {
  font-size: 1.1rem;
  color: #7b8ca8;
  margin: 0;
}

.profile-bio {
  font-size: 1rem;
  color: #7b8ca8;
  margin: 0.5rem 0 0 0;
}

.request-btn {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.request-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
}

.recent-activity-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
}

.activity-card {
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.activity-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(123, 140, 168, 0.1);
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
  margin-bottom: 1rem;
}

.star {
  color: #4a5568;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffd700;
}

.activity-comment {
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

/* Sidebar */
.profile-sidebar {
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

.request-item,
.friend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(123, 140, 168, 0.1);
}

.request-item:last-child,
.friend-item:last-child {
  border-bottom: none;
}

.request-user,
.friend-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-icon-small {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.request-name,
.friend-name {
  color: #ffffff;
  font-weight: 600;
}

.accept-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accept-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 158, 255, 0.3);
}

.request-btn-small {
  padding: 0.5rem 1.5rem;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  color: #4a9eff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.request-btn-small:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
}

.favorite-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.25rem;
  cursor: pointer;
}

.favorite-info {
  flex: 1;
}

.favorite-name {
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.favorite-artist {
  font-size: 0.85rem;
  color: #7b8ca8;
}

@media (max-width: 968px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    order: 2;
  }

  .profile-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .request-btn {
    align-self: center;
  }
}
</style>

