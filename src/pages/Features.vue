<template>
  <div class="page">
    <main class="main-content">
      <section class="section">
        <h1 class="page-title">FEATURES</h1>
        <div class="content-card">
          <p class="card-text">
            Discover all the powerful features that make Noted the perfect 
            tool for organizing your thoughts and ideas.
          </p>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">CORE FEATURES</h2>
        <div class="content-grid">
          <div class="feature-block">
            <h3 class="feature-title">FAST</h3>
            <p class="feature-text">Lightning quick performance</p>
          </div>
          <div class="feature-block accent">
            <h3 class="feature-title">BOLD</h3>
            <p class="feature-text">Beautiful typography</p>
          </div>
          <div class="feature-block">
            <h3 class="feature-title">COOL</h3>
            <p class="feature-text">Modern design</p>
          </div>
          <div class="feature-block">
            <h3 class="feature-title">SYNC</h3>
            <p class="feature-text">Sync across devices</p>
          </div>
          <div class="feature-block accent">
            <h3 class="feature-title">SEARCH</h3>
            <p class="feature-text">Powerful search capabilities</p>
          </div>
          <div class="feature-block">
            <h3 class="feature-title">SECURE</h3>
            <p class="feature-text">Your data is safe</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">COMING SOON</h2>
        <div class="content-card">
          <p class="card-text">
            We're constantly working on new features to improve your experience. 
            Stay tuned for updates!
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "Features",
};
</script>

<style scoped>
.page {
  width: 100%;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
  width: 100%;
}

.section {
  margin-bottom: 6rem;
}

.page-title {
  font-size: clamp(3rem, 8vw, 6rem);
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

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 3rem 0;
  text-align: center;
}

.content-card {
  padding: 4rem 3rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.card-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #7b8ca8;
  margin: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-block {
  padding: 3rem 2rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-block::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4a9eff, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-block:hover {
  transform: translateY(-4px);
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 10px 40px rgba(74, 158, 255, 0.1);
}

.feature-block:hover::before {
  opacity: 1;
}

.feature-block.accent {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.3);
}

.feature-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  line-height: 1;
}

.feature-text {
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 0.15em;
  text-transform: lowercase;
  color: #7b8ca8;
  margin: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 4rem 1rem;
  }

  .section {
    margin-bottom: 4rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-block {
    padding: 2rem 1.5rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
  }
}
</style>

