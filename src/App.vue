<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">
          <span class="caps">NOTED</span>
        </router-link>
        <div class="nav-search">
          <input
            type="text"
            placeholder="Search song, album, people"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="nav-actions">
          <button class="icon-btn">
            <span class="icon">+</span>
          </button>
          <!-- TODO: Add profile page -->
          <router-link to="/profile" class="icon-btn">
            <span class="icon">👤</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
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
