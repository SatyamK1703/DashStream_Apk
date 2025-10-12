// src/types/booking.ts
export interface Booking {
  id: string;
  _id?: string;
  customerId: string;
  serviceId: string;
  professionalId?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDateTime: string;
  completedDateTime?: string;

  // Service details
  serviceName: string;
  serviceCategory: string;
  basePrice: number;
  totalPrice: number;
  duration: number; // in minutes

  // Address information
  customerAddress: {
    address: string;
    landmark?: string;
    city: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  // Contact information
  customerPhone: string;
  customerName: string;

  // Additional details
  specialInstructions?: string;
  selectedOptions?: {
    id: string;
    name: string;
    price: number;
  }[];

  // Payment information
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;

  // Professional information (if assigned)
  professional?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    profileImage?: string;
  };

  // Reviews and ratings
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilter {
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  serviceId?: string;
  professionalId?: string;
}

export interface BookingStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
}