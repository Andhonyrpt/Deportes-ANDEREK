import { http } from "./http";
import users from "../data/users.json";

export const login = async (email, password) => {
  try {
    const { data } = await http.post('auth/login', {
      email, password
    });
    const token = data.token
    if (!token) throw new Error("No se recibió un token")
    localStorage.setItem('authToken', token);
    return data;
  } catch (err) {
    throw err?.message || String(err);
  }
};

export const getProfile = async () => {
  try {
    const { data } = await http.get('users/profile', { requiresAuth: true });
    if (!data || !data.user) { throw new Error("No se pudo obtener el perfil"); }
    localStorage.setItem('userData', JSON.stringify(data.user));
  } catch (err) {
    throw err?.message || String(err);
  }
};

export const fetchUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(users);
    }, 1500); // 1.5 segundos de delay
  });
};

export const searchUsers = async (query) => {
  const lowerQuery = query.trim().toLowerCase();
  return fetchUsers().then((data) =>
    data.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery)
    )
  );
};

export const getUserById = async (userId) => {
  return fetchUsers().then((data) => data.find((user) => user._id === userId));
};
