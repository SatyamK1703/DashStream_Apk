import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
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
import { usePopularServices, useActiveOffers, usePersonalizedOffers } from '../../hooks';


interface PromoBannerProps {
  onPress: () => void;
} // adjust path as needed



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
  } = useActiveOffers({ limit: 5 });

  const {
    data: personalizedOffersData,
    loading: personalizedLoading,
    execute: fetchPersonalizedOffers,
  } = usePersonalizedOffers();
  console.log("\n\n\n\n\n\n\n\npersonalizedOffersData",personalizedOffersData,"\n\n\n\n\n");

  // Track loading state for refresh control
  const isRefreshing = servicesLoading || offersLoading || personalizedLoading;

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
        fetchPersonalizedOffers(),
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleRefresh = () => {
    loadHomeData();
  };

  // Prepare data for components
  const offersToShow = activeOffersData || [];
  // Prefer personalized recommended > trending, then fallback to active offers
  const personalized = (personalizedOffersData ?? {}) as any;
  const personalizedArray = Array.isArray(personalized)
    ? (personalized as any[])
    : Array.isArray(personalized.offers)
    ? (personalized.recommended as any[])
    : Array.isArray(personalized.trending)
    ? (personalized.trending as any[])
    : [];

    console.log("personalizedArray",personalized);

  const mapOfferImage = (offer: any) => {
    // OfferCarousel expects `item.image` to be a source for Image.
    const img = offer?.image || offer?.imageUrl || offer?.thumbnail;
    const imageSource = typeof img === 'string' && img.length > 0 ? { uri: img } : img || require('../../../assets/1.png');
    return { ...offer, image: imageSource };
  };

  const carouselOffers = (Array.isArray(personalizedArray) && personalizedArray.length > 0
    ? personalizedArray
    : offersToShow
  ).map(mapOfferImage);
  // const servicesToShow = popularServicesData?.services || [];
  const servicesToShow = Array.isArray(popularServicesData)
    ? popularServicesData
    : Array.isArray((popularServicesData as any)?.services)
    ? (popularServicesData as any).services
    : [];

  return (
    <View style={styles.container}>
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
        {/* Show offers carousel with API data */}
        <OffersCarousel
          offers={carouselOffers}
          currentIndex={currentOfferIndex}
          setCurrentIndex={setCurrentOfferIndex}
          loading={offersLoading}
          error={offersError}
        />
        
        {/* Show popular services with API data */}
        {!servicesLoading && (
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
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  safeArea: { flex: 1 },
});

