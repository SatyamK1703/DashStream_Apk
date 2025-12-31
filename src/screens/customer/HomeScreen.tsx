import { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../../store';
import Header from '../../components/home/Header';
import OffersCarousel from '../../components/home/OfferCarousel';
import PopularServices from '../../components/home/PopularServices';
import PromoBanner from '../../components/home/PromoBanner';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

// import QuickFixes from '../../components/home/QuickFixes';
import Footer from '../../components/home/FooterMain';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scaleWidth, scaleHeight } from '../../utils/scaling';
import OfferPopup from '../../components/home/offerPopup';
import CustomerTestimonials from '../../components/home/CustomerTestimonials';

// Import API hooks
import { usePopularServices, useActiveOffers } from '../../hooks';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isOfferPopupVisible, setOfferPopupVisible] = useState(false);
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
  }, [loadHomeData]);

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

  const loadHomeData = useCallback(async () => {
    try {
      await Promise.all([fetchPopularServices(), fetchActiveOffers()]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, [fetchPopularServices, fetchActiveOffers]);

  const handleRefresh = useCallback(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Helper to extract a usable image URL from various offer shapes
  const extractOfferImage = (offer: any): string | undefined => {
    if (!offer) return undefined;

    // If image is a plain string URL
    if (typeof offer.image === 'string' && offer.image.trim() !== '') return offer.image;

    // If image is an object with a common 'url' or 'uri' property
    if (offer.image && typeof offer.image === 'object') {
      if (typeof offer.image.url === 'string' && offer.image.url.trim() !== '')
        return offer.image.url;
      if (typeof offer.image.uri === 'string' && offer.image.uri.trim() !== '')
        return offer.image.uri;
      // Some responses might nest image under 'image.data' or similar
      if (offer.image.data && typeof offer.image.data === 'object') {
        if (typeof offer.image.data.url === 'string') return offer.image.data.url;
        if (typeof offer.image.data.uri === 'string') return offer.image.data.uri;
      }
    }

    // Fallbacks - some APIs return 'banner' or 'imageUrl' or nested data
    if (typeof offer.banner === 'string' && offer.banner.trim() !== '') return offer.banner;
    if (offer.banner && typeof offer.banner === 'object') {
      if (typeof offer.banner.url === 'string' && offer.banner.url.trim() !== '')
        return offer.banner.url;
      if (typeof offer.banner.uri === 'string' && offer.banner.uri.trim() !== '')
        return offer.banner.uri;
      if (offer.banner.data && typeof offer.banner.data === 'object') {
        if (typeof offer.banner.data.url === 'string') return offer.banner.data.url;
        if (typeof offer.banner.data.uri === 'string') return offer.banner.data.uri;
      }
    }
    if (typeof offer.imageUrl === 'string' && offer.imageUrl.trim() !== '') return offer.imageUrl;
    if (offer.data && typeof offer.data === 'object') {
      if (typeof offer.data.image === 'string') return offer.data.image;
      if (offer.data.image && typeof offer.data.image === 'object') {
        if (typeof offer.data.image.url === 'string') return offer.data.image.url;
      }
    }

    return undefined;
  };

  // Format offers for carousel (normalize image into a string URL)
  const carouselOffers = [
    {
      id: 'banner-popup-offer',
      title: 'Special Contact Offer',
      description: 'Contact us for service mechanic and rental driver.',
      image: require('../../assets/images/banner-popup.png'),
      onPress: () => setOfferPopupVisible(true),
    },
    ...(activeOffersData || []).map((offer: any) => ({
      id: offer._id || offer.id,
      title: offer.title,
      description: offer.description,
      image: extractOfferImage(offer),
      discountPercentage: offer.discountValue ?? offer.discount ?? offer.value,
      validUntil: offer.validUntil ?? offer.valid_until ?? offer.validTo,
      onPress: () =>
        navigation.navigate('ServiceDetails', {
          serviceId: offer.applicableServices?.[0] || offer.id,
          service: offer,
        } as any),
    })),
  ];

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
        }>
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
         <CustomerTestimonials />
         {/* <QuickFixes /> */}
        <Footer />
      </ScrollView>
      <OfferPopup visible={isOfferPopupVisible} onClose={() => setOfferPopupVisible(false)} />
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
    paddingHorizontal: scaleWidth(16),
    marginTop: scaleHeight(12),
  },
  skeletonCard: {
    height: scaleHeight(120),
    backgroundColor: '#f0f0f0',
    borderRadius: scaleWidth(12),
    flex: 1,
    marginHorizontal: scaleWidth(6),
  },
});
