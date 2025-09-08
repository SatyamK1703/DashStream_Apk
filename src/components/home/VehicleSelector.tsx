import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  TouchableOpacity,  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vehicleData } from '../../data/vehicleData';
const { width } = Dimensions.get('window');


const VehicleSelector = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  


  const filteredData = vehicleData.map(brand => ({
    ...brand,
    models: brand.models.filter(
      model =>
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.brand.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(brand => brand.models.length > 0);

  const handleSelect = (brand, model) => {
  setSelectedVehicle({
    brand: brand.brand,
    model: model.name, 
    type: model.type,
    image: model.image,
    logo: brand.logo,
  });
  setIsVisible(false);
};

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setIsVisible(true)} style={styles.selectBox}>
        {selectedVehicle ? (
          <>
            <Image source={{ uri: selectedVehicle.image }} style={styles.logo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedModel}>{selectedVehicle.model}</Text>
              <Text style={styles.selectedBrand}>{selectedVehicle.brand}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>Select your vehicle</Text>
        )}
        <ChevronDown size={22} color="#6b7280" />
      </Pressable>

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Your Vehicle</Text>
            <TextInput
              placeholder="Search brand or model"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            <KeyboardAvoidingView>

            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => item.brand + index}
              renderItem={({ item }) => (
                  <View style={styles.brandSection}>
                  <View style={styles.brandHeader}>
                    <Image source={{ uri: item.logo }} style={styles.brandLogo} />
                    <Text style={styles.brandText}>{item.brand}</Text>
                  </View>
                  {item.models.map((model, idx) => {
                      const isSelected =
                      selectedVehicle?.brand === item.brand &&
                      selectedVehicle?.model === model.name;
                      return (
                          <TouchableOpacity
                          key={idx}
                          style={[
                              styles.modelCard,
                              isSelected && { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)' }
                            ]}
                            onPress={() => handleSelect(item, model)}
                            >
                        <Image source={{ uri: model.image }} style={styles.modelImage} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modelText}>{model.name}</Text>
                          <Text style={styles.typeText}>{model.type}</Text>
                        </View>
                        {isSelected && <Check size={20} color="#2563eb" />}
                   </TouchableOpacity>
                    );
                })}
                </View>
              )}
              />
            <Pressable onPress={() => setIsVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VehicleSelector;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
   modalPressable: {
    width: '100%',
    alignItems: 'center',
  },
  selectBox: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeholder: {
    color: '#9ca3af',
    fontSize: 17,
    flex: 1,
  },
  selectedModel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  selectedBrand: {
    fontSize: 14,
    color: '#6b7280',
  },
  logo: {
    width: 60,
    height: 44,
    borderRadius: 10,
    marginRight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#111827',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    fontSize: 15,
  },
  brandSection: {
    marginBottom: 20,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  brandLogo: {
    width: 26,
    height: 26,
    marginRight: 8,
    borderRadius: 4,
  },
  brandText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#374151',
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
    marginHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  modelImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  modelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  typeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  closeText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});



