import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { Offer } from '../types/api';

class OfferService {
  /**
   * Get all active offers
   */
  async getActiveOffers(params?: {
    category?: string;
    minOrderValue?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    try {
      return await httpClient.get(ENDPOINTS.OFFERS.ACTIVE, { params });
    } catch (error) {
      console.error('Get active offers error:', error);
      // ✅ Return empty array instead of throwing to prevent app crashes
      return { success: true, data: [] };
    }
  }

  /**
   * Get all offers (including inactive ones)
   */
  async getAllOffers(params?: {
    status?: 'active' | 'inactive' | 'expired';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    try {
      return await httpClient.get(ENDPOINTS.OFFERS.ALL, { params });
    } catch (error) {
      console.error('Get all offers error:', error);
      throw error;
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(offerId: string): Promise<ApiResponse<Offer>> {
    try {
      return await httpClient.get(ENDPOINTS.OFFERS.BY_ID(offerId));
    } catch (error) {
      console.error('Get offer by ID error:', error);
      throw error;
    }
  }

  /**
   * Apply offer code
   */
  async applyOffer(data: {
    code: string;
    amount: number;
    serviceIds?: string[];
  }): Promise<ApiResponse<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    maxDiscount?: number;
    finalAmount: number;
    message?: string;
    offer?: Offer;
  }>> {
    try {
      return await httpClient.post(ENDPOINTS.OFFERS.APPLY, data);
    } catch (error) {
      console.error('Apply offer error:', error);
      throw error;
    }
  }

  /**
   * Get personalized offers for user
   */
  async getPersonalizedOffers(): Promise<ApiResponse<{
    recommended: Offer[];
    trending: Offer[];
    expiringSoon: Offer[];
  }>> {
    try {
      const res = await httpClient.get('/offers/personalized');
      // If server returned non-JSON HTML (like a 500 page), guard against it
      if (!res || typeof res.data !== 'object') {
        if (__DEV__) console.warn('Personalized offers returned unexpected shape, returning empty fallback');
        return {
          success: true,
          status: 'success',
          message: 'Personalized offers temporarily unavailable',
          data: { recommended: [], trending: [], expiringSoon: [] },
        } as ApiResponse<any>;
      }

      return res as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get personalized offers error:', error);
      // If this is an HTML response or 5xx, return a safe empty structure
      return {
        success: true,
        status: 'success',
        message: 'Personalized offers temporarily unavailable',
        data: { recommended: [], trending: [], expiringSoon: [] },
      } as ApiResponse<any>;
    }
  }

  /**
   * Mark offer as viewed (for analytics)
   */
  async markOfferViewed(offerId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.post(`${ENDPOINTS.OFFERS.BY_ID(offerId)}/view`);
    } catch (error) {
      console.error('Mark offer viewed error:', error);
      throw error;
    }
  }

  /**
   * Get offer usage history
   */
  async getOfferUsageHistory(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    id: string;
    offer: Offer;
    usedAt: string;
    discount: number;
    orderAmount: number;
    booking?: string;
  }[]>> {
    try {
      return await httpClient.get('/offers/usage-history', { params });
    } catch (error) {
      console.error('Get offer usage history error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const offerService = new OfferService();
export default offerService;