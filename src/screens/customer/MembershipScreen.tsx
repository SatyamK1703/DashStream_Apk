import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../contexts/AuthContext';
import FAQList from '~/components/faq/FAQList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import apiService from '../../services/apiService';

type MembershipScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular: boolean;
}

const MembershipScreen = () => {
  const navigation = useNavigation<MembershipScreenNavigationProp>();
  const { user } = useAuth();
  const { isFullyAuthenticated } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // User membership status
  const [userMembership, setUserMembership] = useState({
    active: false,
    plan: '',
    validUntil: '',
    autoRenew: false,
    usedServices: 0,
    totalServices: 0,
    savings: 0
  });
  
  // Fetch user membership data
  const fetchMembershipData = async () => {
    try {
      const response = await apiService.get('/membership/status');
      setUserMembership(response.data);
    } catch (error) {
      console.error('Error fetching membership data:', error);
      Alert.alert('Error', 'Failed to load membership information');
    }
  };
  
  useEffect(() => {
    if (isFullyAuthenticated) {
      fetchMembershipData();
    }
  }, [isFullyAuthenticated]);

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handlePurchasePlan = async () => {
    if (!selectedPlan) return;
    
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      const response = await apiService.post('/membership/purchase', {
        planId: selectedPlan.id
      });
      
      setUserMembership(response.data);
      Alert.alert(
        'Membership Activated',
        `Your ${selectedPlan.name} membership has been successfully activated!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error purchasing membership:', error);
      Alert.alert('Error', 'Failed to purchase membership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRenew = async () => {
    setLoading(true);
    try {
      const response = await apiService.put('/membership/auto-renew', {
        autoRenew: !userMembership.autoRenew
      });
      setUserMembership(response.data);
      Alert.alert(
        userMembership.autoRenew ? 'Auto-Renewal Disabled' : 'Auto-Renewal Enabled',
        userMembership.autoRenew 
          ? 'Your membership will not renew automatically when it expires.'
          : 'Your membership will renew automatically when it expires.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling auto-renewal:', error);
      Alert.alert('Error', 'Failed to update auto-renewal settings');
    } finally {
      setLoading(false);
    }
  };

  const cancelMembership = () => {
    Alert.alert(
      'Cancel Membership',
      'Are you sure you want to cancel your membership? You will still have access until the end of your current billing period.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiService.post('/membership/cancel');
              setUserMembership(response.data);
              Alert.alert(
                'Membership Cancelled',
                'Your membership has been cancelled. You will have access until the end of your current billing period.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error cancelling membership:', error);
              Alert.alert('Error', 'Failed to cancel membership. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderMembershipCard = () => (
    <LinearGradient
      colors={["#2563eb", "#3b82f6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.planText}>{userMembership.plan} Membership</Text>
          <Text style={styles.validText}>Valid until {userMembership.validUntil}</Text>
        </View>
        <View style={styles.userBadge}>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Services Used</Text>
          <Text style={styles.statValue}>
            {userMembership.usedServices}/{userMembership.totalServices === Infinity ? '∞' : userMembership.totalServices}
          </Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Total Savings</Text>
          <Text style={styles.statValue}>₹{userMembership.savings}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Auto-Renew</Text>
          <Text style={styles.statValue}>{userMembership.autoRenew ? 'On' : 'Off'}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleAutoRenew}>
          <Ionicons
            name={userMembership.autoRenew ? 'toggle' : 'toggle-outline'}
            size={18}
            color="white"
            style={styles.iconMargin}
          />
          <Text style={styles.actionText}>
            {userMembership.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={cancelMembership}>
          <Ionicons name="close-circle-outline" size={18} color="white" style={styles.iconMargin} />
          <Text style={styles.actionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderPlanCard = (plan: MembershipPlan) => (
    <TouchableOpacity 
      key={plan.id}
      style={[styles.planeCard, plan.popular ? styles.popularCard : styles.defaultCard]}
      onPress={() => handleSelectPlan(plan)}
      activeOpacity={0.85}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      )}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{plan.price}</Text>
        <Text style={styles.duration}>/{plan.duration}</Text>
      </View>
      
      <View style={styles.divider} />
      
      {plan.features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
      
      <TouchableOpacity 
        style={[styles.button, plan.popular ? styles.popularButton : styles.defaultButton]}
        onPress={() => handleSelectPlan(plan)}
      >
        <Text style={styles.buttonText}>Choose Plan</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.roverlay}>
        <View style={styles.rcontainer}>
          <View style={styles.rheaderRow}>
            <Text style={styles.rheaderTitle}>Confirm Purchase</Text>
            <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {selectedPlan && (
            <>
              <View style={styles.rplanCard}>
                <Text style={styles.rplanTitle}>{selectedPlan.name} Membership</Text>
                <View style={styles.rpriceRow}>
                  <Text style={styles.rplanPrice}>₹{selectedPlan.price}</Text>
                  <Text style={styles.rduration}>/{selectedPlan.duration}</Text>
                </View>
                <View style={styles.rdivider} />
                <Text style={styles.rincludesText}>Includes:</Text>
                {selectedPlan.features.map((feature, index) => (
                  <View key={index} style={styles.rfeatureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
                    <Text style={styles.rfeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.rsummarySection}>
                <Text style={styles.rsummaryTitle}>Payment Summary:</Text>
                <View style={styles.rsummaryRow}>
                  <Text style={styles.rsummaryLabel}>Plan Price</Text>
                  <Text style={styles.rsummaryValue}>₹{selectedPlan.price}</Text>
                </View>
                <View style={styles.rsummaryRow}>
                  <Text style={styles.rsummaryLabel}>GST (18%)</Text>
                  <Text style={styles.rsummaryValue}>₹{Math.round(selectedPlan.price * 0.18)}</Text>
                </View>
                <View style={styles.rdivider} />
                <View style={styles.rsummaryRow}>
                  <Text style={styles.rtotalLabel}>Total Amount</Text>
                  <Text style={styles.rtotalValue}>₹{selectedPlan.price + Math.round(selectedPlan.price * 0.18)}</Text>
                </View>
              </View>

              <Text style={styles.rtermsText}>
                By proceeding, you agree to our Terms of Service and acknowledge that your membership will automatically renew at the end of the billing period unless cancelled.
              </Text>

              <TouchableOpacity style={styles.rconfirmButton} onPress={handlePurchasePlan}>
                <Text style={styles.rconfirmText}>Confirm Purchase</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Membership</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Current Membership Card */}
          {userMembership.active && renderMembershipCard()}
          
          {/* Membership Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.sectionTitle}>Membership Benefits</Text>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="cash-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Save up to 25%</Text>
                <Text style={styles.benefitDescription}>Get discounted rates on all services</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="time-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Priority Booking</Text>
                <Text style={styles.benefitDescription}>Skip the queue with priority slots</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="car-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Free Inspections</Text>
                <Text style={styles.benefitDescription}>Regular vehicle health checks</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="gift-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Exclusive Offers</Text>
                <Text style={styles.benefitDescription}>Special deals only for members</Text>
              </View>
            </View>
          </View>
          
          {/* Available Plans */}
          <Text style={styles.sectionTitle}>
            {userMembership.active ? 'Upgrade Your Plan' : 'Choose a Plan'}
          </Text>
          
          {membershipPlans.map(renderPlanCard)}
          
          {/* FAQ Section */}
          <View style={styles.faqContainer}>
            <FAQList
              searchQuery=""
              setSearchQuery={() => {}}
              activeCategory="all"
              setActiveCategory={() => {}}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              navigation={navigation}
              initialCategory="membership" 
            />

            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('FAQ')}>
              <Text style={styles.viewAllText}>View All FAQs</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
      {renderConfirmModal()}
    </SafeAreaView>
  );
};

export default MembershipScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 4
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  headerRight: {
    width: 40
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  validText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  userBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  iconMargin: {
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  planeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    position: 'relative'
  },
  popularCard: {
    borderColor: '#f97316',
  },
  defaultCard: {
    borderColor: '#f3f4f6',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb'
  },
  duration: {
    color: '#6b7280',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#374151',
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#f97316',
  },
  defaultButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  faqContainer: {
    marginBottom: 32,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 4,
  },
  roverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  rcontainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  rheaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rheaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  rplanCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rplanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  rpriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  rplanPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  rduration: {
    color: '#6b7280',
    marginLeft: 4,
  },
  rdivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  rincludesText: {
    color: '#374151',
    marginBottom: 6,
  },
  rfeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rfeatureText: {
    color: '#374151',
    marginLeft: 6,
    fontSize: 14,
  },
  rsummarySection: {
    marginBottom: 16,
  },
  rsummaryTitle: {
    color: '#374151',
    marginBottom: 6,
  },
  rsummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rsummaryLabel: {
    color: '#6b7280',
  },
  rsummaryValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  rtotalLabel: {
    color: '#1f2937',
    fontWeight: '700',
  },
  rtotalValue: {
    color: '#2563eb',
    fontWeight: '700',
  },
  rtermsText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  rconfirmButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  rconfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});