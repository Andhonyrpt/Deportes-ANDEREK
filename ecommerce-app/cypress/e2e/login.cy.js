describe("Flujo de Login", () => {
    const testUser = {
        displayName: "Login Test User",
        email: "customer@test.com",
        password: "Password123!",
        phone: "1234567890"
    };

    before(() => {
        // Asegurar que el usuario existe
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/auth/register`,
            headers: { 'x-load-test': 'true' },
            body: testUser,
            failOnStatusCode: false
        }).then((res) => {
            cy.log("Registro de prueba (Pre-login):", JSON.stringify(res.body));
        });
    });

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.intercept("POST", "**/auth/login", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("loginRequest");

        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProfile");

        cy.visit("/login");
    });

    it("muestra el formulario de login correctamente", () => {
        cy.get('[data-testid="login-form"]').should("be.visible");
        cy.get('[data-testid="input-email"]').should("be.visible");
        cy.get('[data-testid="input-password"]').should("be.visible");
        cy.get('[data-testid="login-submit"]').should("be.visible");
    });

    it("muestra error con credenciales incorrectas (API 400)", () => {
        cy.get('[data-testid="input-email"]').type("inexistente@test.com");
        cy.get('[data-testid="input-password"]').type("WrongPass123!");
        cy.get('[data-testid="login-submit"]').click();

        cy.wait("@loginRequest").its("response.statusCode").should("eq", 400);

        cy.get('[data-testid="error-message"]')
            .should("be.visible");
    });

    it("inicia sesión correctamente y redirige a / (API 200)", () => {
        cy.get('[data-testid="input-email"]').type(testUser.email);
        cy.get('[data-testid="input-password"]').type(testUser.password);
        cy.get('[data-testid="login-submit"]').click();

        cy.wait("@loginRequest").then((interception) => {
            if (interception.response.statusCode !== 200) {
                cy.log("Login failed with response:", JSON.stringify(interception.response.body));
            }
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.wait("@getProfile").its("response.statusCode").should("eq", 200);

        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
        cy.window().its("localStorage").invoke("getItem", "authToken").should("not.be.null");
    });
});
