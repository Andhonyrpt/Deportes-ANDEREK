describe("Flujo de Carrito de Compras", () => {
    const mockProduct = {
        _id: "prod-001",
        name: "Jersey Real Madrid 2024",
        price: 1200,
        imagesUrl: ["http://example.com/jersey.jpg"],
        description: "Jersey oficial de local",
        variants: [{ size: "M", stock: 10 }, { size: "L", stock: 5 }],
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Mock de productos iniciales en Home
        cy.intercept("GET", "**/products*", {
            statusCode: 200,
            body: { products: [mockProduct] },
        }).as("getProducts");

        cy.visit("/");
        cy.wait("@getProducts");
    });

    it("agrega un producto al carrito correctamente", () => {
        // Buscar el botón de agregar al carrito en la ProductCard
        cy.get('[data-testid="add-to-cart-button"]').first().click();

        // El sistema debería redirigir o abrir el carrito
        cy.visit("/cart");

        cy.get('[data-testid="cart-container"]').should("be.visible");
        cy.get(`[data-testid="cart-item-${mockProduct._id}"]`).should("exist");
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
    });

    it("modifica la cantidad de un producto en el carrito", () => {
        // Pre-poblar el carrito vía localStorage (Clave correcta: "cart")
        // Estructura correcta del item: { ...product, quantity, selectedSize }
        const cartData = [{
            ...mockProduct,
            quantity: 1,
            selectedSize: "M"
        }];
        cy.window().then((win) => {
            win.localStorage.setItem("cart", JSON.stringify(cartData));
        });

        cy.visit("/cart");

        // Incrementar cantidad
        cy.get('[data-testid="quantity-increment"]').click();
        cy.get('[data-testid="quantity-value"]').should("contain", "2");
        cy.get('[data-testid="item-total"]').should("contain", "$2400.00");

        // Decrementar cantidad
        cy.get('[data-testid="quantity-decrement"]').click();
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
        cy.get('[data-testid="item-total"]').should("contain", "$1200.00");
    });

    it("elimina un producto del carrito", () => {
        const cartData = [{
            ...mockProduct,
            quantity: 1,
            selectedSize: "M"
        }];
        cy.window().then((win) => {
            win.localStorage.setItem("cart", JSON.stringify(cartData));
        });

        cy.visit("/cart");

        cy.get('[data-testid="remove-item"]').click();
        cy.get(`[data-testid="cart-item-${mockProduct._id}"]`).should("not.exist");
    });

    it("mantiene los productos al recargar la página (persistencia)", () => {
        const cartData = [{
            ...mockProduct,
            quantity: 1,
            selectedSize: "M"
        }];
        cy.window().then((win) => {
            win.localStorage.setItem("cart", JSON.stringify(cartData));
        });

        cy.visit("/cart");
        cy.get(`[data-testid="cart-item-${mockProduct._id}"]`).should("exist");

        cy.reload();

        cy.get(`[data-testid="cart-item-${mockProduct._id}"]`).should("exist");
        cy.get('[data-testid="quantity-value"]').should("contain", "1");
    });
});
