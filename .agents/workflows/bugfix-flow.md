# Bugfix Workflow (Flujo de Corrección de Errores)

Este workflow detalla la orquestación para corregir errores existentes sin introducir nuevo comportamiento no planificado.

## Fases y Subagentes

1. **Lectura y Clasificación (Orchestrator)**  
   - Analiza el reporte del bug.
   - Etiqueta como `bugfix`.

2. **Historia SMART y Diseño de Spec (Spec Writer & QA Test Designer)**  
   - El Spec Writer describe la situación actual (Current Behavior) y la situación esperada (Expected Behavior).  
   - El QA Test Designer provee los pasos para reproducir (Steps to Reproduce) en el Spec, que valdrán como criterio de pase/fallo.

3. **Gestión de Rama (Orchestrator)**  
   - `git checkout -b bugfix/nombre-del-bug` desde `develop`.

4. **Implementación Segura (Frontend/Backend Builder)**  
   - El Builder apropiado identifica la raíz del problema mediante debugging.
   - *Regla*: Todo Bugfix **requiere** un test unitario/integración automatizado (si aplica) que replique la falla antes de arreglarse (Test-Driven Bugfixing).

5. **Revisión (Code Reviewer)**  
   - Audita que la corrección no introduzca regresiones.

6. **Calidad y Verificación (QA Test Designer)**  
   - Confirma que el Test Case que antes fallaba ahora pasa.

7. **Pull Request y Merge (Orchestrator)**  
   - Fusión a `develop`.

## Tolerancias
- Prohibido hacer un bugfix que aproveche la rama para meter un "refactor de paso" (mezclar concerns). Solo se toca el código necesario para arreglar el bug.
