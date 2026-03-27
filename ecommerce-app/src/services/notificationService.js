import { http } from "./http";

/**
 * Obtener notificaciones del usuario
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserNotifications(userId) {
    try {
        const response = await http.get(`notifications/user/${userId}`);
        return response.data || [];
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

/**
 * Obtener notificaciones NO leídas del usuario
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUnreadNotifications(userId) {
    try {
        const response = await http.get(`notifications/unread/${userId}`);
        return response.data || [];
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        return [];
    }
}

/**
 * Marcar una notificación como leída
 * @param {string} notificationId
 * @returns {Promise<Object>}
 */
export async function markNotificationAsRead(notificationId) {
    try {
        const response = await http.patch(`notifications/${notificationId}/mark-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

/**
 * Marcar todas las notificaciones del usuario como leídas
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function markAllNotificationsAsRead(userId) {
    try {
        const response = await http.patch(`notifications/user/${userId}/mark-all-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
}

/**
 * Eliminar una notificación
 * @param {string} notificationId
 * @returns {Promise<Object>}
 */
export async function deleteNotification(notificationId) {
    try {
        const response = await http.delete(`notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}
