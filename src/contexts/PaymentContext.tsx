import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentDetails, PaymentMethod } from '../types/PaymentType';
import { getUserPayments } from '../services/paymentService';
import { showErrorNotification } from '../utils/notificationUtils';

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentDetails[];
  isLoading: boolean;
  error: string | null;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  fetchPaymentHistory: () => Promise<void>;
  clearPaymentError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, method]);
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
  };

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserPayments();
      setPaymentHistory(data);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || 'Failed to fetch payment history';
      setError(errorMessage);
      showErrorNotification('Payment History Error', errorMessage, err);
      console.error('Error fetching payment history:', err);
    }
  };

  const clearPaymentError = () => {
    setError(null);
  };

  const value = {
    paymentMethods,
    paymentHistory,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    fetchPaymentHistory,
    clearPaymentError,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};