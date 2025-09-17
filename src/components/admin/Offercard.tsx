import React from 'react';
import { View, Text, TouchableOpacity,StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface OfferCardProps {
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validUntil: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStats?: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({
  title,
  description,
  discount,
  discountType,
  validUntil,
  onEdit,
  onDelete,
  onStats,
}) => {
  return (
  <TouchableOpacity onPress={onStats}>
   <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actionRow}>
          {onStats && (
            <TouchableOpacity onPress={onStats} style={styles.iconButton}>
              <Ionicons name="analytics-outline" size={18} color="#059669" />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
              <Ionicons name="create-outline" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={styles.discount}>
          {discountType === 'percentage'
            ? `${discount}% OFF`
            : `₹${discount} OFF`}
        </Text>
        <Text style={styles.validUntil}>
          Valid Until: {new Date(validUntil).toLocaleDateString()}
        </Text>
      </View>
    </View>
    </TouchableOpacity>

  );
};

export default OfferCard;


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#111',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  discount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  validUntil: {
    fontSize: 13,
    color: '#666',
  },
});
