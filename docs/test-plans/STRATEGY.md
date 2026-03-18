# Estrategia de Calidad y Testing - Deportes-ANDEREK

Este documento unifica la estrategia de QA, el progreso de pruebas y la visión de calidad tanto para el Backend como para el Frontend.

## 1. Visión General (Pirámide de Pruebas)

### 1.1 Backend (Pirámide Clásica)
- **Unit Tests (80% Cobertura)**: Foco en controladores, modelos y middlewares (`ecommerce-api`).
- **Integration Tests**: Validación de flujos reales Rutas -> DB.
- **Seguridad**: Foco en RBAC, Rate Limiting y validación de esquemas.

### 1.2 Frontend (Testing Trophy)
- **Static Analysis**: ESLint y reglas de estilo.
- **Component Tests**: Validación de componentes atómicos.
- **Integration Tests**: Foco en Contextos y sincronización asíncrona.
- **E2E (Cypress)**: Validación de flujos críticos de usuario (Foco principal: 100% éxito).

---

## 2. Matriz de Progreso de Pruebas

### 2.1 Backend (Endpoints Críticos)
| Endpoint | Tipo | Escenario | Resultado |
| :--- | :---: | :--- | :--- |
| `POST /auth/register` | Unit | Datos válidos | ✅ OK |
| `POST /auth/login` | Integración | Credenciales correctas | ✅ OK |
| `POST /cart/add` | Unit | Stock insuficiente | ✅ Error 400 |
| `POST /orders` | Integración | Transacción atómica | ✅ OK |

### 2.2 Frontend (E2E Cypress)
| ID | Escenario | Estado | Notas |
| :--- | :--- | :--- | :--- |
| CP-01 | Registro Exitoso | ✅ PASSED | Redirección a /login |
| CP-02 | Login Exitoso | ✅ PASSED | Redirección a Home |
| CP-04 | Flujo de Carrito | ✅ PASSED | Persistencia localStorage |
| CP-05 | Checkout (Real API)| ✅ PASSED | Híbrido (LocalStorage + API) |

---

## 3. Deficiencias Detectadas y Plan de Mejora

### 3.1 Backend
- **Validaciones**: Faltan pruebas unitarias aisladas para algunos validadores de `express-validator`.
- **Resiliencia**: Necesidad de simular fallos de base de datos en controladores críticos.

### 3.2 Frontend
- **Inconsistencia de Persistencia**: El test de Checkout pasa a pesar de la lógica híbrida. Se requiere refactorizar el test una vez que se migre al flujo 100% basado en API.
- **Testing de Perfil**: Pendiente completar validación de eliminación de direcciones y gestión de historial desde la UI.

---

## 4. Ejecución de Pruebas

### Backend
```bash
cd ecommerce-api
npm run test
```

### Frontend
```bash
cd ecommerce-app
npm start  # En terminal 1
npx cypress open  # En terminal 2
```
