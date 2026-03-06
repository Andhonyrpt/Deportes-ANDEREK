import users from "../fixtures/users.json";

describe("Flujo de Registro", () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada prueba para asegurar independencia
        cy.clearLocalStorage();
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

    it("registra un usuario nuevo y redirige a /login", () => {
        cy.intercept("GET", "**/auth/check-email*", {
            statusCode: 200,
            body: { taken: false }, // Corregido segun services/auth.js: returns response.data
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

        cy.get('[data-testid="input-email"]').blur();
        cy.wait("@checkEmail");

        cy.get('[data-testid="input-password"]').type(users.newUser.password);
        cy.get('[data-testid="input-verifyPassword"]').type(users.newUser.password);
        cy.get('[data-testid="input-phone"]').type(users.newUser.phone);

        cy.get('[data-testid="register-submit"]').click();
        cy.wait("@registerUser");

        cy.url().should("include", "/login");
    });
});
