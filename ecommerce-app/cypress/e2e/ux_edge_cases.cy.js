describe("Casos de Borde y UX", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("navegación protegida redirige al login tras expiración de sesión", () => {
        // Simular que estuvimos logueados pero el token ya no está (o es inválido)
        cy.visit("/profile");
        cy.url().should("include", "/login");
    });

    it("verifica el menú móvil en resolución pequeña", () => {
        cy.viewport("iphone-x");
        cy.visit("/");

        // El botón de menú móvil debe ser visible
        cy.get(".mobile-menu-btn").should("be.visible").click();

        // El contenido del menú móvil debe aparecer
        cy.get(".mobile-menu-content").should("be.visible");
        cy.contains("Iniciar Sesión").should("be.visible");
    });

    it("maneja correctamente la ausencia de productos en el catálogo", () => {
        cy.intercept("GET", "**/products*", {
            statusCode: 200,
            body: { products: [], total: 0 }
        }).as("getEmptyProducts");

        cy.visit("/");
        cy.wait("@getEmptyProducts");

        cy.contains("No hay productos en el catálogo").should("be.visible");
    });
});
