import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { notificationService } from '../services';
import { Notification } from '../types/api';

// Hook for fetching notifications
export const useNotifications = (filters?: {
  type?: 'booking' | 'payment' | 'offer' | 'general';
  isRead?: boolean;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  const api = usePaginatedApi(
    (params) => notificationService.getNotifications({ ...filters, ...params }),
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
  const [preferences, setPreferences] = useState(null);
  
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
    (newPreferences: {
      booking: boolean;
      payment: boolean;
      offers: boolean;
      general: boolean;
      push: boolean;
      email: boolean;
      sms: boolean;
    }) => notificationService.updatePreferences(newPreferences),
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
    fetchApi.execute();
  }, []);

  return {
    preferences,
    loading: fetchApi.loading || updateApi.loading,
    error: fetchApi.error || updateApi.error,
    updatePreferences: updateApi.execute,
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