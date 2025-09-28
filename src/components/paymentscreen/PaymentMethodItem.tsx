import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../../types/PaymentType';

interface Props {
  method: PaymentMethod;
  handleSetDefault: (id: string) => void;
  handleDeleteMethod: (id: string) => void;
}

const PaymentMethodItem: React.FC<Props> = ({ method, handleSetDefault, handleDeleteMethod }) => (
  <View style={styles.container}>
    <View style={styles.left}>
      <View style={styles.iconWrapper}>
        <Ionicons name={method.icon as any} size={20} color="#2563eb" />
      </View>
      <View>
        <Text style={styles.name}>{method.name}</Text>
        <Text style={styles.details}>{method.details}</Text>
        {method.isDefault && (
          <View style={styles.defaultRow}>
            <View style={styles.dot} />
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.right}>
      {!method.isDefault && (
        <TouchableOpacity onPress={() => handleSetDefault(method.id)} style={styles.btn}>
          <Text style={styles.setDefaultText}>Set Default</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => handleDeleteMethod(method.id)} style={styles.btn}>
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  left: { flexDirection: 'row' },
  iconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  name: { fontWeight: '600', color: '#111827' },
  details: { color: '#6b7280', fontSize: 12 },
  defaultRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 4, marginRight: 4 },
  defaultText: { color: '#22c55e', fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center' },
  btn: { marginLeft: 8 },
  setDefaultText: { color: '#2563eb', fontSize: 12 },
});

export default PaymentMethodItem;
