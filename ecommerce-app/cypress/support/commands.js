// cypress/support/commands.js

Cypress.Commands.add("loginByApi", (email, password) => {
    cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/auth/login`,
        body: { email, password },
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        const { token, refreshToken } = response.body;
        window.localStorage.setItem("authToken", token);
        window.localStorage.setItem("refreshToken", refreshToken);
    });
});

Cypress.Commands.add("addProductToCart", (product, quantity = 1, size = "M") => {
    cy.window().then((win) => {
        const existingCart = JSON.parse(
            win.localStorage.getItem("cartItems") || "[]"
        );

        const newItem = {
            ...product,
            quantity,
            size,
            cartKey: `${product._id || product.id}-${size}`,
        };

        const idx = existingCart.findIndex((i) => i.cartKey === newItem.cartKey);
        if (idx >= 0) {
            existingCart[idx].quantity += quantity;
        } else {
            existingCart.push(newItem);
        }

        win.localStorage.setItem("cartItems", JSON.stringify(existingCart));
    });
});
