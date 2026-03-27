require('dotenv').config();
const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: process.env.REACT_APP_URL || "http://127.0.0.1:3000",
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        chromeWebSecurity: false,
        env: {
            apiUrl: (process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:4000/api").replace(/\/$/, ''),
        },
        setupNodeEvents(on, config) {
            on('before:browser:launch', (browser = {}, launchOptions) => {
                if (browser.family === 'chromium' && browser.name !== 'electron') {
                    launchOptions.args.push('--disable-web-security');
                    return launchOptions;
                }
            });
        },
    },
});
