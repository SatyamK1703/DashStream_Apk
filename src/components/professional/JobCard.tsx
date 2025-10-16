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
      case 'completed': return colors.success;
      case 'ongoing': case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.danger;
      default: return colors.gray500;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleJobPress}>
      <View style={styles.jobHeader}>
        <View style={styles.jobCustomerInfo}>
          <Image 
            source={{ uri: job.customer?.profileImage }} 
            style={styles.customerImage} 
          />
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
        <View style={styles.jobStatus}>
          <Text style={[styles.jobStatusText, { color: getStatusColor(job.status) }]}>
            {job.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.jobAddress}>
        <Ionicons name="location-outline" size={16} color={colors.gray500} />
        <Text style={styles.jobAddressText} numberOfLines={2}>
          {job.address || 'Address not available'}
        </Text>
      </View>

      <View style={styles.jobServices}>
        {job.services?.slice(0, 2).map((service, index) => (
          <Text key={index} style={styles.jobServiceText}>
            • {service.name} (₹{service.price})
          </Text>
        ))}
        {job.services?.length > 2 && (
          <Text style={styles.jobServiceText}>
            +{job.services.length - 2} more services
          </Text>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.jobTotalAmount}>
          <Text style={styles.jobTotalText}>Total: ₹{job.totalAmount}</Text>
        </View>
        {job.status === 'pending' && onAcceptJob && (
          <TouchableOpacity 
            style={styles.acceptJobButton}
            onPress={() => onAcceptJob(job.id)}
          >
            <Text style={styles.acceptJobButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
        {job.distance && (
          <View style={styles.jobDistance}>
            <Ionicons name="car" size={14} color={colors.gray500} />
            <Text style={styles.jobDistanceText}>{job.distance}</Text>
          </View>
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
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gray100,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobAddressText: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 8,
    flex: 1,
  },
  jobServices: {
    marginBottom: 12,
  },
  jobServiceText: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTotalAmount: {
    flex: 1,
  },
  jobTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray800,
  },
  acceptJobButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  acceptJobButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
