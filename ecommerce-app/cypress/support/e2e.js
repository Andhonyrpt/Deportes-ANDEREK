import './commands'

Cypress.on('uncaught:exception', (err, runnable) => {
    // Si el error es sobre 'document' o 'null', lo ignoramos
    if (err.message.includes("Cannot read properties of null (reading 'document')")) {
        return false;
    }
    // Para otros errores, dejamos que el test falle
    return true;
});
