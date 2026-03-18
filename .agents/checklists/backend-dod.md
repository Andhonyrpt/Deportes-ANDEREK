# Backend Definition of Done (DoD)

Para que el trabajo de Backend sea aceptado:

- [ ] Linting (`npm run lint`) en estado limpio.
- [ ] Todos los inputs del nuevo endpoint pasan a través del validador de Express (`express-validator`).
- [ ] Códigos de respuesta HTTP semánticamente correctos (200, 201, 400, 401, 403, 404, 500).
- [ ] No se regresa información cruda de base de datos (Ej: `_id` directos o contraseñas en los Responses - Revisar Proyecciones Mongoose).
- [ ] Rutas sensibles están protegidas con `authMiddleware` (y role-based middleware si aplica).
- [ ] El manejo de errores está enrutado hacia `next(error)` en lugar de capturarse estáticamente con `res.status(500).json(...)`.
- [ ] `npm run test` pasa al 100%. Las pruebas cubren tanto un Happy Path como un Sad Path (Error input).
- [ ] La documentación del controlador con JSDoc fue actualizada (O Swagger).
- [ ] (Si aplica) Migración o actualización de Modelo DB está reflejada en los Seeder / Mocks para los Tests.
