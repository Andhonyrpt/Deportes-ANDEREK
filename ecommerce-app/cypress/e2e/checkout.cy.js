describe("INTEGRATION TEST V3 - Full Checkout Flow", () => {
    let testUser;
    const product = { _id: "6944dac27ec1961401dfe198", name: "Jersey Manchester United Local 2024", price: 1249 };

    Cypress.on('fail', (error, runnable) => {
        console.error('CYPRESS FAIL:', error.message);
        throw error; // still fail the test
    });

    before(() => {
        const uniqueId = Date.now().toString();
        testUser = {
            displayName: "V3 User",
            email: `v3_test_${uniqueId}@anderek.com`,
            password: "Password123!",
            // Asegurar un número de teléfono de 10 dígitos único
            phone: `55${uniqueId.slice(-8)}`
        };
        
        // Registrar sin fallar si ya existe (400)
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl") || "http://localhost:4000/api"}/auth/register`,
            headers: { 'x-load-test': 'true' },
            body: testUser,
            failOnStatusCode: false
        });
    });

    beforeEach(() => {
        cy.clearLocalStorage();

        cy.intercept("GET", "**/users/profile").as("getUserProfile");
        cy.intercept("GET", "**/shipping-addresses/user-addresses*").as("getAddresses");
        cy.intercept("GET", "**/payment-methods/user/**").as("getPayments");
        cy.intercept("GET", "**/cart/user/**").as("getCart");
        cy.intercept("POST", "**/shipping-addresses/new-address").as("saveAddress");
        cy.intercept("POST", "**/payment-methods").as("savePayment");
        cy.intercept("POST", "**/orders").as("placeOrder");

        cy.visit("/");
        cy.log("Login via API...");
        cy.loginByApi(testUser.email, testUser.password).then((auth) => {
            cy.log(`Auth result: ${JSON.stringify(auth.user._id)}`);
        });

        cy.window().then((win) => {
            const stored = win.localStorage.getItem("userData");
            cy.log(`Stored UserData: ${stored}`);
        });

        cy.log("Agregando al carrito y visitando Checkout...");
        cy.addProductToCart(product._id, 1, "M");
        cy.visit("/checkout");

        // Esperas robustas para el PRIMER conjunto de llamadas (las que hace /checkout al cargar)
        cy.wait(["@getUserProfile", "@getCart", "@getAddresses", "@getPayments"], { timeout: 30000 });
        cy.contains("Sincronizando con el servidor...", { timeout: 15000 }).should("not.exist");
    });

    it("corre el flujo completo exitosamente", () => {
        // Verificación inicial: El producto debe estar en el resumen
        cy.get(".cart-view", { timeout: 10000 }).should("contain", "Manchester United");
        
        // Fase 1: Dirección
        cy.get('[data-testid="add-address-button"]').click();
        cy.get('[data-testid="address-name"]').type("Juan Pérez");
        cy.get('[data-testid="address-address"]').type("Calle Falsa 123");
        cy.get('[data-testid="address-city"]').type("CDMX");
        cy.get('[data-testid="address-state"]').type("CDMX");
        cy.get('[data-testid="address-postalCode"]').type("01000");
        cy.get('[data-testid="address-country"]').type("México");
        cy.get('[data-testid="address-phone"]').type("5512345678");
        cy.get('[data-testid="address-submit"]').click();

        cy.wait("@saveAddress");
        cy.wait("@getAddresses");
        cy.get(".selected-address").should("contain", "Juan Pérez");

        // Fase 2: Pago
        cy.get('[data-testid="add-payment-button"]').click();
        cy.get('[data-testid="payment-cardNumber"]').type("4242424242424242");
        cy.get('[data-testid="payment-cardHolderName"]').type("Juan Pérez");
        cy.get('[data-testid="payment-expiryDate"]').type("12/26");
        cy.get('[data-testid="payment-cvv"]').type("123");
        cy.get('[data-testid="payment-bankName"]').type("BBVA");
        cy.get('[data-testid="payment-submit"]').click();

        cy.wait("@savePayment");
        cy.wait("@getPayments");
        cy.get(".selected-payment").should("contain", "BBVA");

        // Fase 4: Pagar
        cy.get('[data-testid="pay-button"]').click();
        cy.wait("@placeOrder");

        // Éxito final
        cy.url().should("include", "/order-confirmation");
        cy.contains("¡Gracias por tu compra!").should("be.visible");
    });
});
