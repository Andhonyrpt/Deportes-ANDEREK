describe("Wishlist y Notificaciones", () => {
    beforeEach(() => {
        cy.loginByApi("customer@test.com", "Password123!");
    });

    it("debe agregar y eliminar un producto de la wishlist", () => {
        cy.visit("/products");
        cy.get('[data-cy="add-to-wishlist"]').first().click();
        
        cy.visit("/wishlist");
        cy.get('[data-cy="wishlist-item"]').should('have.length.at.least', 1);
        
        cy.get('[data-cy="remove-wishlist-item"]').first().click();
        cy.get('[data-cy="wishlist-item"]').should('not.exist');
    });

    it("debe marcar notificación como leída", () => {
        cy.visit("/notifications");
        
        cy.intercept('PATCH', '**/notifications/*/mark-read').as('markRead');
        
        cy.get('[data-cy="unread-notification"]').first().click();
        cy.wait('@markRead');
        
        cy.get('[data-cy="read-status"]').should('contain', 'Leído');
    });
});
