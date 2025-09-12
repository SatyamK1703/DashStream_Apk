// Enhanced Payment Service for Production
import unifiedApiService from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';
import productionAuthService from './productionAuthService';
import { RAZORPAY_KEY_ID } from '../config/environment';

// Types
export interface PaymentOrder {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  notes?: Record<string, string>;
  razorpayOrderId: string;
  razorpayKeyId: string;
}

export interface PaymentDetails {
  orderId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  bookingId?: string;
  receipt: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerification {
  success: boolean;
  paymentId: string;
  orderId: string;
  bookingId?: string;
  amount: number;
  status: 'success' | 'failed';
  message: string;
}

export interface Payment {
  _id: string;
  user: string;
  booking?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  refundId?: string;
  refundAmount?: number;
  notes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: PaymentOrder | PaymentVerification | Payment;
  message: string;
  statusCode?: number;
}

export interface PaymentListResponse {
  success: boolean;
  data?: {
    payments: Payment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  statusCode?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  details: {
    last4?: string;
    brand?: string;
    vpa?: string;
    bank?: string;
  };
  isDefault: boolean;
}

class EnhancedPaymentService {
  private static instance: EnhancedPaymentService;

  private constructor() {}

  public static getInstance(): EnhancedPaymentService {
    if (!EnhancedPaymentService.instance) {
      EnhancedPaymentService.instance = new EnhancedPaymentService();
    }
    return EnhancedPaymentService.instance;
  }

  // Create payment order
  public async createPaymentOrder(
    bookingId: string, 
    amount: number, 
    notes?: Record<string, string>
  ): Promise<PaymentResponse> {
    try {
      console.log('💳 Creating payment order...', { bookingId, amount });

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required to create payment order'
        };
      }

      // Convert amount to paise (Razorpay requires amount in smallest currency unit)
      const amountInPaise = Math.round(amount * 100);

      const requestData = {
        bookingId,
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${bookingId}_${Date.now()}`,
        notes: {
          bookingId,
          ...notes
        }
      };

      const response = await unifiedApiService.post(
        API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_ORDER,
        requestData
      );

      if (response.success && response.data) {
        console.log('✅ Payment order created successfully');
        return {
          success: true,
          data: {
            ...response.data,
            razorpayKeyId: RAZORPAY_KEY_ID || 'rzp_live_REERfmRqrw93oG'
          } as PaymentOrder,
          message: response.message || 'Payment order created successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to create payment order',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Create payment order failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to create payment order. Please try again.',
        statusCode: error.statusCode
      };
    }
  }

  // Verify payment after Razorpay completion
  public async verifyPayment(paymentResponse: RazorpayResponse): Promise<PaymentResponse> {
    try {
      console.log('✅ Verifying payment...', paymentResponse.razorpay_order_id);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required to verify payment'
        };
      }

      const response = await unifiedApiService.post(
        API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY_PAYMENT,
        paymentResponse
      );

      if (response.success && response.data) {
        console.log('✅ Payment verified successfully');
        
        // Save payment to local storage for history
        await this.updateLocalPaymentHistory(response.data);
        
        return {
          success: true,
          data: response.data as PaymentVerification,
          message: response.message || 'Payment verified successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Payment verification failed',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        message: error.message || 'Payment verification failed. Please contact support.',
        statusCode: error.statusCode
      };
    }
  }

  // Get payment history
  public async getPaymentHistory(
    page: number = 1, 
    limit: number = 10
  ): Promise<PaymentListResponse> {
    try {
      console.log('📋 Fetching payment history...');

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY}?page=${page}&limit=${limit}`
      );

      if (response.success) {
        const payments = response.data?.payments || response.data || [];
        console.log('✅ Payment history fetched successfully:', payments.length);
        
        return {
          success: true,
          data: {
            payments,
            pagination: response.pagination
          },
          message: response.message || 'Payment history fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch payment history',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch payment history failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment history',
        statusCode: error.statusCode
      };
    }
  }

  // Get payment methods
  public async getPaymentMethods(): Promise<{ success: boolean; data?: PaymentMethod[]; message: string }> {
    try {
      console.log('💳 Fetching payment methods...');

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.METHODS);

      if (response.success) {
        const methods = response.data?.methods || response.data || [];
        console.log('✅ Payment methods fetched successfully:', methods.length);
        
        return {
          success: true,
          data: methods,
          message: response.message || 'Payment methods fetched successfully'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch payment methods'
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch payment methods failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment methods'
      };
    }
  }

  // Get payment details by ID
  public async getPaymentDetails(paymentId: string): Promise<PaymentResponse> {
    try {
      console.log('📄 Fetching payment details:', paymentId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY}/${paymentId}`
      );

      if (response.success && response.data) {
        console.log('✅ Payment details fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Payment details fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Payment not found',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch payment details failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment details',
        statusCode: error.statusCode
      };
    }
  }

  // Request refund
  public async requestRefund(paymentId: string, reason?: string): Promise<PaymentResponse> {
    try {
      console.log('💰 Requesting refund for payment:', paymentId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.post(
        `${API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY}/${paymentId}/refund`,
        { reason }
      );

      if (response.success) {
        console.log('✅ Refund requested successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Refund requested successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to request refund',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Request refund failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to request refund',
        statusCode: error.statusCode
      };
    }
  }

  // Calculate platform fee
  public calculatePlatformFee(amount: number): number {
    // Example: 2% platform fee with minimum ₹10
    const feePercentage = 0.02;
    const minFee = 10;
    const calculatedFee = amount * feePercentage;
    return Math.max(calculatedFee, minFee);
  }

  // Calculate total amount including fees
  public calculateTotalAmount(baseAmount: number, includeGst: boolean = true): {
    baseAmount: number;
    platformFee: number;
    gst: number;
    totalAmount: number;
  } {
    const platformFee = this.calculatePlatformFee(baseAmount);
    const gstRate = 0.18; // 18% GST
    const gst = includeGst ? (baseAmount + platformFee) * gstRate : 0;
    const totalAmount = baseAmount + platformFee + gst;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }

  // Format amount for display
  public formatAmount(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    }
    return amount.toFixed(2);
  }

  // Validate payment amount
  public validatePaymentAmount(amount: number): { isValid: boolean; message?: string } {
    if (amount <= 0) {
      return { isValid: false, message: 'Amount must be greater than zero' };
    }
    
    if (amount < 1) {
      return { isValid: false, message: 'Minimum payment amount is ₹1' };
    }
    
    if (amount > 200000) {
      return { isValid: false, message: 'Maximum payment amount is ₹2,00,000' };
    }

    return { isValid: true };
  }

  // Private helper methods
  private async updateLocalPaymentHistory(paymentData: any): Promise<void> {
    try {
      // This would save payment data locally for offline access
      console.log('💾 Updating local payment history');
      // Implementation would depend on your local storage strategy
    } catch (error) {
      console.warn('Failed to update local payment history:', error);
    }
  }

  // Get cached payment data for offline use
  public async getCachedPaymentData(): Promise<Payment[]> {
    try {
      // This would retrieve cached payment data for offline use
      return [];
    } catch (error) {
      console.warn('Failed to get cached payment data:', error);
      return [];
    }
  }
}

// Export singleton instance
export default EnhancedPaymentService.getInstance();