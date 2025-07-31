import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../types/PaymentType';

interface AddCardProps {
  visible: boolean;
  onClose: () => void;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}

const AddCard: React.FC<AddCardProps> = ({ visible, onClose, setPaymentMethods }) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddCard = () => {
    if (cardNumber.replace(/\s/g, '').length !== 16) return;
    if (!cardName) return;

    setLoading(true);
    setTimeout(() => {
      const newCard: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        name: cardName,
        details: '•••• •••• •••• ' + cardNumber.slice(-4),
        icon: 'card-outline',
        isDefault: false
      };
      setPaymentMethods(prev => [...prev, newCard]);

      setLoading(false);
      onClose();

      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Add New Card</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Card Number"
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
            maxLength={19}
          />
          <TextInput placeholder="Name on Card" style={styles.input} value={cardName} onChangeText={setCardName} />
          <TextInput placeholder="Expiry MM/YY" style={styles.input} value={expiryDate} onChangeText={setExpiryDate} />
          <TextInput placeholder="CVV" style={styles.input} value={cvv} onChangeText={setCvv} secureTextEntry />
          
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCard} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add Card</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddCard;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  card: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 },
  addBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' }
});
