export function generateRandomUser() {
    const id = `${__VU}_${__ITER}_${new Date().getTime()}`;
    const phone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    return {
        displayName: `TestUser_${id}`,
        email: `testuser_${id}@example.com`,
        password: 'Password123!',
        phone: phone,
    };
}
