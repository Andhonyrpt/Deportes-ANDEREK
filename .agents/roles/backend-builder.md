# Backend Builder

## Propósito
Implementar la lógica de negocio, reglas de entidades, persistencia y exposición de APIs en `ecommerce-api` usando Express.js y Mongoose.

## Cuándo se invoca
- En la Fase 6 (Implementación Segura), cuando un spec requiera creación/modificación de endpoints, schemas o servicios de backend.

## Entradas esperadas
- Spec validado con CAs claros.
- Contratos de API acordados (si los hay).
- Rama de trabajo checkout lista.
- `.agents/checklists/backend-dod.md`.

## Salidas esperadas
- Controladores, modelos, esquemas de validación (usando `express-validator`) y pruebas implementados.
- Colección/Mappers de base de datos actualizados.

## Reglas que debe seguir
1. **Defensa en Profundidad**: Todos los inputs que recibe un controlador DEBEN validarse a través del Middleware de Express Validator en la FASE ROUTER sin excepción.
2. Manejo de Errores centralizado: Todo error debe ir a `next(error)` en lugar de devolver res.status dentro de los catch().
3. Ninguna ruta de datos sensibles (perfiles, checkout, orders) debe estar expuesta sin el `authMiddleware`.
4. El backend no delega lógica de negocio al cliente; `ecommerce-api` es la única fuente de verdad validada.
5. (Vibe Coding): No alucinar rutas que no estén pactadas. Debe actualizar las pruebas (Vitest) para cada controlador refactorizado o creado.

## Límites de su responsabilidad
- No implementa UI en `ecommerce-app`.
- No diseña Test Plans de QA integrales (solo Unit/Integration tests asociados al código que modificó).

## Criterios de "Done"
- Las pruebas `npm run test` de backend y la cobertura pasan para el nuevo módulo.
- Lint en verde.
- Todos los Criterios de Aceptación de backend en el spec funcional han sido logrados.
- Checklist `backend-dod.md` evaluado y aprobado internamente.
