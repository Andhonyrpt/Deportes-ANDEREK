describe("Flujo de Notificaciones y Pedidos", () => {
    const testUser = {
        displayName: "Test User",
        email: `notif${Date.now()}@test.com`,
        password: "Password123!",
        phone: "1234567890"
    };

    before(() => {
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/auth/register`,
            body: testUser,
            failOnStatusCode: false
        });
    });

    beforeEach(() => {
        cy.loginByApi(testUser.email, testUser.password);
        cy.visit("/");
    });

    it("debe mostrar una nueva notificación tras simular un cambio de estado de orden", () => {
        // 1. Necesitamos crear una orden primero para tener un ID válido
        cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/orders`,
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('authToken')}` 
            },
            body: {
                products: [], // Adaptar según tu estructura real
                totalPrice: 100,
                shippingAddress: "Alguna dirección",
                paymentMethod: "Efectivo"
            }
        }).then((orderRes) => {
            const orderId = orderRes.body._id;

            // 2. Simulamos cambio de estado (esto debería disparar la notificación en el backend)
            cy.request({
                method: "PUT",
                url: `${Cypress.env("apiUrl")}/orders/${orderId}/status`,
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                },
                body: { status: "Enviado" }
            });

            // 3. Abrir menú de notificaciones
            cy.get('.notif-btn').click();

            // 4. Verificar que la nueva notificación aparece
            cy.get('.notif-item').should('contain', `orden #${orderId}`);
            cy.get('.notif-item').should('have.class', 'unread');
        });
    });

    it("debe marcar como leída al hacer clic y redirigir a pedidos", () => {
        cy.get('.notif-btn').click();
        
        // Clic en la notificación (esto dispara el marcado como leído y la redirección)
        cy.get('.notif-item.unread').first().click();
        
        // Verificamos redirección
        cy.url().should('include', '/orders');
        
        // Abrir de nuevo para verificar que ya no está marcada como 'unread'
        cy.get('.notif-btn').click();
        cy.get('.notif-item').should('not.have.class', 'unread');
    });
});
