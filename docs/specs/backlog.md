# 3. Backlog estructurado: Deportes-ANDEREK

## 3.1 Épica: Normalización de Persistencia
**Objetivo**: Eliminar la dependencia de localStorage para usuarios autenticados.

| ID | Tarea | Tipo | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| T-101 | Implementar `Cart Merge` (Invitado -> Usuario) al hacer login | Feature | **Crítico** | ✅ HECHO |
| T-102 | Desactivar persistencia en `localStorage` si `isAuth` es true | Refactor | **Alto** | ✅ HECHO |
| T-103 | Auditoría de `shippingService` para asegurar 100% de uso de API | Alineación | **Medio** | ✅ HECHO |

## 3.2 Épica: Refactor de Checkout (Production Ready)
**Objetivo**: Centralizar lógica financiera y mejorar mantenibilidad.

| ID | Tarea | Tipo | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| T-201 | Crear endpoint `POST /orders/preview` en Backend | Feature | **Crítico** | ✅ HECHO |
| T-202 | Eliminar cálculos de IVA/Envío de `Checkout.jsx` | Alineación | **Crítico** | ✅ HECHO |
| T-203 | Extraer `useCheckout` hook para manejar selección de Direcciones/Pagos | Refactor | **Medio** | Pendiente |
| T-204 | Implementar micro-animaciones en transiciones de fase de checkout | UX | **Bajo** | Pendiente |

## 3.3 Épica: Calidad y Continuidad
**Objetivo**: Asegurar que los cambios no rompan flujos existentes.

| ID | Tarea | Tipo | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| T-301 | Unificar `QA_PLAN` y `QA_PROGRESS` en un solo documento | Doc | **Medio** | ✅ HECHO |
| T-302 | Crear tests de integración para `orders/preview` | Testing | **Alto** | Pendiente |
| T-303 | Implementar pruebas de humo en Cypress para flujo completo | Testing | **Medio** | Pendiente |

## 3.4 Priorización sugerida
1.  **Bloque 1: Integridad de Precios**. Finalizado.
2.  **Bloque 2: Sincronización de Datos**. Finalizado.
3.  **Bloque 3: Mantenibilidad**. Próximos pasos recomendados.
