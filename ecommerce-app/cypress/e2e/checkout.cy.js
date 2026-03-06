describe("Flujo de Checkout (4 Fases)", () => {
    const mockProduct = {
        _id: "prod-001",
        name: "Jersey Real Madrid 2024",
        price: 1200,
        imagesUrl: ["http://example.com/jersey.jpg"],
        description: "Jersey oficial de local",
        variants: [{ size: "M", stock: 10 }]
    };

    beforeEach(() => {
        cy.clearLocalStorage();

        // Cargar fixtures de usuario y mockear sesión
        cy.fixture("users").then((users) => {
            const user = users.existingUser;
            const userData = { ...user, id: "user-123", role: "customer" };

            // Mock de perfil de usuario
            cy.intercept("GET", "**/users/profile", {
                statusCode: 200,
                body: { user: userData }
            }).as("getUserProfile");

            // Establecer sesión manualmente para saltar login
            cy.window().then((win) => {
                win.localStorage.setItem("authToken", "mock-token-123");
                win.localStorage.setItem("userData", JSON.stringify(userData));
            });
        });

        // Mock de productos
        cy.intercept("GET", "**/products*", {
            statusCode: 200,
            body: { products: [mockProduct] }
        }).as("getProducts");

        // Agregar producto al carrito vía localStorage
        const cartData = [{
            ...mockProduct,
            quantity: 1,
            selectedSize: "M"
        }];
        cy.window().then((win) => {
            win.localStorage.setItem("cart", JSON.stringify(cartData));
        });

        cy.visit("/checkout");
    });

    it("completa el flujo de checkout exitosamente", () => {
        // Asegurarse de que no estamos en login (redirección fallida)
        cy.url().should("include", "/checkout");

        // Fase 1: Dirección de envío
        // Si no hay direcciones, clic en agregar
        cy.get('[data-testid="add-address-button"]').click();

        cy.get('[data-testid="address-name"]').type("Juan Pérez");
        cy.get('[data-testid="address-address1"]').type("Calle Falsa 123");
        cy.get('[data-testid="address-city"]').type("CDMX");
        cy.get('[data-testid="address-state"]').type("CDMX");
        cy.get('[data-testid="address-postalCode"]').type("01000");
        cy.get('[data-testid="address-country"]').type("México");
        cy.get('[data-testid="address-phone"]').type("5512345678");
        cy.get('[data-testid="address-submit"]').click();

        // Verificar que se guardó y seleccionó la dirección
        cy.get(".selected-address", { timeout: 10000 }).should("contain", "Juan Pérez");

        // Fase 2: Método de pago
        // Si no hay pagos, clic en agregar
        cy.get('[data-testid="add-payment-button"]').click();

        cy.get('[data-testid="payment-bankName"]').type("Mi Banco");
        cy.get('[data-testid="payment-cardNumber"]').type("4242424242424242");
        cy.get('[data-testid="payment-cardHolderName"]').type("Juan Pérez");
        cy.get('[data-testid="payment-expiryDate"]').type("12/28");
        cy.get('[data-testid="payment-cvv"]').type("123");
        cy.get('[data-testid="payment-submit"]').click();

        // Verificar que se guardó y seleccionó el pago
        cy.get(".selected-payment", { timeout: 10000 }).should("contain", "Mi Banco");
        cy.get(".selected-payment").should("contain", "4242");

        // Fase 3: Revisión de totales
        // Subtotal: 1200
        // IVA (16%): 192
        // Envío (Subtotal >= 1000 => Gratis): 0
        // Total: 1392
        cy.get('[data-testid="summary-subtotal"]').parent().should("contain", "$1,200.00");
        cy.get('[data-testid="summary-tax"]').parent().should("contain", "$192.00");
        cy.get('[data-testid="summary-shipping"]').parent().should("contain", "Gratis");
        cy.get('[data-testid="summary-total"]').parent().should("contain", "$1,392.00");

        // Fase 4: Confirmación
        cy.get('[data-testid="pay-button"]').click();

        // Verificar redirección
        cy.url().should("include", "/order-confirmation");
        cy.get("h1").should("contain", "¡Gracias por tu compra!");
        cy.get(".confirmation-message").should("contain", "confirmado");

        // Verificar que el carrito esté vacío
        cy.window().then((win) => {
            const cart = JSON.parse(win.localStorage.getItem("cart") || "[]");
            expect(cart).to.have.length(0);
        });
    });
});
