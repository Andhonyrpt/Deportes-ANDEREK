# 2. Spec del proyecto: Deportes-ANDEREK

## 2.1 Descripción general del sistema
Plataforma de e-commerce integral (MERN Stack) para la venta de artículos deportivos, con gestión de catálogo, carrito de compras, perfiles de usuario y un flujo de checkout completo.

## 2.2 Objetivo del producto
Proporcionar una experiencia de compra fluida y segura, garantizando la consistencia de datos entre dispositivos mediante una persistencia centralizada en el servidor.

## 2.3 Problema que resuelve
Elimina la fragmentación de la experiencia de usuario causada por el almacenamiento local (`localStorage`), permitiendo que carritos y datos de envío sean accesibles desde cualquier sesión autenticada.

## 2.4 Alcance realizado (Auditado y Normalizado)
- Autenticación completa con JWT.
- Gestión de catálogo y búsqueda.
- Carrito de compras 100% sincronizado con API (Fusión Guest-to-Customer activa).
- Checkout basado 100% en cálculos de servidor (`/orders/preview`).
- Backend robusto con validaciones y re-cálculo de precios.

## 2.5 Módulos del sistema

### Módulo: Carrito (Cart)
- **Propósito**: Gestión temporal de productos pre-compra.
- **Estado**: Normalizado. Sincronización asíncrona proactiva.
- **Arquitectura**: Delegación total al servidor para usuarios autenticados.

### Módulo: Checkout
- **Propósito**: Finalización de compra y generación de órdenes.
- **Estado**: Normalizado. Lógica financiera centralizada en el backend.
- **Endpoint Crítico**: `POST /orders/preview`.

## 2.6 Arquitectura técnica normalizada
- **Frontend**: React 18, State Management basado en Contextos sincronizados proactivamente con API.
- **Backend**: Node.js, Express, MongoDB (Fuente única de verdad).
- **Persistencia**: LocalStorage (Solo cache para Guests) -> MongoDB (Sesiones autenticadas).
