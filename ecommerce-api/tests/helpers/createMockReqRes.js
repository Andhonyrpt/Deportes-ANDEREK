import { vi } from 'vitest';

/**
 * Crea objetos req / res / next falsos compatibles con Express.
 *
 * @param {object} options
 * @param {object} [options.body={}]    - req.body
 * @param {object} [options.params={}]  - req.params
 * @param {object} [options.query={}]   - req.query
 * @param {object} [options.user=null]  - req.user (cuando hay auth middleware)
 * @returns {{ req, res, next }}
 */
export function createMockReqRes({
    body = {},
    params = {},
    query = {},
    user = null,
} = {}) {
    const req = { body, params, query, user };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
    };

    const next = vi.fn();

    return { req, res, next };
}
