// cypress/support/commands.js

// cypress/support/commands.js

Cypress.Commands.add("registerUser", (userData) => {
    return cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/auth/register`,
        headers: { "x-load-test": "true" },
        body: userData,
        failOnStatusCode: false
    }).then((res) => {
        // Permitimos 400 si el usuario ya existe para reuso en tests consecutivos
        if (res.status !== 201 && res.status !== 400) {
            throw new Error(`Registration failed: ${res.status} ${JSON.stringify(res.body)}`);
        }
    });
});

Cypress.Commands.add("loginByApi", (email, password) => {
    cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/auth/login`,
        headers: { "x-load-test": "true" },
        body: { email, password },
        failOnStatusCode: false,
    }).then((loginRes) => {
        if (loginRes.status !== 200) {
            throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
        }
        const { token, refreshToken } = loginRes.body;
        
        return cy.request({
            method: "GET",
            url: `${Cypress.env("apiUrl")}/users/profile`,
            headers: {
                Authorization: `Bearer ${token}`,
                "x-load-test": "true"
            }
        }).then((profileRes) => {
            const user = profileRes.body.user;
            
            // Requerimos que ya se haya visitado el origen (e.g. cy.visit('/')) en el test
            // para que cy.window() apunte al origin correcto.
            return cy.window().then((win) => {
                win.localStorage.setItem("authToken", token);
                win.localStorage.setItem("refreshToken", refreshToken);
                win.localStorage.setItem("userData", JSON.stringify(user));
                win.localStorage.setItem("auth_debug_status", "logged_in_by_api");
            });
        });
    });
});

Cypress.Commands.add("addProductToCart", (productId, quantity = 1, size = "M") => {
    return cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        if (token) {
            return cy.request({
                method: "POST",
                url: `${Cypress.env("apiUrl")}/cart/add`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-load-test": "true"
                },
                body: {
                    productId,
                    quantity,
                    size
                }
            });
        } else {
            // Fallback or handle guest cart if applicable
            cy.log("No auth token found for addProductToCart");
        }
    });
});
