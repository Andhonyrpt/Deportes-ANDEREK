# Propuesta de Mejoras Técnicas - Deportes-ANDEREK

Tras un análisis profundo del código base de la API y la App, se sugieren las siguientes mejoras para elevar la calidad, escalabilidad y mantenibilidad del proyecto.

## 1. Arquitectura y Flujo de Datos

### Integración Total del Checkout con la API
Actualmente, el checkout (`Checkout.jsx`) maneja direcciones y métodos de pago de forma híbrida (`localStorage` + API).
- **Acción**: Migrar la persistencia de direcciones y pagos exclusivamente a la base de datos a través de los servicios `shippingService` y `paymentService`.
- **Beneficio**: Consistencia de datos entre dispositivos y mayor seguridad.

### Centralización del Estado de UI
- **Acción**: Implementar un Contexto de Notificaciones/UI global para manejar Toasts y errores de red de forma unificada.
- **Beneficio**: Experiencia de usuario (UX) coherente y reducción de código repetitivo en componentes.

## 2. Backend (API)

### Estandarización de Rutas (RESTful)
- **Acción**: Renombrar rutas para que sigan el estándar de pluralización (ej. `/review` -> `/reviews`, `/new-address` -> `/addresses`).
- **Beneficio**: API más intuitiva y fácil de consumir por otros clientes.

### Manejo de Errores Global
- **Acción**: Refinar el middleware de errores para que devuelva códigos de error estandarizados y mensajes amigables.
- **Beneficio**: Debugging más rápido y mejor integración con el frontend.

## 3. Calidad y Testing

### Implementación de Testing Automatizado
Tras la Fase 11 de QA, la API cuenta con una cobertura robusta en sus controladores principales.
- **Unit Testing**: [x] Cubiertos: Auth, Cart, Orders, Reviews, Wishlist, Categories, Notifications, Shipping/Payment.
- **Integration Testing**: [x] Flujos críticos de seguridad (IDOR, Price Manipulation, Negative Costs) verificados.
- **E2E (Cypress)**: [ ] Pendiente: Implementar pruebas de humo completas en el frontend.

## 4. Backend (API) - Deuda Técnica

### Lógica de Stock en Middleware
Actualmente, el rollback de stock se maneja manualmente en `orderController.js`.
- **Acción**: Migrar la lógica de restauración y descuento de stock a Mongoose Middleware (`pre('save')` o `post('findOneAndUpdate')`).
- **Beneficio**: Garantiza atomicidad y reduce la complejidad de los controladores.

### Consistencia de Naming
Se han detectado discrepancias como `imageUrl` vs `imageURL`.
- **Acción**: Estandarizar todos los campos de imagen a `imageUrl` y asegurar que todos los modelos usen `timestamps: true`.

## 5. Frontend (App)

### Optimización de Rendimiento
- **Acción**: Implementar `React.lazy` para la carga de rutas y optimizar imágenes pesadas.
- **Beneficio**: Reducción del Bundle Size y mejores tiempos de carga (LCP).

### UX/UI Premium
- **Acción**: Integrar micro-animaciones (Framer Motion) y transiciones suaves entre páginas.
- **Beneficio**: Sensación de producto terminado y moderno.

---
*Senior QA & Documentation Report - Actualizado por Antigravity AI*
