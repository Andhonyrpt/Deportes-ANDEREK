export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
}

export function getCurrentUser() {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null;
};
