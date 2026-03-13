# Spec: Hardening de Tests de Integración (Orders & Auth)

## Metadata
- **Tipo:** testing
- **Complejidad:** M
- **Fecha:** 2026-03-12
- **Estado:** DRAFT

## Historia
Como ingeniero de QA/Seguridad, quiero tener tests de integración robustos que validen tanto la lógica financiera del checkout como la seguridad del proceso de autenticación, para prevenir regresiones y proteger los datos de los usuarios.

### SMART Goal (Orders - T-302)
- **S**: Implementar suite de tests para `POST /orders/preview`.
- **M**: 100% de los 12 escenarios definidos pasan.
- **A**: Usando la infraestructura actual de Vitest y Supertest.
- **R**: Valida integridad financiera y evita manipulación de precios.
- **T**: XS

### SMART Goal (Auth - T-304)
- **S**: Hardening de tests para `register` y `login`.
- **M**: Validación de password strength y claims de JWT verificados.
- **A**: Modificando `tests/integration/auth.test.js`.
- **R**: Mejora la postura de seguridad del API.
- **T**: S

## Criterios de Aceptación (T-302: Orders Preview)
- [ ] CA-1: Validación de `subtotal` exacto con múltiples productos.
- [ ] CA-2: Validación de `IVA` (16%) con redondeo correcto.
- [ ] CA-3: Cambio de `shippingCost` de $350 a $0 al pasar el umbral de $1000.
- [ ] CA-4: Rechazo (o normalización) de precios enviados por el cliente (Price Injection).
- [ ] CA-5: Manejo de productos sin stock (debe informar en el preview).
- [ ] CA-6: Respuesta 401/403 para usuarios no autenticados.

## Criterios de Aceptación (T-304: Auth Hardening)
- [ ] CA-7: Test de registro falla si la contraseña no cumple requisitos de complejidad.
- [ ] CA-8: Test de registro maneja correctamente correos y teléfonos duplicados (evita excepción no controlada).
- [ ] CA-9: Verificación de que el JWT retornado en login contiene `userId` y `role` correctos.
- [ ] CA-10: Verificación de que `hashPassword` NUNCA se devuelve en ninguna respuesta.

## Consideraciones de Seguridad
- No exponer secrets en los tests.
- Limpiar la DB entre tests para evitar polución de estados.

## Plan de Pruebas
1. Ejecutar `npm run test tests/integration/order_preview.test.js`.
2. Ejecutar `npm run test tests/integration/auth.test.js`.
