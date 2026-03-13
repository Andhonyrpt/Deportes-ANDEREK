# AGENTS.md - Repository Overview and Guidelines

This file serves as the definitive reference for agentic coding agents operating within the `Deportes-ANDEREK` repository.

## 1. Development Commands
For tasks requiring build, lint, or test operations, always navigate to the appropriate subdirectory (`ecommerce-api/` or `ecommerce-app/`) before running the following commands.

### `ecommerce-api`
- **Lint**: `npm run lint`
- **Run Tests**: `npm run test`
- **Run Single Test**: `npx vitest run <test-file-or-pattern>`
- **Coverage**: `npm run test:coverage`

### `ecommerce-app`
- **Lint**: `npm run lint` (if available, check `package.json`)
- **Run Tests (Cypress/Vitest)**: `npm run test` (check `package.json` for specific test suite commands)

## 2. Code Style Guidelines

### Imports & Formatting
- **Modules**: Always use ESM (`import` / `export`). **NEVER** use `require()` or `module.exports`.
- **Formatting**: Maintain consistent indentation (2 spaces). Ensure no trailing commas in single-line objects, but use them in multi-line objects for cleaner diffs.

### Types & Naming
- **Naming**: Use `camelCase` for variables, functions, and file names. Use `PascalCase` for React components and Mongoose Models.
- **Types**: While the project is JavaScript-based, leverage JSDoc to document expected types for complex functions, especially in the API controllers and React hooks.

### Error Handling
- **API Controllers**: Wrap all business logic in `try...catch` blocks. **NEVER** return a raw error; pass the error to the Express `next()` middleware for consistent error responses.
- **Client Side**: Always handle API response errors gracefully, displaying user-friendly messages using the `ErrorMessage` component (in `ecommerce-app`) or standard UI feedback.

## 3. Important Agentic Rules (Do's & Don'ts)

> [!IMPORTANT]
> - **DO NOT** hardcode configuration (API endpoints, keys). Use environment variables (`.env`).
> - **DO NOT** bypass validation middlewares (`validate` in API routes).
> - **DO NOT** modify `localStorage` directly in React (use defined Contexts: `useAuth`, `useCart`).
> - **DO NOT** implement business logic in React components (use `services/`).
> - **DO NOT** implement new business logic in Express routes (use `controllers/`).

## 4. Repository Structure

### `ecommerce-api/`
- `controllers/`: Request handlers and business logic.
- `routes/`: Express route definitions.
- `models/`: Mongoose schemas.
- `validators/`: Input validation logic (`express-validator`).

### `ecommerce-app/`
- `components/`: UI components (common, layout).
- `context/`: State management (Auth, Cart).
- `services/`: API communication (`http.js`).
- `hooks/`: Custom React hooks (`useFormReducer`).

## 5. Workflow Principles
- **Authentication**: Always use `authMiddleware` for protected API routes and `useAuth` context in the frontend.
- **API Integration**: Centralize all API calls in `services/`. Do not perform `fetch` calls directly in components.
- **State**: The API is the source of truth for all business data (orders, prices, user profile).

---
*End of documentation. Refer to specific `AGENTS.md` in subdirectories for granular API/component documentation.*
