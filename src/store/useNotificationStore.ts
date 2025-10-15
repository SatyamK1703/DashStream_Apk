import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: any[];
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await notificationService.getNotifications();
      set({ notifications: response.data.notifications || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));
