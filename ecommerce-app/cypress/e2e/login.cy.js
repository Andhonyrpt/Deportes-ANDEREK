import users from "../fixtures/users.json";

describe("Flujo de Login", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
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

        // Corregido: getUserProfile espera { user: { ... } }
        cy.intercept("GET", "**/users/profile", {
            statusCode: 200,
            body: {
                message: "Perfil obtenido",
                user: {
                    _id: "user-001",
                    displayName: users.existingUser.displayName,
                    email: users.existingUser.email,
                    role: "user",
                }
            },
        }).as("getProfile");

        cy.get('[data-testid="input-email"]').type(users.existingUser.email);
        cy.get('[data-testid="input-password"]').type(users.existingUser.password);
        cy.get('[data-testid="login-submit"]').click();

        cy.wait("@loginSuccess");
        cy.wait("@getProfile");

        // Verificar redirección
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

        // Verificar storage
        cy.window().its("localStorage").invoke("getItem", "authToken")
            .should("equal", "fake-jwt-token");
    });
});
