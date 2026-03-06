describe("Flujo de Perfil y Pedidos", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        const mockUser = {
            _id: "user-123",
            displayName: "Test User",
            email: "test@example.com",
            role: "customer"
        };

        // Mock del perfil que la app pide al iniciar
        cy.intercept("GET", "**/api/users/profile", {
            statusCode: 200,
            body: { user: mockUser }
        }).as("getInitialProfile");

        // Seedear localStorage ANTES de visitar
        localStorage.setItem("authToken", "fake-token");
        localStorage.setItem("userData", JSON.stringify(mockUser));

        cy.visit("/", {
            onBeforeLoad: (win) => {
                win.localStorage.setItem("authToken", "fake-token");
                win.localStorage.setItem("userData", JSON.stringify(mockUser));
            }
        });

        // Esperar a que el header se renderice con el usuario
        cy.get(".greeting", { timeout: 15000 }).should("contain", "Hola Test User");
    });

    it("navega al perfil y muestra la información correctamente", () => {
        // En lugar de ir directo, clickeamos para evitar problemas de redirección profunda
        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="profile-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/profile");
        cy.get('[data-testid="profile-display-name"]', { timeout: 10000 }).should("be.visible").and("contain", "Test User");
        cy.get('[data-testid="profile-email"]').should("be.visible").and("contain", "test@example.com");
    });

    it("navega a mis pedidos y muestra el historial", () => {
        const mockOrders = [
            {
                id: "ORD-001",
                date: new Date().toISOString(),
                total: 1500,
                subtotal: 1000,
                tax: 160,
                shipping: 340,
                status: "Confirmado",
                items: [{ id: "p1", name: "Jersey Mexico", quantity: 1, price: 1000 }]
            }
        ];
        localStorage.setItem("orders", JSON.stringify(mockOrders));

        cy.get('[data-testid="user-menu-button"]').click({ force: true });
        cy.get('[data-testid="orders-link"]').should("be.visible").click({ force: true });

        cy.url().should("include", "/orders");
        cy.get('[data-testid="order-card-ORD-001"]', { timeout: 10000 }).should("be.visible").click();

        cy.get('[data-testid="order-detail-container"]').should("be.visible");
        cy.get('[data-testid="order-summary-total"]').should("contain", "$1,500.00");
    });
});
