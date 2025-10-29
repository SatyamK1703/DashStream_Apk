import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { notificationService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationPreferences = {
  booking: boolean;
  payment: boolean;
  offers: boolean;
  general: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
} | null;

const STORAGE_KEYS = {
  NOTIF_PREFERENCES: '@DashStream:notification_preferences_local',
};

// Hook for fetching notifications
export const useNotifications = (filters?: {
  type?: 'booking' | 'payment' | 'offer' | 'general';
  isRead?: boolean;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  const api = usePaginatedApi<any>(
    async (params) => {
      const res = await notificationService.getNotifications({ ...filters, ...params });
      const payload = (res as any)?.data ?? (res as any);
      const notifications = payload?.notifications ?? payload ?? [];
      // Return ApiResponse-shaped object where data is an array of notifications
      return {
        success: res.success,
        status: res.status,
        message: res.message,
        data: notifications,
        meta: res.meta,
      } as any;
    },
    {
      showErrorAlert: false,
      onSuccess: (data: any) => {
        if (data?.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      },
    }
  );

  return {
    ...api,
    unreadCount,
  };
};

// Hook for marking notification as read
export const useMarkNotificationRead = () => {
  return useApi(
    (notificationId: string) => notificationService.markAsRead(notificationId),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for marking all notifications as read
export const useMarkAllNotificationsRead = () => {
  return useApi(
    () => notificationService.markAllAsRead(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for unread count
export const useUnreadNotificationsCount = () => {
  const [count, setCount] = useState(0);
  
  const api = useApi(
    () => notificationService.getUnreadCount(),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setCount(data?.count || 0);
      },
    }
  );

  const refreshCount = () => {
    api.execute();
  };

  return {
    count,
    loading: api.loading,
    refreshCount,
  };
};

// Hook for deleting notification
export const useDeleteNotification = () => {
  return useApi(
    (notificationId: string) => notificationService.deleteNotification(notificationId),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for clearing all notifications
export const useClearAllNotifications = () => {
  return useApi(
    () => notificationService.clearAllNotifications(),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(null);
  
  const fetchApi = useApi(
    () => notificationService.getPreferences(),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setPreferences(data);
      },
    }
  );

  const updateApi = useApi(
    (newPreferences: Exclude<NotificationPreferences, null>) => notificationService.updatePreferences(newPreferences),
    {
      showErrorAlert: true,
      onSuccess: (data) => {
        if (data) {
          setPreferences(data);
        }
      },
    }
  );

  useEffect(() => {
    // Fetch preferences but swallow permission errors so UI stays usable
    const fetchPreferences = async () => {
      try {
        const res = await fetchApi.execute();
        // If server returned a local-fallback marker, res may be the local data
        if (res) {
          setPreferences((res as any).data ?? null);
          // persist locally so toggles remain consistent
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_PREFERENCES, JSON.stringify((res as any).data ?? null));
          } catch (e) {
            if (__DEV__) console.warn('Failed to persist fetched notification preferences locally:', e);
          }
        }
      } catch (err: any) {
        // Log, but don't surface an alert for permission errors
        if (__DEV__) console.warn('Failed to load notification preferences from server:', err);

        // Try to load local fallback
        try {
          const localRaw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIF_PREFERENCES);
          if (localRaw) {
            setPreferences(JSON.parse(localRaw));
            return;
          }
        } catch (e) {
          if (__DEV__) console.warn('Failed to read local notification preferences:', e);
        }

        // Ensure preferences is null so callers know it's unavailable
        setPreferences(null);
      }
    };

    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  return {
    preferences,
    loading: fetchApi.loading || updateApi.loading,
    error: fetchApi.error || updateApi.error,
    updatePreferences: async (p: Exclude<NotificationPreferences, null>) => {
      // Update server, but always persist locally so UI stays in sync
      try {
        await updateApi.execute(p);
      } catch (e) {
        if (__DEV__) console.warn('Failed to update preferences on server, saved locally instead:', e);
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_PREFERENCES, JSON.stringify(p));
        setPreferences(p);
      } catch (e) {
        if (__DEV__) console.warn('Failed to persist preferences locally after update:', e);
      }
    },
    refreshPreferences: fetchApi.execute,
  };
};

// Hook for registering FCM token
export const useRegisterFCMToken = () => {
  return useApi(
    (token: string) => notificationService.registerFCMToken(token),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for notifying admin about a new area request
export const useNotifyAreaRequest = () => {
  return useApi(
    (pincode: string) => notificationService.notifyAreaRequest(pincode),
    {
      showErrorAlert: false, // We don't need to bother the user if this fails
    }
  );
};