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

  class Razorpay {
    constructor(options?: any);
    open(options?: RazorpayOptions): Promise<any>;
  }

  const exported: any;
  export default exported;
}
