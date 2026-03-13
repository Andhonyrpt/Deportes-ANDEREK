const cypress = require('cypress');
const fs = require('fs');

const logStream = fs.createWriteStream('cy_final_results.json');

cypress.run({
    spec: 'cypress/e2e/checkout.cy.js',
    browser: 'electron'
}).then((results) => {
    logStream.write(JSON.stringify(results, null, 2));
    if (results.totalFailed > 0) {
        console.error('TEST FAILED');
        results.runs[0].tests.forEach(t => {
            if (t.state === 'failed') {
                console.error('ERROR:', t.displayError);
            }
        });
    } else {
        console.log('ALL TESTS PASSED');
    }
    logStream.end();
}).catch((err) => {
    console.error('CRASHED:', err);
    logStream.end();
});
