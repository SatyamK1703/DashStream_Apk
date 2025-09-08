export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: 'customer' | 'professional' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: 'customer';
  addresses: Address[];
  vehicles: Vehicle[];
  membershipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  membershipExpiry?: string;
  totalBookings: number;
  totalSpent: number;
}

export interface Professional extends User {
  role: 'professional';
  rating: number;
  experience: string;
  specialization: string[];
  isAvailable: boolean;
  serviceAreas: string[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  totalJobs: number;
  totalEarnings: number;
  averageRating: number;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  landmark?: string;
}

export interface Vehicle {
  _id: string;
  type: '2 Wheeler' | '4 Wheeler';
  brand: string;
  model: string;
  year?: number;
  color: string;
  licensePlate?: string;
  isDefault: boolean;
}

export interface UserResponse {
  status: 'success';
  data: {
    user: User | Customer | Professional;
  };
}

export interface UsersResponse {
  status: 'success';
  results: number;
  data: {
    users: (User | Customer | Professional)[];
  };
}

export interface AddressesResponse {
  status: 'success';
  results: number;
  data: {
    addresses: Address[];
  };
}

export interface VehiclesResponse {
  status: 'success';
  results: number;
  data: {
    vehicles: Vehicle[];
  };
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  landmark?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  type?: 'home' | 'work' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  landmark?: string;
  isDefault?: boolean;
}

export interface CreateVehicleRequest {
  type: '2 Wheeler' | '4 Wheeler';
  brand: string;
  model: string;
  year?: number;
  color: string;
  licensePlate?: string;
  isDefault?: boolean;
}

export interface UpdateVehicleRequest {
  type?: '2 Wheeler' | '4 Wheeler';
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  isDefault?: boolean;
}

export interface UpdateProfessionalProfileRequest {
  experience?: string;
  specialization?: string[];
  serviceAreas?: string[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
}
