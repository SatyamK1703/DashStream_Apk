export interface Booking {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  professional?: {
    _id: string;
    name: string;
    phone: string;
    rating: number;
    profileImage?: string;
    experience?: string;
    specialization?: string;
  };
  service: {
    _id: string;
    title: string;
    price: number;
    duration: number;
    image?: string;
    description?: string;
    category?: string;
    vehicleType?: string;
  };
  vehicle: {
    type: '2 Wheeler' | '4 Wheeler';
    brand?: string;
    model?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  trackingUpdates: TrackingUpdate[];
  price: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi';
  paymentId?: string;
  notes?: string;
  rating?: {
    score: number;
    review?: string;
    createdAt: string;
  };
  additionalServices?: {
    service: {
      _id: string;
      title: string;
      price: number;
    };
    price: number;
  }[];
  totalAmount: number;
  estimatedDuration: number;
  actualStartTime?: string;
  actualEndTime?: string;
  cancellationReason?: string;
  cancellationTime?: string;
  isRescheduled: boolean;
  previousSchedule?: {
    date: string;
    time: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrackingUpdate {
  status: string;
  message?: string;
  timestamp: string;
  updatedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface BookingStats {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface MonthlyStats {
  _id: {
    month: number;
    year: number;
  };
  count: number;
  totalAmount: number;
}

export interface BookingResponse {
  status: 'success';
  results: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  bookings: Booking[];
}

export interface SingleBookingResponse {
  status: 'success';
  booking: Booking;
}

export interface BookingStatsResponse {
  status: 'success';
  data: {
    stats: BookingStats[];
    monthlyStats: MonthlyStats[];
  };
}

export interface CreateBookingRequest {
  service: string;
  professional?: string;
  vehicle: {
    type: '2 Wheeler' | '4 Wheeler';
    brand?: string;
    model?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'upi';
  additionalServices?: {
    service: string;
    price: number;
  }[];
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  message?: string;
  cancellationReason?: string;
  rescheduleDate?: string;
  rescheduleTime?: string;
}

export interface RateBookingRequest {
  score: number;
  review?: string;
}

export interface AddTrackingUpdateRequest {
  status: string;
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
