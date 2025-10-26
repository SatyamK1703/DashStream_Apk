import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useServiceArea } from '../../hooks/useServiceArea';

interface ServiceArea {
  _id: string;
  name: string;
  pincode: string;
  isActive: boolean;
  createdAt: string;
}

const AdminServicesArea = () => {
  console.log('AdminServicesArea: Component rendering');
  const navigation = useNavigation();
  const { getAreas, createArea, removeArea, fetchState, addState, deleteState } = useServiceArea();

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPincode, setNewPincode] = useState('');
  const [newName, setNewName] = useState('');

  const isLoading = fetchState.loading || addState.loading || deleteState.loading;
  const error = fetchState.error || addState.error || deleteState.error;

  const fetchServiceAreas = useCallback(async () => {
    try {
      const response = await getAreas();
      console.log('Service Areas Response:', JSON.stringify(response, null, 2));
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
    if (!newName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid name for the service area.');
      return;
    }
    if (!newPincode || newPincode.length !== 6 || !/^[0-9]+$/.test(newPincode)) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }
    try {
      const response = await createArea(newPincode, newName);
      if (response && response.data && response.data.serviceArea) {
        setServiceAreas((prev) => [...prev, response.data.serviceArea]);
      }
      setNewPincode('');
      setNewName('');
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to add service area:', err);
      Alert.alert('Error', addState.error || 'Failed to add service area.');
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading service areas...</Text>
      </View>
    );
  }

  if (error && serviceAreas.length === 0) {
    return (
      <View style={styles.centered}>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.addButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Areas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={serviceAreas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name} ({item.pincode})</Text>
            <TouchableOpacity onPress={() => handleDeletePincode(item._id)}>
              <Ionicons name="trash-outline" size={22} color="#D9534F" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={['#007BFF']} />
        }
        ListEmptyComponent={!isLoading && (
          <View style={styles.listEmptyContainer}>
            <Text style={styles.listEmptyText}>No service areas have been added yet.</Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service Area</Text>
            <TextInput
              style={styles.input}
              placeholder="Service Area Name (e.g., Downtown)"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="6-Digit Pincode"
              keyboardType="numeric"
              maxLength={6}
              value={newPincode}
              onChangeText={setNewPincode}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewName('');
                  setNewPincode('');
                }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddPincode}>
                <Text style={styles.modalButtonText}>Add Area</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 20 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#6C757D' },
    errorText: { fontSize: 16, color: '#D9534F', marginBottom: 16, textAlign: 'center' },
    retryButton: { backgroundColor: '#007BFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529' },
    addButton: { padding: 4 },
    listContainer: { padding: 16 },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    listItemText: { fontSize: 16, color: '#495057', fontWeight: '600' },
    listEmptyContainer: { alignItems: 'center', paddingTop: 40 },
    listEmptyText: { fontSize: 16, color: '#6C757D', fontStyle: 'italic' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#212529',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#212529',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6C757D',
        marginRight: 8,
    },
    confirmButton: {
        backgroundColor: '#007BFF',
        marginLeft: 8,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AdminServicesArea;