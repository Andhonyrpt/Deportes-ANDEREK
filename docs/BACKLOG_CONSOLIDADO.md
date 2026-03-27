# Deportes ANDEREK - Backlog Consolidado y Auditoría Maestro (18 Puntos de Verdad)

Este documento es el **Canon Oficial** del proyecto. Ha sido reconstruido y expandido para servir como la fuente de verdad definitiva sobre la integración, seguridad y arquitectura del sistema.

---

## I. Arquitectura y Gobernanza de Datos

### 1. El Servidor como Fuente Única de Verdad (SSOT)
Se ha validado que el backend (Express + MongoDB) es el único responsable de la integridad de los datos de negocio. El Frontend ya no realiza cálculos críticos de IVA, envío o descuentos, delegando esta lógica al endpoint `POST /orders/preview`.

### 2. Persistencia Híbrida Inteligente
La auditoría de `AuthContext.jsx` y `CartContext.jsx` confirma un modelo donde `localStorage` se reduce al mínimo necesario:
- **Session**: `authToken` y `refreshToken`.
- **Cache**: `userData` para renderizado instantáneo (validado post-inicio).
- **Volatilidad**: Datos de invitado (Guest) se eliminan proactivamente tras el merge exitoso en el backend.

---

## II. Integración de Módulos (Matriz de 18 Puntos)

### 3. Autenticación y Seguridad de Sesión (Cookie-Based)
- **Evidencia**: `AuthContext.jsx` ya no almacena tokens. `http.js` usa `withCredentials: true`. El backend envía cookies `HttpOnly`.
- **Estado**: 100% Integrado y Hardened. Protegido contra XSS.


### 4. Sincronización Proactiva del Carrito (Merge Logic)
- **Evidencia**: `CartContext.jsx:48-61` detecta items en `localStorage` al loguear y llama a `cartService.mergeCart()`.
- **Estado**: 100% Integrado. Resuelve el gap de carritos huérfanos.

### 5. Checkout "Server-Side" (Price Integrity)
- **Evidencia**: `Checkout.jsx` ya no multiplica `price * quantity`. Envía el carrito a `/api/orders/preview` y recibe el total final calculado por el backend.
- **Estado**: 100% Integrado. Protege contra manipulación de precios desde las DevTools.

### 6. Gestión de Direcciones de Envío (CRUD API)
- **Evidencia**: `shippingService.js` reemplaza totalmente al `storageHelpers.js` para usuarios autenticados.
- **Estado**: 100% Integrado. Soporta direcciones por defecto.

### 7. Gestión de Métodos de Pago (CRUD API)
- **Evidencia**: `paymentService.js` interactúa con el modelo Mongoose `PaymentMethod`. La UI de Checkout carga dinámicamente estas tarjetas.
- **Estado**: 100% Integrado.

### 8. Historial de Órdenes y Seguimiento
- **Evidencia**: `Orders.jsx` consume `GET /api/orders/user/:id`.
- **Estado**: 100% Integrado. Muestra estados dinámicos (Processing, Shipped, etc.).

### 9. Catálogo Dinámico con Paginación y Búsqueda
- **Evidencia**: `productService.js` usa search params para `GET /products/search`. El backend maneja el regex de búsqueda.
- **Estado**: 100% Integrado.

### 10. Taxonomía de Categorías (Nesting Level 2)
- **Evidencia**: `categoryService.js` permite filtrar por subcategorías, aprovechando el esquema `Category` -> `SubCategory`.
- **Estado**: 100% Integrado.

### 11. Sistema de Favoritos (Wishlist)
- **Evidencia**: `WishlistContext.jsx` sincroniza el estado global de favoritos con el backend.
- **Estado**: 100% Integrado.

### 12. Centro de Notificaciones y Alertas
- **Evidencia**: `notificationRoutes.js` documentado y funcional. El Header muestra el badge de mensajes no leídos.
- **Estado**: 100% Integrado.

### 13. Social Proof: Reseñas y Valoraciones
- **Evidencia**: `ProductReviews.jsx` carga datos de `reviewController.js`. Permite feedback real de usuarios logueados.
- **Estado**: 100% Integrado.

### 14. Admin Panel: Control de Usuarios (Privilegios)
- **Evidencia**: `UsersView.jsx` (Admin) permite elevar roles a `admin` o desactivar cuentas (`isActive`).
- **Estado**: 100% Integrado.

### 15. Admin Panel: Gestión de Inventario (Productos)
- **Evidencia**: `ProductsView.jsx` (Admin) centraliza el CRUD. Control de `countInStock` crítico para el negocio.
- **Estado**: 100% Integrado.

### 16. Admin Panel: Monitor de Órdenes Global
- **Evidencia**: `OrdersView.jsx` (Admin) permite al staff actualizar el `status` de una orden, disparando notificaciones al usuario.
- **Estado**: 100% Integrado.

### 17. Admin Panel: Estructura de Categorías
- **Evidencia**: `CategoriesView.jsx` permite manejar la navegación principal del sitio desde el dashboard.
- **Estado**: 100% Integrado.

### 18. Documentación Swagger (Auto-Generada)
- **Evidencia**: 13 archivos de rutas (`src/routes/*.js`) inyectados con JSDoc `@openapi`.
- **Estado**: 100% Cobertura Core. Accesible en `/api-docs`.

---

## III. Auditoría de Persistencia y Roadmap de Mejora

### 1. Inventario Actual de Claves
| Clave | Ubicación Responsable | Estado | Riesgo |
|-------|-----------------------|--------|--------|
| `anderek_userData` | `storageService.js` | Cache perfil (Ofuscado) | 🟢 Bajo (Sin Sensibilidad) |
| `anderek_cart` | `storageService.js` | Solo Guests | 🟢 Bajo (Volatilidad) |
| `authToken` | N/A (HttpOnly Cookie) | Servidor | ✅ Seguro (No accesible via JS) |
| `refreshToken`| N/A (HttpOnly Cookie) | Servidor | ✅ Seguro (No accesible via JS) |


### 2. Próximos Pasos (Hoja de Ruta de Persistencia)

#### A. Seguridad de Sesión (COMPLETADO)
- [x] Migración total de `authToken` y `refreshToken` a Cookies HttpOnly.
- [x] Implementación de `storageService.js` para unificar el acceso local.
- [x] Ofuscación/Codificación Base64 de `userData` en caché local.
- [x] Script de limpieza automática de "Zombie Keys" en `App.jsx`.


#### E. Modernización a IndexedDB
- **Mejora**: Evaluar el uso de `localForage` o `IndexedDB` nativo para futuros módulos de "Offline Browsing" o cache de catálogo pesado.

---
*Fin del documento consolidado. Actualizado por Antigravity AI con Roadmap de Mejoras de Persistencia el 2026-03-25.*
