# Frontend Definition of Done (DoD)

Para que el trabajo de Frontend sea aceptado por el Orchestrator/Code Reviewer, el Builder debe asegurar:

- [ ] Linting (`npm run lint`) pasa sin advertencias ni errores.
- [ ] Todo nuevo componente visual tiene PropTypes o JSDoc tipando sus properties.
- [ ] No existen `console.log` sueltos. (Si ocupas depuración, usa logger unificado).
- [ ] La interfaz maneja explícitamente los estados de: Carga (`Loading`), Vacío (`Empty State`), y Error (`ErrorMessage`).
- [ ] Las dependencias añadidas (si las hay) están en `package.json` y fueron autorizadas (Anti-Hallucination check).
- [ ] La UI solicitada es responsiva (Mobile/Desktop check).
- [ ] Las peticiones API pasan estrictamente a través de `services/http.js`.
- [ ] Las variables de entorno agregadas se documentaron en un `.env.example`.
- [ ] Los Unit o Integration Tests pertinentes ejecutados con Vitest/RTL o Cypress pasan (`npm run test`).
