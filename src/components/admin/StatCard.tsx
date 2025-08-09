import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles'
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  isPositive?: boolean;
}

const StatCard = ({ title, value, icon, color, change, isPositive }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statCardContent}>
      <View>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={styles.statCardValue}>{value}</Text>
      </View>
      <View style={[styles.statCardIcon, { backgroundColor: color }]}>
        {icon}
      </View>
    </View>
    {change && (
      <View style={styles.statCardChange}>
        <Ionicons 
          name={isPositive ? 'arrow-up' : 'arrow-down'} 
          size={14} 
          color={isPositive ? '#10B981' : '#EF4444'} 
        />
        <Text style={[styles.statCardChangeText, isPositive ? styles.positiveChange : styles.negativeChange]}>
          {change} from last month
        </Text>
      </View>
    )}
  </View>
);

export default StatCard;