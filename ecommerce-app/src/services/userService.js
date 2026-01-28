import { http } from "./http";
import users from "../data/users.json";

export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  return token !== null;
}

export const getUserProfile = async () => {
  //requiresAuth: true
  try {
    const res = await http.get('users/profile', {requiresAuth: true });
    const { message, user } = res.data;

    if (!user) {
      throw new Error("No se pudo obtener el perfil");
    }

    localStorage.setItem('userData', JSON.stringify(user));
    return user;

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
