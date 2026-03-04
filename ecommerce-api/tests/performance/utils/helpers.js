export function generateRandomUser() {
    // Generate a unique identifier based on VU and iteration
    const id = `${__VU}_${__ITER}_${new Date().getTime()}`;
    return {
        name: `Test User ${id}`,
        email: `testuser_${id}@example.com`,
        password: 'Password123!',
        phone: `123456${id}`.substring(0, 10),
    };
}
