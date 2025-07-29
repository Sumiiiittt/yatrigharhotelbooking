// playwright.config.js
export default {
  use: {
    headless: true, // Run tests in headless mode
    baseURL: 'http://localhost:3000', // Adjust if your app runs on a different port
    viewport: { width: 1280, height: 720 },
  },
  timeout: 30000, // Global test timeout in milliseconds
};
