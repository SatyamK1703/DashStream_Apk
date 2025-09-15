// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   Switch,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// type Service = {
//   id: string;
//   name: string;
//   image: string;
//   category: string;
//   isPopular: boolean;
//   isActive: boolean;
//   price: number;
//   discountedPrice?: number;
//   description: string;
//   duration: number;
//   tags: string[];
//   features: string[];
// };

// type Props = {
//   item: Service;
// };

// const ServiceCard: React.FC<Props> = ({
//   item
// }) => {
//   const handleDeleteService = (serviceId: string) => {
//     Alert.alert(
//         'Delete Service',
//         'Are you sure you want to delete this service? This action cannot be undone.',
//         [
//         {
//             text: 'Cancel',
//             style: 'cancel'
//         },
//         {
//             text: 'Delete',
//             style: 'destructive',
//             onPress: () => {
//             // Simulate API call to delete service
//             setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
//             }
//         }
//         ]
//     );
//     };
//   const handleEditService = (service: Service) => {
//     setIsEditing(true);
//     setFormData({
//       id: service.id,
//       name: service.name,
//       description: service.description,
//       price: service.price.toString(),
//       discountedPrice: service.discountedPrice?.toString() || '',
//       category: service.category,
//       image: service.image,
//       duration: service.duration.toString(),
//       isActive: service.isActive,
//       isPopular: service.isPopular,
//       features: [...service.features],
//       tags: [...service.tags]
//     });
//     setFormErrors({});
//     setShowAddEditModal(true);
//   };
//   const toggleServiceStatus = (serviceId: string) => {
//     setServices(prevServices =>
//       prevServices.map(service =>
//         service.id === serviceId
//           ? { ...service, isActive: !service.isActive }
//           : service
//       )
//     );
//   };
//   return (
//     <View style={styles.card}>
//       <View style={styles.imageContainer}>
//         <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

//         <View style={styles.categoryBadge}>
//           <Text style={styles.badgeText}>
//             {item.category.replace('-', ' ')}
//           </Text>
//         </View>

//         {item.isPopular && (
//           <View style={styles.popularBadge}>
//             <Ionicons name="star" size={12} color="white" />
//             <Text style={styles.popularText}>Popular</Text>
//           </View>
//         )}

//         <View
//           style={[
//             styles.statusBadge,
//             { backgroundColor: item.isActive ? '#22c55e' : '#ef4444' },
//           ]}
//         >
//           <Text style={styles.badgeText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
//         </View>
//       </View>

//       <View style={styles.content}>
//         <View style={styles.titleRow}>
//           <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
//           <View>
//             {item.discountedPrice ? (
//               <View style={styles.priceColumn}>
//                 <Text style={styles.strikePrice}>₹{item.price}</Text>
//                 <Text style={styles.price}>₹{item.discountedPrice}</Text>
//               </View>
//             ) : (
//               <Text style={styles.price}>₹{item.price}</Text>
//             )}
//           </View>
//         </View>

//         <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

//         <View style={styles.row}>
//           <Ionicons name="time-outline" size={16} color="#4B5563" />
//           <Text style={styles.duration}>{item.duration} minutes</Text>
//         </View>

//         {item.tags.length > 0 && (
//           <View style={styles.tagContainer}>
//             {item.tags.map((tag, index) => (
//               <View key={index} style={styles.tag}>
//                 <Text style={styles.tagText}>{tag}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         <Text style={styles.featureTitle}>Features:</Text>
//         <View>
//           {item.features.slice(0, 3).map((feature, index) => (
//             <View key={index} style={styles.featureRow}>
//               <View style={styles.bullet} />
//               <Text style={styles.featureText}>{feature}</Text>
//             </View>
//           ))}
//           {item.features.length > 3 && (
//             <Text style={styles.moreFeatures}>+{item.features.length - 3} more</Text>
//           )}
//         </View>

//         <View style={styles.footer}>
//           <View style={styles.statusSwitch}>
//             <Text style={styles.switchLabel}>Active</Text>
//             <Switch
//               value={item.isActive}
//               onValueChange={() => toggleServiceStatus(item.id)}
//               trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
//               thumbColor={item.isActive ? '#2563EB' : '#F3F4F6'}
//             />
//           </View>

//           <View style={styles.actionButtons}>
//             <TouchableOpacity onPress={() => handleEditService(item)} style={styles.iconButton}>
//               <Ionicons name="create-outline" size={20} color="#4B5563" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleDeleteService(item.id)} style={styles.iconButton}>
//               <Ionicons name="trash-outline" size={20} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default ServiceCard;

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//     marginBottom: 16,
//     overflow: 'hidden',
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: 160,
//   },
//   categoryBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(59,130,246,0.8)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   popularBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(234,179,8,0.9)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   popularText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   statusBadge: {
//     position: 'absolute',
//     bottom: 8,
//     right: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   badgeText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     textTransform: 'capitalize',
//   },
//   content: {
//     padding: 16,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   title: {
//     color: '#1F2937',
//     fontWeight: 'bold',
//     fontSize: 18,
//     flex: 1,
//     marginRight: 8,
//   },
//   priceColumn: {
//     alignItems: 'flex-end',
//   },
//   strikePrice: {
//     color: '#6B7280',
//     fontSize: 13,
//     textDecorationLine: 'line-through',
//   },
//   price: {
//     color: '#3B82F6',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   description: {
//     color: '#4B5563',
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   duration: {
//     color: '#4B5563',
//     marginLeft: 4,
//   },
//   tagContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 12,
//   },
//   tag: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 999,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginRight: 8,
//     marginBottom: 4,
//   },
//   tagText: {
//     color: '#4B5563',
//     fontSize: 12,
//   },
//   featureTitle: {
//     color: '#374151',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   featureRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   bullet: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#3B82F6',
//     marginRight: 8,
//   },
//   featureText: {
//     color: '#4B5563',
//     fontSize: 14,
//   },
//   moreFeatures: {
//     color: '#3B82F6',
//     fontSize: 14,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//     paddingTop: 12,
//   },
//   statusSwitch: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   switchLabel: {
//     color: '#4B5563',
//     marginRight: 8,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//   },
//   iconButton: {
//     padding: 8,
//     marginLeft: 4,
//   },
// });


import React from 'react';
import { View, Text, TouchableOpacity, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  duration: number;
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
          <Text style={cardStyles.title}>{service.name}</Text>
          <View style={cardStyles.priceContainer}>
            {service.discountedPrice ? (
              <>
                <Text style={cardStyles.originalPrice}>₹{service.price}</Text>
                <Text style={cardStyles.discountedPrice}>₹{service.discountedPrice}</Text>
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
      width: '100%',
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
      justifyContent: 'space-between',
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
      justifyContent: 'space-between',
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
