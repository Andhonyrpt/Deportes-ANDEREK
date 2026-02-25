# AGENTS.testing.md — Guía de Tests con Vitest (ecommerce-api)

> Referencia rápida para escribir tests unitarios en este proyecto.  
> Stack: **Node.js ESM · Express 5 · Mongoose · bcrypt · jsonwebtoken · Vitest**

---

## 1. Instalación

```bash
npm install -D vitest @vitest/coverage-v8
```

Añade los scripts en `package.json`:

```jsonc
"scripts": {
  "test":          "vitest run",
  "test:watch":    "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## 2. `vitest.config.js`

```js
// vitest.config.js  (ya creado en la raíz del proyecto)
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,          // ← siempre importar explícitamente desde 'vitest'
        environment: 'node',
        include: ['tests/**/*.test.js'],
        testTimeout: 10_000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.js'],
            exclude: ['src/config/**'],
        },
    },
});
```

---

## 3. Importando desde `"vitest"` (sin globals)

`globals: false` es el valor por defecto y el recomendado. **Nunca** dependas de variables globales; impórtalas siempre:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

| Símbolo    | Uso                                          |
|------------|----------------------------------------------|
| `describe` | Agrupa tests relacionados                    |
| `it`       | Define un caso de prueba                     |
| `expect`   | Assertions                                   |
| `vi`       | Mocking, spies, fake timers                  |
| `beforeEach` / `afterEach` | Setup / teardown por test      |
| `vi.mock`  | Sustituye un módulo completo                 |
| `vi.fn()`  | Crea una función espía                       |

---

## 4. Helper `createMockReqRes`

Coloca este helper en `tests/helpers/createMockReqRes.js` y reutilízalo en todos los tests de controladores:

```js
// tests/helpers/createMockReqRes.js
import { vi } from 'vitest';

/**
 * Crea objetos req / res / next falsos compatibles con Express.
 *
 * @param {object} options
 * @param {object} [options.body={}]    - req.body
 * @param {object} [options.params={}]  - req.params
 * @param {object} [options.query={}]   - req.query
 * @param {object} [options.user=null]  - req.user (si hay auth middleware)
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
        status: vi.fn().mockReturnThis(), // permite encadenar .json()
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
    };

    const next = vi.fn();

    return { req, res, next };
}
```

### Uso básico

```js
const { req, res, next } = createMockReqRes({ body: { email: 'a@b.com' } });
await miControlador(req, res, next);
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
```

---

## 5. Cómo mockear un modelo Mongoose

El proyecto importa los modelos directamente:  
```js
import User from '../models/user.js';
```

**Patrón recomendado:** reemplaza el módulo completo con `vi.mock` antes de importar el controlador.

```js
import { vi } from 'vitest';

// 1. Declara el mock ANTES de cualquier import del controlador
vi.mock('../../src/models/user.js', () => ({
    default: {
        findOne: vi.fn(),
        // Simula el constructor + .save()
        // Se sobreescribe por test con vi.fn().mockImplementation(...)
    },
}));

// 2. Importa el controlador DESPUÉS del mock
import { register } from '../../src/controllers/authController.js';
import User from '../../src/models/user.js';
```

### Mockear `new Model()` + `.save()`

Los controladores usan `new User({...})` y luego `.save()`. Para cubrirlos:

```js
import { vi } from 'vitest';

vi.mock('../../src/models/user.js', () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);

    const MockUser = vi.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    });

    MockUser.findOne = vi.fn();

    return { default: MockUser };
});
```

---

## 6. Ejemplos completos de test

### 6.1 `register()`

```js
// tests/auth/register.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ---------- Mocks (deben declararse ANTES de los imports) ---------- */

const mockSave = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/models/user.js', () => {
    const MockUser = vi.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    });
    MockUser.findOne = vi.fn();
    return { default: MockUser };
});

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password_123'),
    },
}));

/* ---------- Imports reales ---------- */
import { register } from '../../src/controllers/authController.js';
import User from '../../src/models/user.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

/* ---------- Tests ---------- */
describe('register()', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('201 — crea usuario nuevo y devuelve displayName, email, phone', async () => {
        User.findOne.mockResolvedValue(null); // usuario no existe

        const { req, res, next } = createMockReqRes({
            body: {
                displayName: 'Ana',
                email: 'ana@test.com',
                password: 'Secret123!',
                phone: '1234567890',
            },
        });

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            displayName: 'Ana',
            email: 'ana@test.com',
            phone: '1234567890',
        });
        expect(mockSave).toHaveBeenCalledOnce();
        expect(next).not.toHaveBeenCalled();
    });

    it('400 — rechaza email ya existente', async () => {
        User.findOne.mockResolvedValue({ email: 'ana@test.com' }); // ya existe

        const { req, res, next } = createMockReqRes({
            body: {
                displayName: 'Ana',
                email: 'ana@test.com',
                password: 'Secret123!',
                phone: '1234567890',
            },
        });

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exist' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('llama a next(err) si Mongoose lanza una excepción', async () => {
        User.findOne.mockRejectedValue(new Error('DB connection error'));

        const { req, res, next } = createMockReqRes({
            body: { displayName: 'X', email: 'x@x.com', password: 'p', phone: '0000000000' },
        });

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).not.toHaveBeenCalled();
    });
});
```

---

### 6.2 `login()`

```js
// tests/auth/login.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ---------- Mocks ---------- */

vi.mock('../../src/models/user.js', () => ({
    default: { findOne: vi.fn() },
}));

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
    },
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn().mockReturnValue('mocked_jwt_token'),
    },
}));

/* ---------- Imports reales ---------- */
import { login } from '../../src/controllers/authController.js';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

const FAKE_USER = {
    _id: 'userId123',
    displayName: 'Ana',
    email: 'ana@test.com',
    hashPassword: 'hashed_password_123',
    role: 'guest',
};

/* ---------- Tests ---------- */
describe('login()', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Variables de entorno necesarias para jwt.sign
        process.env.JWT_SECRET = 'test_secret';
        process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    });

    it('200 — devuelve token y refreshToken con credenciales válidas', async () => {
        User.findOne.mockResolvedValue(FAKE_USER);
        bcrypt.compare.mockResolvedValue(true);

        const { req, res, next } = createMockReqRes({
            body: { email: 'ana@test.com', password: 'Secret123!' },
        });

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            token: expect.any(String),
            refreshToken: expect.any(String),
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('400 — usuario no encontrado', async () => {
        User.findOne.mockResolvedValue(null);

        const { req, res, next } = createMockReqRes({
            body: { email: 'noexiste@test.com', password: 'pass' },
        });

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining("doesn't exist") })
        );
    });

    it('400 — contraseña incorrecta', async () => {
        User.findOne.mockResolvedValue(FAKE_USER);
        bcrypt.compare.mockResolvedValue(false); // contraseña no coincide

        const { req, res, next } = createMockReqRes({
            body: { email: 'ana@test.com', password: 'WrongPass!' },
        });

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('llama a next(err) si ocurre un error inesperado', async () => {
        User.findOne.mockRejectedValue(new Error('timeout'));

        const { req, res, next } = createMockReqRes({
            body: { email: 'a@b.com', password: 'p' },
        });

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
```

---

## 7. Checklist de casos obligatorios por endpoint

Marca cada caso antes de hacer merge.

### `POST /auth/register`
- [ ] `201` usuario creado con datos correctos  
- [ ] `400` email ya registrado  
- [ ] `next(err)` ante error de base de datos  
- [ ] El campo `hashPassword` **no** se devuelve al cliente  
- [ ] El `role` por defecto es `'guest'`

### `POST /auth/login`
- [ ] `200` con `token` y `refreshToken`  
- [ ] `400` usuario inexistente  
- [ ] `400` contraseña incorrecta  
- [ ] `next(err)` ante error de base de datos  
- [ ] Los tokens contienen `userId`, `displayName`, `role` en el payload

### `GET /auth/check-email?email=`
- [ ] `{ taken: true }` si el email existe  
- [ ] `{ taken: false }` si el email está libre  
- [ ] Maneja email vacío / malformado sin lanzar excepción

### `POST /auth/refresh-token`
- [ ] `200` con nuevo `token` si el refresh es válido  
- [ ] `401` si no se envía `refreshToken`  
- [ ] `403` si el token está expirado o es inválido

### Controladores de recursos (productos, órdenes, carrito, etc.)
Para cada endpoint (`GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`):
- [ ] Responde `200`/`201` con datos correctos  
- [ ] `404` si el recurso no existe  
- [ ] `403`/`401` si el middleware de autenticación rechaza  
- [ ] `next(err)` ante fallo de Mongoose

---

## 8. Estructura recomendada de `tests/`

```
tests/
├── helpers/
│   └── createMockReqRes.js
├── auth/
│   ├── register.test.js
│   └── login.test.js
├── products/
│   └── productController.test.js
├── orders/
│   └── orderController.test.js
└── ...
```

---

## 9. Tips de debugging

```js
// Ver todos los argumentos con los que se llamó un mock
console.log(res.json.mock.calls);

// Restaurar todos los mocks entre archivos
vi.restoreAllMocks(); // úsalo en afterEach si usas vi.spyOn

// Espiar una función real sin reemplazarla
import * as bcrypt from 'bcrypt';
vi.spyOn(bcrypt, 'hash').mockResolvedValue('fake_hash');
```

---

> **Nota:** Este proyecto usa `"type": "module"` en `package.json`, por lo que todos los `import`/`export` son ESM nativos y Vitest los resuelve correctamente sin necesidad de Babel ni `transform`.
