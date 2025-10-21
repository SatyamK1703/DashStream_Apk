import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useServiceArea } from '../../hooks/useServiceArea';

interface ServiceArea {
  _id: string;
  pincode: string;
  isActive: boolean;
  createdAt: string;
}

const AdminServicesArea = () => {
  const navigation = useNavigation();
  const { getAreas, createArea, removeArea, fetchState, addState, deleteState } = useServiceArea();

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPincode, setNewPincode] = useState('');

  const isLoading = fetchState.loading || addState.loading || deleteState.loading;
  const error = fetchState.error || addState.error || deleteState.error;

  const fetchServiceAreas = useCallback(async () => {
    try {
      const response = await getAreas();
      if (response && response.data && response.data.serviceAreas) {
        setServiceAreas(response.data.serviceAreas);
      }
    } catch (err) {
      console.error('Failed to fetch service areas:', err);
      Alert.alert('Error', 'Failed to load service areas.');
    }
  }, [getAreas]);

  useEffect(() => {
    fetchServiceAreas();
  }, [fetchServiceAreas]);

  const onRefresh = useCallback(() => {
    fetchServiceAreas();
  }, [fetchServiceAreas]);

  const handleAddPincode = async () => {
    if (!newPincode || newPincode.length !== 6 || !/^[0-9]+$/.test(newPincode)) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }
    try {
      const response = await createArea(newPincode);
      if (response && response.data && response.data.serviceArea) {
        setServiceAreas((prev) => [...prev, response.data.serviceArea]);
      }
      setNewPincode('');
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to add pincode:', err);
      Alert.alert('Error', addState.error || 'Failed to add pincode.');
    }
  };

  const handleDeletePincode = async (id: string) => {
    Alert.alert(
      'Delete Pincode',
      'Are you sure you want to delete this pincode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await removeArea(id);
              setServiceAreas((prev) => prev.filter((area) => area._id !== id));
            } catch (err) {
              console.error('Failed to delete pincode:', err);
              Alert.alert('Error', deleteState.error || 'Failed to delete pincode.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading && serviceAreas.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading service areas...</Text>
      </View>
    );
  }

  if (error && serviceAreas.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Services Area</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={serviceAreas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.pincodeItem}>
            <Text style={styles.pincodeText}>{item.pincode}</Text>
            <TouchableOpacity onPress={() => handleDeletePincode(item._id)}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={!isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No service areas set yet.</Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Pincode</Text>
            <TextInput
              style={styles.pincodeInput}
              placeholder="Enter 6-digit Pincode"
              keyboardType="numeric"
              maxLength={6}
              value={newPincode}
              onChangeText={setNewPincode}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#EF4444" />
              <Button title="Add Pincode" onPress={handleAddPincode} color="#2563EB" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: 16,
  },
  pincodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pincodeText: {
    fontSize: 16,
    color: '#374151',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1F2937',
  },
  pincodeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default AdminServicesArea;