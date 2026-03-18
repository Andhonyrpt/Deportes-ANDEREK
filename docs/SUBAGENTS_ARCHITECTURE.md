# Arquitectura de Subagentes: E-commerce MERN (SSDLC + Vibe Coding)

## 1. Resumen ejecutivo
Esta propuesta define una capa de orquestación de subagentes de IA diseñada para operar sobre el repositorio `Deportes-ANDEREK`, respetando estrictamente el flujo SSDLC existente. El objetivo es proporcionar un marco estructurado que elimine la improvisación de la IA (hallucinations), mejore la seguridad "by design", deje una memoria documental clara y sirva como un entorno educativo seguro para los alumnos que desarrollan mediante "Vibe Coding".

## 2. Arquitectura de subagentes propuesta
Se ha optado por implementar los siguientes subagentes mediante definiciones explícitas de rol:

1. **Orchestrator** (`orchestrator.md`): Coordina todo el flujo SSDLC. Es el único que asigna tareas a los demás.
2. **Spec Writer** (`spec-writer.md`): Toma requerimientos crudos y genera Historias SMART y Specs técnicos considerando STRIDE.
3. **Frontend Builder** (`frontend-builder.md`): Implementa componentes en React, usando estrictamente los contratos API existentes.
4. **Backend Builder** (`backend-builder.md`): Implementa controladores en Express, obligando la validación en capa de enrutamiento.
5. **QA Test Designer** (`qa-test-designer.md`): Verifica que el código cumpla los Criterios de Aceptación (CAs) bajo pruebas e2e y automatizadas.
6. **Code Reviewer** (`code-reviewer.md`): Revisa diffs y PRs, asegurando convenciones (`AGENTS.md`) y clean code.
7. **Security Reviewer** (`security-reviewer.md`): Revisa vulnerabilidades estáticas y mitigaciones del STRIDE.
8. **Docs Keeper** (`docs-keeper.md`): Preserva la memoria técnica (ADRs) al finalizar los flujos.
9. **Anti-Hallucination Reviewer** (`anti-hallucination-reviewer.md`): Especial de **Vibe Coding**. Garantiza de forma estricta que no se asuman librerías no instaladas, endpoints no creados o contratos no acordados.

*(Nota: Roles redundantes como `prompt-critic` fueron consolidados en el Orchestrator. `learning-coach` se integró como reglas pedagógicas transversales en el Docs Keeper y Orchestrator).*

## 3. Mapa de intervención por fases

| Fase SSDLC | Objetivo | Subagentes Involucrados | Entregable Mínimo | Riesgos si se omite |
|---|---|---|---|---|
| F0/1/2 | Lectura, STRIDE, SMART | Orchestrator, Spec Writer, Security Reviewer | Historia SMART, Riesgos STRIDE | Scope creep, fallos de seguridad graves |
| F3 | Spec Driven Design | Spec Writer | Archivo de Spec `.md` en `/docs/specs` | Desarrollo a ciegas |
| F4 | Gestión de Rama | Orchestrator | Rama aislada (`feature/xxx`) | Conflictos de git |
| F6 | Implementación | Frontend Builder, Backend Builder | Código + Pruebas Unitarias | Código frágil o sin pruebas |
| F7 | Verific. y Quality Gates | Code Reviewer, Security Reviewer, Anti-Hallucination Reviewer | Aprobación de Diff | Alucinaciones, bad smells, bugs de seguridad |
| F8 | Prueba Funcional | QA Test Designer | CAs validados (Checklist) | Funcionalidad rota enviada a main |
| F9 | Pull Request | Orchestrator | PR hacia develop | Interrupción del flujo base |
| F10 | Cierre de Spec | Docs Keeper, Orchestrator | Spec DONE, ADRs creados | Pérdida de memoria técnica |

## 4. Árbol de carpetas recomendado
Ya implementado en la raíz del proyecto:
```
.agents/
├── orchestrator.md
├── roles/
│   ├── spec-writer.md
│   ├── frontend-builder.md
│   ├── backend-builder.md
│   ├── qa-test-designer.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── docs-keeper.md
│   └── anti-hallucination-reviewer.md
├── workflows/
│   ├── feature-flow.md
│   └── bugfix-flow.md
├── templates/
│   ├── adr-template.md
│   ├── pr-template.md
│   └── test-case-template.md
└── checklists/
    ├── frontend-dod.md
    ├── backend-dod.md
    └── pr-checklist.md
```

## 5. Contenido completo de los archivos propuestos
*(Los archivos fueron generados y guardados físicamente en el repositorio bajo la carpeta `.agents/`, cumpliendo el formato exacto estipulado en el blueprint).*

## 6. Protocolos obligatorios
- **Regla 1-1-1-1**: Un pendiente = Un Spec = Una rama = Un PR. Prohibidas tareas anidadas o specs múltiples por commit.
- **Spec First**: Prohibido escribir código funcional (Fase 6) sin que el Spec (Fase 3) esté aprobado y comisionado.
- **Separación de Responsabilidades**: El Builder (Frontend/Backend) NO puede auto-aprobarse el PR. Debe pasar por Code Reviewer y QA.
- **Update on Change**: Si la arquitectura cambia en el PR por necesidad técnica, el Docs Keeper genera un ADR antes de hacer merge.
- **Cierre con Evidencias**: Ningún Spec se pasa a "DONE" sin el llenado de CAs superados y deuda técnica listada.

## 7. Reglas especiales para Vibe Coding
Dado el enfoque de uso intensivo de IA, todo agente debe:
- **No inventar**: Prohibido usar librerías de npm que no figuren en `package.json` sin previa solicitud explícita.
- **No asumir APIs**: Frontend Builder no asume rutas express no creadas. Si falta, la tarea regresa al Backend Builder.
- **Verificación contra el File System**: El Anti-Hallucination checker es ineludible. Validar rutas reales con `cat` o `find` visual antes de proponer imports como `../components/FalsoComponente`.
- **Reasoning**: Las IAs deben incluir un comentario visible en Pull Requests sobre su "cadena de pensamiento" al alterar estructuras core.

## 8. Enfoque pedagógico (Alumnos usando IA)
Para maximizar el aprendizaje:
- **Explicar Trade-offs**: Todo ADR debe incluir la sección "Impacto para el aprendizaje", indicando por qué se tomó una decisión sobre otra (ej: Context vs Redux).
- **Convertir errores en lecciones**: Los comentarios de Code Review del IA hacia el Alumno no deben dar "la solución copiada", sino indicar "El Middleware de express-validator no cubre este parámetro, revisa la documentación de Express".
- **Freno de mano**: El Orchestrator debe pedir aprobación explícita al usuario humano antes del merge, para forzarlo a leer el código generado.

## 9. Roadmap de adopción por etapas

**Etapa 1: MVP de Subagentes (Semanas 1-2)**
- *Roles*: Orchestrator, Frontend/Backend Builder, Spec Writer.
- *Por qué*: Establece el ritmo básico, asegurando que nada se programa sin spec.
- *Impacto*: Reducción inmediata de "código espagueti" y desorganización de ramas.

**Etapa 2: Capa Protectora y Alucinaciones (Semanas 3-4)**
- *Roles*: QA Test Designer, Anti-Hallucination Reviewer, Code Reviewer.
- *Por qué*: Al estabilizar la programación, limitamos el daño por código falso impuesto por la IA o el alumno.
- *Impacto*: Pruebas más sólidas, PRs más sanos, freno a imports rotos.

**Etapa 3: Capa Avanzada/Pedagógica y Cierre (Semanas 5+)**
- *Roles*: Security Reviewer, Docs Keeper.
- *Por qué*: Enseña al alumno procesos industriales reales (STRIDE, ADRs).
- *Impacto*: Memoria técnica de calidad, cumplimiento SSDLC pleno en la app.

## 10. Riesgos y recomendaciones finales
- **Riesgo:** Parálisis por sobre-análisis (exceso de burocracia para bugs triviales).
  - *Mitigación:* Se ha provisto el `bugfix-flow.md` paralelo, que es más rápido pero igual de seguro.
- **Riesgo:** Confusión de los agentes LLM por demasiados roles en contexto.
  - *Mitigación:* Se han separado en archivos `.md` únicos en `.agents/roles/`. Solo hay que invocar a leer el rol específico cuando sea su turno, ahorrando tokens de contexto.
