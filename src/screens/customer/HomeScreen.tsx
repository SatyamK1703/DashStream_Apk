import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/home/Header';
import OffersCarousel from '../../components/home/OfferCarousel';
import PopularServices from '../../components/home/PopularServices';
import PromoBanner from '../../components/home/PromoBanner';
import { offers, popularServices } from '../../constants/data/homeData';

const HomeScreen = () => {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const { user } = useAuth();

  // Auto scroll offers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header userName={user?.name || 'Guest'} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <OffersCarousel
          offers={offers}
          currentIndex={currentOfferIndex}
          setCurrentIndex={setCurrentOfferIndex}
        />
        <PopularServices services={popularServices} />
        <PromoBanner />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
});
