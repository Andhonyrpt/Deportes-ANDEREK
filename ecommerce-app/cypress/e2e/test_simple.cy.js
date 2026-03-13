describe("Sanity Check", () => {
    it("visita la página de inicio", () => {
        cy.visit("/");
        cy.get("h1", { timeout: 10000 }).should("be.visible");
    });
});
