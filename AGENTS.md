# AGENTS.md - Repository Overview and Guidelines

This file serves as the definitive, mandatory reference for any agentic coding agents operating within the `Deportes-ANDEREK` repository. Adherence to these rules ensures architectural consistency, project quality, and efficient collaboration across the API and frontend services.

---

## 1. Project Overview & Architecture
The repository consists of two main projects:
- `ecommerce-api/`: Express.js backend using MongoDB (Mongoose).
- `ecommerce-app/`: React-based frontend using Context API and `http.js` (axios) for API communication.

---

## 2. Development Commands
For tasks requiring build, lint, or test operations, always navigate to the appropriate subdirectory (`ecommerce-api/` or `ecommerce-app/`) before executing these commands.

### `ecommerce-api`
- **Lint**: `npm run lint`
- **Run Tests**: `npm run test`
- **Run Single Test**: `npx vitest run <test-file-or-pattern>`
- **Coverage**: `npm run test:coverage`

### `ecommerce-app`
- **Lint**: `npm run lint`
- **Run Tests (Vitest/Cypress)**: `npm run test`
- **Open Cypress UI**: `npm run cypress:open`

---

## 3. Code Style Guidelines

### Imports & Formatting
- **Modules**: Always use ESM (`import` / `export`). **NEVER** use `require()` or `module.exports`.
- **Formatting**: Maintain 2-space indentation.
- **Trailing Commas**: No trailing commas in single-line objects; use them in multi-line objects for cleaner Git diffs.

### Types & Naming Conventions
- **Files/Variables/Functions**: Use `camelCase`.
- **React Components/Mongoose Models**: Use `PascalCase`.
- **Types**: While the project is JavaScript-based, leverage **JSDoc** to document expected types for complex functions, API controllers, and custom hooks.

### Error Handling
- **API Controllers**: Wrap all business logic in `try...catch` blocks. **NEVER** return a raw error; pass the error to the Express `next()` middleware for consistent error handling.
- **Client Side**: Always handle API response errors gracefully, displaying user-friendly messages using the `ErrorMessage` component (in `ecommerce-app`) or standard UI feedback via context states.

---

## 4. Architecture & Best Practices

### The Source of Truth
- **API**: The API is the definitive source of truth for all business data (orders, inventory, profiles).
- **Client State**: UI state management should be handled strictly via defined Contexts (`useAuth`, `useCart`).

### Architectural Rules
- **Configuration**: **DO NOT** hardcode configuration or keys. Use environment variables (`.env`).
- **Validation**: **DO NOT** bypass validation middlewares (`validate` in API routes).
- **Storage**: **DO NOT** modify `localStorage` directly in React. Use dedicated Context actions.
- **Business Logic**: **DO NOT** implement business logic in React components (use `services/`).
- **Express Routes**: **DO NOT** implement new business logic in Express routes (use `controllers/`).
- **API calls**: All API calls must be centralized in `services/`. Do not perform `fetch` calls directly in components.

---

## 5. Workflow Principles

### Authentication
- Always use `authMiddleware` for protected API routes.
- Always use `useAuth()` context in the frontend to check sessions.

### API Integration (Frontend)
- Use the provided `http` service (`import { http } from "../services/http";`) for all API requests. 
- Ensure authorization headers are handled by the `http` interceptors.

---

## 6. Directory Structure Reference

### `ecommerce-api/`
- `controllers/`: Request handlers.
- `routes/`: Express route definitions.
- `models/`: Mongoose schemas.
- `validators/`: Input validation logic (`express-validator`).

### `ecommerce-app/`
- `components/`: UI components (common, layout).
- `context/`: State management (Auth, Cart).
- `services/`: API communication (`http.js`).
- `hooks/`: Custom React hooks (`useFormReducer`).

---
*End of documentation. Refer to sub-directory AGENTS.md files for granular component/API documentation.*
