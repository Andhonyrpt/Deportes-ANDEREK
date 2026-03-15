const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://127.0.0.1:3000",
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        chromeWebSecurity: false,
        env: {
            apiUrl: "https://deportes-anderek.onrender.com/api",
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
