export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'booking' | 'promo' | 'payment' | 'system' | 'chat';
  relatedId?: string;
  read: boolean;
  readAt?: string;
  actionType: 'open_booking' | 'open_chat' | 'open_profile' | 'open_service' | 'open_payment' | 'none';
  actionParams?: { [key: string]: any };
  image?: string;
  expiresAt?: string;
  meta?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}