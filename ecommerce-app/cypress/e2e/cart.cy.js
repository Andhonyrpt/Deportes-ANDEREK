describe("Flujo de Carrito de Compras", () => {
    // Productos reales de la DB (Render API)
    const product1 = { 
        _id: "69b1183fd947069ecb02061b", 
        name: "Jersey Manchester United Local 2024", 
        price: 1249,
        variants: [{size: "S", stock: 10}, {size: "M", stock: 15}, {size: "L", stock: 5}, {size: "XL", stock: 2}]
    };
    const product2 = { 
        _id: "69b1183fd947069ecb02061d", 
        name: "Jersey Liverpool Visitante 2024", 
        price: 1199,
        variants: [{size: "S", stock: 10}, {size: "M", stock: 15}, {size: "L", stock: 5}, {size: "XL", stock: 2}]
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Login con usuario existente
        cy.loginByApi("customer@test.com", "Password123!");

        // Interceptores para bypass de rate limit y debug
        cy.intercept("GET", "**/products*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProducts");

        cy.intercept("GET", "**/cart/**", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getCart");

        cy.intercept("POST", "**/cart/add", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("addToCartReq");

        cy.intercept("PUT", "**/cart/update-item", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("updateCartReq");

        cy.intercept("DELETE", "**/cart/remove-item/**", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("removeCartReq");

        // Visitamos / después para que el token ya esté en el localStorage
        cy.visit("/");

        // Esperamos a que los productos iniciales carguen (gatillados por el primer visit)
        cy.wait("@getProducts");
    });


    it("agrega un producto al carrito correctamente", () => {
        // Buscamos el producto para asegurar que está visible
        cy.get('[data-testid="search-input"]').type(product1.name);
        cy.get('[data-testid="search-submit"]').click();
        cy.wait("@getProducts");

        // Ahora sí, lo agregamos, asegurando que esté habilitado
        cy.wait(1000); // Wait for React to hydrate
        cy.get(`[data-testid="product-card-${product1._id}"]`).find('[data-testid="add-to-cart-button"]').should('not.be.disabled').click({force: true});

        cy.wait("@addToCartReq", { timeout: 15000 }).its("response.statusCode").should("eq", 200);

        cy.visit("/cart");
        cy.wait("@getCart");

        cy.get('[data-testid="cart-container"]').should("be.visible");
        cy.contains(product1.name).should("be.visible");
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
    });

    it("modifica la cantidad de un producto en el carrito", () => {
        // Pre-poblar el carrito vía API usando nuestro comando
        cy.addProductToCart(product1._id, 1, "M");

        cy.visit("/cart");
        cy.wait("@getCart");

        // Incrementar cantidad
        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).find('[data-testid="quantity-increment"]').first().click();
        cy.wait("@updateCartReq").its("response.statusCode").should("eq", 200);
        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).find('[data-testid="quantity-value"]').should("contain", "2");

        // Decrementar cantidad
        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).find('[data-testid="quantity-decrement"]').first().click();
        cy.wait("@updateCartReq").its("response.statusCode").should("eq", 200);
        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).find('[data-testid="quantity-value"]').should("contain", "1");
    });

    it("elimina un producto del carrito", () => {
        cy.addProductToCart(product1._id, 1, "M");

        cy.visit("/cart");
        cy.wait("@getCart");

        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).find('[data-testid="remove-item"]').first().click();
        cy.wait("@removeCartReq").its("response.statusCode").should("eq", 200);

        // Await re-render
        cy.wait(1000);
        cy.get(`[data-testid="cart-item-${product1._id}-M"]`).should("not.exist");
    });

    it("mantiene los productos al recargar la página (persistencia real)", () => {
        cy.addProductToCart(product1._id, 1, "M");

        cy.visit("/cart");
        cy.wait("@getCart");
        cy.contains(product1.name).should("exist");

        cy.reload();
        cy.wait("@getCart");

        cy.contains(product1.name).should("be.visible");
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
    });
});
