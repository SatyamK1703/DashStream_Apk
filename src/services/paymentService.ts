import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Payment } from '../types/api';

class PaymentService {
  /**
   * Get available payment methods
   */
  async getAvailablePaymentMethods(params?: {
    serviceIds?: string[];
    orderValue?: number;
  }): Promise<ApiResponse<{
    id: string;
    type: string;
    name: string;
    description: string;
    icon: string;
    isDefault: boolean;
    fees?: {
      percentage?: number;
      fixed?: number;
      maxFee?: number;
    };
    codSettings?: {
      minAmount?: number;
      maxAmount?: number;
      collectBeforeService?: boolean;
      allowPartialPayment?: boolean;
    };
  }[]>> {
    try {
      return await httpClient.get('/payment-methods', { params });
    } catch (error) {
      console.error('Get available payment methods error:', error);
      throw error;
    }
  }

  /**
   * Create a payment order (for online payments)
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
      return await httpClient.post(API_ENDPOINTS.PAYMENTS.CREATE_ORDER, data);
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
      return await httpClient.post(API_ENDPOINTS.PAYMENTS.VERIFY_PAYMENT, data);
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Create COD payment record
   */
  async createCODPayment(data: {
    bookingId: string;
    amount: number;
    notes?: any;
  }): Promise<ApiResponse<{
    paymentId: string;
    codStatus: string;
    amount: number;
    message: string;
  }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.PAYMENTS.CREATE_ORDER.replace('create-order', 'create-cod'), data);
    } catch (error) {
      console.error('Create COD payment error:', error);
      throw error;
    }
  }

  /**
   * Collect COD payment (for professionals)
   */
  async collectCODPayment(bookingId: string, data: {
    amount: number;
    notes?: string;
  }): Promise<ApiResponse<{
    booking: any;
    message: string;
  }>> {
    try {
      return await httpClient.post(`/payments/cod/${bookingId}/collect`, data);
    } catch (error) {
      console.error('Collect COD payment error:', error);
      throw error;
    }
  }

  /**
   * Mark COD payment as failed (for professionals)
   */
  async failCODPayment(bookingId: string, data: {
    reason: string;
  }): Promise<ApiResponse<{
    booking: any;
    message: string;
  }>> {
    try {
      return await httpClient.post(`/payments/cod/${bookingId}/fail`, data);
    } catch (error) {
      console.error('Fail COD payment error:', error);
      throw error;
    }
  }

  /**
   * Get user's saved payment methods (user's cards/UPI saved in account)
   */
  async getPaymentMethods(): Promise<ApiResponse<{
    id: string;
    type: 'card' | 'upi';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    upiId?: string;
    isDefault: boolean;
    createdAt: string;
  }[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.PAYMENTS.PAYMENT_METHODS);
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
      return await httpClient.post(API_ENDPOINTS.PAYMENTS.PAYMENT_METHODS, data);
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
      return await httpClient.delete(`${API_ENDPOINTS.PAYMENTS.PAYMENT_METHODS}/${methodId}`);
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
      return await httpClient.post(API_ENDPOINTS.PAYMENTS.REFUND, data);
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
    breakdown: {
      description: string;
      amount: number;
    }[];
    refunds: {
      id: string;
      amount: number;
      status: string;
      reason: string;
      createdAt: string;
    }[];
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