import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProJobDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type ProJobDetailsScreenRouteProp = RouteProp<ProStackParamList, 'JobDetails'>;

interface JobDetail {
  id: string;
  customerName: string;
  customerImage: string;
  customerPhone: string;
  date: string;
  time: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  professionalLocation?: {
    latitude: number;
    longitude: number;
  };
  services: {
    name: string;
    price: number;
    description?: string;
  }[];
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  distance?: string;
  estimatedArrival?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  paymentStatus: 'paid' | 'pending';
  specialInstructions?: string;
  vehicleDetails?: {
    type: 'car' | 'motorcycle' | 'bicycle';
    brand: string;
    model: string;
    color: string;
    licensePlate?: string;
  };
}

const ProJobDetailsScreen = () => {
  const navigation = useNavigation<ProJobDetailsScreenNavigationProp>();
  const route = useRoute<ProJobDetailsScreenRouteProp>();
  const { jobId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [jobStatus, setJobStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock job data
  const mockJob: JobDetail = {
    id: 'JOB123456',
    customerName: 'Priya Sharma',
    customerImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    customerPhone: '+91 9876543210',
    date: 'Today',
    time: '11:30 AM',
    address: '123 Main St, Koramangala, Bangalore',
    location: {
      latitude: 12.9352,
      longitude: 77.6245
    },
    professionalLocation: {
      latitude: 12.9252,
      longitude: 77.6145
    },
    services: [
      { 
        name: 'Premium Wash', 
        price: 599,
        description: 'Exterior wash, wax application, tire shine, and window cleaning'
      },
      { 
        name: 'Interior Cleaning', 
        price: 399,
        description: 'Vacuum cleaning, dashboard polishing, and seat conditioning'
      }
    ],
    totalAmount: 998,
    status: 'upcoming',
    distance: '3.2 km',
    estimatedArrival: '25 mins',
    paymentStatus: 'paid',
    specialInstructions: 'Please be careful with the side mirrors, they were recently replaced.',
    vehicleDetails: {
      type: 'car',
      brand: 'Honda',
      model: 'City',
      color: 'Silver',
      licensePlate: 'KA 01 AB 1234'
    }
  };

  useEffect(() => {
    // Simulate API call to fetch job details
    const fetchJobDetails = () => {
      setLoading(true);
      setTimeout(() => {
        setJob(mockJob);
        setJobStatus(mockJob.status);
        setLoading(false);
      }, 1500);
    };

    fetchJobDetails();
  }, [jobId]);

  const handleStartJob = () => {
    Alert.alert(
      'Start Job',
      'Are you sure you want to start this job? This will notify the customer that you are on your way.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Start',
          onPress: () => {
            // Simulate API call to update job status
            setJobStatus('ongoing');
            if (job) {
              setJob({...job, status: 'ongoing'});
            }
            // Navigate to route tracking
            navigation.navigate('RouteTracking', { jobId });
          }
        }
      ]
    );
  };

  const handleCompleteJob = () => {
    setShowConfirmation(true);
  };

  const confirmCompleteJob = () => {
    // Simulate API call to complete job
    setJobStatus('completed');
    if (job) {
      setJob({
        ...job, 
        status: 'completed',
        completedAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
    }
    setShowConfirmation(false);
    
    // Show success message
    Alert.alert(
      'Job Completed',
      'Great job! The customer has been notified that the service is complete.',
      [{ text: 'OK' }]
    );
  };

  const handleCancelJob = () => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Simulate API call to cancel job
            setJobStatus('cancelled');
            if (job) {
              setJob({...job, status: 'cancelled'});
            }
            
            // Show success message
            Alert.alert(
              'Job Cancelled',
              'The job has been cancelled and the customer has been notified.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    if (job?.customerPhone) {
      const phoneNumber = Platform.OS === 'android' 
        ? `tel:${job.customerPhone}` 
        : `telprompt:${job.customerPhone}`;
      
      Linking.canOpenURL(phoneNumber)
        .then(supported => {
          if (supported) {
            return Linking.openURL(phoneNumber);
          }
        })
        .catch(error => console.log('Error calling customer:', error));
    }
  };

  const handleNavigate = () => {
    if (job?.location) {
      const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
      const url = Platform.OS === 'ios'
        ? `${scheme}?ll=${job.location.latitude},${job.location.longitude}&q=${encodeURIComponent(job.address)}`
        : `${scheme}${job.location.latitude},${job.location.longitude}?q=${encodeURIComponent(job.address)}`;
      
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${job.location.latitude},${job.location.longitude}`;
            return Linking.openURL(fallbackUrl);
          }
        })
        .catch(error => console.log('Error opening maps:', error));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 font-bold text-lg mt-4">Job Not Found</Text>
        <Text className="text-gray-500 text-center mt-2 px-10">
          The job you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity 
          className="mt-6 px-6 py-3 bg-primary rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = () => {
    switch (jobStatus) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (jobStatus) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return jobStatus;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg ml-4">Job Details</Text>
          <View className={`ml-auto px-3 py-1 rounded-full ${getStatusColor().split(' ')[0]}`}>
            <Text className={`text-xs font-medium ${getStatusColor().split(' ')[1]}`}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        {job.location && (
          <View className="h-48 w-full">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ height: '100%', width: '100%' }}
              initialRegion={{
                latitude: job.location.latitude,
                longitude: job.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              zoomEnabled
              zoomControlEnabled
            >
              <Marker
                coordinate={{
                  latitude: job.location.latitude,
                  longitude: job.location.longitude,
                }}
                title={job.customerName}
                description={job.address}
              >
                <View className="bg-white p-1 rounded-full">
                  <View className="bg-red-500 p-2 rounded-full">
                    <Ionicons name="location" size={16} color="white" />
                  </View>
                </View>
              </Marker>
              
              {job.professionalLocation && (
                <>
                  <Marker
                    coordinate={{
                      latitude: job.professionalLocation.latitude,
                      longitude: job.professionalLocation.longitude,
                    }}
                    title="Your Location"
                  >
                    <View className="bg-white p-1 rounded-full">
                      <View className="bg-primary p-2 rounded-full">
                        <Ionicons name="car" size={16} color="white" />
                      </View>
                    </View>
                  </Marker>
                  
                  <MapViewDirections
                    origin={{
                      latitude: job.professionalLocation.latitude,
                      longitude: job.professionalLocation.longitude,
                    }}
                    destination={{
                      latitude: job.location.latitude,
                      longitude: job.location.longitude,
                    }}
                    apikey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with actual API key
                    strokeWidth={3}
                    strokeColor="#2563eb"
                    lineDashPattern={[0]}
                  />
                </>
              )}
            </MapView>
            
            <TouchableOpacity 
              className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md"
              onPress={handleNavigate}
            >
              <Ionicons name="navigate" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Customer Info */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-xl shadow-sm">
          <View className="flex-row items-center">
            <Image 
              source={{ uri: job.customerImage }}
              className="w-16 h-16 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-gray-800 font-bold text-lg">{job.customerName}</Text>
              <Text className="text-gray-500">{job.customerPhone}</Text>
              <View className="flex-row mt-2">
                <TouchableOpacity 
                  className="bg-primary py-1 px-4 rounded-full flex-row items-center"
                  onPress={handleCallCustomer}
                >
                  <Ionicons name="call" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {/* Job Info */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-xl shadow-sm">
          <Text className="text-gray-800 font-bold text-base mb-3">Job Information</Text>
          
          <View className="flex-row items-center mb-3">
            <View className="w-8 items-center">
              <Ionicons name="calendar-outline" size={18} color="#4B5563" />
            </View>
            <View>
              <Text className="text-gray-700">{job.date}</Text>
              <Text className="text-gray-500 text-sm">{job.time}</Text>
            </View>
          </View>
          
          <View className="flex-row items-start mb-3">
            <View className="w-8 items-center">
              <Ionicons name="location-outline" size={18} color="#4B5563" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700">{job.address}</Text>
              {job.distance && job.estimatedArrival && (
                <Text className="text-gray-500 text-sm">
                  {job.distance} • ETA: {job.estimatedArrival}
                </Text>
              )}
            </View>
          </View>
          
          {job.vehicleDetails && (
            <View className="flex-row items-start mb-3">
              <View className="w-8 items-center">
                <FontAwesome5 
                  name={job.vehicleDetails.type === 'car' ? 'car' : 
                        job.vehicleDetails.type === 'motorcycle' ? 'motorcycle' : 'bicycle'} 
                  size={18} 
                  color="#4B5563" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700">
                  {job.vehicleDetails.brand} {job.vehicleDetails.model} ({job.vehicleDetails.color})
                </Text>
                {job.vehicleDetails.licensePlate && (
                  <Text className="text-gray-500 text-sm">
                    License Plate: {job.vehicleDetails.licensePlate}
                  </Text>
                )}
              </View>
            </View>
          )}
          
          {job.specialInstructions && (
            <View className="flex-row items-start mb-3">
              <View className="w-8 items-center">
                <Ionicons name="information-circle-outline" size={18} color="#4B5563" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">Special Instructions:</Text>
                <Text className="text-gray-600">{job.specialInstructions}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Services */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-xl shadow-sm">
          <Text className="text-gray-800 font-bold text-base mb-3">Services</Text>
          
          {job.services.map((service, index) => (
            <View key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
              <View className="flex-row justify-between">
                <Text className="text-gray-800 font-medium">{service.name}</Text>
                <Text className="text-gray-800 font-medium">₹{service.price}</Text>
              </View>
              {service.description && (
                <Text className="text-gray-500 text-sm mt-1">{service.description}</Text>
              )}
            </View>
          ))}
          
          <View className="h-[1px] bg-gray-200 my-3" />
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 font-bold">Total Amount</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-800 font-bold text-lg">₹{job.totalAmount}</Text>
              <View className={`ml-2 px-2 py-0.5 rounded ${job.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Text className={`text-xs ${job.paymentStatus === 'paid' ? 'text-green-800' : 'text-amber-800'}`}>
                  {job.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="p-4 mt-2 mb-6">
          {jobStatus === 'upcoming' && (
            <View className="flex-row">
              <TouchableOpacity 
                className="flex-1 bg-primary py-3 rounded-lg items-center justify-center"
                onPress={handleStartJob}
              >
                <Text className="text-white font-bold">Start Job</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="ml-4 bg-white border border-red-500 py-3 px-4 rounded-lg items-center justify-center"
                onPress={handleCancelJob}
              >
                <Text className="text-red-500 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {jobStatus === 'ongoing' && (
            <View className="flex-row">
              <TouchableOpacity 
                className="flex-1 bg-green-600 py-3 rounded-lg items-center justify-center"
                onPress={handleCompleteJob}
              >
                <Text className="text-white font-bold">Mark as Completed</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="ml-4 bg-primary py-3 px-4 rounded-lg items-center justify-center"
                onPress={() => navigation.navigate('RouteTracking', { jobId })}
              >
                <Text className="text-white font-medium">Navigate</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {(jobStatus === 'completed' || jobStatus === 'cancelled') && (
            <TouchableOpacity 
              className="bg-primary py-3 rounded-lg items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-white font-bold">Back to Jobs</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {/* Completion Confirmation Modal */}
      {showConfirmation && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white m-4 p-5 rounded-xl w-5/6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="checkmark" size={32} color="#16A34A" />
              </View>
              <Text className="text-gray-800 font-bold text-lg">Complete Job?</Text>
            </View>
            
            <Text className="text-gray-600 text-center mb-4">
              Are you sure you want to mark this job as completed? This will notify the customer that the service has been completed.
            </Text>
            
            <View className="flex-row">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center justify-center mr-2"
                onPress={() => setShowConfirmation(false)}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-green-600 py-3 rounded-lg items-center justify-center ml-2"
                onPress={confirmCompleteJob}
              >
                <Text className="text-white font-bold">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProJobDetailsScreen;