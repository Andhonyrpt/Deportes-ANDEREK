describe("INTEGRATION TEST V3 - Full Checkout Flow", () => {
    // Usamos el usuario administrador que acabas de configurar
    const adminUser = {
        email: "cypress_admin_test@anderek.com",
        password: "Password123!" 
    };
    const product = { _id: "69b1183fd947069ecb02061b", name: "Jersey Manchester United Local 2024", price: 1249 };

    before(() => {
        // Login con el usuario administrador configurado
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/auth/login`,
            headers: { 'x-load-test': 'true' },
            body: adminUser,
            failOnStatusCode: false
        }).then((loginRes) => {
            cy.log("Login Status (Admin):", loginRes.status);
            if (loginRes.status === 200) {
                const token = loginRes.body.token;
                cy.request({
                    method: "GET",
                    url: `${Cypress.env("apiUrl")}/users/profile`,
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'x-load-test': 'true'
                    }
                }).then((profileRes) => {
                    Cypress.env("authToken", token);
                    Cypress.env("userData", JSON.stringify(profileRes.body.user));
                    cy.log("Administrador autenticado exitosamente");
                });
            } else {
                throw new Error("El login con el administrador falló: " + JSON.stringify(loginRes.body));
            }
        });
    });


    beforeEach(() => {
        cy.clearLocalStorage();
        
        // Login usando el comando que ya funciona en otros tests
        cy.loginByApi(testUser.email, testUser.password);
        
        // Limpiar datos transaccionales
        cy.clearDataByApi();

        cy.intercept("GET", "**/users/profile", (req) => { req.headers['x-load-test'] = 'true'; }).as("getUserProfile");
        cy.intercept("GET", "**/shipping-addresses/user-addresses*", (req) => { req.headers['x-load-test'] = 'true'; }).as("getAddresses");
        cy.intercept("GET", "**/payment-methods/user/**", (req) => { req.headers['x-load-test'] = 'true'; }).as("getPayments");
        cy.intercept("GET", "**/cart/**", (req) => { req.headers['x-load-test'] = 'true'; }).as("getCart");
        cy.intercept("POST", "**/shipping-addresses/new-address", (req) => { req.headers['x-load-test'] = 'true'; }).as("saveAddress");
        cy.intercept("POST", "**/payment-methods", (req) => { req.headers['x-load-test'] = 'true'; }).as("savePayment");
        cy.intercept("POST", "**/orders", (req) => { req.headers['x-load-test'] = 'true'; }).as("placeOrder");

        cy.visit("/");
        
        cy.addProductToCart(product._id, 1, "M");
        cy.visit("/checkout");

        cy.wait(["@getUserProfile", "@getCart", "@getAddresses", "@getPayments"], { timeout: 30000 });
        cy.contains("Sincronizando con el servidor...", { timeout: 15000 }).should("not.exist");
    });

    it("corre el flujo completo exitosamente", () => {
        cy.get(".cart-view", { timeout: 10000 }).should("contain", "Manchester United");
        
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="add-address-button"]').length === 0) {
                cy.contains("1. Dirección de envío").click();
            }
        });
        cy.get('[data-testid="add-address-button"]').click();
        cy.get('[data-testid="address-name"]').type("Juan Pérez");
        cy.get('[data-testid="address-address"]').type("Calle Falsa 123");
        cy.get('[data-testid="address-city"]').type("CDMX");
        cy.get('[data-testid="address-state"]').type("CDMX");
        cy.get('[data-testid="address-postalCode"]').type("01000");
        cy.get('[data-testid="address-country"]').type("México");
        cy.get('[data-testid="address-phone"]').type("5512345678");
        cy.get('[data-testid="address-submit"]').click();

        cy.wait("@saveAddress").its("response.statusCode").should("eq", 201);
        cy.wait("@getAddresses");
        cy.get(".selected-address").should("contain", "Juan Pérez");

        cy.get('[data-testid="add-payment-button"]').click();
        cy.get('[data-testid="payment-cardNumber"]').type("4242424242424242");
        cy.get('[data-testid="payment-cardHolderName"]').type("Juan Pérez");
        cy.get('[data-testid="payment-expiryDate"]').type("12/26");
        cy.get('[data-testid="payment-cvv"]').type("123");
        cy.get('[data-testid="payment-bankName"]').type("BBVA");
        cy.get('[data-testid="payment-submit"]').click();

        cy.wait("@savePayment").its("response.statusCode").should("eq", 201);
        cy.wait("@getPayments");
        cy.get(".selected-payment").should("contain", "BBVA");

        // Fase 4: Pagar
        cy.get('.pay-button').click();
        cy.wait("@placeOrder").its("response.statusCode").should("eq", 201);


        cy.url().should("include", "/order-confirmation");
        cy.contains("¡Gracias por tu compra!").should("be.visible");
    });
});
