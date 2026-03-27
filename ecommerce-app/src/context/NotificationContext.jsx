import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        if (!user?._id) return;
        const data = await getUserNotifications(user._id);
        setNotifications(data.notifications || data || []);
        
        // Calculate unread
        const unread = (data.notifications || data || []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
    };

    useEffect(() => {
        if (user?._id) {
            loadNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?._id) return;
        try {
            await markAllNotificationsAsRead(user._id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const removeNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            
            const notifToRemove = notifications.find(n => n._id === notificationId);
            if (notifToRemove && !notifToRemove.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            removeNotification,
            refreshNotifications: loadNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}
