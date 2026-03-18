# Feature Workflow (Flujo de Nueva Funcionalidad)

Este workflow detalla la orquestación paso a paso exclusiva para `features` de ciclo completo, extendiendo el protocolo SSDLC base.

## Fases y Subagentes

1. **Lectura y Clasificación (Orchestrator)**  
   - Analiza el requerimiento del usuario.  
   - Selecciona el tipo de trabajo: `feature`.  
   - Pide al usuario confirmación básica.

2. **Historia SMART y Diseño de Spec (Spec Writer & Security Reviewer)**  
   - El Spec Writer redacta la especificación funcional completa.  
   - El Security Reviewer interviene aportando la matriz STRIDE para la funcionalidad.  
   - *Hito*: Se comitea el archivo en `/docs/specs`.

3. **Gestión de Rama (Orchestrator)**  
   - `git checkout -b feature/nombre-corto` desde `develop`.

4. **Implementación Segura (Backend Builder & Frontend Builder)**  
   - El Backend se implementa PRIMERO (Contrato de API). El Backend Builder hace endpoints, schemas, y Unit Test.  
   - El Frontend Builder interviene DESPUÉS de un contrato sólido. Implementa los componentes, hooks, views.  
   - *Vibe Coding Rule*: Ambos deben estar limitados por el Anti-Hallucination Reviewer.

5. **Revisión y Anti-Alucinaciones (Code Reviewer + Anti-Hallucination Reviewer)**  
   - Auditoría estática: limpieza del código, `AGENTS.md` respetado.  
   - Auditoría de dependencias reales vs imaginadas.  

6. **Calidad y Verificación (QA Test Designer)**  
   - Ejecución del plan e2e y verificación 1 a 1 de los CAs marcados en la Fase 2.  
   - El reporte es anexado al PR.

7. **Pull Request y Merge (Orchestrator)**  
   - El Orchestrator fusiona contra `develop`.  

8. **Cierre Documental (Docs Keeper)**  
   - Generación del ADR si aplicó un cambio fuerte.  
   - Actualiza el modelo de datos (diagramas) o endpoints públicos en la documentación.

---

## Tolerancias
- Prohibido hacer merges funcionales sin el visto bueno de **QA** y **Anti-Hallucinations**.
- La rama no debe contener código mezclado temporal ni "TODOs" sin rastreo (Issue asignado).
