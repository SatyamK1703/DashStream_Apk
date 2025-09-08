// types.ts
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking' | 'emi';
  name: string;
  details: string;
  icon: string;
  isDefault: boolean;
  // Additional fields for UI display
  backgroundColor?: string;
  textColor?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayResponse) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentDetails {
  paymentId: string;
  order: RazorpayOrder;
  key: string;
  status?: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
  bookingId?: string;
}

export interface PaymentConfirmation {
  amount: number;
  currency: string;
  bookingId: string;
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  selectedMethod?: PaymentMethod;
}
