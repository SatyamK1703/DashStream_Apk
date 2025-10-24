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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-2 text-base text-gray-600">Loading service areas...</Text>
      </View>
    );
  }

  if (error && serviceAreas.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-base text-red-600 mb-3">Error: {error}</Text>
        <TouchableOpacity className="bg-blue-600 px-5 py-2 rounded-lg" onPress={onRefresh}>
          <Text className="text-white text-base font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Set Services Area</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="p-1">
          <Ionicons name="add-circle-outline" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={serviceAreas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-3 shadow-md">
            <Text className="text-base text-gray-700 font-semibold">{item.name} ({item.pincode})</Text>
            <TouchableOpacity onPress={() => handleDeletePincode(item._id)}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={!isLoading && (
          <View className="items-center py-5">
            <Text className="text-base text-gray-500 italic">No service areas set yet.</Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-60">
          <View className="bg-white p-6 rounded-lg w-4/5 shadow-lg">
            <Text className="text-xl font-bold mb-5 text-center text-gray-800">Add New Service Area</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-800 text-center"
              placeholder="Enter Service Area Name"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-5 text-base text-gray-800 text-center"
              placeholder="Enter 6-digit Pincode"
              keyboardType="numeric"
              maxLength={6}
              value={newPincode}
              onChangeText={setNewPincode}
            />
            <View className="flex-row justify-around">
              <TouchableOpacity
                className="bg-red-500 px-5 py-2 rounded-lg"
                onPress={() => {
                  setModalVisible(false);
                  setNewName('');
                  setNewPincode('');
                }}>
                <Text className="text-white text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 px-5 py-2 rounded-lg"
                onPress={handleAddPincode}>
                <Text className="text-white text-base font-semibold">Add Area</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



export default AdminServicesArea;