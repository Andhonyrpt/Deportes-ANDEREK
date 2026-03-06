# QA E2E Test Plan & Progress Matrix

Este documento detalla el plan de pruebas End-to-End para el `ecommerce-app`, permitiendo rastrear el progreso de cada escenario y su estado de validación.

## Metodología
- **Herramienta**: Cypress
- **Entorno**: Local (Mocked API / Real Dev Server)
- **Criterio de Éxito**: 100% de los casos de prueba en verde.

---

## Matriz de Escenarios

| Escenario                      | Casos de Prueba                                                                 | Estado        | Fecha         | Notas                                     |
| :----------------------------- | :------------------------------------------------------------------------------ | :------------ | :------------ | :---------------------------------------- |
| **1. Registro & Login**        | - Form visibility<br>- Validations (mismatch, short pass)<br>- Success Login/Reg | ✅ **Validado** | 2026-03-05    | Implementado con mocks de API.             |
| **2. Carrito de Compras**      | - Add/Remove items<br>- Quantity updates<br>- Persistencia (localStorage)       | 📅 Pendiente  | -             | Requiere `data-testid` en `CartView`.     |
| **3. Checkout (Flujo Completo)** | - Address selection<br>- Payment selection<br>- Order confirmation              | 📅 Pendiente  | -             | Escbozo inicial en `AGENTS.testing.md`. |
| **4. Perfil de Usuario**       | - Profile view<br>- Address management<br>- Order history                       | 📅 Pendiente  | -             |                                           |

---

## Detalle de Validación: Escenario 1 (Registro & Login)

### Casos Ejecutados
1.  **Registro**:
    - [x] Verificación de renderizado de campos obligatorios.
    - [x] Validación de contraseñas no coincidentes (UI Error).
    - [x] Registro exitoso con redirección a `/login`.
2.  **Login**:
    - [x] Verificación de renderizado de formulario.
    - [x] Manejo de error 401 (Credenciales inválidas).
    - [x] Login exitoso con carga de perfil y redirección a `/`.

### Archivos Relacionados
- **Tests**: `cypress/e2e/register.cy.js`, `cypress/e2e/login.cy.js`
- **Fixtures**: `cypress/fixtures/users.json`
- **Comandos**: `cy.loginByApi` (support/commands.js)

---

## Siguientes Pasos
---

## Solución de Problemas (Troubleshooting)

### Error: `cy.visit() failed ... AggregateError`
Este error ocurre cuando el servidor de desarrollo no está corriendo. Cypress requiere que la aplicación esté accesible en `http://localhost:3000`.

**Solución:**
1. Abre una terminal nueva en `ecommerce-app/`.
2. Ejecuta `npm start`.
3. Una vez que la aplicación esté lista ("Compiled successfully"), vuelve a la terminal de Cypress y ejecuta los tests.
