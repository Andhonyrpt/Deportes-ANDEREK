# Plan de QA Robustos - Ecommerce API

## 1. Estrategia de Pruebas (Pirámide de Pruebas)

### Pruebas Unitarias (80% Cobertura)
- **Objetivo**: Probar la lógica de los controladores, modelos y middlewares en total aislamiento (utilizando mocks pesados de Mongoose y dependencias externas).
- **Alcance**: Todos los controladores en `src/controllers/` y middlewares en `src/middlewares/`.

### Pruebas de Integración (API Tests)
- **Objetivo**: Validar el flujo real entre Rutas -> Middlewares -> Controladores -> Base de Datos.
- **Alcance**: Escenarios "Happy Path" y flujos críticos (Checkout, Registro, Gestión de Carrito).
- **Herramientas**: Supertest + Test Database (.env.test).

### Pruebas de Seguridad y Resiliencia
- **Objetivo**: Verificar Rate Limiting, RBAC (Role-Based Access Control) y validación de esquemas (express-validator).
- **Alcance**: Intentos de acceso no autorizado, inyección de datos malformados.

---

## 2. Matriz de Pruebas (Muestra de Endpoints Críticos)

| Endpoint | Tipo | Escenario | Resultado Esperado |
| :--- | :---: | :--- | :--- |
| `POST /auth/register` | Unit | Datos válidos | 201 + User (sin password) |
| `POST /auth/register` | Unit | Email duplicado | 400 + Mensaje de error |
| `POST /auth/login` | Integración | Credenciales correctas | 200 + Token + Refresh |
| `POST /auth/login` | Integración | Usuario bloqueado/inactivo | 403 Forbidden |
| `POST /cart/add` | Unit | Stock insuficiente | 400 + Error de stock |
| `POST /orders` | Integración | Transacción atómica (DB fallback) | 201 + Orden creada o 500 (rollback) |
| `GET /admin/*` | Seguridad | Acceso con rol 'customer' | 403 Access Denied |

---

## 3. Plan de Ejecución y Monitoreo

### Fase 1: Estandarización
- [ ] Implementar un `Global Teardown` para limpiar la base de datos de pruebas.
- [ ] Crear fábricas de datos (factories) para generar usuarios y productos de prueba fácilmente.

### Fase 2: Cobertura Core
- [ ] Pruebas unitarias para todos los validadores en `src/middlewares/validators.js`.
- [ ] Pruebas unitarias aislando dependencias (mocks) para los 10 controladores sin cobertura actual (Users, Cart, Categories, Reviews, etc.).
- [ ] Pruebas de integración para el flujo de Checkout y actualización de stock.

### Fase 3: CI/CD
- [ ] Integración con GitHub Actions para ejecutar la suite completa en cada PR.
- [ ] Generación automática de reportes de cobertura (LCOV).

---

## 4. Deficiencias Detectadas (Huecos)
1.  **Validaciones Huérfanas**: Muchos validadores de `express-validator` no tienen pruebas unitarias específicas, confiando solo en pruebas de integración.
2.  **Manejo de Errores DB**: No hay pruebas que simulen caídas de base de datos para verificar que el middleware de error global responda correctamente.
3.  **Persistencia del Carrito**: Falta probar la lógica de `merge` de carritos (Guest -> Customer) si se llegara a implementar en el futuro.
4.  **JWT Expiry**: No hay pruebas automatizadas que validen el comportamiento exacto cuando un token expira durante una sesión activa.
