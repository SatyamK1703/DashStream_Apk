import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text,StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../../components/admin/Header';
import SearchBar from '~/components/admin/SearchBar';
import SortControls from '~/components/admin/SortControls';
import OfferCard from '~/components/admin/Offercard';
import EmptyState from '~/components/admin/EmptyState';
import AddEditOfferModal from '~/components/admin/AddEditOfferModal';



import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

import {
  useAdminOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  useToggleOfferStatus,
} from '../../hooks/adminOffers';
import { useAuth } from '../../store';

type AdminOffersNavigationProp = NativeStackNavigationProp<
  AdminStackParamList
>;

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  offerCode: string;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OfferFormData {
  _id?: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  offerCode?: string;
  usageLimit?: string;
}

const ManageOffersScreen = () => {
  const navigation = useNavigation<AdminOffersNavigationProp>();
  const { user } = useAuth();

  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'discount' | 'date'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    validFrom: new Date().toISOString(),
    validUntil: new Date().toISOString(),
    isActive: true,
    offerCode: '',
    usageLimit: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: offers = [],
    loading,
    error,
    refresh: fetchOffers,
  } = useAdminOffers();

  const { execute: createOffer } = useCreateOffer();
  const { execute: updateOffer } = useUpdateOffer();
  const { execute: deleteOffer } = useDeleteOffer();
  const { execute: toggleStatus } = useToggleOfferStatus();
  const [modalKey, setModalKey] = useState(0);

  const filterAndSortOffers = useCallback(() => {
    if (!offers || !Array.isArray(offers)) {
      setFilteredOffers([]);
      return;
    }

    let filtered = [...offers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(query) ||
          offer.description.toLowerCase().includes(query) ||
          (offer.offerCode || '').toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'discount':
          comparison = a.discount - b.discount;
          break;
        case 'date':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOffers(filtered);
  }, [offers, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortOffers();
  }, [filterAndSortOffers]);

  const handleSortByChange = () => {
    const options = ['title', 'discount', 'date'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex] as 'title' | 'discount' | 'date');
  };

  const toggleOfferStatus = async (offerId: string) => {
    try {
      const offer = offers.find((o) => o._id === offerId);
      if (!offer) return;

      await toggleStatus(offerId, !offer.isActive);

      await fetchOffers();
    } catch (error) {
      console.error('Toggle offer status error:', error);
      Alert.alert('Error', 'Failed to update offer status. Please try again.');
    }
  };

  const handleAddOffer = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      validFrom: new Date().toISOString(),
      validUntil: new Date().toISOString(),
      isActive: true,
      offerCode: '',
      usageLimit: '',
    });
    setShowAddEditModal(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setIsEditing(true);
    setFormData({
      _id: offer._id,
      title: offer.title,
      description: offer.description,
      discount: offer.discount.toString(),
      discountType: offer.discountType,
      validFrom: offer.validFrom,
      validUntil: offer.validUntil,
      isActive: offer.isActive,
      offerCode: offer.offerCode,
      usageLimit: offer.usageLimit?.toString() || '',
    });
    setModalKey((k) => k + 1); // force modal to re-mount with new formData
    setShowAddEditModal(true);
  };

  const handleViewStats = (offer: Offer) => {
    navigation.navigate('AdminOfferStats', {
      offerId: offer._id,
      offerTitle: offer.title,
    });
  };

  const handleDeleteOffer = (offerId: string) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOffer(offerId);
              await fetchOffers();
              Alert.alert('Success', 'Offer deleted successfully');
            } catch (error) {
              console.error('Delete offer error:', error);
              Alert.alert('Error', 'Failed to delete offer. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Manage Offers" onBack={() => navigation.goBack()} onAdd={handleAddOffer} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Manage Offers" onBack={() => navigation.goBack()} onAdd={handleAddOffer} />

      <View style={styles.searchContainer}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder ="search offers"
        />

        <SortControls
          itemCount={filteredOffers?.length || 0}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderToggle={() =>
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
          }
        />
      </View>

      {(!filteredOffers || filteredOffers.length === 0) ? (
        <EmptyState placetext='Create Offers' title='No offers found.' description='Start creating offers and attract more customers!' onAddService={handleAddOffer} />
      ) : (
        <FlatList
          data={filteredOffers || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OfferCard
              title={item.title}
              description={item.description}
              discount={item.discount}
              discountType={item.discountType}
              validUntil={item.validUntil}
              onStats={() => handleViewStats(item)}
              onEdit={() => handleEditOffer(item)}
              onDelete={() => handleDeleteOffer(item._id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={['#2563EB']}
            />
          }
        />
      )}

      <AddEditOfferModal
        key={modalKey}
        visible={showAddEditModal}
        isEditing={isEditing}
        formData={formData}
        onClose={() => setShowAddEditModal(false)}
        onSuccess={fetchOffers}
      />
    </SafeAreaView>
  );
};

export default ManageOffersScreen;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // light gray background
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // light border
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
