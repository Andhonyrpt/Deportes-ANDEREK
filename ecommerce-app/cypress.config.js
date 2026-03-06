const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://127.0.0.1:3000",
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        env: {
            apiUrl: "http://localhost:4000/api",
        },
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
