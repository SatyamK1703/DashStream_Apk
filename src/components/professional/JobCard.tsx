import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

import { colors } from '../../styles/colors';

import { Booking } from '../../types/api';

// --- Props ---
interface JobCardProps {
  job: Booking;
  onAcceptJob?: (jobId: string) => void;
}

type JobCardNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const JobCard: React.FC<JobCardProps> = ({ job, onAcceptJob }) => {
  const navigation = useNavigation<JobCardNavigationProp>();

  const handleJobPress = () => {
    navigation.navigate('JobDetails', { jobId: job.id });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return colors.green800;
      case 'ongoing': case 'in_progress': return colors.primary;
      case 'pending': return colors.amber800;
      case 'cancelled': return colors.red800;
      default: return colors.gray500;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleJobPress}>
      <View style={styles.jobHeader}>
        <View style={styles.jobCustomerInfo}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={20} color={colors.gray400} />
          </View>
          <View>
            <Text style={styles.customerName}>
              {job.customer?.name || 'Customer'}
            </Text>
            <View style={styles.jobDateTimeRow}>
              <Ionicons name="calendar" size={14} color={colors.gray500} />
              <Text style={styles.jobDateTime}>
                {new Date(job.scheduledDate).toLocaleDateString()} • {job.scheduledTime}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.jobStatus, { backgroundColor: getStatusColor(job.status) + '20' }]}>
          <Text style={[styles.jobStatusText, { color: getStatusColor(job.status) }]}>
            {job.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.jobAddress}>
        <Ionicons name="location" size={16} color={colors.gray500} />
        <Text style={styles.jobAddressText} numberOfLines={2}>
          {String(job.address) || 'Address not available'}
        </Text>
      </View>

      <View style={styles.jobServices}>
        {job.service ? (
          <View style={styles.serviceItem}>
            <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
            <Text style={styles.jobServiceText}>
              {job.service.name} (₹{job.service.basePrice})
            </Text>
          </View>
        ) : (
          <Text style={styles.jobServiceText}>Service details not available</Text>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.jobTotalAmount}>
          <Ionicons name="cash" size={16} color={colors.primary} />
          <Text style={styles.jobTotalText}>₹{job.totalAmount}</Text>
        </View>
        {/* Distance not available in current API */}
        {/* {job.distance && (
          <View style={styles.jobDistance}>
            <Ionicons name="car" size={14} color={colors.gray500} />
            <Text style={styles.jobDistanceText}>{job.distance}</Text>
          </View>
        )} */}
        {job.status === 'pending' && onAcceptJob && (
          <TouchableOpacity
            style={styles.acceptJobButton}
            onPress={() => onAcceptJob(job.id)}
          >
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.acceptJobButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4,
  },
  jobDateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDateTime: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
  },
  jobStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobAddressText: {
    fontSize: 14,
    color: colors.gray500,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  jobServices: {
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobServiceText: {
    fontSize: 13,
    color: colors.gray500,
    marginLeft: 6,
  },
  moreServicesText: {
    fontSize: 12,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTotalAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
   acceptJobButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.green800,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginLeft: 12,
  },
  acceptJobButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  jobDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  jobDistanceText: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
  },
});

export default JobCard;
