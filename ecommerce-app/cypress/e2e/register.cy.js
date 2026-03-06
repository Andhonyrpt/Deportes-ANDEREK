import users from "../fixtures/users.json";

describe("Flujo de Registro", () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada prueba para asegurar independencia
        cy.clearLocalStorage();

        // Interceptores para debug y bypass de rate limit
        cy.intercept("GET", "**/auth/check-email*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("checkEmail");

        cy.intercept("POST", "**/auth/register", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("registerRequest");

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
        const uniqueEmail = `test_${Date.now()}@anderek.com`;

        cy.get('[data-testid="input-displayName"]').type("Dynamic User");
        cy.get('[data-testid="input-email"]').type(uniqueEmail);

        // Sin mocks, la validación de email se hace contra la API real
        cy.get('[data-testid="input-email"]').blur();
        cy.wait("@checkEmail").its("response.statusCode").should("eq", 200);

        cy.get('[data-testid="input-password"]').type("Password123!");
        cy.get('[data-testid="input-verifyPassword"]').type("Password123!");
        cy.get('[data-testid="input-phone"]').type("5551234567");

        cy.get('[data-testid="register-submit"]').click();

        // Validamos la respuesta exitosa
        cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);

        // Validamos la redirección real tras éxito en el backend con mayor timeout por si es lento
        cy.url().should("include", "/login", { timeout: 10000 });
    });
});
