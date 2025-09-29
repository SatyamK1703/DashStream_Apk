// src/store/paymentStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PaymentDetails, PaymentMethod } from '../types/api';
import { paymentService } from '../services';
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
  removePaymentMethod: (id: string) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
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
      set({ paymentMethods: [...paymentMethods, method] });
    },

    removePaymentMethod: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await paymentService.removePaymentMethod(id);
        
        if (response.success) {
          const { paymentMethods, selectedPaymentMethod } = get();
          const updatedMethods = paymentMethods.filter(method => method.id !== id);
          
          set({ 
            paymentMethods: updatedMethods,
            selectedPaymentMethod: selectedPaymentMethod?.id === id ? null : selectedPaymentMethod,
            isLoading: false 
          });
        } else {
          throw new Error(response.message || 'Failed to remove payment method');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to remove payment method';
        set({ error: errorMsg, isLoading: false });
        showErrorNotification(errorMsg);
      }
    },

    updatePaymentMethod: async (id: string, updates: Partial<PaymentMethod>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await paymentService.updatePaymentMethod(id, updates);
        
        if (response.success) {
          const { paymentMethods } = get();
          const updatedMethods = paymentMethods.map(method =>
            method.id === id ? { ...method, ...updates } : method
          );
          
          set({ paymentMethods: updatedMethods, isLoading: false });
        } else {
          throw new Error(response.message || 'Failed to update payment method');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update payment method';
        set({ error: errorMsg, isLoading: false });
        showErrorNotification(errorMsg);
      }
    },

    setSelectedPaymentMethod: (selectedPaymentMethod: PaymentMethod | null) => {
      set({ selectedPaymentMethod });
    },

    fetchPaymentHistory: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await paymentService.getPaymentHistory();
        
        if (response.success && response.data) {
          set({ paymentHistory: response.data, isLoading: false });
        } else {
          set({ 
            error: response.message || 'Failed to fetch payment history',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching payment history:', error);
        set({ 
          error: error.message || 'Failed to fetch payment history',
          isLoading: false 
        });
      }
    },

    fetchPaymentMethods: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await paymentService.getPaymentMethods();
        
        if (response.success && response.data) {
          set({ paymentMethods: response.data, isLoading: false });
        } else {
          set({ 
            error: response.message || 'Failed to fetch payment methods',
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
      set({ 
        isLoading: true, 
        error: null,
        currentTransaction: {
          amount,
          bookingId,
          status: 'processing'
        }
      });
      
      try {
        const paymentMethod = method || get().selectedPaymentMethod;
        if (!paymentMethod) {
          throw new Error('No payment method selected');
        }

        const response = await paymentService.processPayment({
          amount,
          bookingId,
          paymentMethodId: paymentMethod.id,
        });
        
        if (response.success && response.data) {
          set({ 
            currentTransaction: {
              id: response.data.transactionId,
              amount,
              bookingId,
              status: 'completed'
            },
            isLoading: false 
          });
          
          const { paymentHistory } = get();
          set({ 
            paymentHistory: [response.data, ...paymentHistory] 
          });
          
          return { 
            success: true, 
            transactionId: response.data.transactionId 
          };
        } else {
          set({ 
            currentTransaction: {
              amount,
              bookingId,
              status: 'failed'
            },
            error: response.message || 'Payment failed',
            isLoading: false 
          });
          
          return { 
            success: false, 
            error: response.message || 'Payment failed' 
          };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Payment processing failed';
        
        set({ 
          currentTransaction: {
            amount,
            bookingId,
            status: 'failed'
          },
          error: errorMsg,
          isLoading: false 
        });
        
        showErrorNotification(errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    refundPayment: async (transactionId: string, amount?: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await paymentService.refundPayment({
          transactionId,
          amount,
        });
        
        if (response.success) {
          const { paymentHistory } = get();
          const updatedHistory = paymentHistory.map(payment =>
            payment.transactionId === transactionId
              ? { ...payment, status: 'refunded' as const, refundedAt: new Date().toISOString() }
              : payment
          );
          
          set({ paymentHistory: updatedHistory, isLoading: false });
          return { success: true };
        } else {
          const error = response.message || 'Refund failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Refund processing failed';
        set({ error: errorMsg, isLoading: false });
        showErrorNotification(errorMsg);
        return { success: false, error: errorMsg };
      }
    },

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
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    },
  }))
);