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

    it("debe agregar y eliminar un producto de la wishlist", () => {
        cy.visit("/products");
        cy.get('[data-testid^="product-card-"]', { timeout: 10000 }).should('be.visible').first().find('a').first().click();
        
        cy.get('.product-details-wishlist-btn').click();
        
        cy.visit("/wishlist");
        cy.get('[data-cy="wishlist-item"]', { timeout: 10000 }).should('have.length.at.least', 1);
        
        cy.get('[data-cy="remove-wishlist-item"]').first().click();
        cy.get('[data-cy="wishlist-item"]').should('not.exist');
    });

    it("debe marcar notificación como leída", () => {
        cy.visit("/");
        // Esperar a que carguen las notificaciones en el header
        cy.get('.notif-btn', { timeout: 10000 }).click();
        
        cy.intercept('PATCH', '**/notifications/*/mark-read').as('markRead');
        
        // Esperar a que haya items
        cy.get('.notif-item', { timeout: 10000 }).should('be.visible');
        
        cy.get('.notif-item.unread').first().find('.notif-mark-item-read-btn').click();
        cy.wait('@markRead');
        
        // Verificamos que ya no tenga la clase unread
        cy.get('.notif-item').first().should('not.have.class', 'unread');
    });

    it("debe marcar notificación como leída", () => {
        cy.visit("/");
        cy.get('.notif-btn').click();
        
        cy.intercept('PATCH', '**/notifications/*/mark-read').as('markRead');
        
        // Buscamos items no leídos en el dropdown
        cy.get('.notif-item.unread').first().find('.notif-mark-item-read-btn').click();
        cy.wait('@markRead');
        
        // Verificamos que ya no tenga la clase unread
        cy.get('.notif-item').first().should('not.have.class', 'unread');
    });
});
