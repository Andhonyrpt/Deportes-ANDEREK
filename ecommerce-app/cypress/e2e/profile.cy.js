describe("Flujo de Perfil y Pedidos", () => {
    let testUser;

    before(() => {
        const uniqueId = Date.now().toString();
        testUser = {
            displayName: "Profile Test User",
            email: `profile_test_${uniqueId}@anderek.com`,
            password: "Password123!",
            // Asegurar un número de teléfono único
            phone: `55${uniqueId.slice(-8)}`
        };
        // Registramos al usuario real antes de las pruebas de perfil
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

        // Interceptores para bypass de rate limit (sin mocks)
        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProfile");

        // Login vía API
        cy.loginByApi(testUser.email, testUser.password);

        cy.visit("/");
        // Esperamos a que el profile se cargue en el header
        cy.wait("@getProfile");
        cy.get(".greeting", { timeout: 15000 })
            .should("be.visible")
            .and("contain", `Hola ${testUser.displayName}`);
    });

    it("navega a mis pedidos y muestra el historial (vacío o con datos reales)", () => {
        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="orders-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/orders");
        // Como el usuario es nuevo, validamos que el contenedor esté cargado
        cy.get(".orders-page", { timeout: 10000 }).should("be.visible");
    });
});
