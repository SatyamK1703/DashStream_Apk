import { Alert } from 'react-native';
import { PaymentMethod } from '../types/PaymentType';

export const handleAddCard = (
  cardNumber: string,
  cardName: string,
  expiryDate: string,
  cvv: string,
  setLoading: (v: boolean) => void,
  setPaymentMethods: (cb: (prev: PaymentMethod[]) => PaymentMethod[]) => void,
  resetCardForm: () => void,
  closeModal: () => void
) => {
  if (cardNumber.replace(/\s/g, '').length !== 16) {
    Alert.alert('Error', 'Please enter a valid 16-digit card number');
    return;
  }
  if (!cardName.trim()) {
    Alert.alert('Error', 'Please enter the name on card');
    return;
  }
  if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
    Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
    return;
  }
  if (cvv.length !== 3) {
    Alert.alert('Error', 'Please enter a valid 3-digit CVV');
    return;
  }

  setLoading(true);
  setTimeout(() => {
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: cardName,
      details: '•••• •••• •••• ' + cardNumber.slice(-4),
      icon: 'card-outline',
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, newCard]);
    setLoading(false);
    closeModal();
    resetCardForm();
    Alert.alert('Success', 'Card added successfully');
  }, 1500);
};

export const handleAddUpi = (
  upiId: string,
  upiApp: string,
  setLoading: (v: boolean) => void,
  setPaymentMethods: (cb: (prev: PaymentMethod[]) => PaymentMethod[]) => void,
  resetUpiForm: () => void,
  closeModal: () => void
) => {
  if (!upiId.includes('@')) {
    Alert.alert('Error', 'Please enter a valid UPI ID');
    return;
  }

  setLoading(true);
  setTimeout(() => {
    const newUpi: PaymentMethod = {
      id: Date.now().toString(),
      type: 'upi',
      name: upiApp,
      details: upiId,
      icon: 'phone-portrait-outline',
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, newUpi]);
    setLoading(false);
    closeModal();
    resetUpiForm();
    Alert.alert('Success', 'UPI ID added successfully');
  }, 1500);
};
