import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../../types/PaymentType';
import { getPaymentMethods } from '../../services/paymentService';
import { showErrorNotification } from '../../utils/notificationUtils';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethodId?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelectMethod,
  selectedMethodId,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      
      // Auto-select default method if no method is selected
      if (!selectedMethodId && methods.length > 0) {
        const defaultMethod = methods.find(m => m.isDefault) || methods[0];
        onSelectMethod(defaultMethod);
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      showErrorNotification('Error', error.message || 'Failed to load payment methods');
    }
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    onSelectMethod(method);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>
      
      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        style={styles.methodsContainer}
      >
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              selectedMethodId === method.id && styles.selectedMethodItem,
              method.backgroundColor ? { backgroundColor: method.backgroundColor } : null,
            ]}
            onPress={() => handleSelectMethod(method)}
          >
            <View style={styles.methodIconContainer}>
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethodId === method.id ? '#fff' : '#333'} 
              />
            </View>
            
            <View style={styles.methodDetails}>
              <Text 
                style={[
                  styles.methodName,
                  selectedMethodId === method.id && styles.selectedMethodText,
                  method.textColor ? { color: method.textColor } : null,
                ]}
              >
                {method.name}
              </Text>
              
              <Text 
                style={[
                  styles.methodDescription,
                  selectedMethodId === method.id && styles.selectedMethodDescription,
                ]}
              >
                {method.details}
              </Text>
            </View>
            
            <View style={styles.radioContainer}>
              <View 
                style={[
                  styles.radioOuter,
                  selectedMethodId === method.id && styles.selectedRadioOuter,
                ]}
              >
                {selectedMethodId === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  methodsContainer: {
    maxHeight: 300,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedMethodItem: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedMethodText: {
    color: '#fff',
  },
  methodDescription: {
    fontSize: 12,
    color: '#666',
  },
  selectedMethodDescription: {
    color: '#e6f2ff',
  },
  radioContainer: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioOuter: {
    borderColor: '#fff',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default PaymentMethodSelector;