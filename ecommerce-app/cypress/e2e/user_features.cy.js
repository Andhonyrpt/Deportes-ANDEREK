describe("Wishlist y Notificaciones", () => {
    const testUser = {
        displayName: "Test User",
        email: `wishlist${Date.now()}@test.com`,
        password: "Password123!",
        phone: "1234567890"
    };

    before(() => {
        cy.registerUser(testUser);
    });

    beforeEach(() => {
        cy.loginByApi(testUser.email, testUser.password);
    });

    it("debe agregar y eliminar un producto de la wishlist desde el detalle", () => {
        cy.visit("/");
        // 1. Ir a detalle de producto
        cy.get('[data-testid^="product-card-"]', { timeout: 10000 }).should('be.visible').first().find('a').first().click();
        
        // 2. Agregar a Wishlist (toggle: click para añadir)
        cy.get('.product-details-wishlist-btn').click();
        
        // 3. Ir a wishlist y verificar
        cy.visit("/wishlist");
        cy.get('[data-testid^="product-card-"]', { timeout: 10000 }).should('have.length.at.least', 1);
        
        // 4. Volver a detalle para eliminar (toggle: click para quitar)
        cy.visit("/");
        cy.get('[data-testid^="product-card-"]', { timeout: 10000 }).should('be.visible').first().find('a').first().click();
        cy.get('.product-details-wishlist-btn').click();
        
        // 5. Verificar que ya no está en Wishlist
        cy.visit("/wishlist");
        cy.get('h1').should('contain', 'Tu lista de deseos está vacía');
    });

    it("debe agregar varios productos y vaciar toda la wishlist", () => {
        cy.visit("/");
        // Agregar primer producto
        cy.get('[data-testid^="product-card-"]', { timeout: 10000 }).first().find('a').first().click();
        cy.get('.product-details-wishlist-btn').click();
        cy.visit("/");
        // Agregar segundo producto
        cy.get('[data-testid^="product-card-"]').eq(1).find('a').first().click();
        cy.get('.product-details-wishlist-btn').click();
        
        cy.visit("/wishlist");
        cy.get('[data-testid^="product-card-"]').should('have.length.at.least', 2);
        
        // Vaciar lista completa
        cy.contains('button', 'Vaciar Lista').click();
        
        // Verificar vaciado
        cy.get('h1').should('contain', 'Tu lista de deseos está vacía');
    });

    it("debe mostrar mensaje cuando no hay notificaciones", () => {
        cy.visit("/");
        cy.get('.notif-btn').click();
        cy.contains('No tienes notificaciones').should('be.visible');
    });

    it("debe mostrar una nueva notificación tras simular una compra exitosa", () => {
        // 1. Obtener producto y usuario para crear orden
        cy.request({
            method: "GET",
            url: `${Cypress.env("apiUrl")}/users/profile`,
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }).then((profileRes) => {
            const userId = profileRes.body.user._id;

            cy.request(`${Cypress.env("apiUrl")}/products`).then((prodRes) => {
                const product = prodRes.body.products[0];
                
                // 2. Crear orden (esto disparará la notificación en el backend)
                cy.request({
                    method: "POST",
                    url: `${Cypress.env("apiUrl")}/orders`,
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                    body: {
                        user: userId,
                        products: [{ productId: product._id, quantity: 1, size: "M", price: product.price }],
                        shippingAddress: "69b1183fd947069ecb020630", // ID real requerido
                        paymentMethod: "69b1183fd947069ecb020635",   // ID real requerido
                        totalPrice: product.price
                    }
                }).then((orderRes) => {
                    const orderId = orderRes.body._id;

                    // 3. Refrescar / abrir menú
                    cy.visit("/");
                    cy.get('.notif-btn', { timeout: 10000 }).click();

                    // 4. Verificar que aparece
                    cy.get('.notif-item', { timeout: 10000 }).should('be.visible').and('contain', `orden #${orderId}`);
                    
                    // 5. Marcar como leída mediante clic y verificar redirección
                    cy.intercept('PATCH', '**/notifications/*/mark-read').as('markRead');
                    cy.get('.notif-item.unread').first().click();
                    cy.wait('@markRead');
                    
                    cy.url().should('include', '/orders');
                });
            });
        });
    });
});
