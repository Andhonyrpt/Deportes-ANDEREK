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

        cy.intercept("POST", "**/users/addresses", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("saveAddress");

        cy.intercept("POST", "**/users/payments", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("savePayment");

        cy.intercept("POST", "**/orders", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("createOrder");

        // Login y pre-poblar carrito vía API
        cy.loginByApi(testUser.email, testUser.password).then(() => {
            cy.addProductToCart(product._id, 1, "M");
        });

        cy.visit("/checkout");
    });

    it("completa el flujo de checkout exitosamente con la API real", () => {
        cy.url().should("include", "/checkout");

        // Fase 1: Dirección de envío
        cy.get('[data-testid="add-address-button"]').click();

        cy.get('[data-testid="address-name"]').type("Juan Pérez");
        cy.get('[data-testid="address-address1"]').type("Calle Falsa 123");
        cy.get('[data-testid="address-city"]').type("CDMX");
        cy.get('[data-testid="address-state"]').type("CDMX");
        cy.get('[data-testid="address-postalCode"]').type("01000");
        cy.get('[data-testid="address-country"]').type("México");
        cy.get('[data-testid="address-phone"]').type("5512345678");
        cy.get('[data-testid="address-submit"]').click();

        cy.wait("@saveAddress").its("response.statusCode").should("be.oneOf", [200, 201]);
        cy.get(".selected-address", { timeout: 10000 }).should("contain", "Juan Pérez");

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

        // Fase 3: Revisión de totales (Cálculos basados en $1249.00)
        // Subtotal: 1249.00
        // IVA (16%): 199.84
        // Envío (Gratis >= 1000): 0
        // Total: 1448.84
        cy.get('[data-testid="summary-subtotal"]').parent().should("contain", "$1,249.00");
        cy.get('[data-testid="summary-tax"]').parent().should("contain", "$199.84");
        cy.get('[data-testid="summary-shipping"]').parent().should("contain", "Gratis");
        cy.get('[data-testid="summary-total"]').parent().should("contain", "$1,448.84");

        // Fase 4: Confirmación
        cy.get('[data-testid="pay-button"]').click();

        cy.wait("@createOrder").its("response.statusCode").should("be.oneOf", [200, 201]);

        // Verificar redirección
        cy.url().should("include", "/order-confirmation");
        cy.get("h1").should("contain", "¡Gracias por tu compra!");

        // Verificar que el carrito esté vacío en localStorage tras la compra
        cy.window().its("localStorage").invoke("getItem", "cart").then(cart => {
            const items = JSON.parse(cart || "[]");
            expect(items).to.have.length(0);
        });
    });
});
