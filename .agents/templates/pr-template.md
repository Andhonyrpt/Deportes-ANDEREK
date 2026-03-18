# Pull Request Template

## Descripción
[Incluye un resumen breve de lo modificado en el PR].

**Ticket / Issue Relacionado:** `#xxx`  
**Spec Documentado:** `docs/specs/[YYYY-MM-DD]-[tipo]-[nombre].md`

## Tipo de Cambio
- [ ] Bugfix (Corrección sin impacto a funcionalidad existente)
- [ ] Feature (Añade funcionalidad manteniendo compatibilidad)
- [ ] Breaking Change (Modifica contratos existentes de manera incompatible)
- [ ] Docs (Cambios sólo de documentación)
- [ ] Refactor (Limpieza técnica)

## Anti-Hallucination Check (Obligatorio Vibe Coding)
- [ ] Confirmo que las librerías añadidas están instaladas en `package.json`.
- [ ] Confirmo que ningún endpoint consumido en el front es una suposición, y todos existen en el código real del backend.
- [ ] Confirmo que el esquema de base de datos coinciden con el modelo Mongoose de `ecommerce-api`.

## Pruebas Realizadas
- [ ] Unit Tests ejecutados localmente (`npm run test`)
- [ ] Pasos para probar manuales o ejecutados por QA en entorno Cypress.
- Detalles adicionales de la prueba visual: [Inserta foto / captura / comando aquí].

## Notas de Revisión
- Para el Code Reviewer: Por favor revisar en detalle la línea `X` por su complejidad arquitectónica.
