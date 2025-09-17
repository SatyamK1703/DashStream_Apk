import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { Payment } from '../types/api';

class PaymentService {
  /**
   * Create a payment order
   */
  async createOrder(data: {
    bookingId: string;
    amount: number;
    currency?: string;
    paymentMethod?: 'card' | 'upi' | 'wallet' | 'netbanking'; // Made optional to match backend
    saveCard?: boolean;
    notes?: any;
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
      return await httpClient.post(ENDPOINTS.PAYMENTS.CREATE_ORDER, data);
    } catch (error) {
      console.error('Create payment order error:', error);
      throw error;
    }
  }

  /**
   * Verify payment after successful transaction
   */
  async verifyPayment(data: {
    orderId: string;
    paymentId: string;
    signature: string;
    bookingId: string;
  }): Promise<ApiResponse<{
    verified: boolean;
    payment: Payment;
    booking: any;
  }>> {
    try {
      return await httpClient.post(ENDPOINTS.PAYMENTS.VERIFY_PAYMENT, data);
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Get user's saved payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<Array<{
    id: string;
    type: 'card' | 'upi';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    upiId?: string;
    isDefault: boolean;
    createdAt: string;
  }>>> {
    try {
      return await httpClient.get(ENDPOINTS.PAYMENTS.PAYMENT_METHODS);
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: {
    type: 'card' | 'upi';
    cardToken?: string; // For cards
    upiId?: string; // For UPI
    setAsDefault?: boolean;
  }): Promise<ApiResponse<{
    id: string;
    type: string;
    added: boolean;
  }>> {
    try {
      return await httpClient.post(ENDPOINTS.PAYMENTS.PAYMENT_METHODS, data);
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(methodId: string): Promise<ApiResponse<{ removed: boolean }>> {
    try {
      return await httpClient.delete(`${ENDPOINTS.PAYMENTS.PAYMENT_METHODS}/${methodId}`);
    } catch (error) {
      console.error('Remove payment method error:', error);
      throw error;
    }
  }

  /**
   * Request refund for a payment
   */
  async requestRefund(data: {
    paymentId: string;
    amount?: number; // Partial refund amount
    reason: string;
  }): Promise<ApiResponse<{
    refundId: string;
    status: string;
    amount: number;
    estimatedSettlement: string;
  }>> {
    try {
      return await httpClient.post(ENDPOINTS.PAYMENTS.REFUND, data);
    } catch (error) {
      console.error('Request refund error:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Payment[]>> {
    try {
      return await httpClient.get('/payments/history', { params });
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  /**
   * Get payment details by ID
   */
  async getPaymentDetails(paymentId: string): Promise<ApiResponse<Payment & {
    breakdown: Array<{
      description: string;
      amount: number;
    }>;
    refunds: Array<{
      id: string;
      amount: number;
      status: string;
      reason: string;
      createdAt: string;
    }>;
  }>> {
    try {
      return await httpClient.get(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }

  /**
   * Check promo code validity
   */
  async validatePromoCode(data: {
    code: string;
    amount: number;
    serviceId?: string;
  }): Promise<ApiResponse<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    maxDiscount?: number;
    message?: string;
  }>> {
    try {
      return await httpClient.post('/payments/validate-promo', data);
    } catch (error) {
      console.error('Validate promo code error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;