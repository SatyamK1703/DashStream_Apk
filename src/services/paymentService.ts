import apiService  from './apiService';
import { PaymentDetails, RazorpayResponse } from '../types/PaymentType';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_HISTORY_KEY = '@dashstream:payment_history';

/**
 * Create a payment order with Razorpay
 * @param bookingId The booking ID for which payment is being made
 * @param amount The amount to be paid in INR (will be converted to paise)
 * @returns Payment details including Razorpay order ID and key
 */
export const createPaymentOrder = async (bookingId: string, amount: number): Promise<PaymentDetails> => {
  try {
    // Convert amount to paise (Razorpay requires amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    const response = await apiService.post('/payments/create-order', {
      bookingId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    throw new Error(error.response?.data?.message || 'Failed to create payment order');
  }
};

/**
 * Verify payment with backend after Razorpay payment completion
 * @param paymentResponse The response from Razorpay payment
 * @returns Verification result
 */
export const verifyPayment = async (paymentResponse: RazorpayResponse) => {
  try {
    const response = await apiService.post('/payments/verify', paymentResponse);
    
    // If payment is successful, update local payment history
    if (response.data.status === 'success') {
      await updateLocalPaymentHistory(response.data.data.payment);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

/**
 * Get payment history for the current user
 * @returns Array of payment details
 */
export const getUserPayments = async (): Promise<PaymentDetails[]> => {
  try {
    // Try to get from API first
    const response = await apiService.get('/payments/user');
    const payments = response.data.data.payments;
    
    // Update local storage with latest data
    await AsyncStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(payments));
    
    return payments;
  } catch (error: any) {
    console.error('Error fetching payment history from API:', error);
    
    // Fall back to local storage if API fails
    try {
      const localPayments = await AsyncStorage.getItem(PAYMENT_HISTORY_KEY);
      return localPayments ? JSON.parse(localPayments) : [];
    } catch (storageError) {
      console.error('Error fetching payment history from storage:', storageError);
      return [];
    }
  }
};

/**
 * Update local payment history with a new payment
 * @param payment The new payment to add to history
 */
const updateLocalPaymentHistory = async (payment: any) => {
  try {
    // Get existing payment history
    const existingPaymentsJson = await AsyncStorage.getItem(PAYMENT_HISTORY_KEY);
    const existingPayments = existingPaymentsJson ? JSON.parse(existingPaymentsJson) : [];
    
    // Add new payment to the beginning of the array
    const updatedPayments = [payment, ...existingPayments];
    
    // Save updated payment history
    await AsyncStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(updatedPayments));
  } catch (error) {
    console.error('Error updating local payment history:', error);
  }
};

/**
 * Get available payment methods
 * @returns Array of payment methods
 */
export const getPaymentMethods = async () => {
  // In a real app, this would fetch from an API
  // For now, we'll return mock data
  return [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Pay securely with your card',
      icon: 'card-outline',
      isDefault: true,
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      details: 'Google Pay, PhonePe, Paytm & more',
      icon: 'phone-portrait-outline',
      isDefault: false,
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      details: 'All major banks supported',
      icon: 'business-outline',
      isDefault: false,
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Wallets',
      details: 'Paytm, PhonePe, Amazon Pay & more',
      icon: 'wallet-outline',
      isDefault: false,
    },
  ];
};

/**
 * Get payment details by ID
 * @param paymentId The payment ID
 * @returns Payment details
 */
export const getPaymentDetails = async (paymentId: string): Promise<PaymentDetails> => {
  try {
    const response = await apiService.get(`/payments/${paymentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
  }
};

/**
 * Initiate refund for a payment
 * @param paymentId The payment ID
 * @param refundData Refund details
 * @returns Refund result
 */
export const initiateRefund = async (paymentId: string, refundData: {
  amount?: number;
  notes?: string;
}) => {
  try {
    const response = await apiService.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  } catch (error: any) {
    console.error('Error initiating refund:', error);
    throw new Error(error.response?.data?.message || 'Failed to initiate refund');
  }
};

/**
 * Utility methods for payment processing
 */
export const paymentUtils = {
  generatePaymentId: (): string => {
    return 'pay_' + Math.random().toString(36).substr(2, 9);
  },

  formatAmount: (amount: number): number => {
    // Convert to paise for Razorpay (multiply by 100)
    return Math.round(amount * 100);
  },

  formatAmountFromPaise: (amountInPaise: number): number => {
    // Convert from paise to rupees (divide by 100)
    return amountInPaise / 100;
  },

  validatePaymentData: (paymentData: any): boolean => {
    const requiredFields = ['orderId', 'paymentId', 'signature'];
    return requiredFields.every(field => paymentData[field]);
  },

  // Get Razorpay options for payment
  getRazorpayOptions: (order: any, user: any, onSuccess: (response: any) => void, onError: (error: any) => void) => {
    return {
      key: order.key,
      amount: order.order.amount,
      currency: order.order.currency,
      name: 'DashStream',
      description: 'Service Payment',
      order_id: order.order.id,
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      theme: {
        color: '#2563eb',
      },
      handler: onSuccess,
      modal: {
        ondismiss: onError,
      },
    };
  }
};
