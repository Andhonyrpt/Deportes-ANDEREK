describe("Configuración de Perfil y Seguridad", () => {
    beforeEach(() => {
        cy.loginByApi("customer@test.com", "Password123!");
        cy.visit("/profile");
    });

    it("debe editar el perfil con éxito", () => {
        cy.get('[data-cy="edit-profile-btn"]').click();
        cy.get('input[name="displayName"]').clear().type("Nuevo Nombre Test");
        cy.get('[data-cy="save-profile"]').click();
        cy.get('[data-cy="success-message"]').should('be.visible');
        cy.get('.greeting').should('contain', 'Nuevo Nombre Test');
    });

    it("debe cambiar la contraseña con éxito", () => {
        cy.get('[data-cy="password-settings-link"]').click();
        cy.get('input[name="currentPassword"]').type("Password123!");
        cy.get('input[name="newPassword"]').type("NewSecurePass123!");
        cy.get('input[name="confirmPassword"]').type("NewSecurePass123!");
        cy.get('[data-cy="submit-password"]').click();
        cy.get('[data-cy="success-message"]').should('be.visible');
    });
});
