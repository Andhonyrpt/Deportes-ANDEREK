import { http } from "./http";

export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  return token !== null;
}

export const getUserProfile = async () => {

  const res = await http.get('users/profile');
  const { message, user } = res.data;

  if (!user) {
    throw new Error("No se pudo obtener el perfil");
  }

  console.log(message);
  return user;
};

/**
 * @param {Object} profileData - { displayName, email, phone, avatar }
 */
export const updateUserProfile = async (profileData) => {
  const res = await http.put('users/profile', profileData);
  return res.data;
};

/**
 * @param {string} userId
 * @param {Object} passwords - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (userId, passwords) => {
  const res = await http.put(`change-password/${userId}`, passwords);
  return res.data;
};

/**
 * [ADMIN ONLY]
 * @param {Object} params - { page, limit, role, isActive }
 */
export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await http.get(`users${query ? `?${query}` : ''}`);
  return res.data;
};

/**
 * [ADMIN ONLY]
 * @param {string} userId
 * @param {Object} userData - { displayName, email, phone, avatar, role, isActive }
 */
export const updateUserAsAdmin = async (userId, userData) => {
  const res = await http.put(`users/${userId}`, userData);
  return res.data;
};