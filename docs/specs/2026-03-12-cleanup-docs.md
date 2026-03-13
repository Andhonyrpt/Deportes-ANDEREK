# Spec: Limpieza Documental y Consolidación de Workspace

## Metadata
- **Tipo:** docs/hygiene
- **Complejidad:** S
- **Fecha:** 2026-03-12
- **Estado:** DRAFT

## Historia
Como Product Architect, quiero limpiar el espacio de trabajo de archivos basura y consolidar la documentación en una estructura jerárquica para reducir la carga cognitiva de los desarrolladores y asegurar que solo exista una fuente de verdad.

- **S**: Crear directorios `docs/archive` y `docs/testing`, mover archivos relevantes y eliminar archivos obsoletos.
- **M**: Los directorios existen, los archivos movidos están en su lugar y el README está actualizado.
- **A**: Tenemos permisos de escritura en el sistema de archivos.
- **R**: Es el primer paso crítico del plan de normalización aprobado por el usuario.
- **T**: S

## Criterios de Aceptación
- [ ] CA-1: Directorios `docs/archive` y `docs/testing` creados.
- [ ] CA-2: `QA_PLAN.md`, `QA_PROGRESS.md` y matrices consolidados en `docs/testing/`.
- [ ] CA-3: Archivos `.txt` y scripts huérfanos eliminados de la raíz de la API.
- [ ] CA-4: `README.md` actualizado con la nueva estructura.

## Consideraciones de Seguridad
- No se manejan secretos en estos archivos.
- La eliminación de logs de pruebas viejas reduce el ruido pero asegura que no queden datos de prueba sensibles (si los hubiera) en texto claro por mucho tiempo.

## Riesgos y Deuda Técnica
- Riesgo: Romper links internos entre documentos. Se mitigará revisando el `README.md`.
