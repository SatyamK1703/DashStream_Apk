import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/home/Header';
import OffersCarousel from '../../components/home/OfferCarousel';
import PopularServices from '../../components/home/PopularServices';
import PromoBanner from '../../components/home/PromoBanner';
import { offers, popularServices } from '../../constants/data/homeData';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator'; // adjust path as needed
import VehicleSelector from '~/components/home/VehicleSelector';
import CustomerTestimonials from '~/components/home/CustomerTestimonials';
import QuickFixes from '~/components/home/QuickFixes';
import Footer from '~/components/home/FooterMain';
import { SafeAreaView } from 'react-native-safe-area-context';


interface PromoBannerProps {
  onPress: () => void;
} // adjust path as needed



const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
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
        <VehicleSelector/>
        <PopularServices services={popularServices} />
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

// import React, { useState, useEffect } from 'react';
// import { View, ScrollView, StatusBar, StyleSheet } from 'react-native';
// import { useAuth } from '../../context/AuthContext';
// import Header from '../../components/home/Header';
// import OffersCarousel from '../../components/home/OfferCarousel';
// import PopularServices from '../../components/home/PopularServices';
// import PromoBanner from '../../components/home/PromoBanner';
// import { offers, popularServices } from '../../constants/data/homeData';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
// import VehicleSelector from '~/components/home/VehicleSelector';
// import CustomerTestimonials from '~/components/home/CustomerTestimonials';
// import QuickFixes from '~/components/home/QuickFixes';
// import Footer from '~/components/home/FooterMain';
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface PromoBannerProps {
//   onPress: () => void;
// }

// const HomeScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
//   const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
//   const { user } = useAuth();

//   // Auto scroll offers
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top']}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <View style={styles.container}>
//         <Header userName={user?.name || 'Guest'} />
//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           <OffersCarousel
//             offers={offers}
//             currentIndex={currentOfferIndex}
//             setCurrentIndex={setCurrentOfferIndex}
//           />
//           <VehicleSelector/>
//           <PopularServices services={popularServices} />
//           <PromoBanner onPress={() => navigation.navigate('Membership')} />
//           <CustomerTestimonials/>
//           <QuickFixes/>
//           <Footer/>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff'
//   },
//   container: { 
//     flex: 1, 
//     backgroundColor: '#fff' 
//   },
//   scrollView: { 
//     flex: 1 
//   },
// });