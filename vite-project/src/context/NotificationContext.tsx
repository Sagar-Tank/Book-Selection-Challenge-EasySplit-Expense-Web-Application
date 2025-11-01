import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    onSnapshot,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!currentUser) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            // Query notifications by userId (uid) first
            const q1 = query(
                collection(db, 'notifications'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const snapshot1 = await getDocs(q1);
            let loadedNotifications = snapshot1.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));

            // Also query by email if email exists
            if (currentUser.email) {
                try {
                    const q2 = query(
                        collection(db, 'notifications'),
                        where('userId', '==', currentUser.email),
                        orderBy('createdAt', 'desc'),
                        limit(50)
                    );
                    const snapshot2 = await getDocs(q2);
                    const emailNotifications = snapshot2.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Notification));

                    // Merge and deduplicate
                    const allNotifications = [...loadedNotifications, ...emailNotifications];
                    const uniqueNotifications = Array.from(
                        new Map(allNotifications.map(n => [n.id, n])).values()
                    );
                    loadedNotifications = uniqueNotifications.sort((a, b) => b.createdAt - a.createdAt);
                } catch (emailError) {
                    // Firestore doesn't support OR queries, so we handle this separately
                    console.error('Error loading notifications by email:', emailError);
                }
            }

            setNotifications(loadedNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Set up real-time listener
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribes: Array<() => void> = [];

        // Listen for notifications by userId
        const q1 = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe1 = onSnapshot(q1, (snapshot) => {
            const loadedNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));

            // Also listen for email-based notifications if email exists
            if (currentUser.email) {
                const q2 = query(
                    collection(db, 'notifications'),
                    where('userId', '==', currentUser.email),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );

                const unsubscribe2 = onSnapshot(q2, (snapshot2) => {
                    const emailNotifications = snapshot2.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Notification));

                    // Merge and deduplicate
                    const allNotifications = [...loadedNotifications, ...emailNotifications];
                    const uniqueNotifications = Array.from(
                        new Map(allNotifications.map(n => [n.id, n])).values()
                    );
                    const sortedNotifications = uniqueNotifications.sort((a, b) => b.createdAt - a.createdAt);
                    setNotifications(sortedNotifications);
                    setLoading(false);
                }, (error) => {
                    console.error('Error in email notifications listener:', error);
                    setNotifications(loadedNotifications);
                    setLoading(false);
                });

                unsubscribes.push(unsubscribe2);
            } else {
                setNotifications(loadedNotifications);
                setLoading(false);
            }
        }, (error) => {
            console.error('Error in notifications listener:', error);
            setLoading(false);
        });

        unsubscribes.push(unsubscribe1);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [currentUser]);

    const markAsRead = async (notificationId: string) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;

        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            const updatePromises = unreadNotifications.map(notification =>
                updateDoc(doc(db, 'notifications', notification.id), {
                    read: true
                })
            );
            await Promise.all(updatePromises);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const refreshNotifications = async () => {
        await loadNotifications();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

