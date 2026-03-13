# Spec: Endpoint de Previsualización de Órdenes (Order Preview)

## Metadata
- **Tipo:** backend/feature
- **Complejidad:** M
- **Fecha:** 2026-03-12
- **Estado:** DONE

## Historia
Como cliente en el checkout, quiero ver el desglose exacto de mi orden (subtotal, impuestos, envío) calculado por el servidor antes de pagar, para evitar discrepancias con el frontend y asegurar que el total sea el correcto según las reglas de negocio.

- **S**: Implementar endpoint `POST /orders/preview` que reciba el carrito y devuelva el desglose financiero.
- **M**: El endpoint responde con el JSON correcto y los cálculos coinciden con la lógica de `orderController`.
- **A**: El backend ya tiene la lógica de cálculo en `createOrder`; se debe extraer a una función utilitaria.
- **R**: Resuelve la brecha de persistencia y la vulnerabilidad de manipulación de precios en el cliente.
- **T**: M

## Requerimientos Funcionales
- Debe recibir un array de productos con `productId`, `quantity` y `size`.
- Debe validar la existencia de los productos y el stock (opcionalmente para preview, pero recomendado).
- Debe calcular el `subtotal` usando precios actuales de la DB.
- Debe calcular `IVA` (16%) y `shippingCost` ($350 si < $1000, else $0).
- Debe devolver un objeto con: `subtotal`, `tax`, `shippingCost`, y `total`.

## Resultados (se completa al cerrar)
- Fecha de cierre: 2026-03-12
- CAs cumplidos:
  - [x] CA-1: Endpoint `POST /orders/preview` responde con 200 OK.
  - [x] CA-2: El cálculo de `total` es igual a `subtotal + tax + shippingCost`.
  - [x] CA-3: El endpoint es accesible para usuarios autenticados.
  - [x] CA-4: No persiste nada en la base de datos.
- Deuda técnica generada: Ninguna detectada.
- Lecciones aprendidas: La extracción de la lógica de cálculo a `orderHelper.js` facilita tanto el preview como la creación de la orden.
- Pendientes abiertos confirmados: Implementar tests de integración (T-302).
- Gaps no resueltos: Integración completa en el frontend (T-202/T-203).
- Trabajo fuera de alcance confirmado: Manejo de cupones de descuento.
- Backlog derivado creado: sí
- Referencias a historias/tareas creadas: T-302, T-203.
