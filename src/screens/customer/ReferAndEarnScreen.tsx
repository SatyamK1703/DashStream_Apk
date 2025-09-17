import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  TextInput,
  Alert,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type ReferAndEarnScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const ReferAndEarnScreen = () => {
  const navigation = useNavigation<ReferAndEarnScreenNavigationProp>();
  const [referralCode] = useState('DASH2024USER'); // Would come from user data in real app

  const handleShare = async () => {
    try {
      const message = `Hey! Download DashStream and use my referral code ${referralCode} to get amazing services at your doorstep. You'll get ₹100 off on your first booking!`;
      
      await Share.share({
        message,
        title: 'Join DashStream - Get ₹100 Off!'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reward Card */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Ionicons name="gift" size={32} color="#fff" />
          </View>
          <Text style={styles.rewardTitle}>Earn ₹50 for every friend!</Text>
          <Text style={styles.rewardSubtitle}>
            Your friends get ₹100 off their first booking
          </Text>
        </View>

        {/* Referral Code Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          <View style={styles.referralCodeContainer}>
            <TextInput
              style={styles.referralCodeInput}
              value={referralCode}
              editable={false}
            />
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
              <Ionicons name="copy-outline" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How it works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share your code</Text>
              <Text style={styles.stepDescription}>
                Send your referral code to friends and family
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>They sign up</Text>
              <Text style={styles.stepDescription}>
                Your friend downloads the app and enters your code
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Both earn rewards</Text>
              <Text style={styles.stepDescription}>
                They get ₹100 off, you get ₹50 when they complete their first booking
              </Text>
            </View>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share with Friends</Text>
        </TouchableOpacity>

        {/* Earnings Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Earnings</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Total Referrals</Text>
            <Text style={styles.earningsValue}>0</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsValue}>₹0</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Pending Rewards</Text>
            <Text style={styles.earningsValue}>₹0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferAndEarnScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12
  },
  headerTitleContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  scroll: {
    flex: 1,
    padding: 16
  },
  rewardCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16
  },
  rewardIcon: {
    marginBottom: 12
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  referralCodeInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center'
  },
  copyButton: {
    marginLeft: 12,
    padding: 8
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280'
  },
  shareButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  earningsLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  }
});