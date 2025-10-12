// API Types for DashStream App

export interface User {
  _id: string;
  id: string;
  name: string;
  email?: string;
  dateOfBirth?: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  profileImage?: {
    url: string;
    publicId: string;
  };
  profileComplete: boolean;
  isPhoneVerified: boolean;
  lastActive: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subCategory?: string;
  basePrice: number;
  price?: number; // Alias for basePrice, some APIs return this
  duration: number; // in minutes
  isActive: boolean;
  images: {
    url: string;
    publicId: string;
  }[];
  features: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  image: {
    url: string;
    publicId: string;
  };
  serviceCount: number;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  id: string;
  bookingId: string;
  customer: User;
  professional?: Professional;
  service?: Service;
  vehicle?: Vehicle;
  address?: Address;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  price?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  notes?: string;
  otp?: string;
  rating?: {
    rating: number;
    review: string;
  };
  review?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: {
    url: string;
  };
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  status: string;
  // Additional fields for extended professional profile
  user?: User;
  specializations?: string[];
  experience?: number; // in years
  reviewCount?: number;
  completedJobs?: number;
  isVerified?: boolean;
  documents?: {
    type: 'identity' | 'address' | 'skill';
    url: string;
    verified: boolean;
  }[];
  serviceAreas?: {
    city: string;
    radius: number; // in km
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }[];
  pricing?: {
    service: string;
    rate: number;
    type: 'fixed' | 'hourly';
  }[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  _id: string;
  owner: string; // User ID
  type: 'car' | 'motorcycle' | 'truck' | 'van';
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  _id: string;
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  code: string;
  image: {
    url: string;
    publicId: string;
  };
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  applicableServices: string[]; // Service IDs
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  booking: string; // Booking ID
  user: string; // User ID
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'upi' | 'wallet' | 'netbanking';
  gateway: 'razorpay' | 'stripe';
  transactionId: string;
  gatewayResponse: any;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  details: string;
  icon: string;
  isDefault: boolean;
}

export interface Notification {
  _id: string;
  user: string; // User ID
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'offer' | 'general';
  data?: any; // Additional data for deep linking
  isRead: boolean;
  createdAt: string;
}

export interface Membership {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  benefits: string[];
  discount: number; // percentage
  isActive: boolean;
  image: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserMembership {
  _id: string;
  user: string; // User ID
  membership: Membership;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  payment: string; // Payment ID
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  otpSent: boolean;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: User;
  // Backend may return either 'token' or 'accessToken'
  accessToken?: string;
  token?: string;
  refreshToken: string;
  isNewUser?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  profileImage?: string;
}

export interface CreateAddressRequest {
  type: 'home' | 'work' | 'other';
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  // state: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault?: boolean;
}

export interface CreateBookingRequest {
  serviceId: string;
  vehicleId?: string;
  addressId: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface CreateVehicleRequest {
  type: 'car' | 'motorcycle' | 'truck' | 'van';
  brand: string;
  model: string;

}

export interface SearchParams {
  query?: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: 'price' | 'rating' | 'popularity' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Statistics types for admin
export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  recentBookings: Booking[];
  topServices: Service[];
  monthlyStats: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  status: string;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}