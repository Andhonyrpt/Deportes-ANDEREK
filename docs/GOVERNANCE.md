# 🏛️ Gobernanza Documental y Vibe Coding (GOVERNANCE.md)

Este documento establece las políticas de administración, jerarquía, y reglas de uso del repositorio tanto para humanos como para Subagentes de Inteligencia Artificial ("Vibe Coding"). Todo documento y línea de código en **Deportes-ANDEREK** obedece a estas directrices.

---

## 1. PRECEDENCIA DOCUMENTAL (FUENTE DE VERDAD)

En caso de contradicción entre documentos o código, la precedencia es la siguiente (El N° 1 anula al N° 2, etc):

1. **Protocolos de Seguridad y Gobernanza**: `SSDLC.md` y `GOVERNANCE.md` (Inmutables salvo por consenso del Arquitecto Principal/Dueño).
2. **Arquitectura y Contratos**: `SUBAGENTS_ARCHITECTURE.md`, `PROJECT_SPEC.md` y los `ADRs` (Architecture Decision Records pendientes de crear).
3. **El Código de Producción (`develop` / `main`)**: Lo que realmente está ejecutándose.
4. **Especificaciones Individuales**: Los archivos `/docs/specs/*.md`. Su contexto es local a su respectiva rama/ticket, no afectan reglas globales.
5. **Base de Conocimiento**: Archivos en `/docs/skills/`.

*Cualquier contenido en `/docs/archive/` no tiene aplicabilidad operativa.*

---

## 2. REGLAS GENÉRICAS DE MANTENIMIENTO TÉCNICO

- **Prohibido el borrado destructivo**: Ningún archivo `.md` base debe ser eliminado para siempre. Si cae en obsolescencia, debe ser movido a `/docs/archive/` y su nombre pre-fijado (ej. `[OBSOLETO]-archivo.md`).
- **Nombres de Archivos**: Los archivos globales van en `MAYUSCULAS_SNAKE_CASE.md`. Los specs usan `YYYY-MM-DD-tipo-referencia.md`. Los roles y configuraciones internas usan `kebab-case.md`.
- **DDR (Docs Driven Refactoring)**: Cuando se actualice un comportamiento base del sistema, el **Docs Keeper** DEBE actualizar el `PROJECT_SPEC.md`, `USER_STORIES.md` o el archivo que corresponda.

---

## 3. PROTOCOLOS ESTRICTOS DE IA Y VIBE CODING

Para prevenir la degradación de la base de código y las "alucinaciones" al usar agentes de IA, se imponen las siguientes reglas inquebrantables:

### 3.1. Prohibido Inventar la Realidad (El Principio "Check-First")
- **No inventar archivos**: Un agente NO PUEDE importar un componente (`import { Button }`) si no ha verificado primero mediante lectura del file system (ej. `ls` o `find`) que el archivo de destino existe.
- **No inventar rutas/APIs**: El Frontend Builder NO PUEDE apuntar a un endpoint (ej. `GET /api/v1/fantasy`) si este no está explícitamente definido en `/docs/specs` y presente físicamente en los enrutadores de `ecommerce-api`.
- **No inventar dependencias**: Se prohíbe el uso de librerías exóticas. Si el agente requiere un `npm install`, debe pedir permiso explícito al Orchestrator/Usuario justificando por qué no se puede hacer con Vanilla JS/React u otras librerías ya presentes en `package.json`.

### 3.2. Prohibido Asumir Comportamientos (Spec-Driven)
- El agente **sólo asume lo que el Spec consiente**. Si un escenario "Sad Path" no está documentado en el Spec de origen, el agente no debe adivinar la solución; **debe preguntar** (al usuario humano o al Spec Writer) para refinar el documento.

### 3.3. Sin Evidencia no hay "Done" (Test-Driven Validation)
- Un agente no puede cerrar una rama o tarea afirmando que "arregló un bug" sin aportar el **diff de la ejecución de la prueba automatizada** de QA o Cypress que antes fallaba y ahora pasa, o en su defecto los pasos metodológicos explícitos.
- Todo PR generado por Vibe Coding debe pasar, forzosamente, por el checklist de revisión (rol de *Anti-Hallucination Reviewer* / *Code Reviewer*).

### 3.4. Separar Experimentos de la Rama Base
- Los experimentos de IA, scripts temporales generados al vuelo para probar un concepto, Mocks o scaffolding sucio **nunca deben fusionarse a `develop`**.
- La inserción de código definitivo no debe contener comentarios estilo `// TODO: IA will finish this`.

---

## 4. PROTOCOLO PARA AGREGAR NUEVA DOCUMENTACIÓN

1. **Nuevo Subagente**: Si el flujo requiere un nuevo tipo de trabajador AI, se debe crear su `.md` en `/.agents/roles/`, referenciar su intervención en `SUBAGENTS_ARCHITECTURE.md` e `INDEX.md`.
2. **Nuevos Templates/Workflows**: Se colocarán en `.agents/templates/` o `.agents/workflows/` y deben incluir un ejemplo práctico documentado de cómo lo invoca el Orchestrator.
3. **Nuevos Gaps / Technical Debt**: Todo error detectado o inconsistencia encontrada por un Agente NO DEBE ser arreglada silenciosamente si no era su tarea. Debe generarse un nuevo Spec (o añadirlo al `BACKLOG.md`) para futura atención.
