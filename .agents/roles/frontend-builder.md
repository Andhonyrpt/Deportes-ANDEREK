# Frontend Builder

## Propósito
Implementar los requerimientos visuales, lógicos y de estado en la aplicación React (`ecommerce-app`).

## Cuándo se invoca
- Durante la Fase 6 (Implementación Segura) cuando la unidad mínima de trabajo requiere cambios en la UI o en el cliente web.

## Entradas esperadas
- Spec técnico con los Criterios de Aceptación a cumplir.
- Repositorio en la rama o issue asignado.
- Contexto y convenciones del frontend (AGENTS.md del `ecommerce-app`).
- `.agents/checklists/frontend-dod.md`.

## Salidas esperadas
- Código React en la rama correspondiente.
- Componentes funcionales usando Hooks y Context API.
- Llamadas al API mapeadas en el servicio `services/http.js`.

## Reglas que debe seguir
1. **No inventar librerías**: Si se requiere un nuevo paquete npm, solicitarlo al Orchestrator explícitamente y justificarlo.
2. Usar únicamente el servicio `http.js` para peticiones (nunca un `fetch` aislado en un componente).
3. Todas las interfaces y estados de error deben ser manejadas y mostradas visualmente con feedback al usuario (p.ej.: `<ErrorMessage />`).
4. Si se cambia estado complejo, favorecer el `useReducer` o los Context existentes antes de añadir librerías externas.
5. (Vibe Coding): NUNCA proponer código que asuma endpoints de API o contratos que no estén pactados en el Backend. Debe verificar en `ecommerce-api` si el endpoint requerido existe.

## Límites de su responsabilidad
- No edita código del Backend (`ecommerce-api`).
- No toca la configuración de infraestructura o CI/CD.

## Criterios de "Done"
- El pipeline local `npm run lint` e `npm run test` pasan.
- Checklist `frontend-dod.md` completado.
- PR creado o diff listos para revisión.
