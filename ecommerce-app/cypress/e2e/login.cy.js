import users from "../fixtures/users.json";

describe("Flujo de Login", () => {
    let testUser;

    before(() => {
        testUser = {
            displayName: "Login Test User",
            email: `login_test_${Date.now()}@anderek.com`,
            password: "Password123!",
            phone: "1234567890"
        };
        // Registramos al usuario real antes de las pruebas de login
        cy.registerUser(testUser);
    });

    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptores para bypass de rate limit (sin mocks)
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

    it("muestra error con credenciales incorrectas", () => {
        cy.get('[data-testid="input-email"]').type("noexiste@anderek.com");
        cy.get('[data-testid="input-password"]').type("WrongPass123!");
        cy.get('[data-testid="login-submit"]').click();

        // Validamos la respuesta real (400 o 401 segun la API)
        cy.wait("@loginRequest").its("response.statusCode").should("be.oneOf", [400, 401]);

        cy.get('[data-testid="error-message"]')
            .should("be.visible")
            .and("not.be.empty");
    });

    it("inicia sesión correctamente y redirige a /", () => {
        cy.get('[data-testid="input-email"]').type(testUser.email);
        cy.get('[data-testid="input-password"]').type(testUser.password);
        cy.get('[data-testid="login-submit"]').click();

        cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
        cy.wait("@getProfile").its("response.statusCode").should("eq", 200);

        // Verificar redirección
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

        // Verificar que hay tokens en storage
        cy.window().its("localStorage").invoke("getItem", "authToken").should("not.be.null");
    });
});
