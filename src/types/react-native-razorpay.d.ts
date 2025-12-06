declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency?: string;
    key?: string;
    amount?: number | string;
    name?: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayCheckout {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  }

  const RazorpayCheckout: RazorpayCheckout;
  export = RazorpayCheckout;
}
