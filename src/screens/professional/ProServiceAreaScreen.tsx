import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProServiceAreaScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface AreaItem {
  id: string;
  name: string;
  isSelected: boolean;
  distance: number; // in km
  estimatedJobs: number;
}

const ProServiceAreaScreen = () => {
  const navigation = useNavigation<ProServiceAreaScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(15); // in km
  const [autoAcceptJobs, setAutoAcceptJobs] = useState(false);
  
  // Mock data for available service areas
  const [availableAreas, setAvailableAreas] = useState<AreaItem[]>([
    { id: '1', name: 'Koramangala', isSelected: true, distance: 0, estimatedJobs: 12 },
    { id: '2', name: 'HSR Layout', isSelected: true, distance: 3.5, estimatedJobs: 10 },
    { id: '3', name: 'Indiranagar', isSelected: true, distance: 5.2, estimatedJobs: 8 },
    { id: '4', name: 'Jayanagar', isSelected: false, distance: 7.8, estimatedJobs: 7 },
    { id: '5', name: 'JP Nagar', isSelected: false, distance: 8.5, estimatedJobs: 6 },
    { id: '6', name: 'Whitefield', isSelected: false, distance: 12.3, estimatedJobs: 9 },
    { id: '7', name: 'Electronic City', isSelected: false, distance: 14.1, estimatedJobs: 5 },
    { id: '8', name: 'Marathahalli', isSelected: false, distance: 9.7, estimatedJobs: 8 },
    { id: '9', name: 'Bannerghatta Road', isSelected: false, distance: 10.2, estimatedJobs: 4 },
    { id: '10', name: 'MG Road', isSelected: false, distance: 6.8, estimatedJobs: 7 },
    { id: '11', name: 'Yelahanka', isSelected: false, distance: 18.5, estimatedJobs: 3 },
    { id: '12', name: 'Hebbal', isSelected: false, distance: 15.2, estimatedJobs: 4 },
  ]);
  
  // Filter areas based on search query and max distance
  const filteredAreas = availableAreas
    .filter(area => 
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      area.distance <= maxDistance
    )
    .sort((a, b) => a.distance - b.distance);
  
  // Get selected areas
  const selectedAreas = availableAreas.filter(area => area.isSelected);
  
  // Calculate estimated jobs based on selected areas
  const totalEstimatedJobs = selectedAreas.reduce((total, area) => total + area.estimatedJobs, 0);
  
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const toggleAreaSelection = (id: string) => {
    setAvailableAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === id ? { ...area, isSelected: !area.isSelected } : area
      )
    );
  };
  
  const handleSaveChanges = () => {
    if (selectedAreas.length === 0) {
      Alert.alert('Error', 'Please select at least one service area.');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Success',
        'Your service areas have been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };
  
  const handleMaxDistanceChange = (value: number) => {
    setMaxDistance(value);
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading service areas...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Service Area</Text>
        </View>
      </View>
      
      {/* Summary Card */}
      <View className="bg-white mx-4 rounded-xl shadow-sm p-4 -mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800 font-bold text-lg">Your Service Areas</Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary font-medium">{selectedAreas.length} Selected</Text>
          </View>
        </View>
        
        <View className="flex-row items-center mt-3">
          <FontAwesome5 name="briefcase" size={14} color="#4B5563" />
          <Text className="text-gray-600 ml-2">
            Estimated {totalEstimatedJobs} jobs per week in selected areas
          </Text>
        </View>
        
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="location-on" size={16} color="#4B5563" />
          <Text className="text-gray-600 ml-1">
            {selectedAreas.length > 0 
              ? selectedAreas.map(area => area.name).join(', ')
              : 'No areas selected'}
          </Text>
        </View>
      </View>
      
      {/* Search and Filter */}
      <View className="mx-4 mt-4">
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search areas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <Text className="text-gray-700 font-medium mb-2">Maximum Distance: {maxDistance} km</Text>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-500">5 km</Text>
            <Text className="text-gray-500">25 km</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-200"
              onPress={() => handleMaxDistanceChange(Math.max(5, maxDistance - 5))}
            >
              <Ionicons name="remove" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
              <View 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${((maxDistance - 5) / 20) * 100}%` }}
              />
            </View>
            
            <TouchableOpacity 
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-200"
              onPress={() => handleMaxDistanceChange(Math.min(25, maxDistance + 5))}
            >
              <Ionicons name="add" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <View>
              <Text className="text-gray-700 font-medium">Auto-Accept Jobs</Text>
              <Text className="text-gray-500 text-sm">Automatically accept jobs in your service area</Text>
            </View>
            <Switch
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={autoAcceptJobs ? '#2563EB' : '#9CA3AF'}
              onValueChange={setAutoAcceptJobs}
              value={autoAcceptJobs}
            />
          </View>
        </View>
      </View>
      
      {/* Area List */}
      <ScrollView className="flex-1 mx-4">
        <Text className="text-gray-700 font-medium mb-2">
          {filteredAreas.length} Areas Available {searchQuery ? 'for Search' : 'within Range'}
        </Text>
        
        {filteredAreas.length === 0 ? (
          <View className="bg-white rounded-xl shadow-sm p-4 items-center justify-center py-8">
            <MaterialIcons name="location-off" size={40} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              {searchQuery 
                ? `No areas found matching "${searchQuery}"`
                : 'No areas available within the selected distance'}
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                className="mt-4 py-2 px-4 bg-primary rounded-lg"
                onPress={() => setSearchQuery('')}
              >
                <Text className="text-white">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="bg-white rounded-xl shadow-sm p-4 mb-20">
            {filteredAreas.map((area) => (
              <TouchableOpacity 
                key={area.id}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleAreaSelection(area.id)}
              >
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">{area.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">{area.distance} km away</Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <FontAwesome5 name="briefcase" size={12} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">~{area.estimatedJobs} jobs/week</Text>
                  </View>
                </View>
                
                <View className={`w-6 h-6 rounded-md items-center justify-center ${area.isSelected ? 'bg-primary' : 'border border-gray-300'}`}>
                  {area.isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className={`py-3 rounded-lg items-center ${isSaving ? 'bg-primary/70' : 'bg-primary'}`}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-medium">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProServiceAreaScreen;