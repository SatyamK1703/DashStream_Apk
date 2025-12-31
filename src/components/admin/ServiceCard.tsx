import React from 'react';
import { View, Text, TouchableOpacity, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  duration: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
  tags: string[];
}

interface ServiceCardProps {
  service: Service;
  onToggleStatus: (serviceId: string) => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.imageContainer}>
        <Image
          source={{ uri: service.image }}
          style={cardStyles.image}
          resizeMode="cover"
        />
        
        <View style={cardStyles.categoryBadge}>
          <Text style={cardStyles.badgeText}>
            {service.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
        
        {service.isPopular && (
          <View style={cardStyles.popularBadge}>
            <Ionicons name="star" size={12} color="white" />
            <Text style={cardStyles.popularBadgeText}>Popular</Text>
          </View>
        )}
        
        <View style={[
          cardStyles.statusBadge,
          service.isActive ? cardStyles.activeBadge : cardStyles.inactiveBadge
        ]}>
          <Text style={cardStyles.badgeText}>
            {service.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={cardStyles.content}>
        <View style={cardStyles.header}>
          <Text style={cardStyles.title}>{service.title}</Text>
          <View style={cardStyles.priceContainer}>
            {service.discountPrice ? (
              <>
                <Text style={cardStyles.originalPrice}>₹{service.price}</Text>
                <Text style={cardStyles.discountedPrice}>₹{service.discountPrice}</Text>
              </>
            ) : (
              <Text style={cardStyles.regularPrice}>₹{service.price}</Text>
            )}
          </View>
        </View>
        
        <Text style={cardStyles.description} numberOfLines={2}>
          {service.description}
        </Text>
        
        <View style={cardStyles.durationContainer}>
          <Ionicons name="time-outline" size={16} color="#4B5563" />
          <Text style={cardStyles.durationText}>{service.duration} minutes</Text>
        </View>
        
        {service.tags.length > 0 && (
          <View style={cardStyles.tagsContainer}>
            {service.tags.map((tag, index) => (
              <View key={index} style={cardStyles.tag}>
                <Text style={cardStyles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={cardStyles.featuresTitle}>Features:</Text>
        <View style={cardStyles.featuresContainer}>
          {service.features && service.features.slice(0, 3).map((feature, index) => (
            <View key={`feature-${feature}-${index}`} style={cardStyles.feature}>
              <View style={cardStyles.featureDot} />
              <Text style={cardStyles.featureText}>{feature}</Text>
            </View>
          ))}
          {service.features && service.features.length > 3 && (
            <Text style={cardStyles.moreFeatures}>
              +{service.features.length - 3} more
            </Text>
          )}
        </View>
        
        <View style={cardStyles.actions}>
          <View style={cardStyles.switchContainer}>
            <Text style={cardStyles.switchText}>Active</Text>
            <Switch
              value={service.isActive}
              onValueChange={() => onToggleStatus(service.id)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={service.isActive ? '#2563EB' : '#F3F4F6'}
            />
          </View>
          
          <View style={cardStyles.actionButtons}>
            <TouchableOpacity 
              style={cardStyles.actionButton}
              onPress={() => onEdit(service)}
            >
              <Ionicons name="create-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={cardStyles.actionButton}
              onPress={() => onDelete(service.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ServiceCard;

const cardStyles = {
    container: {
      backgroundColor: 'white',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: 16,
      overflow: 'hidden' as const,
    },
    imageContainer: {
      position: 'relative' as const,
    },
    image: {
      width: '100%' as const,
      height: 160,
    },
    categoryBadge: {
      position: 'absolute' as const,
      top: 8,
      left: 8,
      backgroundColor: 'rgba(37, 99, 235, 0.8)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    popularBadge: {
      position: 'absolute' as const,
      top: 8,
      right: 8,
      backgroundColor: 'rgba(245, 158, 11, 0.9)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    statusBadge: {
      position: 'absolute' as const,
      bottom: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    activeBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.9)',
    },
    inactiveBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: 8,
    },
    title: {
      color: '#1F2937',
      fontWeight: 'bold' as const,
      fontSize: 18,
      flex: 1,
      marginRight: 8,
    },
    priceContainer: {
      alignItems: 'flex-end' as const,
    },
    originalPrice: {
      color: '#6B7280',
      fontSize: 14,
      textDecorationLine: 'line-through' as const,
    },
    discountedPrice: {
      color: '#2563EB',
      fontWeight: 'bold' as const,
    },
    regularPrice: {
      color: '#2563EB',
      fontWeight: 'bold' as const,
    },
    description: {
      color: '#6B7280',
      marginBottom: 12,
    },
    durationContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    },
    durationText: {
      color: '#6B7280',
      marginLeft: 4,
    },
    tagsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: '#F3F4F6',
      borderRadius: 50,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 4,
    },
    tagText: {
      color: '#6B7280',
      fontSize: 12,
    },
    featuresTitle: {
      color: '#374151',
      fontWeight: '500' as const,
      marginBottom: 4,
    },
    featuresContainer: {
      marginBottom: 16,
    },
    feature: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 4,
    },
    featureDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#2563EB',
      marginRight: 8,
    },
    featureText: {
      color: '#6B7280',
      fontSize: 14,
    },
    moreFeatures: {
      color: '#2563EB',
      fontSize: 14,
    },
    actions: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
    },
    switchContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    switchText: {
      color: '#6B7280',
      marginRight: 8,
    },
    actionButtons: {
      flexDirection: 'row' as const,
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500' as const,
    },
    popularBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500' as const,
      marginLeft: 4,
    },
  };
