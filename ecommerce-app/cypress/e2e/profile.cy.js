describe("Flujo de Perfil y Pedidos", () => {
    let testUser;

    before(() => {
        testUser = {
            displayName: "Profile Test User",
            email: `profile_test_${Date.now()}@anderek.com`,
            password: "Password123!",
            phone: "1234567890"
        };
        cy.registerUser(testUser);
    });

    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptores para bypass de rate limit (sin mocks)
        cy.intercept("GET", "**/users/profile", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProfile");

        cy.intercept("GET", "**/orders*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getOrders");

        // Login vía API
        cy.loginByApi(testUser.email, testUser.password);

        cy.visit("/");
        // Esperamos a que el profile se cargue en el header
        cy.wait("@getProfile");
        cy.get(".greeting", { timeout: 15000 })
            .should("be.visible")
            .and("contain", `Hola ${testUser.displayName}`);
    });

    it("navega al perfil y muestra la información correctamente", () => {
        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="profile-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/profile");
        cy.get('[data-testid="profile-display-name"]', { timeout: 10000 })
            .should("be.visible")
            .and("contain", testUser.displayName);
        cy.get('[data-testid="profile-email"]')
            .should("be.visible")
            .and("contain", testUser.email);
    });

    it("navega a mis pedidos y muestra el historial (vacío o con datos reales)", () => {
        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="orders-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/orders");
        cy.wait("@getOrders").its("response.statusCode").should("eq", 200);

        // Como el usuario es nuevo, validamos que el contenedor esté pero no haya pedidos (o que cargue)
        cy.get(".orders-list-container").should("be.visible");
    });
});
