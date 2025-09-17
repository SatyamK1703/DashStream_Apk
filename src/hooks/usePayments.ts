import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { paymentService } from '../services';
import { Payment } from '../types/api';

// Hook for creating payment order
export const useCreatePaymentOrder = () => {
  return useApi(
    (data: {
      bookingId: string;
      amount: number;
      currency?: string;
      paymentMethod?: 'card' | 'upi' | 'wallet' | 'netbanking'; // Made optional to match backend
      saveCard?: boolean;
      notes?: any;
    }) => paymentService.createOrder(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for verifying payment
export const useVerifyPayment = () => {
  return useApi(
    (data: {
      orderId: string;
      paymentId: string;
      signature: string;
      bookingId: string;
    }) => paymentService.verifyPayment(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for fetching payment methods
export const usePaymentMethods = () => {
  return useApi(
    () => paymentService.getPaymentMethods(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for adding payment method
export const useAddPaymentMethod = () => {
  return useApi(
    (data: {
      type: 'card' | 'upi';
      cardToken?: string;
      upiId?: string;
      setAsDefault?: boolean;
    }) => paymentService.addPaymentMethod(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for removing payment method
export const useRemovePaymentMethod = () => {
  return useApi(
    (methodId: string) => paymentService.removePaymentMethod(methodId),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for requesting refund
export const useRequestRefund = () => {
  return useApi(
    (data: {
      paymentId: string;
      amount?: number;
      reason: string;
    }) => paymentService.requestRefund(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for payment history
export const usePaymentHistory = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  return usePaginatedApi(
    (params) => paymentService.getPaymentHistory({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for payment details
export const usePaymentDetails = (paymentId: string | null) => {
  const api = useApi(
    () => paymentService.getPaymentDetails(paymentId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (paymentId) {
      api.execute();
    }
  }, [paymentId]);

  return api;
};

// Hook for validating promo code
export const useValidatePromoCode = () => {
  return useApi(
    (data: {
      code: string;
      amount: number;
      serviceId?: string;
    }) => paymentService.validatePromoCode(data),
    {
      showErrorAlert: false,
    }
  );
};