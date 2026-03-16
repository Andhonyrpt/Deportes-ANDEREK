describe("Flujo de Perfil y Pedidos", () => {
    let userData; // Almacenará los datos devueltos por loginByApi

    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptores para bypass de rate limit (sin mocks)
        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProfile");

        // Login vía API y capturar datos
        cy.loginByApi("customer@test.com", "Password123!").then((data) => {
            userData = data.user;
        });

        cy.visit("/");
        // Esperamos a que el profile se cargue en el header
        cy.wait("@getProfile");
    });

    it("navega a mis pedidos y muestra el historial (vacío o con datos reales)", () => {
        cy.get(".greeting", { timeout: 15000 })
            .should("be.visible")
            .and("contain", `Hola ${userData.displayName}`);

        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="orders-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/orders");
        // Como el usuario es nuevo, validamos que el contenedor esté cargado
        cy.get(".orders-page", { timeout: 10000 }).should("be.visible");
    });
});
