export interface Offer {
  _id: string;
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number; // percentage (0-100) or fixed amount
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isFeatured: boolean;
  usageLimit?: number;
  usedCount: number;
  applicableServices?: string[]; // Service IDs
  applicableCategories?: string[]; // Category names
  vehicleType?: '2 Wheeler' | '4 Wheeler' | 'Both';
  image?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferResponse {
  status: 'success';
  results: number;
  data: {
    offers: Offer[];
  };
}

export interface SingleOfferResponse {
  status: 'success';
  data: {
    offer: Offer;
  };
}

export interface CreateOfferRequest {
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  applicableServices?: string[];
  applicableCategories?: string[];
  vehicleType?: '2 Wheeler' | '4 Wheeler' | 'Both';
  image?: string;
  termsAndConditions?: string;
}

export interface UpdateOfferRequest {
  title?: string;
  description?: string;
  code?: string;
  type?: 'percentage' | 'fixed' | 'free_service';
  value?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  applicableServices?: string[];
  applicableCategories?: string[];
  vehicleType?: '2 Wheeler' | '4 Wheeler' | 'Both';
  image?: string;
  termsAndConditions?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UseOfferRequest {
  bookingId: string;
  serviceId: string;
  orderValue: number;
}

export interface ValidateOfferResponse {
  status: 'success';
  data: {
    isValid: boolean;
    discount: number;
    message: string;
  };
}

export interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  expiredOffers: number;
  totalUsage: number;
  totalDiscountGiven: number;
  popularOffers: {
    offer: Offer;
    usageCount: number;
  }[];
}
