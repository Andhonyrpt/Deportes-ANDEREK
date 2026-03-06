// cypress/support/commands.js

// cypress/support/commands.js

Cypress.Commands.add("registerUser", (userData) => {
    return cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/auth/register`,
        headers: { "x-load-test": "true" },
        body: userData,
        failOnStatusCode: false
    });
});

Cypress.Commands.add("loginByApi", (email, password) => {
    return cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/auth/login`,
        headers: { "x-load-test": "true" },
        body: { email, password },
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status === 200) {
            const { token, refreshToken } = response.body;
            window.localStorage.setItem("authToken", token);
            window.localStorage.setItem("refreshToken", refreshToken);
            // También guardamos userData si es necesario para el contexto
            return cy.request({
                method: "GET",
                url: `${Cypress.env("apiUrl")}/users/profile`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-load-test": "true"
                }
            }).then(profileRes => {
                window.localStorage.setItem("userData", JSON.stringify(profileRes.body.user));
                return response;
            });
        }
        return response;
    });
});

Cypress.Commands.add("addProductToCart", (productId, quantity = 1, size = "M") => {
    const token = window.localStorage.getItem("authToken");
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
