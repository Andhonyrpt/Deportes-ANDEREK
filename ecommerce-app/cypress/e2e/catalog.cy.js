describe("Flujo de Catálogo y Búsqueda", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit("/");
    });

    it("busca productos por texto", () => {
        cy.intercept("GET", "**/products*", {
            statusCode: 200,
            body: {
                products: [
                    { _id: "p1", name: "Jersey Mexico", price: 1000, variants: [{ size: "M", stock: 5 }] }
                ]
            }
        }).as("searchProducts");

        cy.get('[data-testid="search-input"]').type("Mexico");
        cy.get('[data-testid="search-submit"]').click();

        cy.wait("@searchProducts");
        cy.url().should("include", "q=Mexico");
        cy.contains("Jersey Mexico").should("be.visible");
    });

    it("navega por categorías desde el menú", () => {
        cy.get('[data-testid="category-menu-button"]').click();
        // Usamos contains para buscar el texto de la categoría ya que los IDs son dinámicos
        cy.get(".category-group a").first().should("be.visible").click();

        cy.url().should("include", "/category/");
    });

    it("muestra error al buscar algo que no existe", () => {
        cy.intercept("GET", "**/products*", {
            statusCode: 200,
            body: { products: [] }
        }).as("searchEmpty");

        cy.get('[data-testid="search-input"]').type("Inexistente");
        cy.get('[data-testid="search-submit"]').click();

        cy.wait("@searchEmpty");
        cy.contains("No encontramos coincidencias").should("be.visible");
    });
});
