import axios from 'axios';

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:4000/api/auth/register', {
            displayName: 'Node Test',
            email: `node_test_${Date.now()}@test.com`,
            password: 'Password123!',
            phone: '1234567890'
        }, {
            headers: {
                'x-load-test': 'true'
            }
        });
        console.log('SUCCESS:', response.status, response.data);
    } catch (err) {
        console.error('ERROR:', err.response?.status, err.response?.data || err.message);
    }
}

testRegister();
