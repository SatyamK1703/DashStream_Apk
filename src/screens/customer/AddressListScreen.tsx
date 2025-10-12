import React, { useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation , RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAddresses, useCheckout } from '../../store';
import { Address } from '../../types/api';

type AddressListNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'AddressList'>;

const AddressListScreen = () => {
  const navigation = useNavigation<AddressListNavigationProp>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'AddressList'>>();
  const { currentAddressId } = route.params || {};

  // Use modern stores
  const { addresses, isLoading, error, fetchAddresses, deleteAddress } = useAddresses();
  const { setSelectedAddress } = useCheckout();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSelect = (address: Address) => {
    // Update the checkout store with the selected address
    setSelectedAddress(address);

    // Navigate back to checkout
    navigation.navigate('Checkout', { selectedAddressId: address._id });
  };

  const handleEdit = (addressData: Address) => {
    navigation.navigate('AddAddress', {
      addressId: addressData._id,
      addressData,
    });
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const result = await deleteAddress(addressId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete address. Please try again.');
            }
          },
          style: "destructive"
        },
      ]
    );
  };

  const renderAddress = ({ item }: { item: Address }) => {
    const typeValue = typeof item?.type === 'string' ? item.type : undefined;
    const formattedType = typeValue && typeValue.length > 0
      ? `${typeValue.charAt(0).toUpperCase()}${typeValue.slice(1)}`
      : item?.name ?? 'Address';
    const iconName = typeValue === 'work' ? 'briefcase-outline' : 'home-outline';
    const displayTitle = item?.name ?? item?.address ?? item?.city ?? formattedType;

    const detailLines: string[] = [];

    if (item?.address && item.address !== displayTitle) {
      detailLines.push(item.address);
    }

    if (item?.landmark) {
      detailLines.push(item.landmark);
    }

    const cityParts = [item?.city].filter(
      (part): part is string => typeof part === 'string' && part.trim().length > 0,
    );

    if (cityParts.length > 0 || (typeof item?.pincode === 'string' && item.pincode.trim().length > 0)) {
      let cityLine = cityParts.join(', ');
      if (item?.pincode) {
        cityLine = cityLine ? `${cityLine} - ${item.pincode}` : item.pincode;
      }

      if (cityLine && cityLine !== displayTitle) {
        detailLines.push(cityLine);
      }
    }

    if (detailLines.length === 0 && displayTitle !== formattedType) {
      detailLines.push(formattedType);
    }

    const deleteId = (item as any)?._id ?? (item as any)?.id;

    const isSelected = currentAddressId && (item._id === currentAddressId || (item as any)?.id === currentAddressId);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.9}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={24} color="#4B5563" />
          </View>
          <View>
            <Text style={styles.addressType}>{formattedType}</Text>
            {Boolean(item?.isDefault) && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          {Boolean(isSelected) && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Selected</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.addressName}>{displayTitle}</Text>
          {detailLines.map((line, index) => (
            <Text key={`${line}-${index}`} style={styles.addressText}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil-outline" size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, !deleteId && { opacity: 0.4 }]}
            disabled={!deleteId}
            onPress={() => {
              if (deleteId) {
                handleDelete(deleteId);
              }
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load addresses.</Text>
          <Text style={styles.emptySubText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={(item) => String((item as any)._id || '')}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No addresses found.</Text>
              <Text style={styles.emptySubText}>Add a new address to get started.</Text>
            </View>
          )}
        />
      )}

      {/* Add New Address Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAddress', {})}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddressListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardSelected: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedBadge: {
    marginLeft: 'auto',
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    padding: 10,
    marginRight: 12,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    paddingVertical: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2563EB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
