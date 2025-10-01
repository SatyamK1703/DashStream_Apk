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
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled' | 'confirmed' | 'in-progress' | 'refunded';
  amount: string;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  services: {
    name: string;
    price: number;
  }[];
  rating?: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: 'active' | 'inactive' | 'blocked';
  totalBookings: number;
  totalSpent: number;
  membershipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  membershipExpiry?: string;
  joinDate: string;
  lastActive: string;
  addresses: Address[];
  vehicles: Vehicle[];
  bookings: Booking[];
  notes: Note[];
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle' | 'bicycle';
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate?: string;
  image?: string;
}

export interface Note {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}