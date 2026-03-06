async function testRegister() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-load-test': 'true'
            },
            body: JSON.stringify({
                displayName: 'Node Fetch Test',
                email: `fetch_test_${Date.now()}@test.com`,
                password: 'Password123!',
                phone: '1234567890'
            })
        });
        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('DATA:', data);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

testRegister();
