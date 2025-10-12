// src/types/notification.ts
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  type: 'booking' | 'payment' | 'promotional' | 'system' | 'reminder';
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  readAt?: string;
  
  // Action buttons (optional)
  actions?: {
    id: string;
    title: string;
    action: string;
  }[];
  
  // Associated entities
  bookingId?: string;
  serviceId?: string;
  userId?: string;
  
  // Delivery information
  channel: 'push' | 'in_app' | 'email' | 'sms';
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface NotificationSettings {
  pushEnabled: boolean;
  bookingUpdates: boolean;
  promotionalOffers: boolean;
  systemAlerts: boolean;
  reminderNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
}

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}