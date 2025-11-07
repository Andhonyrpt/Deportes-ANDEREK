const validUsers = {
    "admin@gmail.com": "admin123",
    "cliente@gmail.com": "cliente123",
    "test@gmail.com": "test123"
}

export function login(email, password) {

    if (validUsers[email] === password) {
        const token = btoa(`${email}:${Date.now()}`);

        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify({
            email,
            name: email.split("@")[0],
            loginDate: new Date().toISOString(),
            role: email.includes('admin') ? 'admin' : 'cliente'
        }));

        return { success: true, user: email };
    }
    return {
        success: false,
        user: email,
        error: "Email or password it is not correct"
    };
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
}

export function getCurrentUser() {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null;
};

export function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null;
}