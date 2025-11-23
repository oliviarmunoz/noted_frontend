<template>
  <div class="page">
    <main class="main-content">
      <section class="section">
        <h1 class="page-title">CONTACT</h1>
        <div class="content-card">
          <p class="card-text">
            Get in touch with us. We'd love to hear from you!
          </p>
        </div>
      </section>

      <section class="section">
        <div class="contact-container">
          <div class="contact-form-card">
            <h2 class="section-title">SEND US A MESSAGE</h2>
            <form class="contact-form">
              <div class="form-group">
                <label for="name" class="form-label">NAME</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  class="form-input"
                  placeholder="Your name"
                />
              </div>
              <div class="form-group">
                <label for="email" class="form-label">EMAIL</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="form-input"
                  placeholder="your.email@example.com"
                />
              </div>
              <div class="form-group">
                <label for="message" class="form-label">MESSAGE</label>
                <textarea
                  id="message"
                  name="message"
                  class="form-input form-textarea"
                  rows="6"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
          </div>

          <div class="contact-info-card">
            <h2 class="section-title">CONTACT INFO</h2>
            <div class="info-item">
              <h3 class="info-label">EMAIL</h3>
              <p class="info-text">contact@noted.app</p>
            </div>
            <div class="info-item">
              <h3 class="info-label">SUPPORT</h3>
              <p class="info-text">support@noted.app</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "Contact",
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
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 2rem 0;
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

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.contact-form-card,
.contact-info-card {
  padding: 3rem;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7b8ca8;
}

.form-input {
  padding: 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.form-input::placeholder {
  color: #4a5568;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.btn {
  padding: 1rem 2.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.3);
}

.info-item {
  margin-bottom: 2rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7b8ca8;
  margin: 0 0 0.5rem 0;
}

.info-text {
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 4rem 1rem;
  }

  .section {
    margin-bottom: 4rem;
  }

  .contact-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .contact-form-card,
  .contact-info-card {
    padding: 2rem 1.5rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
  }
}
</style>

