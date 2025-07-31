// types.ts
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  details: string;
  icon: string;
  isDefault: boolean;
}
