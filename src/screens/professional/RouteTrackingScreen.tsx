// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   Linking,
//   Platform,
//   Dimensions
// } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import * as Location from 'expo-location';
// import { ProStackParamList } from '../../../app/routes/ProNavigator';

// type RouteTrackingScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
// type RouteTrackingScreenRouteProp = RouteProp<ProStackParamList, 'RouteTracking'>;

// interface JobLocation {
//   id: string;
//   customerName: string;
//   customerImage: string;
//   customerPhone: string;
//   address: string;
//   location: {
//     latitude: number;
//     longitude: number;
//   };
//   services: string[];
//   totalAmount: number;
//   estimatedArrival?: string;
// }

// const RouteTrackingScreen = () => {
//   const navigation = useNavigation<RouteTrackingScreenNavigationProp>();
//   const route = useRoute<RouteTrackingScreenRouteProp>();
//   const { jobId } = route.params;
//   const mapRef = useRef<MapView>(null);
//   const { width, height } = Dimensions.get('window');
  
//   const [loading, setLoading] = useState(true);
//   const [job, setJob] = useState<JobLocation | null>(null);
//   const [currentLocation, setCurrentLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [distance, setDistance] = useState<string>('Calculating...');
//   const [duration, setDuration] = useState<string>('Calculating...');
//   const [arrived, setArrived] = useState(false);
//   const [locationPermission, setLocationPermission] = useState(false);
//   const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

//   // Mock job data
//   const mockJob: JobLocation = {
//     id: 'JOB123456',
//     customerName: 'Priya Sharma',
//     customerImage: 'https://randomuser.me/api/portraits/women/44.jpg',
//     customerPhone: '+91 9876543210',
//     address: '123 Main St, Koramangala, Bangalore',
//     location: {
//       latitude: 12.9352,
//       longitude: 77.6245
//     },
//     services: ['Premium Wash', 'Interior Cleaning'],
//     totalAmount: 998,
//     estimatedArrival: '25 mins'
//   };

//   useEffect(() => {
//     // Request location permissions
//     const requestLocationPermission = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert(
//           'Permission Denied',
//           'You need to grant location permissions to use this feature.',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//         return;
//       }
      
//       setLocationPermission(true);
      
//       // Get initial location
//       try {
//         const location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Highest
//         });
        
//         const { latitude, longitude } = location.coords;
//         setCurrentLocation({ latitude, longitude });
        
//         // Start watching position
//         const subscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.Highest,
//             distanceInterval: 10, // Update every 10 meters
//             timeInterval: 5000 // Or every 5 seconds
//           },
//           (newLocation) => {
//             const { latitude, longitude } = newLocation.coords;
//             setCurrentLocation({ latitude, longitude });
            
//             // Check if arrived at destination (within 50 meters)
//             if (job) {
//               const distanceToDestination = calculateDistance(
//                 latitude,
//                 longitude,
//                 job.location.latitude,
//                 job.location.longitude
//               );
              
//               if (distanceToDestination <= 0.05) { // 0.05 km = 50 meters
//                 if (!arrived) {
//                   setArrived(true);
//                   Alert.alert(
//                     'You Have Arrived',
//                     `You have arrived at ${job.customerName}'s location. Ready to start the service?`,
//                     [
//                       {
//                         text: 'Not Yet',
//                         style: 'cancel'
//                       },
//                       {
//                         text: 'Start Service',
//                         onPress: () => navigation.navigate('JobDetails', { jobId })
//                       }
//                     ]
//                   );
//                 }
//               }
//             }
//           }
//         );
        
//         setLocationSubscription(subscription);
//       } catch (error) {
//         console.log('Error getting location:', error);
//         Alert.alert(
//           'Location Error',
//           'Unable to get your current location. Please try again.',
//           [{ text: 'OK' }]
//         );
//       }
//     };

//     // Fetch job details
//     const fetchJobDetails = () => {
//       setLoading(true);
//       // Simulate API call
//       setTimeout(() => {
//         setJob(mockJob);
//         setLoading(false);
//       }, 1000);
//     };

//     requestLocationPermission();
//     fetchJobDetails();

//     // Cleanup function
//     return () => {
//       if (locationSubscription) {
//         locationSubscription.remove();
//       }
//     };
//   }, [jobId]);

//   // Calculate distance between two coordinates in kilometers
//   const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371; // Radius of the earth in km
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km
//     return distance;
//   };

//   const deg2rad = (deg: number) => {
//     return deg * (Math.PI / 180);
//   };

//   // Fit map to show both markers
//   const fitMapToMarkers = () => {
//     if (mapRef.current && currentLocation && job) {
//       mapRef.current.fitToCoordinates(
//         [
//           currentLocation,
//           job.location
//         ],
//         {
//           edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//           animated: true
//         }
//       );
//     }
//   };

//   const handleCallCustomer = () => {
//     if (job?.customerPhone) {
//       const phoneNumber = Platform.OS === 'android' 
//         ? `tel:${job.customerPhone}` 
//         : `telprompt:${job.customerPhone}`;
      
//       Linking.canOpenURL(phoneNumber)
//         .then(supported => {
//           if (supported) {
//             return Linking.openURL(phoneNumber);
//           }
//         })
//         .catch(error => console.log('Error calling customer:', error));
//     }
//   };

//   const handleOpenExternalNavigation = () => {
//     if (currentLocation && job) {
//       const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
//       const url = Platform.OS === 'ios'
//         ? `${scheme}?saddr=${currentLocation.latitude},${currentLocation.longitude}&daddr=${job.location.latitude},${job.location.longitude}`
//         : `${scheme}0,0?q=${job.location.latitude},${job.location.longitude}(${encodeURIComponent(job.address)})`;
      
//       Linking.canOpenURL(url)
//         .then(supported => {
//           if (supported) {
//             return Linking.openURL(url);
//           } else {
//             const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${job.location.latitude},${job.location.longitude}`;
//             return Linking.openURL(fallbackUrl);
//           }
//         })
//         .catch(error => console.log('Error opening maps:', error));
//     }
//   };

//   const handleMarkArrived = () => {
//     Alert.alert(
//       'Mark as Arrived',
//       'Are you sure you want to mark yourself as arrived at the customer location?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel'
//         },
//         {
//           text: 'Yes, I\'m Here',
//           onPress: () => {
//             setArrived(true);
//             navigation.navigate('JobDetails', { jobId });
//           }
//         }
//       ]
//     );
//   };

//   if (loading || !currentLocation) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <ActivityIndicator size="large" color="#2563eb" />
//         <Text className="text-gray-600 mt-4">
//           {loading ? 'Loading job details...' : 'Getting your location...'}
//         </Text>
//       </View>
//     );
//   }

//   if (!job) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
//         <Text className="text-gray-800 font-bold text-lg mt-4">Job Not Found</Text>
//         <Text className="text-gray-500 text-center mt-2 px-10">
//           The job you're looking for doesn't exist or has been removed.
//         </Text>
//         <TouchableOpacity 
//           className="mt-6 px-6 py-3 bg-primary rounded-lg"
//           onPress={() => navigation.goBack()}
//         >
//           <Text className="text-white font-medium">Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Map View */}
//       <View className="flex-1">
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={{ width, height: height * 0.65 }}
//           initialRegion={{
//             latitude: currentLocation.latitude,
//             longitude: currentLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//           showsUserLocation
//           showsMyLocationButton={false}
//           followsUserLocation
//           onMapReady={fitMapToMarkers}
//           onLayout={fitMapToMarkers}
//         >
//           {/* Customer Location Marker */}
//           <Marker
//             coordinate={{
//               latitude: job.location.latitude,
//               longitude: job.location.longitude,
//             }}
//             title={job.customerName}
//             description={job.address}
//           >
//             <View className="bg-white p-1 rounded-full">
//               <View className="bg-red-500 p-2 rounded-full">
//                 <Ionicons name="location" size={16} color="white" />
//               </View>
//             </View>
//           </Marker>
          
//           {/* Directions */}
//           <MapViewDirections
//             origin={{
//               latitude: currentLocation.latitude,
//               longitude: currentLocation.longitude,
//             }}
//             destination={{
//               latitude: job.location.latitude,
//               longitude: job.location.longitude,
//             }}
//             apikey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with actual API key
//             strokeWidth={4}
//             strokeColor="#2563eb"
//             lineDashPattern={[0]}
//             onReady={(result) => {
//               setDistance(`${result.distance.toFixed(1)} km`);
//               setDuration(`${Math.ceil(result.duration)} min`);
//             }}
//           />
//         </MapView>
        
//         {/* Map Controls */}
//         <View className="absolute top-12 left-4 right-4 flex-row justify-between">
//           <TouchableOpacity 
//             className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-md"
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={20} color="#2563eb" />
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-md"
//             onPress={fitMapToMarkers}
//           >
//             <Ionicons name="locate" size={20} color="#2563eb" />
//           </TouchableOpacity>
//         </View>
        
//         <TouchableOpacity 
//           className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md"
//           onPress={handleOpenExternalNavigation}
//         >
//           <Ionicons name="navigate" size={24} color="#2563eb" />
//         </TouchableOpacity>
//       </View>
      
//       {/* Bottom Sheet */}
//       <View className="bg-white rounded-t-3xl shadow-lg pt-4 pb-8 px-4">
//         {/* Handle */}
//         <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-4" />
        
//         {/* Customer Info */}
//         <View className="flex-row items-center mb-4">
//           <Image 
//             source={{ uri: job.customerImage }}
//             className="w-12 h-12 rounded-full"
//           />
//           <View className="ml-3 flex-1">
//             <Text className="text-gray-800 font-bold">{job.customerName}</Text>
//             <Text className="text-gray-500 text-sm">{job.address}</Text>
//           </View>
//           <TouchableOpacity 
//             className="bg-primary w-10 h-10 rounded-full items-center justify-center"
//             onPress={handleCallCustomer}
//           >
//             <Ionicons name="call" size={18} color="white" />
//           </TouchableOpacity>
//         </View>
        
//         {/* ETA Info */}
//         <View className="flex-row justify-between bg-blue-50 p-3 rounded-xl mb-4">
//           <View className="items-center">
//             <Text className="text-gray-500 text-xs">Distance</Text>
//             <Text className="text-gray-800 font-bold">{distance}</Text>
//           </View>
          
//           <View className="items-center">
//             <Text className="text-gray-500 text-xs">Duration</Text>
//             <Text className="text-gray-800 font-bold">{duration}</Text>
//           </View>
          
//           <View className="items-center">
//             <Text className="text-gray-500 text-xs">Services</Text>
//             <Text className="text-gray-800 font-bold">{job.services.length}</Text>
//           </View>
          
//           <View className="items-center">
//             <Text className="text-gray-500 text-xs">Amount</Text>
//             <Text className="text-gray-800 font-bold">₹{job.totalAmount}</Text>
//           </View>
//         </View>
        
//         {/* Action Buttons */}
//         <View className="flex-row">
//           <TouchableOpacity 
//             className="flex-1 bg-primary py-3 rounded-lg items-center justify-center"
//             onPress={handleMarkArrived}
//           >
//             <Text className="text-white font-bold">I've Arrived</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             className="ml-4 bg-white border border-primary py-3 px-4 rounded-lg items-center justify-center"
//             onPress={() => navigation.navigate('JobDetails', { jobId })}
//           >
//             <Text className="text-primary font-medium">View Details</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default RouteTrackingScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// Mock types for self-contained component
type ProStackParamList = {
  RouteTracking: { jobId: string };
  JobDetails: { jobId: string };
};

type RouteTrackingScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type RouteTrackingScreenRouteProp = RouteProp<ProStackParamList, 'RouteTracking'>;

interface JobLocation {
  id: string;
  customerName: string;
  customerImage: string;
  customerPhone: string;
  address: string;
  location: { latitude: number; longitude: number };
  services: string[];
  totalAmount: number;
}

const RouteTrackingScreen = () => {
  const navigation = useNavigation<RouteTrackingScreenNavigationProp>();
  const route = useRoute<RouteTrackingScreenRouteProp>();
  const { jobId } = route.params;
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState('...');
  const [duration, setDuration] = useState('...');

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        Alert.alert('Location Error', 'Unable to get your current location.');
      }
    };

    const fetchJobDetails = () => {
      const mockJob: JobLocation = {
        id: 'JOB123456', customerName: 'Priya Sharma', customerImage: 'https://randomuser.me/api/portraits/women/44.jpg', customerPhone: '+91 9876543210', address: '123 Main St, Koramangala, Bangalore', location: { latitude: 12.9352, longitude: 77.6245 }, services: ['Premium Wash', 'Interior Cleaning'], totalAmount: 998,
      };
      setTimeout(() => {
        setJob(mockJob);
        setLoading(false);
      }, 1000);
    };

    requestLocationPermission();
    fetchJobDetails();
  }, [jobId, navigation]);

  const fitMapToMarkers = () => {
    if (mapRef.current && currentLocation && job) {
      mapRef.current.fitToCoordinates([currentLocation, job.location], {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  const handleCallCustomer = () => {
    if (job?.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    }
  };

  const handleOpenExternalNavigation = () => {
    if (job) {
      const url = Platform.select({
        ios: `maps:0,0?q=${job.location.latitude},${job.location.longitude}`,
        android: `geo:0,0?q=${job.location.latitude},${job.location.longitude}(${job.customerName})`,
      });
      if(url) Linking.openURL(url);
    }
  };

  if (loading || !currentLocation || !job) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {loading ? 'Loading job details...' : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...currentLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={fitMapToMarkers}
      >
        <Marker coordinate={job.location} title={job.customerName}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={20} color={colors.white} />
          </View>
        </Marker>
        <MapViewDirections
          origin={currentLocation}
          destination={job.location}
          apikey={"YOUR_GOOGLE_MAPS_API_KEY"} // Replace with your key
          strokeWidth={4}
          strokeColor={colors.primary}
          onReady={result => {
            setDistance(`${result.distance.toFixed(1)} km`);
            setDuration(`${Math.ceil(result.duration)} min`);
          }}
        />
      </MapView>

      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={fitMapToMarkers}>
          <Ionicons name="locate" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.navigateButton} onPress={handleOpenExternalNavigation}>
        <Ionicons name="navigate" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <View style={styles.customerInfo}>
          <Image source={{ uri: job.customerImage }} style={styles.customerImage} />
          <View style={styles.customerTextContainer}>
            <Text style={styles.customerName}>{job.customerName}</Text>
            <Text style={styles.customerAddress} numberOfLines={1}>{job.address}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
            <Ionicons name="call" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.etaInfo}>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Distance</Text><Text style={styles.etaValue}>{distance}</Text></View>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Duration</Text><Text style={styles.etaValue}>{duration}</Text></View>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Amount</Text><Text style={styles.etaValue}>₹{job.totalAmount}</Text></View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('JobDetails', { jobId })}>
          <Text style={styles.primaryButtonText}>I've Arrived / View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray300: '#D1D5DB',
  gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937', red500: '#EF4444',
  blue50: '#EFF6FF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  loadingText: { color: colors.gray600, marginTop: 16 },
  headerControls: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 60, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  controlButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  navigateButton: { position: 'absolute', bottom: 320, right: 16, backgroundColor: colors.white, padding: 12, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  markerContainer: { backgroundColor: colors.red500, padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.white },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'android' ? 16 : 32, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 10 },
  handle: { width: 64, height: 4, backgroundColor: colors.gray300, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  customerImage: { width: 48, height: 48, borderRadius: 24 },
  customerTextContainer: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  customerAddress: { color: colors.gray500, fontSize: 14 },
  callButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  etaInfo: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.blue50, padding: 12, borderRadius: 12, marginBottom: 16 },
  etaItem: { alignItems: 'center' },
  etaLabel: { color: colors.gray500, fontSize: 12 },
  etaValue: { color: colors.gray800, fontWeight: 'bold' },
  primaryButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default RouteTrackingScreen;

