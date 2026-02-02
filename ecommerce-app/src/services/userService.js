import { http } from "./http";

export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  return token !== null;
}

export const getUserProfile = async () => {
  //requiresAuth: true
  try {
    const res = await http.get('users/profile');
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