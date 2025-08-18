// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,StyleSheet
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
// import { LineChart } from 'react-native-chart-kit';
// import { Dimensions } from 'react-native';
// import { useAuth } from '../../context/AuthContext';
// import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
// import {bookingsData,revenueData,topProfessionals,recentBookings,dashboardStats} from '../../constants/data/AdminScreenData';
// import StatCard from '~/components/admin/StatCard';
// import BookingCard from '~/components/admin/BookingCard';
// import ProfessionalCard from '~/components/admin/ProfessionalCard';
// type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// const AdminDashboardScreen = () => {
//   const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
//   const { user } = useAuth();
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
//   const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');
  
//   useEffect(() => {
//     // Simulate data loading
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500);
    
//     return () => clearTimeout(timer);
//   }, []);
  
//   const onRefresh = () => {
//     setRefreshing(true);
//     // Simulate refresh
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1500);
//   };
  
//   const chartConfig = {
//     backgroundGradientFrom: '#ffffff',
//     backgroundGradientTo: '#ffffff',
//     decimalPlaces: 0,
//     color: (opacity = 1) => statsFilter === 'revenue' ? `rgba(37, 99, 235, ${opacity})` : `rgba(139, 92, 246, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
//     style: {
//       borderRadius: 16,
//     },
//     propsForDots: {
//       r: '4',
//       strokeWidth: '2',
//       stroke: statsFilter === 'revenue' ? '#2563EB' : '#8B5CF6',
//     },
//   };
  
//   const chartData = statsFilter === 'revenue' ? revenueData[timeFilter] : bookingsData[timeFilter];
  
//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-50">
//         <ActivityIndicator size="large" color="#2563EB" />
//         <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <Text style={styles.headerTitle}>Dashboard</Text>
//           <Text style={styles.headerSubtitle}>Welcome back, {user?.name || 'Admin'}</Text>
//         </View>
//         <TouchableOpacity
//           style={styles.notificationButton}
//           onPress={() => navigation.navigate('AdminNotifications')}
//         >
//           <Ionicons name="notifications" size={20} color="white" />
//           <View style={styles.notificationBadge} />
//         </TouchableOpacity>
//       </View>
      
//       <ScrollView 
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
//         }
//       >
//         {/* Stats Cards */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.statsContainer}>
//             <StatCard
//               title="Total Revenue"
//               value={dashboardStats.totalRevenue}
//               icon={<MaterialCommunityIcons name="currency-inr" size={20} color="white" />}
//               color="#2563EB"
//               change={dashboardStats.revenueChange}
//               isPositive={true}
//             />
//             <StatCard
//               title="Total Bookings"
//               value={dashboardStats.totalBookings}
//               icon={<MaterialCommunityIcons name="calendar-check" size={20} color="white" />}
//               color="#8B5CF6"
//               change={dashboardStats.bookingsChange}
//               isPositive={true}
//             />
//             <StatCard
//               title="Active Customers"
//               value={dashboardStats.activeCustomers}
//               icon={<Ionicons name="people" size={20} color="white" />}
//               color="#10B981"
//               change={dashboardStats.customersChange}
//               isPositive={true}
//             />
//             <StatCard
//               title="Active Pros"
//               value={dashboardStats.activeProfessionals}
//               icon={<FontAwesome5 name="user-tie" size={18} color="white" />}
//               color="#F59E0B"
//               change={dashboardStats.professionalsChange}
//               isPositive={false}
//             />
//             {/* Other StatCards... */}
//           </View>
//         </View>
        
//         {/* Chart Section */}
//         <View style={styles.chartContainer}>
//           <View style={styles.chartHeader}>
//             <Text style={styles.chartTitle}>
//               {statsFilter === 'revenue' ? 'Revenue Analytics' : 'Booking Analytics'}
//             </Text>
//             <View style={styles.filterToggle}>
//               <TouchableOpacity
//                 style={[styles.filterButton, statsFilter === 'revenue' && styles.activeFilter]}
//                 onPress={() => setStatsFilter('revenue')}
//               >
//                 <Text style={[styles.filterText, statsFilter === 'revenue' && styles.activeFilterText]}>Revenue</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.filterButton, statsFilter === 'bookings' && styles.activeFilter]}
//                 onPress={() => setStatsFilter('bookings')}
//               >
//                 <Text style={[styles.filterText, statsFilter === 'bookings' && styles.activeFilterText]}>Bookings</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
          
//           <LineChart
//             data={chartData}
//             width={Dimensions.get('window').width - 48}
//             height={220}
//             chartConfig={chartConfig}
//             bezier
//             style={styles.chart}
//           />
          
//           <View style={styles.timeFilterContainer}>
//             {['daily', 'weekly', 'monthly'].map((filter) => (
//               <TouchableOpacity
//                 key={filter}
//                 style={[styles.timeFilterButton, timeFilter === filter && styles.activeTimeFilter]}
//                 onPress={() => setTimeFilter(filter as any)}
//               >
//                 <Text style={styles.timeFilterText}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
        
//         {/* Recent Bookings */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Recent Bookings</Text>
//             <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
//               <Text style={styles.viewAllText}>View All</Text>
//             </TouchableOpacity>
//           </View>
          
//           {recentBookings.map((booking) => (
//             <BookingCard
//               key={booking.id}
//               {...booking}
//               onPress={() => navigation.navigate('AdminBookingDetails', { bookingId: booking.id })}
//             />
//           ))}
//         </View>
        
//         {/* Top Professionals */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Top Professionals</Text>
//             <TouchableOpacity onPress={() => navigation.navigate('AdminProfessionals')}>
//               <Text style={styles.viewAllText}>View All</Text>
//             </TouchableOpacity>
//           </View>
          
//           {topProfessionals.map((professional) => (
//             <ProfessionalCard
//               key={professional.id}
//               {...professional}
//               onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: professional.id })}
//             />
//           ))}
//         </View>
        
//         {/* Quick Actions */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionTitle}>Quick Actions</Text>
//           <View style={styles.quickActionsContainer}>
//             {[
//               { icon: 'calendar-plus', color: '#2563EB', text: 'Manage Bookings', nav: 'AdminBookings' },
//               { icon: 'user-tie', color: '#8B5CF6', text: 'Manage Pros', nav: 'AdminProfessionals' },
//               {icon: 'users',color:'#10B981',text:'Manage Customers',nav:'AdminCustomers' },
//               {icon:'list-ul',color:"#F59E0B",text:'Settings',nav:'AdminSettings'}
//             ].map((action) => (
//               <TouchableOpacity 
//                 key={action.text}
//                 style={styles.quickActionButton}
//                 onPress={() => navigation.navigate(action.nav as any)}
//               >
//                 <FontAwesome5 name={action.icon} size={24} color={action.color} />
//                 <Text style={styles.quickActionText}>{action.text}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };



// export default AdminDashboardScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f9fafb',
//   },
//   loadingText: {
//     marginTop: 16,
//     color: '#6b7280',
//   },
//   header: {
//     backgroundColor: '#2563eb',
//     paddingTop: 48,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   headerSubtitle: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   notificationButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     backgroundColor: '#ef4444',
//     borderRadius: 6,
//   },
//   sectionContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     color: '#1f2937',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   viewAllText: {
//     color: '#2563eb',
//     fontSize: 14,
//   },
//    // Stats Card styles
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   statCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     width: '48%',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   statCardContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   statCardTitle: {
//     color: '#6b7280',
//     fontSize: 12,
//   },
//   statCardValue: {
//     color: '#111827',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   statCardIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statCardChange: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   statCardChangeText: {
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   positiveChange: {
//     color: '#10B981',
//   },
//   negativeChange: {
//     color: '#EF4444',
//   },
//   chartContainer: {
//     backgroundColor: 'white',
//     marginHorizontal: 16,
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   chartHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   chartTitle: {
//     color: '#1f2937',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   filterToggle: {
//     flexDirection: 'row',
//     borderRadius: 20,
//     backgroundColor: '#e5e7eb',
//     overflow: 'hidden',
//   },
//   filterButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//   },
//   activeFilter: {
//     backgroundColor: '#2563eb',
//     borderRadius: 20,
//   },
//   filterText: {
//     color: '#6b7280',
//     fontSize:14,
//   },
//   activeFilterText: {
//     color: 'white',
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 8,
//   },
//   timeFilterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 8,
//   },
//   timeFilterButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginHorizontal: 4,
//     borderRadius:20,
//     backgroundColor: 'white',
//   },
//   activeTimeFilter: {
//     backgroundColor: '#e5e7eb',
//   },
//   timeFilterText: {
//     color: '#6b7280',
//     fontSize:14,
//   },
//   // Booking Card styles
//   bookingCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   bookingCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   bookingCardName: {
//     color: '#111827',
//     fontWeight: '500',
//     fontSize: 16,
//   },
//   bookingCardService: {
//     color: '#6b7280',
//     fontSize: 14,
//   },
//   bookingCardAmount: {
//     color: '#2563eb',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   bookingCardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   bookingCardDate: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   bookingCardDateTime: {
//     color: '#6b7280',
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   bookingCardStatus: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   bookingCardStatusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     textTransform: 'capitalize',
//   },

//   // Status specific styles
//   'status-pending': {
//     backgroundColor: '#fef3c7',
//   },
//   'status-pendingText': {
//     color: '#92400e',
//   },
//   'status-ongoing': {
//     backgroundColor: '#dbeafe',
//   },
//   'status-ongoingText': {
//     color: '#1e40af',
//   },
//   'status-completed': {
//     backgroundColor: '#d1fae5',
//   },
//   'status-completedText': {
//     color: '#065f46',
//   },
//   'status-cancelled': {
//     backgroundColor: '#fee2e2',
//   },
//   'status-cancelledText': {
//     color: '#991b1b',
//   },

//   // Professional Card styles
//   professionalCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   professionalCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   professionalAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#e5e7eb',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   professionalAvatarText: {
//     color: '#6b7280',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   professionalInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   professionalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   professionalName: {
//     color: '#111827',
//     fontWeight: '500',
//     fontSize: 16,
//   },
//   onlineStatus: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   online: {
//     backgroundColor: '#d1fae5',
//   },
//   offline: {
//     backgroundColor: '#e5e7eb',
//   },
//   onlineStatusText: {
//     fontSize: 12,
//   },
//   'onlineStatusText-online': {
//     color: '#065f46',
//   },
//   'onlineStatusText-offline': {
//     color: '#4b5563',
//   },
//   professionalStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingText: {
//     color: '#6b7280',
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   jobsText: {
//     color: '#6b7280',
//     fontSize: 12,
//   },

//   // Quick Actions styles
//   quickActionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   quickActionButton: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     width: '48%',
//     marginBottom: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   quickActionText: {
//     color: '#1f2937',
//     fontWeight: '500',
//     marginTop: 8,
//     fontSize: 14,
//   },

// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView // 1. Import SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import {bookingsData,revenueData,topProfessionals,recentBookings,dashboardStats} from '../../constants/data/AdminScreenData';
import StatCard from '~/components/admin/StatCard';
import BookingCard from '~/components/admin/BookingCard';
import ProfessionalCard from '~/components/admin/ProfessionalCard';

// --- Type Definition ---
type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// --- Main Component ---
const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => statsFilter === 'revenue' ? `rgba(37, 99, 235, ${opacity})` : `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: statsFilter === 'revenue' ? '#2563EB' : '#8B5CF6',
    },
  };
  
  const chartData = statsFilter === 'revenue' ? revenueData[timeFilter] : bookingsData[timeFilter];
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    // 2. Use SafeAreaView as the root component
    <SafeAreaView style={styles.container}>
      {/* 3. Updated Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Revenue"
              value={dashboardStats.totalRevenue}
              icon={<MaterialCommunityIcons name="currency-inr" size={20} color="white" />}
              color="#2563EB"
              change={dashboardStats.revenueChange}
              isPositive={true}
            />
            <StatCard
              title="Total Bookings"
              value={dashboardStats.totalBookings}
              icon={<MaterialCommunityIcons name="calendar-check" size={20} color="white" />}
              color="#8B5CF6"
              change={dashboardStats.bookingsChange}
              isPositive={true}
            />
            <StatCard
              title="Active Customers"
              value={dashboardStats.activeCustomers}
              icon={<Ionicons name="people" size={20} color="white" />}
              color="#10B981"
              change={dashboardStats.customersChange}
              isPositive={true}
            />
            <StatCard
              title="Active Pros"
              value={dashboardStats.activeProfessionals}
              icon={<FontAwesome5 name="user-tie" size={18} color="white" />}
              color="#F59E0B"
              change={dashboardStats.professionalsChange}
              isPositive={false}
            />
          </View>
        </View>
        
        {/* Chart Section */}
        <View style={styles.chartSectionContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>
              {statsFilter === 'revenue' ? 'Revenue Analytics' : 'Booking Analytics'}
            </Text>
            <View style={styles.filterToggle}>
              <TouchableOpacity
                style={[styles.filterButton, statsFilter === 'revenue' && styles.activeFilter]}
                onPress={() => setStatsFilter('revenue')}
              >
                <Text style={[styles.filterText, statsFilter === 'revenue' && styles.activeFilterText]}>Revenue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statsFilter === 'bookings' && styles.activeFilter]}
                onPress={() => setStatsFilter('bookings')}
              >
                <Text style={[styles.filterText, statsFilter === 'bookings' && styles.activeFilterText]}>Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32} // Adjusted for padding
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          
          <View style={styles.timeFilterContainer}>
            {['daily', 'weekly', 'monthly'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.timeFilterButton, timeFilter === filter && styles.activeTimeFilter]}
                onPress={() => setTimeFilter(filter as any)}
              >
                <Text style={styles.timeFilterText}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Recent Bookings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onPress={() => navigation.navigate('AdminBookingDetails', { bookingId: booking.id })}
            />
          ))}
        </View>
        
        {/* Top Professionals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Professionals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminProfessionals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {topProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: professional.id })}
            />
          ))}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {[
              { icon: 'calendar-plus', color: '#2563EB', text: 'Manage Bookings', nav: 'AdminBookings' },
              { icon: 'user-tie', color: '#8B5CF6', text: 'Manage Pros', nav: 'AdminProfessionals' },
              { icon: 'users', color: '#10B981', text: 'Manage Customers', nav: 'AdminCustomers' },
              { icon: 'cogs', color: "#F59E0B", text: 'Settings', nav: 'AdminSettings' }
            ].map((action) => (
              <TouchableOpacity 
                key={action.text}
                style={styles.quickActionButton}
                onPress={() => navigation.navigate(action.nav as any)}
              >
                <FontAwesome5 name={action.icon} size={24} color={action.color} />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    backgroundColor: '#F9FAFB', // Light grey background for the scrollable content
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align items to the end (right)
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
     // Ensure title is behind the button
  },
  notificationButton: {
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  chartSectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeFilter: {
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2563EB',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  timeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTimeFilter: {
    backgroundColor: '#E5E7EB',
  },
  timeFilterText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 12,
    fontSize: 14,
  },
});

export default AdminDashboardScreen;

