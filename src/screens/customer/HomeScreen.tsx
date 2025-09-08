import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/home/Header';
import OffersCarousel from '../../components/home/OfferCarousel';
import PopularServices from '../../components/home/PopularServices';
import {PromoBanner} from '../../components/home/PromoBanner';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import VehicleSelector from '~/components/home/VehicleSelector';
import CustomerTestimonials from '~/components/home/CustomerTestimonials';
import QuickFixes from '~/components/home/QuickFixes';
import Footer from '~/components/home/FooterMain';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../contexts/DataContext';
import { Service } from '../../types/ServiceType';
import { Offer } from '../../types/OfferType';


interface PromoBannerProps {
  onPress: () => void;
} // adjust path as needed



const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isGuest } = useAuth();
  const { 
    activeOffers: offers, 
    popularServices, 
    isLoadingOffers, 
    isLoadingServices,
    fetchOffers,
    getPopularServices,
    error,
    clearError
  } = useData();

  // Fetch data from data service
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      clearError();

      // Fetch offers and popular services using data service
      await Promise.all([
        fetchOffers(),
        getPopularServices()
      ]);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchOffers, getPopularServices, clearError]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  // Auto scroll offers
  useEffect(() => {
    if (offers && offers.length > 0) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [offers?.length]);
  
  // Track guest user activity when they access the home screen
  useEffect(() => {
    if (user && isGuest && user.id) {
      // TODO: Implement guest user activity tracking
      console.log('Guest user activity tracked for user:', user.id);
    }
  }, [user, isGuest]);

  if ((isLoadingOffers || isLoadingServices) && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header userName={user?.name || 'Guest'} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header userName={user?.name || 'Guest'} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <OffersCarousel
          offers={offers || []}
          currentIndex={currentOfferIndex}
          setCurrentIndex={setCurrentOfferIndex}
        />
        <VehicleSelector/>
        <PopularServices services={popularServices || []} />
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
