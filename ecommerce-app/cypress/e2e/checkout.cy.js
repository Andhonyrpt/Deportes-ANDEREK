describe("Flujo de Checkout (4 Fases) - Integración API", () => {
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

        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("getUserProfile");

        cy.intercept("GET", "**/shipping-addresses/user-addresses*", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("getAddresses");

        cy.intercept("GET", "**/payment-methods/user/**", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("getPayments");
        
        cy.intercept("GET", "**/cart/user/**", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("getCart");

        cy.intercept("POST", "**/shipping-addresses/new-address", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("saveAddress");

        cy.intercept("POST", "**/payment-methods/new-payment-method", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("savePayment");

        cy.intercept("POST", "**/orders/new-order", (req) => {
            req.headers['x-load-test'] = 'true';
            req.continue();
        }).as("placeOrder");

        cy.visit("/");

        cy.loginByApi(testUser.email, testUser.password).then(() => {
            return cy.addProductToCart(product._id, 1, "M");
        });

        cy.visit("/checkout");

        // Esperar cargas iniciales
        cy.wait(["@getUserProfile", "@getCart", "@getAddresses", "@getPayments"], { timeout: 20000 });

        cy.contains("Sincronizando con el servidor...", { timeout: 10000 }).should("not.exist");
    });

    it("debe completar el flujo completo desde dirección hasta confirmación", () => {
        // Verificar contenido del carrito
        cy.get(".checkout-summary").should("contain", product.name);

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
        cy.wait("@getAddresses");
        cy.get(".selected-address").should("contain", "Juan Pérez");

        // Fase 2: Método de pago
        cy.get('[data-testid="add-payment-button"]').click();
        cy.get('[data-testid="payment-cardNumber"]').type("4242424242424242");
        cy.get('[data-testid="payment-cardHolder"]').type("Juan Pérez");
        cy.get('[data-testid="payment-expiryDate"]').type("12/26");
        cy.get('[data-testid="payment-cvv"]').type("123");
        cy.get('[data-testid="payment-bankName"]').type("BBVA");
        cy.get('[data-testid="payment-submit"]').click();

        cy.wait("@savePayment").its("response.statusCode").should("be.oneOf", [200, 201]);
        cy.wait("@getPayments");
        cy.get(".selected-payment").should("contain", "BBVA");

        // Fase 3: Revisión (CartView ya debería estar visible)
        cy.get('.cart-view').should('be.visible');

        // Fase 4: Confirmar y Pagar
        cy.get('[data-testid="pay-button"]').click();
        cy.wait("@placeOrder").its("response.statusCode").should("be.oneOf", [200, 201]);

        // Verificación de éxito
        cy.url().should("include", "/order-confirmation");
        cy.contains("¡Gracias por tu compra!", { timeout: 10000 }).should("be.visible");
    });
});
