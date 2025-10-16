import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { styles } from './ProJobDetailsScreen.styles';
import { colors } from '../../styles/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

// Import proper types and hooks
import { ProStackParamList } from '../../../app/routes/ProNavigator';
import { useProfessionalJob, useProfessionalJobActions } from '../../hooks/useProfessional';

type ProJobDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type ProJobDetailsScreenRouteProp = RouteProp<ProStackParamList, 'JobDetails'>;

import { Booking } from '../../types/api';
import { SCREEN_TEXTS, config } from '../../config/config';

const ProJobDetailsScreen = () => {
  const navigation = useNavigation<ProJobDetailsScreenNavigationProp>();
  const route = useRoute<ProJobDetailsScreenRouteProp>();
  const { jobId } = route.params;

  // Use professional job hooks
  const {
    data: job,
    isLoading,
    error,
    execute: refreshJob,
  } = useProfessionalJob(jobId) as {
    data: Booking | null;
    isLoading: boolean;
    error: any;
    execute: () => void;
  };
  const {
    acceptJob,
    startJob,
    completeJob,
    cancelJob,
    isLoading: actionLoading,
  } = useProfessionalJobActions();

  const handleCallCustomer = () => {
    if (job?.customer?.phone) {
      const url = `tel:${job.customer.phone}`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) Linking.openURL(url);
      });
    }
  };

  const handleNavigate = () => {
    if (job?.address?.coordinates) {
      const url = Platform.select({
        ios: `maps:0,0?q=${job.address.coordinates.latitude},${job.address.coordinates.longitude}`,
        android: `geo:0,0?q=${job.address.coordinates.latitude},${job.address.coordinates.longitude}(${job.customer?.name})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const updateJobStatus = async (newStatus: string) => {
    const statusMap: { [key: string]: () => Promise<any> } = {
      confirmed: () => acceptJob(jobId),
      'in-progress': () => startJob(jobId),
      completed: () => completeJob(jobId),
      cancelled: () => cancelJob(jobId),
    };

    Alert.alert(
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} ${SCREEN_TEXTS.ProJobDetails.job}`,
      `${SCREEN_TEXTS.ProJobDetails.confirmStatusChange} ${newStatus} ${SCREEN_TEXTS.ProJobDetails.thisJob}?`,
      [
        { text: SCREEN_TEXTS.ProJobDetails.cancel, style: 'cancel' },
        {
          text: SCREEN_TEXTS.ProJobDetails.confirm,
          onPress: async () => {
            try {
              const action = statusMap[newStatus];
              if (action) {
                await action();
                refreshJob(); // Refresh job data
                Alert.alert(
                  'Success',
                  `${SCREEN_TEXTS.ProJobDetails.job} ${newStatus} ${SCREEN_TEXTS.ProJobDetails.successfully}!`
                );
                if (newStatus === 'in-progress') {
                  navigation.navigate('RouteTracking', { jobId });
                }
              }
            } catch (error) {
              Alert.alert(
                'Error',
                `${SCREEN_TEXTS.ProJobDetails.failedTo} ${newStatus} ${SCREEN_TEXTS.ProJobDetails.job}. ${SCREEN_TEXTS.ProJobDetails.pleaseTryAgain}.`
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centeredScreen}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.red500} />
        <Text style={styles.errorTitle}>{SCREEN_TEXTS.ProJobDetails.jobNotFound}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>{SCREEN_TEXTS.ProJobDetails.goBack}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = {
    pending: {
      label: SCREEN_TEXTS.ProJobDetails.statusPending,
      bg: colors.blue100,
      text: colors.blue800,
    },
    confirmed: {
      label: SCREEN_TEXTS.ProJobDetails.statusConfirmed,
      bg: colors.blue100,
      text: colors.blue800,
    },
    assigned: {
      label: SCREEN_TEXTS.ProJobDetails.statusAssigned,
      bg: colors.blue100,
      text: colors.blue800,
    },
    'in-progress': {
      label: SCREEN_TEXTS.ProJobDetails.statusInProgress,
      bg: colors.amber100,
      text: colors.amber800,
    },
    completed: {
      label: SCREEN_TEXTS.ProJobDetails.statusCompleted,
      bg: colors.green100,
      text: colors.green800,
    },
    cancelled: {
      label: SCREEN_TEXTS.ProJobDetails.statusCancelled,
      bg: colors.red100,
      text: colors.red800,
    },
    rejected: {
      label: SCREEN_TEXTS.ProJobDetails.statusRejected,
      bg: colors.red100,
      text: colors.red800,
    },
  }[job.status] || {
    label: SCREEN_TEXTS.ProJobDetails.statusUnknown,
    bg: colors.gray100,
    text: colors.gray800,
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{SCREEN_TEXTS.ProJobDetails.jobDetails}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              ...job.address?.coordinates,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}>
            {job.professionalLocation && (
              <Marker
                coordinate={job.professionalLocation}
                title={SCREEN_TEXTS.ProJobDetails.yourLocation}>
                <View style={styles.markerContainer}>
                  <Ionicons name="car" size={16} color={colors.white} />
                </View>
              </Marker>
            )}
            <Marker coordinate={job.address?.coordinates} title={job.customer?.name}>
              <View style={[styles.markerContainer, { backgroundColor: colors.red500 }]}>
                <Ionicons name="location" size={16} color={colors.white} />
              </View>
            </Marker>
            {job.professionalLocation && (
              <MapViewDirections
                origin={job.professionalLocation}
                destination={job.address?.coordinates}
                apikey={config.GOOGLE_MAPS_API_KEY}
                strokeWidth={3}
                strokeColor={colors.primary}
              />
            )}
          </MapView>
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Ionicons name="navigate" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          <View style={styles.card}>
            <View style={styles.customerHeader}>
              <Image
                source={{ uri: job.customer?.profileImage?.url }}
                style={styles.customerImage}
              />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customer?.name}</Text>
                <Text style={styles.customerPhone}>{job.customer?.phone}</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
                <Ionicons name="call" size={16} color={colors.white} />
                <Text style={styles.callButtonText}>{SCREEN_TEXTS.ProJobDetails.call}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{SCREEN_TEXTS.ProJobDetails.jobInformation}</Text>
            {/* Job Details Rows */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{SCREEN_TEXTS.ProJobDetails.date}</Text>
              <Text style={styles.detailValue}>
                {new Date(job.scheduledDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{SCREEN_TEXTS.ProJobDetails.time}</Text>
              <Text style={styles.detailValue}>{job.scheduledTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{SCREEN_TEXTS.ProJobDetails.address}</Text>
              <Text style={styles.detailValue}>{job.address?.address}</Text>
            </View>
            {job.specialInstructions && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {SCREEN_TEXTS.ProJobDetails.specialInstructions}
                </Text>
                <Text style={styles.detailValue}>{job.specialInstructions}</Text>
              </View>
            )}
            {job.vehicle && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{SCREEN_TEXTS.ProJobDetails.vehicle}</Text>
                <Text style={styles.detailValue}>
                  {job.vehicle.make} {job.vehicle.model} ({job.vehicle.licensePlate})
                </Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{SCREEN_TEXTS.ProJobDetails.services}</Text>
            {job.services?.map((service, index) => (
              <View
                key={index}
                style={[
                  styles.serviceItem,
                  index === (job.services?.length || 0) - 1 && styles.lastServiceItem,
                ]}>
                <View>
                  <Text style={styles.serviceName}>{service.serviceId?.title}</Text>
                  {service.serviceId?.description && (
                    <Text style={styles.serviceDescription}>{service.serviceId.description}</Text>
                  )}
                </View>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{SCREEN_TEXTS.ProJobDetails.totalAmount}</Text>
              <Text style={styles.totalAmount}>₹{job.totalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {job.status === 'pending' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => updateJobStatus('confirmed')}
            disabled={actionLoading}>
            <Text style={styles.primaryButtonText}>{SCREEN_TEXTS.ProJobDetails.acceptJob}</Text>
          </TouchableOpacity>
        )}
        {job.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => updateJobStatus('in-progress')}
            disabled={actionLoading}>
            <Text style={styles.primaryButtonText}>{SCREEN_TEXTS.ProJobDetails.startJob}</Text>
          </TouchableOpacity>
        )}
        {job.status === 'in-progress' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.green600 }]}
            onPress={() => updateJobStatus('completed')}
            disabled={actionLoading}>
            <Text style={styles.primaryButtonText}>
              {SCREEN_TEXTS.ProJobDetails.markAsCompleted}
            </Text>
          </TouchableOpacity>
        )}
        {(job.status === 'completed' || job.status === 'cancelled') && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>{SCREEN_TEXTS.ProJobDetails.backToJobs}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProJobDetailsScreen;
