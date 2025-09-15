// src/store/paymentStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PaymentDetails, PaymentMethod } from '../types/PaymentType';
import { getUserPayments } from '../services/paymentService';
import { showErrorNotification } from '../utils/notificationUtils';

interface PaymentState {
  // State
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentDetails[];
  isLoading: boolean;
  error: string | null;
  
  // Selected payment method
  selectedPaymentMethod: PaymentMethod | null;
  
  // Transaction state
  currentTransaction: {
    id?: string;
    amount?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    bookingId?: string;
  } | null;
  
  // Actions
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
  
  fetchPaymentHistory: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  
  // Payment processing
  processPayment: (amount: number, bookingId: string, method?: PaymentMethod) => Promise<{ success: boolean; transactionId?: string; error?: string }>;
  refundPayment: (transactionId: string, amount?: number) => Promise<{ success: boolean; error?: string }>;
  
  // Utilities
  clearPaymentError: () => void;
  getPaymentMethodById: (id: string) => PaymentMethod | null;
  getTotalSpent: () => number;
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => PaymentDetails[];
}

export const usePaymentStore = create<PaymentState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    paymentMethods: [],
    paymentHistory: [],
    isLoading: false,
    error: null,
    selectedPaymentMethod: null,
    currentTransaction: null,

    // Actions
    addPaymentMethod: (method: PaymentMethod) => {
      const { paymentMethods } = get();
      
      // Check if method already exists
      const existingMethod = paymentMethods.find(pm => 
        pm.type === method.type && pm.identifier === method.identifier
      );
      
      if (existingMethod) {
        set({ error: 'Payment method already exists' });
        return;
      }
      
      set({ 
        paymentMethods: [...paymentMethods, method],
        error: null 
      });
    },

    removePaymentMethod: (id: string) => {
      const { paymentMethods, selectedPaymentMethod } = get();
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      
      // Clear selected method if it was removed
      const newSelectedMethod = selectedPaymentMethod?.id === id ? null : selectedPaymentMethod;
      
      set({ 
        paymentMethods: updatedMethods,
        selectedPaymentMethod: newSelectedMethod 
      });
    },

    updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => {
      const { paymentMethods } = get();
      const updatedMethods = paymentMethods.map(method =>
        method.id === id ? { ...method, ...updates } : method
      );
      
      set({ paymentMethods: updatedMethods });
    },

    setSelectedPaymentMethod: (method: PaymentMethod | null) => {
      set({ selectedPaymentMethod: method });
    },

    fetchPaymentHistory: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await getUserPayments();
        
        if (response.success && response.data) {
          set({ 
            paymentHistory: response.data,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.error || 'Failed to fetch payment history',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching payment history:', error);
        set({ 
          error: error.message || 'Failed to fetch payment history',
          isLoading: false 
        });
        
        // Show error notification
        showErrorNotification('Failed to load payment history');
      }
    },

    fetchPaymentMethods: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // TODO: Implement payment methods API call
        // For now, this would be a placeholder
        const response = { success: true, data: [] };
        
        if (response.success) {
          set({ 
            paymentMethods: response.data || [],
            isLoading: false 
          });
        } else {
          set({ 
            error: 'Failed to fetch payment methods',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching payment methods:', error);
        set({ 
          error: error.message || 'Failed to fetch payment methods',
          isLoading: false 
        });
      }
    },

    processPayment: async (amount: number, bookingId: string, method?: PaymentMethod) => {
      const { selectedPaymentMethod } = get();
      const paymentMethod = method || selectedPaymentMethod;
      
      if (!paymentMethod) {
        const error = 'No payment method selected';
        set({ error });
        return { success: false, error };
      }

      set({ 
        isLoading: true, 
        error: null,
        currentTransaction: {
          amount,
          bookingId,
          status: 'pending'
        }
      });

      try {
        // TODO: Implement actual payment processing
        // This would integrate with payment gateway (Razorpay, Stripe, etc.)
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create payment record
        const paymentRecord: PaymentDetails = {
          id: transactionId,
          amount,
          currency: 'INR',
          status: 'completed',
          method: paymentMethod.type,
          bookingId,
          timestamp: new Date().toISOString(),
          gateway: 'razorpay', // or whatever gateway is used
          transactionId,
        };

        // Add to payment history
        const { paymentHistory } = get();
        set({ 
          paymentHistory: [paymentRecord, ...paymentHistory],
          currentTransaction: {
            id: transactionId,
            amount,
            bookingId,
            status: 'completed'
          },
          isLoading: false 
        });

        return { success: true, transactionId };
        
      } catch (error: any) {
        console.error('Payment processing error:', error);
        const errorMsg = error.message || 'Payment failed';
        
        set({ 
          error: errorMsg,
          currentTransaction: {
            amount,
            bookingId,
            status: 'failed'
          },
          isLoading: false 
        });

        showErrorNotification(`Payment failed: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },

    refundPayment: async (transactionId: string, amount?: number) => {
      set({ isLoading: true, error: null });

      try {
        // TODO: Implement refund API call
        // This would call the payment gateway's refund API
        
        // Simulate refund processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update payment history
        const { paymentHistory } = get();
        const updatedHistory = paymentHistory.map(payment => {
          if (payment.transactionId === transactionId) {
            return {
              ...payment,
              status: 'refunded' as any,
              refundAmount: amount || payment.amount,
              refundDate: new Date().toISOString()
            };
          }
          return payment;
        });

        set({ 
          paymentHistory: updatedHistory,
          isLoading: false 
        });

        return { success: true };
        
      } catch (error: any) {
        console.error('Refund processing error:', error);
        const errorMsg = error.message || 'Refund failed';
        
        set({ 
          error: errorMsg,
          isLoading: false 
        });

        showErrorNotification(`Refund failed: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },

    // Utility functions
    clearPaymentError: () => set({ error: null }),

    getPaymentMethodById: (id: string) => {
      const { paymentMethods } = get();
      return paymentMethods.find(method => method.id === id) || null;
    },

    getTotalSpent: () => {
      const { paymentHistory } = get();
      return paymentHistory
        .filter(payment => payment.status === 'completed')
        .reduce((total, payment) => total + payment.amount, 0);
    },

    getPaymentsByDateRange: (startDate: Date, endDate: Date) => {
      const { paymentHistory } = get();
      return paymentHistory.filter(payment => {
        const paymentDate = new Date(payment.timestamp);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    },
  }))
);