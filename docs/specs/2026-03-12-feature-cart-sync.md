# Spec: Sincronización de Carrito y Fusión Guest-to-Customer

## Metadata
- **Tipo:** backend+frontend/refactor
- **Complejidad:** M
- **Fecha:** 2026-03-12
- **Estado:** DRAFT

## Historia
Como cliente, quiero que los productos que elegí mientras navegaba sin cuenta se mantengan en mi carrito después de iniciar sesión, para no tener que buscarlos de nuevo.

- **S**: Crear endpoint de merge y lógica de disparo en el frontend.
- **M**: Al loguearse, los items previos se integran con el carrito de la cuenta.
- **A**: El backend ya tiene lógica de `addProductToCart` que puede reutilizarse en un loop o bulk.
- **R**: Mejora directamente la conversión (evita abandono de carrito al loguearse).
- **T**: M-L (debido a la coordinación FE/BE).

## Criterios de Aceptación
- [ ] CA-1: Endpoint `POST /cart/merge` acepta un array de items y los fusiona sin duplicados.
- [ ] CA-2: `CartContext` detecta cambio de `isAuth: false -> true` y envía los items de `localStorage`.
- [ ] CA-3: El carrito del servidor es la fuente de verdad única post-login.

## Riesgos
- Race condition: `initializeCart` disparándose antes de que el merge termine. Se mitigará usando `await`.
