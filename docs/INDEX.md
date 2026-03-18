# 📚 Índice Maestro del Proyecto (Deportes-ANDEREK)

Bienvenidos al sistema documental unificado del proyecto Deportes-ANDEREK. Este archivo sirve como el punto central de entrada para comprender la arquitectura, procesos y estado actual del proyecto.

---

## 🏗️ 1. Arquitectura y Gobernanza

Los documentos en esta sección dictan CÓMO trabajamos y cuáles son las reglas inquebrantables del proyecto.

- 📜 [**GOVERNANCE.md**](./GOVERNANCE.md): Reglas de operación, fuentes de verdad, versionado documental y protocolos para Inteligencia Artificial (Vibe Coding).
- 🔐 [**SSDLC.md**](./SSDLC.md): Protocolo de Ciclo de Vida de Desarrollo Seguro. El estándar base para cualquier cambio de código.
- 🤖 [**SUBAGENTS_ARCHITECTURE.md**](./SUBAGENTS_ARCHITECTURE.md): Arquitectura de los subagentes AI que operan sobre el repositorio, sus roles y fronteras.

---

## 🎯 2. Definición del Producto

Aquí reside el "Qué" construimos y el estado actual de las prioridades.

- 📦 [**PROJECT_SPEC.md**](./PROJECT_SPEC.md): Especificación general del sistema, alcance normalizado y los módulos principales.
- 🧑‍💻 [**USER_STORIES.md**](./USER_STORIES.md): Historias de usuario activas y su estado de inclusión en el producto.
- 📋 [**BACKLOG.md**](./BACKLOG.md): Pendientes, épicas y tareas priorizadas que el equipo (o los subagentes) deben tomar en la siguiente iteración.

---

## 🔬 3. Especificaciones Funcionales (Specs)

Carpeta: `/docs/specs/`

Los "Specs" son los documentos de diseño detallado para cada rama de trabajo (Feature o Bugfix). Se adhieren a la convención de nombre `YYYY-MM-DD-tipo-nombre.md`. Son el punto de partida técnico requerido antes de cualquier línea de código.

- [Specs Activos e Históricos](./specs/)

---

## 🧪 4. Control de Calidad y Seguridad

Carpeta: `/docs/test-plans/`

Contiene las estrategias y los resultados de las pruebas sobre la aplicación MERN.

- 📐 [**STRATEGY.md**](./test-plans/STRATEGY.md): Visión general de testing, pirámide de calidad (Backend/Frontend).
- 🛡️ [**SECURITY.md**](./test-plans/SECURITY.md): Matriz de pruebas de ciberseguridad, mitigaciones STRIDE y OWASP.
- 🚥 [**MATRIX.md**](./test-plans/MATRIX.md): Resumen de cobertura de pruebas unitarias y de integración por controlador.
- 🚀 [**PERFORMANCE.md**](./test-plans/PERFORMANCE.md): Resultados de pruebas de carga y métricas operativas de la API.

---

## 🛠️ 5. Sistema de Subagentes (Agentes de IA)

Carpeta: `/.agents/`

Toda la lógica para orquestar la capa de Agentes IA ("Vibe Coding").

- 👮 **Orchestrator**: [`.agents/orchestrator.md`](../.agents/orchestrator.md)
- 🎭 **Roles Reusables**: [`.agents/roles/`](../.agents/roles/) (Frontend Builder, QA, Security, etc).
- 🔄 **Workflows**: [`.agents/workflows/`](../.agents/workflows/) (Feature y Bugfix).
- 📋 **Checklists & Templates**: [`.agents/checklists/`](../.agents/checklists/) y [`.agents/templates/`](../.agents/templates/).

---

## 🎓 6. Base de Conocimiento (Skills)

Carpeta: `/docs/skills/`

Colección de decisiones técnicas transversales, patrones de diseño MERN, convenciones de Git y guías de mejores prácticas para los agentes de IA y los desarrolladores humanos.

- [Ver Guías Técnicas y Patrones](./skills/)

---

## 🗄️ 7. Archivo (Archive)

Carpeta: `/docs/archive/`

Documentos, propuestas o decisiones que ya no están vigentes pero se conservan por memoria histórica.

- [Ver Archivo Histórico](./archive/)

---

> 📝 **Nota sobre Actualizaciones**: Este índice debe mantenerse actualizado. Si se agrega una nueva categoría principal de documentación o cambia una convención, debe registrarse aquí *y* en GOVERNANCE.md.
