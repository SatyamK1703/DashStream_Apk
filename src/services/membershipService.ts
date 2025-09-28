import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Membership, UserMembership } from '../types/api';

class MembershipService {
  /**
   * Get all available membership plans
   */
  async getMembershipPlans(): Promise<ApiResponse<Membership[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.MEMBERSHIPS.PLANS);
    } catch (error) {
      console.error('Get membership plans error:', error);
      throw error;
    }
  }

  /**
   * Get current user's membership
   */
  async getMyMembership(): Promise<ApiResponse<{
    membership?: UserMembership;
    benefits: string[];
    remainingDays: number;
    discountPercentage: number;
  }>> {
    try {
      return await httpClient.get(API_ENDPOINTS.MEMBERSHIPS.MY_MEMBERSHIP);
    } catch (error) {
      console.error('Get my membership error:', error);
      throw error;
    }
  }

  /**
   * Purchase a membership plan
   */
  async purchaseMembership(data: {
    membershipId: string;
    paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
  }): Promise<ApiResponse<{
    orderId: string;
    amount: number;
    currency: string;
    key: string; // Razorpay key
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
  }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.MEMBERSHIPS.PURCHASE, data);
    } catch (error) {
      console.error('Purchase membership error:', error);
      throw error;
    }
  }

  /**
   * Verify membership payment
   */
  async verifyMembershipPayment(data: {
    orderId: string;
    paymentId: string;
    signature: string;
    membershipId: string;
  }): Promise<ApiResponse<{
    verified: boolean;
    userMembership: UserMembership;
  }>> {
    try {
      return await httpClient.post('/memberships/verify-payment', data);
    } catch (error) {
      console.error('Verify membership payment error:', error);
      throw error;
    }
  }

  /**
   * Cancel membership
   */
  async cancelMembership(reason?: string): Promise<ApiResponse<{
    cancelled: boolean;
    refundAmount?: number;
    refundProcessingDays?: number;
  }>> {
    try {
      return await httpClient.post('/memberships/cancel', { reason });
    } catch (error) {
      console.error('Cancel membership error:', error);
      throw error;
    }
  }

  /**
   * Get membership usage history
   */
  async getMembershipUsage(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    booking: string;
    service: string;
    discountApplied: number;
    savings: number;
    usedAt: string;
  }>>> {
    try {
      return await httpClient.get('/memberships/usage-history', { params });
    } catch (error) {
      console.error('Get membership usage error:', error);
      throw error;
    }
  }

  /**
   * Calculate membership benefits for a booking
   */
  async calculateMembershipBenefits(data: {
    serviceId: string;
    amount: number;
  }): Promise<ApiResponse<{
    eligible: boolean;
    discount: number;
    savings: number;
    finalAmount: number;
  }>> {
    try {
      return await httpClient.post('/memberships/calculate-benefits', data);
    } catch (error) {
      console.error('Calculate membership benefits error:', error);
      throw error;
    }
  }

  /**
   * Renew membership
   */
  async renewMembership(data: {
    membershipId?: string; // If different plan
    paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
  }): Promise<ApiResponse<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
  }>> {
    try {
      return await httpClient.post('/memberships/renew', data);
    } catch (error) {
      console.error('Renew membership error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const membershipService = new MembershipService();
export default membershipService;