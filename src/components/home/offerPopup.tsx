import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { scaleWidth, scaleHeight } from '../../utils/scaling';

interface OfferPopupProps {
  visible: boolean;
  onClose: () => void;
}

const OfferPopup: React.FC<OfferPopupProps> = ({ visible, onClose }) => {
  const handleCall = () => {
    const phoneNumber = '123-456-7890'; // Replace with the actual phone number
    const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          console.error('Phone calls are not available on this device');
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={50} tint="light" style={styles.blurContainer}>
          <View style={styles.popup}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={26} color="#444" />
            </Pressable>

            <Ionicons
              name="construct-outline"
              size={48}
              color="#007AFF"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.title}>Need Assistance?</Text>
            <Text style={styles.description}>
              For service mechanic or rental driver support, reach out directly.
            </Text>

            <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call" size={22} color="#fff" />
              <Text style={styles.callButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: scaleWidth(320),
    backgroundColor: 'rgba(255, 255, 255)',
    borderRadius: 20,
    paddingVertical: scaleHeight(30),
    paddingHorizontal: scaleWidth(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  title: {
    fontSize: scaleWidth(20),
    fontWeight: '700',
    color: '#222',
    marginBottom: scaleHeight(8),
    textAlign: 'center',
  },
  description: {
    fontSize: scaleWidth(15),
    color: '#555',
    textAlign: 'center',
    lineHeight: scaleHeight(22),
    marginBottom: scaleHeight(25),
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(28),
    borderRadius: scaleWidth(30),
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  callButtonText: {
    color: 'white',
    marginLeft: scaleWidth(8),
    fontSize: scaleWidth(16),
    fontWeight: '600',
  },
});

export default OfferPopup;
