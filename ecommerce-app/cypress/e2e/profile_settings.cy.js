describe("Configuración de Perfil y Seguridad", () => {
    const testUser = {
        displayName: "Test User",
        email: `customer${Date.now()}@test.com`,
        password: "Password123!",
        phone: "1234567890"
    };

    before(() => {
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/auth/register`,
            headers: { 'x-load-test': 'true' },
            body: testUser,
            failOnStatusCode: false
        }).then((res) => {
            cy.log("Registro de prueba (Pre-before):", JSON.stringify(res.body));
        });
    });

    beforeEach(() => {
        cy.loginByApi(testUser.email, testUser.password);
        cy.visit("/profile");
    });

    it("debe editar el perfil con éxito", () => {
        cy.get('[data-testid="profile-action-editar-perfil"]').click();
        cy.get('input#edit-displayName').clear().type("Nuevo Nombre Test");
        cy.get('button[type="submit"]').contains("Guardar cambios").click();
        cy.get('.profile-success').should('be.visible').and('contain', 'Perfil actualizado correctamente.');
        cy.reload(); // Recargar para forzar actualización de datos
        cy.get('[data-testid="profile-display-name"]').should('contain', 'Nuevo Nombre Test');
    });

    it("debe cambiar la contraseña con éxito", () => {
        cy.get('[data-testid="profile-action-cambiar-contrasena"]').click();
        cy.get('input#pw-current').type("Password123!");
        cy.get('input#pw-new').type("NewSecurePass123!");
        cy.get('input#pw-confirm').type("NewSecurePass123!");
        cy.get('button[type="submit"]').contains("Cambiar contraseña").click();
        cy.get('.profile-success').should('be.visible').and('contain', 'Contraseña cambiada exitosamente.');
    });
});
