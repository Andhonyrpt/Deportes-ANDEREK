import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // No globals: always import { describe, it, expect, vi } from 'vitest'
        globals: false,

        // Node environment (no DOM needed for an Express API)
        environment: 'node',

        // Test files pattern
        include: ['tests/**/*.test.js'],

        // Per-test timeout (ms)
        testTimeout: 10_000,

        // Coverage (optional: run with --coverage flag)
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.js'],
            exclude: ['src/config/**'],
        },
    },
});
