export interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image?: string;
  category: string;
  vehicleType: '2 Wheeler' | '4 Wheeler' | 'Both';
  isActive: boolean;
  professional?: {
    _id: string;
    name: string;
    rating: number;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  serviceCount: number;
}

export interface ServiceResponse {
  status: 'success';
  results: number;
  data: {
    services: Service[];
  };
}

export interface SingleServiceResponse {
  status: 'success';
  data: {
    service: Service;
  };
}

export interface ServiceCategoriesResponse {
  status: 'success';
  data: {
    categories: ServiceCategory[];
  };
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  vehicleType: '2 Wheeler' | '4 Wheeler' | 'Both';
  image?: string;
}

export interface UpdateServiceRequest {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  vehicleType?: '2 Wheeler' | '4 Wheeler' | 'Both';
  image?: string;
  isActive?: boolean;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  averagePrice: number;
  categoryBreakdown: {
    category: string;
    count: number;
  }[];
}
