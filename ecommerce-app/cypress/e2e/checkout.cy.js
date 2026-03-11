describe("Flujo de Checkout (4 Fases)", () => {
    let testUser;
    // Producto real de la DB (Manchester United)
    const product = { _id: "6944dac27ec1961401dfe198", name: "Jersey Manchester United Local 2024", price: 1249 };

    before(() => {
        testUser = {
            displayName: "Checkout User",
            email: `checkout_test_${Date.now()}@anderek.com`,
            password: "Password123!",
            phone: "1234567890"
        };
        cy.registerUser(testUser);
    });

    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptores para bypass de rate limit y debug
        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getUserProfile");

        cy.intercept("GET", "**/products*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProducts");

        // Nuevas rutas de envío
        cy.intercept("GET", "**/shipping-addresses/user-addresses*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getAddresses");

        cy.intercept("POST", "**/shipping-addresses/new-address", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("saveAddress");

        // Nuevas rutas de pago
        cy.intercept("GET", "**/payment-methods/user/**", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getPayments");

        cy.intercept("POST", "**/payment-methods", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("savePayment");

        cy.intercept("POST", "**/orders", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("createOrder");

        // Set the origin DOMAIN first so cy.window() in loginByApi works on the app!
        cy.visit("/");

        // Login y pre-poblar carrito vía API
        cy.loginByApi(testUser.email, testUser.password).then(() => {
            return cy.addProductToCart(product._id, 1, "M");
        });

        cy.window().then(win => {
            cy.log("Local Storage before visit:", win.localStorage.getItem("authToken") ? "HAS TOKEN" : "NO TOKEN");
        });

        cy.visit("/checkout");

        cy.window().then(win => {
            cy.log("Local Storage after visit:", win.localStorage.getItem("authToken") ? "HAS TOKEN" : "NO TOKEN");
        });

        // Esperar a que el AuthContext esté listo y el perfil cargado
        cy.wait("@getUserProfile", { timeout: 10000 });

        // Esperar a que la sincronización inicial de Checkout termine
        cy.contains("Sincronizando con el servidor...", { timeout: 10000 }).should("not.exist");
    });

    it("completa el flujo de checkout exitosamente con la API real", () => {
        cy.url().should("include", "/checkout");

        // Esperar a que carguen los datos iniciales (vacíos para nuevo usuario)
        // Usamos un timeout mayor por si la API tarda un poco
        cy.wait(["@getAddresses", "@getPayments"], { timeout: 10000 });

        // Fase 1: Dirección de envío
        cy.get('[data-testid="add-address-button"]').click();

        cy.get('[data-testid="address-name"]').type("Juan Pérez");
        cy.get('[data-testid="address-address"]').type("Calle Falsa 123");
        cy.get('[data-testid="address-city"]').type("CDMX");
        cy.get('[data-testid="address-state"]').type("CDMX");
        cy.get('[data-testid="address-postalCode"]').type("01000");
        cy.get('[data-testid="address-country"]').type("México");
        cy.get('[data-testid="address-phone"]').type("5512345678");
        cy.get('[data-testid="address-submit"]').click();

        cy.wait("@saveAddress").its("response.statusCode").should("be.oneOf", [200, 201]);
        
        // Agregar logs para depuración del DOM
        cy.get(".checkout-container", { timeout: 10000 }).then($el => {
            cy.writeFile("cypress/dom_dump.html", $el[0].outerHTML);
        });

        cy.get(".selected-address", { timeout: 5000 }).should("contain", "Juan Pérez");

        // Fase 2: Método de pago
        cy.get('[data-testid="add-payment-button"]').click();

        cy.get('[data-testid="payment-bankName"]').type("Mi Banco");
        cy.get('[data-testid="payment-cardNumber"]').type("4242424242424242");
        cy.get('[data-testid="payment-cardHolderName"]').type("Juan Pérez");
        cy.get('[data-testid="payment-expiryDate"]').type("12/28");
        cy.get('[data-testid="payment-cvv"]').type("123");
        cy.get('[data-testid="payment-submit"]').click();

        cy.wait("@savePayment").its("response.statusCode").should("be.oneOf", [200, 201]);
        cy.get(".selected-payment", { timeout: 10000 }).should("contain", "Mi Banco");

        // Fase 3: Revisión de totales (Cálculos basados en $1249.00 + $199.84 IVA + $0 Envío = $1448.84)
        cy.get('[data-testid="summary-subtotal"]').should("contain", "$1,249.00");
        cy.get('[data-testid="summary-tax"]').should("contain", "$199.84");
        cy.get('[data-testid="summary-shipping"]').should("contain", "Gratis");
        cy.get('[data-testid="summary-total"]').should("contain", "$1,448.84");

        // Fase 4: Confirmación
        cy.get('[data-testid="pay-button"]').should("not.be.disabled").click();

        cy.wait("@createOrder").its("response.statusCode").should("be.oneOf", [200, 201]);

        // Verificar redirección
        cy.url().should("include", "/order-confirmation");
        cy.get("h1").should("contain", "¡Gracias por tu compra!");
    });
});
