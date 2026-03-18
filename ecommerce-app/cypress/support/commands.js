Cypress.Commands.add("registerUser", (userData) => {
    const apiUrl = Cypress.env("apiUrl");
    cy.log(`Registering: ${userData.email} at ${apiUrl}`);
    
    return cy.request({
        method: "POST",
        url: `${apiUrl}/auth/register`,
        headers: { 'x-load-test': 'true' },
        body: userData,
        failOnStatusCode: false,
        timeout: 60000
    }).then((res) => {
        cy.log(`Register response: ${res.status}`);
        cy.log(`Register body: ${JSON.stringify(res.body)}`);
        if (res.status !== 201 && res.status !== 400 && res.status !== 429) {
            throw new Error(`Registration failed: ${res.status} ${JSON.stringify(res.body)}`);
        }
    });
});

Cypress.Commands.add("loginByApi", (email, password) => {
    const apiUrl = Cypress.env("apiUrl");
    cy.log(`Logging in: ${email} at ${apiUrl}`);

    return cy.request({
        method: "POST",
        url: `${apiUrl}/auth/login`,
        headers: { 'x-load-test': 'true' },
        body: { email, password },
        failOnStatusCode: false,
        timeout: 60000
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

Cypress.Commands.add("clearDataByApi", () => {
    const apiUrl = Cypress.env("apiUrl");
    
    return cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        const userStr = win.localStorage.getItem("userData");
        const user = userStr ? JSON.parse(userStr) : null;

        if (!token || !user) return;

        // Limpiar carrito
        cy.request({
            method: "POST",
            url: `${apiUrl}/cart/clear`,
            headers: { Authorization: `Bearer ${token}` },
            body: { userId: user._id },
            failOnStatusCode: false
        });

        // Limpiar direcciones
        cy.request({
            method: "GET",
            url: `${apiUrl}/shipping-addresses/user-addresses`, // Corrected route
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
        }).then((res) => {
            if (res.status === 200 && res.body.addresses) {
                res.body.addresses.forEach(addr => {
                    cy.request({
                        method: "DELETE",
                        url: `${apiUrl}/shipping-addresses/delete-address/${addr._id}`, // Corrected route
                        headers: { Authorization: `Bearer ${token}` }
                    });
                });
            }
        });

        // Limpiar pagos
        cy.request({
            method: "GET",
            url: `${apiUrl}/payment-methods/user/${user._id}`, // Corrected route
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
        }).then((res) => {
            if (res.status === 200 && Array.isArray(res.body)) {
                res.body.forEach(pay => {
                    cy.request({
                        method: "DELETE",
                        url: `${apiUrl}/payment-methods/${pay._id}`,
                        headers: { Authorization: `Bearer ${token}` }
                    });
                });
            }
        });
    });
});

Cypress.Commands.add("addProductToCart", (productId, quantity = 1, size = "M") => {
    const apiUrl = Cypress.env("apiUrl");
    
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
