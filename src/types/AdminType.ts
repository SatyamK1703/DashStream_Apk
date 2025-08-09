export type BookingStatus = 'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  professionalName: string | null;
  professionalId: string | null;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  amount: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

export interface FilterOption {
  label: string;
  value: string;
}
