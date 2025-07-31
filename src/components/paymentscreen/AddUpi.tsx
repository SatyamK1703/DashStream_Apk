import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../types/PaymentType';

interface AddUpiProps {
  visible: boolean;
  onClose: () => void;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}

const AddUpi: React.FC<AddUpiProps> = ({ visible, onClose, setPaymentMethods }) => {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUpi = () => {
    if (!upiId.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      const newUpi: PaymentMethod = {
        id: Date.now().toString(),
        type: 'upi',
        name: 'UPI',
        details: upiId,
        icon: 'phone-portrait-outline',
        isDefault: false
      };
      setPaymentMethods(prev => [...prev, newUpi]);

      setLoading(false);
      onClose();
      setUpiId('');
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Add UPI ID</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="username@upi"
            style={styles.input}
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
          />
          
          <TouchableOpacity style={styles.addBtn} onPress={handleAddUpi} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add UPI</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddUpi;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  card: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 },
  addBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' }
});
