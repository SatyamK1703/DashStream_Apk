import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight } from '../../utils/scaling';

interface OfferPopupProps {
  visible: boolean;
  onClose: () => void;
}

const OfferPopup: React.FC<OfferPopupProps> = ({ visible, onClose }) => {
  const handleCall = () => {
    const phoneNumber = '123-456-7890'; // Replace with the actual phone number
    let phoneUrl = '';

    if (Platform.OS === 'android') {
      phoneUrl = `tel:${phoneNumber}`;
    } else {
      phoneUrl = `telprompt:${phoneNumber}`;
    }

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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalText}>
            For service mechanic and rental driver, contact this number:
          </Text>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="white" />
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: scaleWidth(320),
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: scaleWidth(16),
    lineHeight: scaleHeight(24),
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: scaleHeight(10),
    paddingHorizontal: scaleWidth(20),
    borderRadius: scaleWidth(10),
  },
  callButtonText: {
    color: 'white',
    marginLeft: scaleWidth(10),
    fontSize: scaleWidth(16),
    fontWeight: 'bold',
  },
});

export default OfferPopup;
