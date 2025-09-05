import apiService from './apiService';
import { API_CONFIG } from '../constants/config';
import { PaymentDetails, RazorpayResponse } from '../types/PaymentType';

// Use payment endpoints from API_CONFIG
const PAYMENT_ENDPOINTS = API_CONFIG.ENDPOINTS.PAYMENTS;

/**
 * Create a payment order
 * @param bookingId - Booking ID
 * @param amount - Amount to be paid
 * @param notes - Additional notes for the payment
 * @returns Payment details including Razorpay order
 */
export const createPaymentOrder = async (
  bookingId: string,
  amount: number,
  notes?: Record<string, string>
): Promise<PaymentDetails> => {
  try {
    const response = await apiService.post(PAYMENT_ENDPOINTS.CREATE_ORDER, {
      bookingId,
      amount,
      notes,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create payment order');
  }
};

/**
 * Verify payment after successful Razorpay transaction
 * @param paymentResponse - Response from Razorpay
 * @returns Payment verification result
 */
export const verifyPayment = async (paymentResponse: RazorpayResponse) => {
  try {
    const response = await apiService.post(PAYMENT_ENDPOINTS.VERIFY_PAYMENT, paymentResponse);
    return response.data;
  } catch (error: any) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

/**
 * Get all payments for the current user
 * @returns List of user payments
 */
export const getUserPayments = async () => {
  try {
    const response = await apiService.get(PAYMENT_ENDPOINTS.USER_PAYMENTS);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user payments:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
  }
};

/**
 * Get payment details by ID
 * @param paymentId - Payment ID
 * @returns Payment details
 */
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const url = PAYMENT_ENDPOINTS.PAYMENT_DETAILS.replace(':id', paymentId);
    const response = await apiService.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
  }
};