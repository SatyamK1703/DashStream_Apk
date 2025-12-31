import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/admin/Header';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useOfferStats, useUpdateOffer } from '../../hooks/adminOffers';

type AdminOfferStatsRouteProp = RouteProp<AdminStackParamList, 'AdminOfferStats'>;
type AdminOfferStatsNavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'AdminOfferStats'
>;

interface OfferUsage {
  _id: string;
  user: {
    _id: string;
    phone: string;
    name?: string;
  };
  usedAt: string;
  booking: {
    _id: string;
    serviceTitle: string;
    totalAmount: number;
    discountAmount: number;
  };
}

interface OfferStatsData {
  offer: {
    _id: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    offerCode: string;
    usageLimit?: number;
    usageCount: number;
  };
  usageHistory: OfferUsage[];
  topUsers: {
    user: {
      _id: string;
      phone: string;
      name?: string;
    };
    usageCount: number;
    totalSavings: number;
  }[];
  totalRevenue: number;
  totalSavings: number;
}

const AdminOfferStatsScreen = () => {
  const navigation = useNavigation<AdminOfferStatsNavigationProp>();
  const route = useRoute<AdminOfferStatsRouteProp>();
  const { offerId, offerTitle } = route.params;

  const {
    data: statsData,
    loading,
    error,
    refresh: fetchStats,
  } = useOfferStats(offerId);

  const { execute: updateOffer, loading: updateLoading } = useUpdateOffer();

  const [refreshing, setRefreshing] = useState(false);
  const [editingUsageLimit, setEditingUsageLimit] = useState(false);
  const [newUsageLimit, setNewUsageLimit] = useState('');
  const [resetingUsage, setResetingUsage] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleUpdateUsageLimit = async () => {
    try {
      const limit = parseInt(newUsageLimit);
      if (isNaN(limit) || limit < 0) {
        Alert.alert('Error', 'Please enter a valid number');
        return;
      }

      await updateOffer(offerId, { usageLimit: limit });
      setEditingUsageLimit(false);
      setNewUsageLimit('');
      await fetchStats(); // Refresh data
      Alert.alert('Success', 'Usage limit updated successfully');
    } catch (error) {
      console.error('Update usage limit error:', error);
      Alert.alert('Error', 'Failed to update usage limit');
    }
  };

  const handleResetUsageCount = async () => {
    Alert.alert(
      'Reset Usage Count',
      'Are you sure you want to reset the usage count to 0? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetingUsage(true);
              await updateOffer(offerId, { usageCount: 0 });
              await fetchStats(); // Refresh data
              Alert.alert('Success', 'Usage count reset successfully');
            } catch (error) {
              console.error('Reset usage count error:', error);
              Alert.alert('Error', 'Failed to reset usage count');
            } finally {
              setResetingUsage(false);
            }
          },
        },
      ]
    );
  };

  const startEditingUsageLimit = () => {
    setNewUsageLimit(statsData?.offer?.usageLimit?.toString() || '');
    setEditingUsageLimit(true);
  };

  if (loading && !statsData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={`${offerTitle} Stats`} 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading offer statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !statsData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={`${offerTitle} Stats`} 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load offer statistics</Text>
          <Text style={styles.errorSubtext}>Please try again</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { offer, usageHistory, topUsers, totalRevenue, totalSavings } = statsData;

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`${offer.title} Stats`} 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
          />
        }
      >
        {/* Offer Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          <Text style={styles.offerCode}>Code: {offer.offerCode}</Text>
          
          <View style={styles.offerDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Discount:</Text>
              <Text style={styles.detailValue}>
                {offer.discountType === 'percentage'
                  ? `${offer.discount}%`
                  : formatCurrency(offer.discount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valid Until:</Text>
              <Text style={styles.detailValue}>
                {new Date(offer.validUntil).toLocaleDateString('en-IN')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[
                styles.statusBadge,
                offer.isActive ? styles.activeBadge : styles.inactiveBadge
              ]}>
                {offer.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#2563EB" />
            <Text style={styles.statNumber}>{offer.usageCount}</Text>
            <Text style={styles.statLabel}>Total Uses</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color="#059669" />
            <Text style={styles.statNumber}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-down-outline" size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{formatCurrency(totalSavings)}</Text>
            <Text style={styles.statLabel}>Total Savings</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="infinite-outline" size={24} color="#7C3AED" />
            <Text style={styles.statNumber}>
              {offer.usageLimit ? `${offer.usageLimit - offer.usageCount}` : '∞'}
            </Text>
            <Text style={styles.statLabel}>Uses Left</Text>
          </View>
        </View>

        {/* Usage Management Section */}
        <View style={styles.managementCard}>
          <Text style={styles.sectionTitle}>Usage Management</Text>
          
          {/* Usage Limit Management */}
          <View style={styles.managementRow}>
            <View style={styles.managementInfo}>
              <Text style={styles.managementLabel}>Usage Limit</Text>
              <Text style={styles.managementSubtitle}>
                Set how many times customers can use this offer
              </Text>
            </View>
            <View style={styles.managementActions}>
              {editingUsageLimit ? (
                <View style={styles.editingContainer}>
                  <TextInput
                    style={styles.limitInput}
                    value={newUsageLimit}
                    onChangeText={setNewUsageLimit}
                    placeholder="Enter limit"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View style={styles.editingButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingUsageLimit(false);
                        setNewUsageLimit('');
                      }}
                    >
                      <Ionicons name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleUpdateUsageLimit}
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.displayContainer}>
                  <Text style={styles.currentValue}>
                    {offer.usageLimit ? offer.usageLimit.toString() : 'Unlimited'}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={startEditingUsageLimit}
                  >
                    <Ionicons name="pencil" size={16} color="#2563EB" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Usage Count Reset */}
          <View style={styles.managementRow}>
            <View style={styles.managementInfo}>
              <Text style={styles.managementLabel}>Current Usage Count</Text>
              <Text style={styles.managementSubtitle}>
                Reset count back to 0 (irreversible action)
              </Text>
            </View>
            <View style={styles.managementActions}>
              <View style={styles.displayContainer}>
                <Text style={styles.currentValue}>{offer.usageCount}</Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetUsageCount}
                  disabled={resetingUsage || offer.usageCount === 0}
                >
                  {resetingUsage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color="#FFFFFF" />
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Top Users */}
        {topUsers && topUsers.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Top Users</Text>
            {topUsers.map((userStats: any, index: number) => (
              <View key={userStats.user._id} style={styles.userRow}>
                <View style={styles.userRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {userStats.user.name || 'User'}
                  </Text>
                  <Text style={styles.userPhone}>{userStats.user.phone}</Text>
                </View>
                <View style={styles.userStats}>
                  <Text style={styles.userUsageCount}>
                    {userStats.usageCount} uses
                  </Text>
                  <Text style={styles.userSavings}>
                    {formatCurrency(userStats.totalSavings)} saved
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Usage History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Usage History</Text>
          {usageHistory && usageHistory.length > 0 ? (
            usageHistory.map((usage: any) => (
              <View key={usage._id} style={styles.usageRow}>
                <View style={styles.usageInfo}>
                  <Text style={styles.usageName}>
                    {usage.user.name || 'User'}
                  </Text>
                  <Text style={styles.usagePhone}>{usage.user.phone}</Text>
                  <Text style={styles.usageService}>{usage.booking.serviceTitle}</Text>
                </View>
                <View style={styles.usageDetails}>
                  <Text style={styles.usageAmount}>
                    {formatCurrency(usage.booking.totalAmount)}
                  </Text>
                  <Text style={styles.usageSavings}>
                    -{formatCurrency(usage.booking.discountAmount)} saved
                  </Text>
                  <Text style={styles.usageDate}>
                    {formatDate(usage.usedAt)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No usage history yet</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  offerCode: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 12,
  },
  offerDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userUsageCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  userSavings: {
    fontSize: 12,
    color: '#059669',
  },
  usageRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  usageInfo: {
    flex: 1,
  },
  usageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  usagePhone: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  usageService: {
    fontSize: 14,
    color: '#374151',
  },
  usageDetails: {
    alignItems: 'flex-end',
  },
  usageAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  usageSavings: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 2,
  },
  usageDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  bottomPadding: {
    height: 24,
  },
  // Management Section Styles
  managementCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  managementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  managementInfo: {
    flex: 1,
    marginRight: 16,
  },
  managementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  managementSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  managementActions: {
    alignItems: 'flex-end',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    gap: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  limitInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    textAlign: 'center',
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminOfferStatsScreen;