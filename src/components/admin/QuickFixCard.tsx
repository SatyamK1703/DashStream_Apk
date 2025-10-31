import React from 'react';
import { View, Text, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickFix {
  _id: string;
  label: string;
  image: string;
  isActive?: boolean;
}

interface QuickFixCardProps {
  quickFix: QuickFix;
  onEdit: (quickFix: QuickFix) => void;
  onDelete: (quickFixId: string) => void;
  onToggleStatus?: (quickFixId: string, isActive: boolean) => void;
}

const QuickFixCard: React.FC<QuickFixCardProps> = ({
  quickFix,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: quickFix.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title}>{quickFix.label}</Text>
        <View style={styles.actions}>
          {onToggleStatus && (
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Active</Text>
              <Switch
                value={quickFix.isActive}
                onValueChange={(value) => onToggleStatus(quickFix._id, value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={quickFix.isActive ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          )}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(quickFix)}>
              <Ionicons name="create-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(quickFix._id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    color: '#6B7280',
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default QuickFixCard;
