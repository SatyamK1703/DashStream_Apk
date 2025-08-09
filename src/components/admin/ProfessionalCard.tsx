import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

interface ProfessionalCardProps {
  id: string;
  name: string;
  image?: string;
  rating: number;
  jobsCompleted: number;
  isOnline: boolean;
  onPress: () => void;
}

const ProfessionalCard = ({ id, name, rating, jobsCompleted, isOnline, onPress }: ProfessionalCardProps) => {
  const onlineStatusStyle = isOnline ? styles.online : styles.offline;
  const onlineStatusTextStyle = styles[`onlineStatusText-${isOnline ? 'online' : 'offline'}`];
  
  return (
    <TouchableOpacity 
      style={styles.professionalCard}
      onPress={onPress}
    >
      <View style={styles.professionalCardContent}>
        <View style={styles.professionalAvatar}>
          <Text style={styles.professionalAvatarText}>{name.charAt(0)}</Text>
        </View>
        
        <View style={styles.professionalInfo}>
          <View style={styles.professionalHeader}>
            <Text style={styles.professionalName}>{name}</Text>
            <View style={[styles.onlineStatus, onlineStatusStyle]}>
              <Text style={[styles.onlineStatusText, onlineStatusTextStyle]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <View style={styles.professionalStats}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating} Rating</Text>
            </View>
            <Text style={styles.jobsText}>{jobsCompleted} Jobs Completed</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProfessionalCard;