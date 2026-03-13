# Plan de Pruebas de Rendimiento y Estrés (API e-commerce)

## 1. Objetivos del Plan
Como QA Senior de Automation, el propósito de este plan es validar el comportamiento de la API del e-commerce bajo distintas cargas de usuarios concurrentes. 

**Criterios de Éxito (SLAs):**
- **Tiempo de respuesta máximo:** `< 1000ms (1 segundo)` para el 95% de las peticiones (P95).
- **Tasa de errores máxima permitida:** `< 1%`.
- Identificar el punto de quiebre (Breaking Point) en el ambiente de pruebas.
- Validar la recuperación del sistema tras un pico de carga.

## 2. Herramienta Seleccionada
Se recomienda utilizar **k6 (de Grafana)** debido a que:
1. Permite escribir pruebas en JavaScript moderno (ES6).
2. Es altamente eficiente en consumo de recursos frente a JMeter.
3. Se integra fácilmente en pipelines de CI/CD (GitHub Actions, GitLab, etc.).
4. Permite definir SLAs (umbres de falla) directamente en el código.

## 3. Ambientes de Prueba
Las pruebas deben ejecutarse bajo las mismas condiciones en los diferentes ambientes, escalando la carga según corresponda:

- **Desarrollo (DEV):** Validación temprana de los scripts de k6 a baja escala (Smoke Testing). Asegura que los endpoints responden a pruebas unitarias de carga.
- **Staging / QA:** Ambiente espejo de producción (idealmente con la misma o similar infraestructura). Aquí se realizan Pruebas de Carga (Load Testing) y Estrés (Stress Testing).
- **Producción (PROD):** Sólo pruebas en modo "Smoke" o pruebas de carga mínimas programadas en horas "valle" (baja afluencia). No se hacen pruebas de estrés.

## 4. Tipos de Pruebas a Ejecutar

### A. Smoke Test (Prueba de Humo)
- **Propósito:** Validar que el script de prueba de rendimiento funciona correctamente y que el ambiente está disponible.
- **Carga:** 1 a 5 usuarios concurrentes (VUs).
- **Duración:** 1 minuto.

### B. Load Test (Prueba de Carga)
- **Propósito:** Simular el tráfico normal y los picos esperados durante días regulares.
- **Carga:** Escalonado de 0 a X (ej: 100) VUs, mantener la máxima carga y luego bajar a 0.
- **Duración:** 5 a 10 minutos.

### C. Stress Test (Prueba de Estrés)
- **Propósito:** Identificar el punto en el cual la API se degrada severamente o falla (Breaking Point). Empujar la API más allá del tráfico esperado.
- **Carga:** Ramp-up agresivo hasta miles de VUs concurrentes.
- **Duración:** 15 a 30 minutos.

### D. Spike Test (Prueba de Picos)
- **Propósito:** Evaluar cómo reacciona el sistema ante un evento repentino de tráfico masivo (ej: un lanzamiento de producto o "Black Friday").
- **Carga:** Subida drástica (ej: de 10 a 500 VUs en menos de 10 segundos).

## 5. Casos de Uso Críticos (Escenarios a Probar)
Se priorizarán los endpoints de mayor uso o criticidad de negocio que impactan directamente a los recursos de CPU/Base de Datos:

1. **Flujo de Usuario (Read-Heavy):**
   - Obtener Catálogos y Productos (`GET /api/v1/products`).
   - Búsqueda y filtrado iterativo.
2. **Flujo Crítico (Write/Read-Heavy):**
   - Registro y Login (`POST /api/v1/auth/login`).
   - Creación y manejo de Carrito (`POST /api/v1/cart`).
3. **Flujo Transaccional:**
   - Creación de Órdenes (Checkout) (`POST /api/v1/orders`). *(Nota: se deben usar datos de prueba o mock de la pasarela de pagos).*

---

## 6. Procedimiento de Ejecución
1. Instalar k6 en la máquina o agente CI (`choco install k6` en Windows, `brew install k6` en macOS).
2. Configurar variables de entorno (`BASE_URL`, `TOKEN`).
3. Ejecutar los scripts documentados abajo monitoreando paralelamente los recursos del servidor (CPU, RAM de Node.js, Threads de DB MongoDB/PostgreSQL).
4. Generar reportes.

---

## 7. Script de Referencia (Load/Stress Test con Validación de SLAs)
A continuación se incluye un script listo para ejecutar usando k6. Para ejecutarlo usa:
`k6 run tests/performance/load-test.js`
