// components/ContactSupport.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

interface ContactSupportProps {
  navigation: NativeStackNavigationProp<CustomerStackParamList>;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Couldn't find what you're looking for?
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Support')}
      >
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactSupport;

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
  },
  text: {
    textAlign: 'center',
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
