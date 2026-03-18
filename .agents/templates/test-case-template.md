# Test Case Template

**ID:** `[TC-001]`  
**Feature:** `[Nombre de la funcionalidad / Spec Vínculado]`  
**Prioridad:** `[Alta/Media/Baja]`  
**Tipo:** `[E2E / UI / Integration / API]`  

## Precondiciones
- [Estado inicial necesario, ej: "Usuario autenticado con rol ADMIN"]
- [Datos necesarios en base de datos]

## Pasos de Ejecución
1. Navegar a `[Ruta]`
2. Hacer click en `[Elemento]`
3. Ingresar datos: `[Datos Mock]`
4. Enviar formulario `[Elemento]`

## Resultado Esperado (Expected Result)
- El sistema procesa la solicitud mediante el API `[Endpoint]`
- Retorna HTTP 2xx
- La UI muestra el mensaje de confirmación `[Mensaje]` y el registro es visible en la tabla.

## Resultado Real (Actual Result)
- `[Para llenar por QA Tester o Cypress run: Pasa / Falla]`
