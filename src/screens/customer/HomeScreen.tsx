import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../store';
import Header from '../../components/home/Header';
import OffersCarousel from '../../components/home/OfferCarousel';
import PopularServices from '../../components/home/PopularServices';
import PromoBanner from '../../components/home/PromoBanner';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import CustomerTestimonials from '~/components/home/CustomerTestimonials';
import QuickFixes from '~/components/home/QuickFixes';
import Footer from '~/components/home/FooterMain';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import API hooks
import { usePopularServices, useActiveOffers } from '../../hooks';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const { user } = useAuth();

  // API hooks
  const {
    data: popularServicesData,
    loading: servicesLoading,
    execute: fetchPopularServices,
    error: servicesError,
  } = usePopularServices(6);

  const {
    data: activeOffersData,
    loading: offersLoading,
    refresh: fetchActiveOffers,
    error: offersError,
  } = useActiveOffers();
  
  const isRefreshing = servicesLoading || offersLoading;
  
  // Load initial data
  useEffect(() => {
    loadHomeData();
  }, []);

  // Auto scroll offers
  useEffect(() => {
    const offersToShow = activeOffersData || [];
    if (offersToShow.length > 0) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offersToShow.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeOffersData]);

  const loadHomeData = async () => {
    try {
      await Promise.all([
        fetchPopularServices(),
        fetchActiveOffers(),
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };
  
  const handleRefresh = () => {
    loadHomeData();
  };

  // Format offers for carousel
  const carouselOffers = (activeOffersData || []).map((offer: any) => ({
    id: offer._id || offer.id,
    title: offer.title,
    description: offer.description,
    image: offer.image || offer.banner,
    discountPercentage: offer.discountValue,
    validUntil: offer.validUntil,
    onPress: () => navigation.navigate('ServiceDetails', { 
      serviceId: offer.applicableServices?.[0] || offer.id,
      service: offer 
    })
  }));

  const servicesToShow = Array.isArray(popularServicesData)
    ? popularServicesData
    : Array.isArray((popularServicesData as any)?.services)
    ? (popularServicesData as any).services
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header userName={user?.name || 'Guest'} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Offers carousel with API data or placeholder */}
        <OffersCarousel
          offers={carouselOffers}
          currentIndex={currentOfferIndex}
          setCurrentIndex={setCurrentOfferIndex}
          loading={offersLoading}
          error={offersError}
        />

        {/* Popular services with loading placeholder */}
        {servicesLoading ? (
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : (
          <PopularServices 
            services={servicesToShow} 
            loading={servicesLoading}
            error={servicesError}
          />
        )}

        <PromoBanner onPress={() => navigation.navigate('Membership')} />
        <CustomerTestimonials/>
        <QuickFixes/>
        <Footer/>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  safeArea: { flex: 1 },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  skeletonCard: {
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
});