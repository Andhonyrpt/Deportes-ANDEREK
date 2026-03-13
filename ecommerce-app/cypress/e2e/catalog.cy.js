describe("Flujo de Catálogo y Búsqueda", () => {
    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptor para bypass de rate limit (sin mocks)
        cy.intercept("GET", "**/products*", (req) => {
            req.headers['x-load-test'] = 'true';
            req.headers['Cache-Control'] = 'no-cache';
        }).as("getProducts");

        cy.visit("/");
    });

    it("busca productos por texto", () => {
        const searchTerm = "Manchester United";
        cy.get('[data-testid="search-input"]').type(searchTerm);
        cy.get('[data-testid="search-submit"]').click();

        cy.wait("@getProducts").its("response.statusCode").should("eq", 200);
        cy.url().should("include", `q=${searchTerm.replace(" ", "%20")}`);

        // Validamos que aparezca el producto real de la DB
        cy.contains("Jersey Manchester United Local 2024").should("be.visible");
    });

    it("navega por categorías desde el menú", () => {
        cy.get('[data-testid="category-menu-button"]').click();
        // Usamos contains para buscar el texto de la categoría ya que los IDs son dinámicos
        cy.get(".category-group a").first().should("be.visible").click();

        cy.url().should("include", "/category/");
        // El catálogo debe cargar productos reales de la categoría
        cy.get(".product-card", { timeout: 10000 }).should("have.length.at.least", 1);
    });

    it("muestra error al buscar algo que no existe", () => {
        cy.get('[data-testid="search-input"]').type("Inexistente_Super_Jersey_9999");
        cy.get('[data-testid="search-submit"]').click();

        cy.wait("@getProducts").its("response.statusCode").should("eq", 200);
        cy.contains("No encontramos coincidencias").should("be.visible");
    });
});
