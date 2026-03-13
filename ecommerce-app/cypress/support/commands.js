Cypress.Commands.add("registerUser", (userData) => {
    const apiUrl = Cypress.env("apiUrl") || "http://127.0.0.1:4000/api";
    cy.log(`Registering: ${userData.email} at ${apiUrl}`);
    
    return cy.request({
        method: "POST",
        url: `${apiUrl}/auth/register`,
        headers: { 'x-load-test': 'true' },
        body: userData,
        failOnStatusCode: false
    }).then((res) => {
        cy.log(`Register response: ${res.status}`);
        if (res.status !== 201 && res.status !== 400 && res.status !== 429) {
            cy.log(`Register error body: ${JSON.stringify(res.body)}`);
            throw new Error(`Registration failed: ${res.status} ${JSON.stringify(res.body)}`);
        }
    });
});

Cypress.Commands.add("loginByApi", (email, password) => {
    const apiUrl = Cypress.env("apiUrl") || "http://localhost:4000/api";
    cy.log(`Logging in: ${email} at ${apiUrl}`);

    return cy.request({
        method: "POST",
        url: `${apiUrl}/auth/login`,
        headers: { 'x-load-test': 'true' },
        body: { email, password },
        failOnStatusCode: false
    }).then((loginRes) => {
        cy.log(`Login response: ${loginRes.status}`);
        if (loginRes.status !== 200) {
            throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
        }

        const token = loginRes.body.token;
        return cy.request({
            method: "GET",
            url: `${apiUrl}/users/profile`,
            headers: { Authorization: `Bearer ${token}` }
        }).then((profileRes) => {
            cy.log(`Profile response: ${profileRes.status}`);
            const user = profileRes.body.user;
            
            return cy.window().then((win) => {
                win.localStorage.setItem("authToken", token);
                win.localStorage.setItem("userData", JSON.stringify(user));
                win.localStorage.setItem("auth_debug_status", "logged_in_by_api");
                return { token, user };
            });
        });
    });
});

Cypress.Commands.add("addProductToCart", (productId, quantity = 1, size = "M") => {
    const apiUrl = Cypress.env("apiUrl") || "http://localhost:4000/api";
    
    return cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        const userStr = win.localStorage.getItem("userData");
        const user = userStr ? JSON.parse(userStr) : null;

        if (!token || !user) {
            throw new Error("Cannot add to cart: No auth token or user data in localStorage");
        }

        return cy.request({
            method: "POST",
            url: `${apiUrl}/cart/add`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                userId: user._id,
                productId,
                quantity,
                size
            }
        });
    });
});
