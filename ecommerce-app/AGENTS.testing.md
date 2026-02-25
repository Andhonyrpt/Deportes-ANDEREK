# Guía de Tests E2E con Cypress — ecommerce-app

Esta guía establece los patrones, comandos y flujos completos de pruebas End-to-End para el proyecto `ecommerce-app` usando Cypress.

---

## 1. Instalación de Cypress

Cypress **no está instalado** en el proyecto. Ejecutar los siguientes pasos desde la raíz de `ecommerce-app/`:

```bash
# Instalar Cypress como devDependency
npm install --save-dev cypress

# Abrir Cypress por primera vez (genera la estructura cypress/)
npx cypress open
```

### Agregar scripts en `package.json`

```json
"scripts": {
  "cy:open": "cypress open",
  "cy:run":  "cypress run",
  "cy:run:headed": "cypress run --headed"
}
```

### Estructura generada

```
ecommerce-app/
└── cypress/
    ├── e2e/              ← Archivos de test (.cy.js)
    ├── fixtures/         ← Datos de prueba (JSON)
    ├── support/
    │   ├── commands.js   ← Comandos personalizados
    │   └── e2e.js        ← Importa commands.js automáticamente
    └── cypress.config.js
```

### `cypress.config.js` recomendado

```js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    setupNodeEvents(on, config) {},
  },
});
```

> **Nota:** El servidor de desarrollo debe estar corriendo (`npm start`) antes de ejecutar los tests.

---

## 2. Comandos Personalizados

Agregar en `cypress/support/commands.js`:

### `cy.loginByApi(email, password)`

Autentica al usuario directamente vía API REST, sin pasar por la UI. Guarda `authToken` y `refreshToken` en `localStorage` para que el contexto `useAuth()` reconozca la sesión.

```js
// cypress/support/commands.js

Cypress.Commands.add("loginByApi", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.equal(200);
    const { token, refreshToken } = response.body;
    window.localStorage.setItem("authToken", token);
    window.localStorage.setItem("refreshToken", refreshToken);
  });
});
```

### `cy.addProductToCart(product, quantity, size)`

Inyecta un producto directamente en el carrito mediante `localStorage`, simulando el estado que produciría `addToCart()` del contexto `useCart()`.

```js
Cypress.Commands.add("addProductToCart", (product, quantity = 1, size = "M") => {
  cy.window().then((win) => {
    const existingCart = JSON.parse(
      win.localStorage.getItem("cartItems") || "[]"
    );

    const newItem = {
      ...product,
      quantity,
      size,
      // Clave usada internamente por useCart para identificar items
      cartKey: `${product._id || product.id}-${size}`,
    };

    // Si ya existe, incrementar cantidad
    const idx = existingCart.findIndex((i) => i.cartKey === newItem.cartKey);
    if (idx >= 0) {
      existingCart[idx].quantity += quantity;
    } else {
      existingCart.push(newItem);
    }

    win.localStorage.setItem("cartItems", JSON.stringify(existingCart));
  });
});
```

### Variables de entorno en `cypress.config.js`

```js
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      apiUrl: "http://localhost:4000/api",
    },
  },
});
```

---

## 3. Fixtures de Datos de Prueba

Crear `cypress/fixtures/users.json`:

```json
{
  "newUser": {
    "displayName": "Cypress Test User",
    "email": "cypress_test@anderek.com",
    "password": "Cypress123!",
    "phone": "5551234567"
  },
  "existingUser": {
    "email": "usuario@anderek.com",
    "password": "Password123!"
  }
}
```

Crear `cypress/fixtures/products.json`:

```json
{
  "sampleProduct": {
    "_id": "product-cypress-001",
    "name": "Camiseta Deportiva Cypress",
    "price": 450,
    "image": "https://via.placeholder.com/300",
    "category": "camisetas"
  }
}
```

---

## 4. Test Completo: Flujo de Registro

**Archivo:** `cypress/e2e/register.cy.js`

```js
import users from "../fixtures/users.json";

describe("Flujo de Registro", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("muestra el formulario de registro correctamente", () => {
    cy.get('[data-testid="register-form"]').should("be.visible");
    cy.get('[data-testid="input-displayName"]').should("be.visible");
    cy.get('[data-testid="input-email"]').should("be.visible");
    cy.get('[data-testid="input-password"]').should("be.visible");
    cy.get('[data-testid="input-verifyPassword"]').should("be.visible");
    cy.get('[data-testid="input-phone"]').should("be.visible");
    cy.get('[data-testid="register-submit"]').should("be.visible");
  });

  it("muestra error cuando las contraseñas no coinciden", () => {
    cy.get('[data-testid="input-displayName"]').type("Test User");
    cy.get('[data-testid="input-email"]').type("test@example.com");
    cy.get('[data-testid="input-password"]').type("Password123!");
    cy.get('[data-testid="input-verifyPassword"]').type("OtraPassword456!");
    cy.get('[data-testid="input-phone"]').type("5551234567");
    cy.get('[data-testid="register-submit"]').click();

    cy.get('[data-testid="error-message"]')
      .should("be.visible")
      .and("contain.text", "contraseñas no coinciden");
  });

  it("muestra error cuando la contraseña es menor a 8 caracteres", () => {
    cy.get('[data-testid="input-displayName"]').type("Test User");
    cy.get('[data-testid="input-email"]').type("test@example.com");
    cy.get('[data-testid="input-password"]').type("corta");
    cy.get('[data-testid="input-verifyPassword"]').type("corta");
    cy.get('[data-testid="input-phone"]').type("5551234567");
    cy.get('[data-testid="register-submit"]').click();

    cy.get('[data-testid="error-message"]')
      .should("be.visible")
      .and("contain.text", "al menos 8 caracteres");
  });

  it("registra un usuario nuevo y redirige a /login", () => {
    // Interceptar la llamada a la API
    cy.intercept("GET", "**/auth/check-email*", {
      statusCode: 200,
      body: { taken: false },
    }).as("checkEmail");

    cy.intercept("POST", "**/auth/register", {
      statusCode: 201,
      body: {
        displayName: users.newUser.displayName,
        email: users.newUser.email,
      },
    }).as("registerUser");

    cy.get('[data-testid="input-displayName"]').type(users.newUser.displayName);
    cy.get('[data-testid="input-email"]').type(users.newUser.email);

    // Perder el foco en email para disparar la validación de disponibilidad
    cy.get('[data-testid="input-email"]').blur();
    cy.wait("@checkEmail");

    cy.get('[data-testid="input-password"]').type(users.newUser.password);
    cy.get('[data-testid="input-verifyPassword"]').type(users.newUser.password);
    cy.get('[data-testid="input-phone"]').type(users.newUser.phone);

    cy.get('[data-testid="register-submit"]').click();
    cy.wait("@registerUser");

    // Debe redirigir a /login con el mensaje de éxito
    cy.url().should("include", "/login");
  });

  it("muestra error si el email ya está registrado", () => {
    cy.intercept("GET", "**/auth/check-email*", {
      statusCode: 200,
      body: { taken: true },
    }).as("checkEmail");

    cy.get('[data-testid="input-displayName"]').type("Test User");
    cy.get('[data-testid="input-email"]')
      .type("existente@anderek.com")
      .blur();

    cy.wait("@checkEmail");
    cy.get('[data-testid="input-password"]').type("Password123!");
    cy.get('[data-testid="input-verifyPassword"]').type("Password123!");
    cy.get('[data-testid="input-phone"]').type("5551234567");
    cy.get('[data-testid="register-submit"]').click();

    cy.get('[data-testid="error-message"]')
      .should("be.visible")
      .and("contain.text", "ya esta registrado");
  });
});
```

---

## 5. Test Completo: Flujo de Login

**Archivo:** `cypress/e2e/login.cy.js`

```js
import users from "../fixtures/users.json";

describe("Flujo de Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("muestra el formulario de login correctamente", () => {
    cy.get('[data-testid="login-form"]').should("be.visible");
    cy.get('[data-testid="input-email"]').should("be.visible");
    cy.get('[data-testid="input-password"]').should("be.visible");
    cy.get('[data-testid="login-submit"]').should("be.visible");
  });

  it("muestra error con credenciales incorrectas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { message: "Credenciales inválidas" },
    }).as("loginFail");

    cy.get('[data-testid="input-email"]').type("noexiste@anderek.com");
    cy.get('[data-testid="input-password"]').type("WrongPass123!");
    cy.get('[data-testid="login-submit"]').click();
    cy.wait("@loginFail");

    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("inicia sesión correctamente y redirige a /", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        refreshToken: "fake-refresh-token",
      },
    }).as("loginSuccess");

    // Mockear la carga del perfil que ocurre tras el login en AuthContext
    cy.intercept("GET", "**/users/profile*", {
      statusCode: 200,
      body: {
        _id: "user-001",
        displayName: users.existingUser.displayName,
        email: users.existingUser.email,
        role: "user",
      },
    }).as("getProfile");

    cy.get('[data-testid="input-email"]').type(users.existingUser.email);
    cy.get('[data-testid="input-password"]').type(users.existingUser.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.wait("@loginSuccess");

    // Verificar redirección al home
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

    // Verificar que el token fue almacenado
    cy.window().its("localStorage").invoke("getItem", "authToken")
      .should("equal", "fake-jwt-token");
  });

  it("el botón de envío está deshabilitado durante la carga", () => {
    cy.intercept("POST", "**/auth/login", (req) => {
      req.on("response", (res) => {
        res.setDelay(500); // Simular latencia
      });
      req.reply({
        statusCode: 200,
        body: { token: "tok", refreshToken: "ref" },
      });
    }).as("loginSlow");

    cy.get('[data-testid="input-email"]').type(users.existingUser.email);
    cy.get('[data-testid="input-password"]').type(users.existingUser.password);
    cy.get('[data-testid="login-submit"]').click();

    // Durante la carga el botón debe estar deshabilitado
    cy.get('[data-testid="login-submit"]').should("be.disabled");
    cy.wait("@loginSlow");
  });
});
```

---

## 6. Test Completo: Flujo de Checkout (4 Fases)

El flujo de Checkout tiene cuatro fases según `Checkout.jsx`:

1. **Dirección de envío** — Seleccionar o agregar dirección
2. **Método de pago** — Seleccionar o agregar tarjeta
3. **Revisar pedido** — Confirmar items del carrito
4. **Confirmar y Pagar** — Crear la orden y redirigir a `/order-confirmation`

**Archivo:** `cypress/e2e/checkout.cy.js`

```js
import users from "../fixtures/users.json";
import products from "../fixtures/products.json";

const mockAddress = {
  id: "addr-001",
  name: "Casa Principal",
  address1: "Calle Deportes 123",
  city: "Monterrey",
  postalCode: "64000",
  default: true,
  isDefault: true,
};

const mockPayment = {
  id: "pay-001",
  alias: "Tarjeta Personal",
  cardNumber: "4111111111111234",
  isDefault: true,
  default: true,
};

describe("Flujo de Checkout", () => {
  beforeEach(() => {
    // 1. Autenticar por API (sin UI)
    cy.loginByApi(users.existingUser.email, users.existingUser.password);

    // 2. Agregar producto al carrito
    cy.addProductToCart(products.sampleProduct, 2, "L");

    // 3. Precargar dirección y método de pago en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem(
        "checkout_addresses",
        JSON.stringify([mockAddress])
      );
      win.localStorage.setItem(
        "checkout_payments",
        JSON.stringify([mockPayment])
      );
    });

    cy.visit("/checkout");
  });

  // ─── FASE 1: Dirección de envío ──────────────────────────────────────────

  it("FASE 1 — muestra la sección de dirección de envío", () => {
    cy.get('[data-testid="checkout-section-address"]').should("be.visible");
    cy.get('[data-testid="section-title-address"]')
      .should("contain.text", "1. Dirección de envío");
  });

  it("FASE 1 — permite seleccionar una dirección existente", () => {
    cy.get('[data-testid="address-item-addr-001"]').should("be.visible");
    cy.get('[data-testid="address-radio-addr-001"]').check();
    cy.get('[data-testid="address-radio-addr-001"]').should("be.checked");
    // La sección se colapsa al seleccionar
    cy.get('[data-testid="checkout-section-address"]')
      .find('[data-testid="address-list"]')
      .should("not.be.visible");
  });

  it("FASE 1 — permite agregar una nueva dirección", () => {
    cy.get('[data-testid="btn-add-address"]').click();
    cy.get('[data-testid="address-form"]').should("be.visible");

    cy.get('[data-testid="address-input-name"]').type("Oficina");
    cy.get('[data-testid="address-input-address1"]').type("Av. Reforma 456");
    cy.get('[data-testid="address-input-city"]').type("CDMX");
    cy.get('[data-testid="address-input-postalCode"]').type("06600");

    cy.get('[data-testid="address-form-submit"]').click();

    // Verifica que la nueva dirección queda seleccionada
    cy.get('[data-testid="checkout-summary-address"]')
      .should("contain.text", "Oficina");
  });

  // ─── FASE 2: Método de pago ───────────────────────────────────────────────

  it("FASE 2 — muestra la sección de método de pago", () => {
    cy.get('[data-testid="checkout-section-payment"]').should("be.visible");
    cy.get('[data-testid="section-title-payment"]')
      .should("contain.text", "2. Método de pago");
  });

  it("FASE 2 — permite seleccionar un método de pago existente", () => {
    cy.get('[data-testid="payment-item-pay-001"]').should("be.visible");
    cy.get('[data-testid="payment-radio-pay-001"]').check();
    cy.get('[data-testid="payment-radio-pay-001"]').should("be.checked");
  });

  it("FASE 2 — permite agregar un nuevo método de pago", () => {
    cy.get('[data-testid="btn-add-payment"]').click();
    cy.get('[data-testid="payment-form"]').should("be.visible");

    cy.get('[data-testid="payment-input-alias"]').type("Mi Visa");
    cy.get('[data-testid="payment-input-cardNumber"]').type("4111111111111111");

    cy.get('[data-testid="payment-form-submit"]').click();

    cy.get('[data-testid="checkout-summary-payment"]')
      .should("contain.text", "Mi Visa");
  });

  // ─── FASE 3: Revisión del pedido ─────────────────────────────────────────

  it("FASE 3 — muestra los productos del carrito en la revisión", () => {
    cy.get('[data-testid="checkout-section-review"]').should("be.visible");
    cy.get('[data-testid="section-title-review"]')
      .should("contain.text", "3. Revisa tu pedido");

    // Debe mostrar el producto agregado en beforeEach
    cy.get('[data-testid="cart-item-list"]')
      .should("contain.text", products.sampleProduct.name);
  });

  it("FASE 3 — muestra el resumen de costos correctamente", () => {
    const subtotal = products.sampleProduct.price * 2; // 900
    const tax = parseFloat((subtotal * 0.16).toFixed(2)); // 144
    const shipping = 350; // subtotal < 1000
    const grandTotal = subtotal + tax + shipping; // 1394

    cy.get('[data-testid="summary-subtotal"]')
      .should("contain.text", "900");
    cy.get('[data-testid="summary-tax"]')
      .should("contain.text", "144");
    cy.get('[data-testid="summary-shipping"]')
      .should("contain.text", "350");
    cy.get('[data-testid="summary-total"]')
      .should("contain.text", "1,394");
  });

  // ─── FASE 4: Confirmación y pago ─────────────────────────────────────────

  it("FASE 4 — el botón Confirmar está deshabilitado si falta dirección o pago", () => {
    // Limpiar localStorage para que no haya datos precargados
    cy.window().then((win) => {
      win.localStorage.removeItem("checkout_addresses");
      win.localStorage.removeItem("checkout_payments");
    });
    cy.reload();

    cy.get('[data-testid="btn-confirm-order"]').should("be.disabled");
  });

  it("FASE 4 — flujo completo: confirmar y redirigir a /order-confirmation", () => {
    // Asegurar que hay dirección y pago seleccionados (cargados en beforeEach)
    cy.get('[data-testid="address-radio-addr-001"]').check();
    cy.get('[data-testid="payment-radio-pay-001"]').check();

    cy.get('[data-testid="btn-confirm-order"]')
      .should("not.be.disabled")
      .click();

    // Verificar redirección
    cy.url().should("include", "/order-confirmation");

    // Verificar que la orden fue persisitida en localStorage
    cy.window().then((win) => {
      const orders = JSON.parse(win.localStorage.getItem("orders") || "[]");
      expect(orders).to.have.length.at.least(1);
      expect(orders[0].status).to.equal("confirmed");
    });

    // Verificar que el carrito fue vaciado
    cy.window()
      .its("localStorage")
      .invoke("getItem", "cartItems")
      .then((val) => {
        const items = JSON.parse(val || "[]");
        expect(items).to.have.length(0);
      });
  });
});
```

---

## 7. Tabla de `data-testid` Requeridos

Los siguientes atributos `data-testid` deben agregarse a los componentes correspondientes. Sin ellos, los tests fallarán.

### `LoginForm.jsx`

| `data-testid`     | Elemento                                 | Tipo       |
| :---------------- | :--------------------------------------- | :--------- |
| `login-form`      | `<form>`                                 | `form`     |
| `input-email`     | `<Input id="email">` → `<input>`         | `input`    |
| `input-password`  | `<Input id="password">` → `<input>`      | `input`    |
| `login-submit`    | `<Button type="submit">`                 | `button`   |
| `error-message`   | `<ErrorMessage>` contenedor              | `div`/`p`  |

### `RegisterForm.jsx`

| `data-testid`           | Elemento                                       | Tipo      |
| :---------------------- | :--------------------------------------------- | :-------- |
| `register-form`         | `<form>`                                       | `form`    |
| `input-displayName`     | `<Input id="displayName">` → `<input>`         | `input`   |
| `input-email`           | `<Input id="email">` → `<input>`               | `input`   |
| `input-password`        | `<Input id="password">` → `<input>`            | `input`   |
| `input-verifyPassword`  | `<Input id="verifyPassword">` → `<input>`      | `input`   |
| `input-phone`           | `<Input id="phone">` → `<input>`               | `input`   |
| `register-submit`       | `<Button type="submit">`                       | `button`  |
| `error-message`         | `<ErrorMessage>` contenedor                    | `div`/`p` |

### `Checkout.jsx` y sub-componentes

| `data-testid`                 | Elemento                                            | Componente        |
| :---------------------------- | :-------------------------------------------------- | :---------------- |
| `checkout-section-address`    | `<SummarySection>` fase 1                           | `Checkout.jsx`    |
| `section-title-address`       | `<h>` con el título "1. Dirección de envío"         | `SummarySection`  |
| `checkout-section-payment`    | `<SummarySection>` fase 2                           | `Checkout.jsx`    |
| `section-title-payment`       | `<h>` con el título "2. Método de pago"             | `SummarySection`  |
| `checkout-section-review`     | `<SummarySection>` fase 3                           | `Checkout.jsx`    |
| `section-title-review`        | `<h>` con el título "3. Revisa tu pedido"           | `SummarySection`  |
| `address-list`                | Contenedor de `<AddressList>`                       | `AddressList.jsx` |
| `address-item-{id}`           | Fila/tarjeta de dirección, e.g. `address-item-addr-001` | `AddressList.jsx` |
| `address-radio-{id}`          | `<input type="radio">` por dirección               | `AddressList.jsx` |
| `btn-add-address`             | Botón "Agregar nueva dirección"                     | `AddressList.jsx` |
| `address-form`                | `<form>` de `AddressForm`                           | `AddressForm.jsx` |
| `address-input-name`          | Input "Nombre / Alias"                              | `AddressForm.jsx` |
| `address-input-address1`      | Input "Calle y número"                              | `AddressForm.jsx` |
| `address-input-city`          | Input "Ciudad"                                      | `AddressForm.jsx` |
| `address-input-postalCode`    | Input "Código Postal"                               | `AddressForm.jsx` |
| `address-form-submit`         | Botón guardar del formulario                        | `AddressForm.jsx` |
| `payment-item-{id}`           | Fila/tarjeta de método de pago                      | `PaymentList.jsx` |
| `payment-radio-{id}`          | `<input type="radio">` por método de pago           | `PaymentList.jsx` |
| `btn-add-payment`             | Botón "Agregar método de pago"                      | `PaymentList.jsx` |
| `payment-form`                | `<form>` de `PaymentForm`                           | `PaymentForm.jsx` |
| `payment-input-alias`         | Input "Alias / Apodo"                               | `PaymentForm.jsx` |
| `payment-input-cardNumber`    | Input "Número de tarjeta"                           | `PaymentForm.jsx` |
| `payment-form-submit`         | Botón guardar del formulario                        | `PaymentForm.jsx` |
| `cart-item-list`              | Contenedor del listado de productos en revisión     | `CartView.jsx`    |
| `checkout-summary-address`    | `<p>` con el nombre de la dirección seleccionada   | `Checkout.jsx`    |
| `checkout-summary-payment`    | `<p>` con el alias del método de pago seleccionado | `Checkout.jsx`    |
| `summary-subtotal`            | `<p>` con el valor del subtotal                     | `Checkout.jsx`    |
| `summary-tax`                 | `<p>` con el valor del IVA (16%)                    | `Checkout.jsx`    |
| `summary-shipping`            | `<p>` con el costo de envío                         | `Checkout.jsx`    |
| `summary-total`               | `<p>` con el total final                            | `Checkout.jsx`    |
| `btn-confirm-order`           | `<Button>` "Confirmar y Pagar"                      | `Checkout.jsx`    |

### `common/Input` y `common/Button`

Para que los selectors `data-testid` en los `<Input>` funcionen, el componente `Input` debe pasar el atributo al `<input>` nativo:

```jsx
// src/components/common/Input/Input.jsx  (modificación necesaria)
export default function Input({ id, "data-testid": testId, ...props }) {
  return (
    <input
      id={id}
      data-testid={testId || id}
      {...props}
    />
  );
}
```

Con este cambio, pasar `id="email"` automáticamente agrega `data-testid="email"` al `<input>`, y se puede sobreescribir explícitamente con `data-testid="input-email"`.

---

## 8. Restricciones del Agente para Tests E2E

- **NO** hardcodear credenciales reales en los tests; siempre usar `cypress/fixtures/`.
- **NO** depender del orden de ejecución entre tests; cada `it()` debe ser independiente.
- **NO** usar `cy.wait(número)` como esperas arbitrarias; preferir `cy.intercept().as()` + `cy.wait('@alias')`.
- **NO** acceder a elementos por texto o clase CSS; **SIEMPRE** usar `data-testid`.
- **NO** omitir el `cy.intercept()` en tests que realizan llamadas a la API; todos los tests deben funcionar sin servidor real.
- **SIEMPRE** limpiar el estado (`localStorage`, cookies) en `beforeEach` o usando `cy.clearLocalStorage()`.
