import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProEarningsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedJobs: number;
  averageRating: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  jobIds: string[];
  paymentMethod: string;
  transactionId?: string;
}

const ProEarningsScreen = () => {
  const navigation = useNavigation<ProEarningsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');
  
  // Mock data for earnings summary
  const mockEarningsSummary: EarningsSummary = {
    totalEarnings: 24850,
    pendingPayouts: 3500,
    completedJobs: 42,
    averageRating: 4.8
  };
  
  // Mock data for payment history
  const mockPaymentHistory: PaymentHistory[] = [
    {
      id: 'PAY123456',
      amount: 3500,
      date: '2023-06-15',
      status: 'pending',
      jobIds: ['JOB789012', 'JOB789013'],
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'PAY123455',
      amount: 4200,
      date: '2023-06-10',
      status: 'completed',
      jobIds: ['JOB789010', 'JOB789011'],
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654321'
    },
    {
      id: 'PAY123454',
      amount: 3850,
      date: '2023-06-03',
      status: 'completed',
      jobIds: ['JOB789008', 'JOB789009'],
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654320'
    },
    {
      id: 'PAY123453',
      amount: 4500,
      date: '2023-05-27',
      status: 'completed',
      jobIds: ['JOB789006', 'JOB789007'],
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654319'
    },
    {
      id: 'PAY123452',
      amount: 5200,
      date: '2023-05-20',
      status: 'completed',
      jobIds: ['JOB789004', 'JOB789005'],
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654318'
    },
    {
      id: 'PAY123451',
      amount: 3600,
      date: '2023-05-13',
      status: 'completed',
      jobIds: ['JOB789002', 'JOB789003'],
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654317'
    }
  ];
  
  // Weekly earnings data for chart
  const weeklyEarnings = [
    { day: 'Mon', amount: 850 },
    { day: 'Tue', amount: 1200 },
    { day: 'Wed', amount: 950 },
    { day: 'Thu', amount: 1100 },
    { day: 'Fri', amount: 1500 },
    { day: 'Sat', amount: 1800 },
    { day: 'Sun', amount: 1400 }
  ];
  
  // Monthly earnings data for chart
  const monthlyEarnings = [
    { day: 'Week 1', amount: 5500 },
    { day: 'Week 2', amount: 6200 },
    { day: 'Week 3', amount: 6800 },
    { day: 'Week 4', amount: 6350 }
  ];
  
  // Yearly earnings data for chart
  const yearlyEarnings = [
    { day: 'Jan', amount: 18500 },
    { day: 'Feb', amount: 19200 },
    { day: 'Mar', amount: 21500 },
    { day: 'Apr', amount: 22800 },
    { day: 'May', amount: 24500 },
    { day: 'Jun', amount: 24850 }
  ];
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEarningsSummary(mockEarningsSummary);
      setPaymentHistory(mockPaymentHistory);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const getChartData = () => {
    switch (timeFilter) {
      case 'week':
        return weeklyEarnings;
      case 'month':
        return monthlyEarnings;
      case 'year':
        return yearlyEarnings;
      default:
        return weeklyEarnings;
    }
  };
  
  const renderChartBars = () => {
    const data = getChartData();
    const maxAmount = Math.max(...data.map(item => item.amount));
    
    return (
      <View className="flex-row justify-between items-end h-40 mt-4">
        {data.map((item, index) => {
          const barHeight = (item.amount / maxAmount) * 100;
          
          return (
            <View key={index} className="items-center">
              <View 
                className="w-8 bg-primary rounded-t-md"
                style={{ height: `${barHeight}%` }}
              />
              <Text className="text-xs text-gray-500 mt-1">{item.day}</Text>
              <Text className="text-xs font-medium">₹{item.amount}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  const getStatusColor = (status: 'completed' | 'pending' | 'processing') => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getStatusBgColor = (status: 'completed' | 'pending' | 'processing') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'processing':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading earnings data...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">My Earnings</Text>
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.navigate('ProNotifications')}
          >
            <Ionicons name="notifications" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('summary')}
        >
          <Text className={`font-medium ${activeTab === 'summary' ? 'text-primary' : 'text-gray-500'}`}>
            Earnings Summary
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'history' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('history')}
        >
          <Text className={`font-medium ${activeTab === 'history' ? 'text-primary' : 'text-gray-500'}`}>
            Payment History
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'summary' && earningsSummary && (
          <View className="p-4">
            {/* Total Earnings Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-500 text-sm">Total Earnings</Text>
              <Text className="text-3xl font-bold text-gray-800 mt-1">
                ₹{earningsSummary.totalEarnings.toLocaleString('en-IN')}
              </Text>
              
              <View className="flex-row mt-4 justify-between">
                <View className="items-center">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-1">
                    <FontAwesome5 name="money-bill-wave" size={16} color="#2563eb" />
                  </View>
                  <Text className="text-xs text-gray-500">Pending</Text>
                  <Text className="text-sm font-bold">₹{earningsSummary.pendingPayouts.toLocaleString('en-IN')}</Text>
                </View>
                
                <View className="items-center">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-1">
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                  <Text className="text-xs text-gray-500">Jobs</Text>
                  <Text className="text-sm font-bold">{earningsSummary.completedJobs}</Text>
                </View>
                
                <View className="items-center">
                  <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mb-1">
                    <Ionicons name="star" size={18} color="#F59E0B" />
                  </View>
                  <Text className="text-xs text-gray-500">Rating</Text>
                  <Text className="text-sm font-bold">{earningsSummary.averageRating}</Text>
                </View>
              </View>
            </View>
            
            {/* Earnings Chart */}
            <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-bold text-lg">Earnings Chart</Text>
                
                <View className="flex-row bg-gray-100 rounded-lg p-1">
                  <TouchableOpacity 
                    className={`px-3 py-1 rounded-md ${timeFilter === 'week' ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setTimeFilter('week')}
                  >
                    <Text className={timeFilter === 'week' ? 'text-primary font-medium' : 'text-gray-500'}>
                      Week
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className={`px-3 py-1 rounded-md ${timeFilter === 'month' ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setTimeFilter('month')}
                  >
                    <Text className={timeFilter === 'month' ? 'text-primary font-medium' : 'text-gray-500'}>
                      Month
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className={`px-3 py-1 rounded-md ${timeFilter === 'year' ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setTimeFilter('year')}
                  >
                    <Text className={timeFilter === 'year' ? 'text-primary font-medium' : 'text-gray-500'}>
                      Year
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {renderChartBars()}
            </View>
            
            {/* Payment Schedule */}
            <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
              <Text className="text-gray-800 font-bold text-lg mb-2">Payment Schedule</Text>
              <Text className="text-gray-500 mb-4">
                Your earnings are processed every week and transferred to your bank account within 2-3 business days.
              </Text>
              
              <View className="bg-blue-50 p-3 rounded-lg">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name="calendar" size={16} color="#2563eb" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-800 font-medium">Next Payout</Text>
                    <Text className="text-gray-500 text-sm">Monday, June 19, 2023</Text>
                  </View>
                </View>
                
                <View className="h-px bg-blue-200 my-3" />
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                    <FontAwesome5 name="money-bill-wave" size={14} color="#2563eb" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-800 font-medium">Estimated Amount</Text>
                    <Text className="text-gray-500 text-sm">₹3,500</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                className="mt-4 py-3 bg-primary rounded-lg items-center"
                onPress={() => navigation.navigate('ProSettings')}
              >
                <Text className="text-white font-medium">Update Payment Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {activeTab === 'history' && (
          <View className="p-4">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <View 
                  key={payment.id} 
                  className={`bg-white p-4 rounded-xl shadow-sm ${index > 0 ? 'mt-3' : ''}`}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-gray-800 font-bold">₹{payment.amount.toLocaleString('en-IN')}</Text>
                      <Text className="text-gray-500 text-sm">{formatDate(payment.date)}</Text>
                    </View>
                    
                    <View className={`px-3 py-1 rounded-full ${getStatusBgColor(payment.status)}`}>
                      <Text className={`text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="h-px bg-gray-100 my-3" />
                  
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-gray-500">Payment ID</Text>
                      <Text className="text-sm text-gray-700">{payment.id}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-xs text-gray-500">Method</Text>
                      <Text className="text-sm text-gray-700">{payment.paymentMethod}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-xs text-gray-500">Jobs</Text>
                      <Text className="text-sm text-gray-700">{payment.jobIds.length}</Text>
                    </View>
                  </View>
                  
                  {payment.transactionId && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Text className="text-xs text-gray-500">Transaction ID</Text>
                      <Text className="text-sm text-gray-700">{payment.transactionId}</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    className="mt-3 py-2 border border-primary rounded-lg items-center"
                  >
                    <Text className="text-primary font-medium">View Details</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-10">
                <MaterialCommunityIcons name="cash-remove" size={64} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-center">No payment history found</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProEarningsScreen;