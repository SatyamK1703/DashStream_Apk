import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StyleSheet, // Import StyleSheet
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Import proper types and hooks
import { ProStackParamList } from '../../../app/routes/ProfessionalNavigator';
import { useProfessionalEarningsScreen } from '../../hooks/useProfessional';

type ProEarningsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// --- Interfaces ---
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

  // Use the earnings hook
  const {
    earnings,
    isLoading,
    error,
    refresh
  } = useProfessionalEarningsScreen();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');

  // --- Helper Functions ---
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const getChartData = () => {
    if (!earnings?.chartData) return [];
    return earnings.chartData[timeFilter] || [];
  };

  const onRefresh = () => {
    refresh();
  };

  // --- Render Functions ---
  const renderChartBars = () => {
    const data = getChartData();
    const maxAmount = Math.max(...data.map(item => item.amount), 1);
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.chartBarWrapper}>
            <View style={[styles.chartBar, { height: `${(item.amount / maxAmount) * 100}%` }]} />
            <Text style={styles.chartLabel}>{item.day}</Text>
            <Text style={styles.chartAmount}>₹{item.amount}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSummary = () => {
    if (!earnings) return null;
    return (
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
          <Text style={styles.summaryTotal}>₹{earnings.totalEarnings?.toLocaleString('en-IN') || '0'}</Text>
          <View style={styles.summaryMetrics}>
            {[
              { label: 'Pending', value: `₹${earnings.pendingPayouts?.toLocaleString('en-IN') || '0'}`, icon: 'money-bill-wave', color: colors.blue, bgColor: colors.blue100 },
              { label: 'Jobs', value: earnings.completedJobs || 0, icon: 'checkmark-circle', color: colors.green, bgColor: colors.green100 },
              { label: 'Rating', value: earnings.averageRating || 0, icon: 'star', color: colors.amber, bgColor: colors.amber100 },
            ].map(metric => (
              <View key={metric.label} style={styles.metricItem}>
                <View style={[styles.metricIconContainer, { backgroundColor: metric.bgColor }]}>
                  <FontAwesome5 name={metric.icon as any} size={16} color={metric.color} />
                </View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Earnings Chart</Text>
            <View style={styles.filterContainer}>
              {(['week', 'month', 'year'] as const).map(filter => (
                <TouchableOpacity key={filter} style={[styles.filterButton, timeFilter === filter && styles.activeFilterButton]} onPress={() => setTimeFilter(filter)}>
                  <Text style={[styles.filterText, timeFilter === filter && styles.activeFilterText]}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {renderChartBars()}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <Text style={styles.infoText}>Your earnings are processed weekly and transferred to your bank account within 2-3 business days.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ProSettings')}>
            <Text style={styles.primaryButtonText}>Update Payment Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: PaymentHistory }) => {
    const statusStyle = {
      completed: { bg: colors.green100, text: colors.green600 },
      pending: { bg: colors.amber100, text: colors.amber600 },
      processing: { bg: colors.blue100, text: colors.blue600 },
    }[item.status];

    return (
      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.historyDetails}>
          <View style={styles.historyDetailItem}><Text style={styles.historyDetailLabel}>Payment ID</Text><Text style={styles.historyDetailValue}>{item.id}</Text></View>
          <View style={styles.historyDetailItem}><Text style={styles.historyDetailLabel}>Jobs</Text><Text style={styles.historyDetailValue}>{item.jobIds.length}</Text></View>
        </View>
        {item.transactionId && (
          <View style={styles.historyTransaction}>
            <Text style={styles.historyDetailLabel}>Transaction ID</Text>
            <Text style={styles.historyDetailValue}>{item.transactionId}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHistory = () => (
    <FlatList
      data={earnings?.paymentHistory || []}
      renderItem={renderHistoryItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="cash-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyStateText}>No payment history found</Text>
        </View>
      }
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ProNotifications')}>
          <Ionicons name="notifications" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'summary' && styles.activeTab]} onPress={() => setActiveTab('summary')}>
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.activeTab]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}>
        {activeTab === 'summary' ? renderSummary() : renderHistory()}
      </ScrollView>
    </View>
  );
};

// --- Styles ---
const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray300: '#D1D5DB', gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937',
  blue: '#2563EB', blue100: '#DBEAFE', blue600: '#2563EB', green: '#10B981', green100: '#D1FAE5', green600: '#059669', amber: '#F59E0B', amber100: '#FEF3C7', amber600: '#D97706',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  flex1: { flex: 1 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  loadingText: { color: colors.gray600, marginTop: 16 },
  contentContainer: { padding: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontWeight: '500', color: colors.gray500 },
  activeTabText: { color: colors.primary },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  summaryLabel: { color: colors.gray500, fontSize: 14 },
  summaryTotal: { fontSize: 32, fontWeight: 'bold', color: colors.gray800, marginTop: 4 },
  summaryMetrics: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-around' },
  metricItem: { alignItems: 'center' },
  metricIconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: colors.gray500 },
  metricValue: { fontSize: 14, fontWeight: 'bold', color: colors.gray800 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18 },
  filterContainer: { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: 8, padding: 4 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  activeFilterButton: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 },
  filterText: { color: colors.gray500 },
  activeFilterText: { color: colors.primary, fontWeight: '500' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, marginTop: 16 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartBar: { width: '50%', backgroundColor: colors.primary, borderRadius: 4 },
  chartLabel: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  chartAmount: { fontSize: 12, fontWeight: '500', color: colors.gray800 },
  infoText: { color: colors.gray500, marginVertical: 12, lineHeight: 20 },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: colors.white, fontWeight: '500' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyAmount: { color: colors.gray800, fontWeight: 'bold', fontSize: 16 },
  historyDate: { color: colors.gray500, fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 12, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: 12 },
  historyDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  historyDetailItem: { flex: 1 },
  historyDetailLabel: { fontSize: 12, color: colors.gray500 },
  historyDetailValue: { fontSize: 14, color: colors.gray800 },
  historyTransaction: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { color: colors.gray500, marginTop: 16 },
});

export default ProEarningsScreen;
