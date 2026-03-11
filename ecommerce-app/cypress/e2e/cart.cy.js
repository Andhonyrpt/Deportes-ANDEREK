describe("Flujo de Carrito de Compras", () => {
    let testUser;
    // Productos reales de la DB (Manchester United y Liverpool)
    const product1 = { _id: "6944dac27ec1961401dfe198", name: "Jersey Manchester United Local 2024", price: 1249 };
    const product2 = { _id: "6944db637ec1961401dfe19b", name: "Jersey Liverpool Visitante 2024", price: 1199 };

    before(() => {
        testUser = {
            displayName: "Cart Test User",
            email: `cart_test_${Date.now()}@anderek.com`,
            password: "Password123!",
            phone: "1234567890"
        };
        cy.registerUser(testUser);
    });

    beforeEach(() => {
        cy.clearLocalStorage();

        // Interceptores para bypass de rate limit y debug
        cy.intercept("GET", "**/products*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getProducts");

        cy.intercept("GET", "**/cart/*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("getCart");

        cy.intercept("POST", "**/cart/add", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("addToCartReq");

        cy.intercept("PATCH", "**/cart/update", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("updateCartReq");

        cy.intercept("DELETE", "**/cart/remove/*", (req) => {
            req.headers['x-load-test'] = 'true';
        }).as("removeCartReq");

        // Visitamos / primero para que loginByApi pueda acceder a cy.window()
        cy.visit("/");

        // Login vía API para estar autenticado
        cy.loginByApi(testUser.email, testUser.password);

        // Esperamos a que los productos iniciales carguen (gatillados por el primer visit)
        cy.wait("@getProducts");
    });

    it("agrega un producto al carrito correctamente", () => {
        // Buscamos el producto para asegurar que está visible
        cy.get('[data-testid="search-input"]').type(product1.name);
        cy.get('[data-testid="search-submit"]').click();
        cy.wait("@getProducts");

        // Ahora sí, lo agregamos
        cy.contains(product1.name).parents(".product-card").find('[data-testid="add-to-cart-button"]').click();

        cy.wait("@addToCartReq").its("response.statusCode").should("eq", 200);

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
        cy.get('[data-testid="quantity-increment"]').click();
        cy.wait("@updateCartReq").its("response.statusCode").should("eq", 200);
        cy.get('[data-testid="quantity-value"]').should("contain", "2");

        const expectedTotal = (product1.price * 2).toFixed(2);
        cy.get('[data-testid="item-total"]').should("contain", `$${expectedTotal}`);

        // Decrementar cantidad
        cy.get('[data-testid="quantity-decrement"]').click();
        cy.wait("@updateCartReq").its("response.statusCode").should("eq", 200);
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
        cy.get('[data-testid="item-total"]').should("contain", `$${product1.price.toFixed(2)}`);
    });

    it("elimina un producto del carrito", () => {
        cy.addProductToCart(product1._id, 1, "M");

        cy.visit("/cart");
        cy.wait("@getCart");

        cy.get('[data-testid="remove-item"]').click();
        cy.wait("@removeCartReq").its("response.statusCode").should("eq", 200);

        cy.contains(product1.name).should("not.exist");
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
