# QA E2E Test Plan & Progress Matrix

Este documento detalla el plan de pruebas End-to-End para el `ecommerce-app`, permitiendo rastrear el progreso de cada escenario y su estado de validación.

## Metodología
- **Herramienta**: Cypress
- **Entorno**: Local (Mocked API / Real Dev Server)
- **Criterio de Éxito**: 100% de los casos de prueba en verde.

---

### Matriz de Progreso E2E

| Caso de Prueba | Escenario | Estado | Notas |
| :--- | :--- | :--- | :--- |
| CP-01 | Registro Exitoso | ✅ PASSED | Validado con interceptación de API |
| CP-02 | Login Exitoso | ✅ PASSED | Redirección a home correcta |
| CP-03 | Login Fallido | ✅ PASSED | Mensaje de error visible |
| CP-04 | Flujo de Carrito | ✅ PASSED | Persistencia en localStorage |
| CP-05 | Checkout (Real API)| ✅ PASSED | Validación completa: Dirección -> Pago -> Orden |
| CP-06 | Ver Perfil | ✅ PASSED | Datos de usuario correctos |
| CP-07 | Historial de Pedidos| ✅ PASSED | Lista de pedidos y detalle |
| CP-08 | Búsqueda Catalogo | ✅ PASSED | Filtrado por texto funcional |
| CP-09 | Navegar Categorías| ✅ PASSED | Menú de categorías lateral |
| CP-10 | Menú Móvil | ✅ PASSED | Visible en viewport 375px |
| CP-11 | Sesión Expirada | ✅ PASSED | Redirección automática a /login |
| CP-12 | Búsqueda Vacía | ✅ PASSED | Manejo de "no resultados encontrados" |

---

## Detalle de Validación: Escenario 2 (Carrito de Compras)

### Casos Definidos
- [x] **Agregar al Carrito**: Validar que el botón de compra añade el item y abre el carrito.
- [x] **Modificar Cantidad**: Incrementar y decrementar items asegurando que el total se actualice.
- [x] **Eliminar Item**: Ver que el producto desaparece del listado y los totales bajan.
- [x] **Persistencia**: Recargar la página (`cy.reload`) y validar que los items se mantienen.

---

## Detalle de Validación: Escenario 3 (Checkout - 4 Fases)

### Casos Definidos
- [x] **Fase 1 (Dirección)**: Seleccionar dirección existente o crear una nueva.
- [x] **Fase 2 (Pago)**: Seleccionar tarjeta existente o agregar una nueva.
- [x] **Fase 3 (Revisión)**: Verificar cálculo de Subtotal, IVA (16%), Envío y Total Final.
- [x] **Fase 4 (Confirmación)**: Simular pago exitoso, redirección y verificación de vaciado de carrito.

---

## Detalle de Validación: Escenario 4 (Perfil de Usuario)

### Casos Definidos
- [ ] **Información Personal**: Validar que se muestranDisplayName y Email.
- [ ] **Direcciones**: Probar eliminación de direcciones guardadas.
- [ ] **Pedidos**: Listar el historial de compras y acceder al detalle de un pedido.

---

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
