// import React from 'react';
// import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const ServiceCard = ({ title, price, duration, onPress, description, image }) => {
//   const imageSource = typeof image === 'string' ? { uri: image } : image;

//   return (
//     <Pressable
//       style={styles.card}
//       onPress={onPress}
//       android_ripple={{ color: '#e5e7eb' }}
//       accessibilityRole="button"
//       accessibilityLabel={`${title}, AED ${price}, ${duration} minutes`}
//       hitSlop={8}
//     >
//       {imageSource ? (
//         <Image source={imageSource} style={styles.image} resizeMode="cover" />
//       ) : (
//         <View style={[styles.image, { backgroundColor: '#f3f4f6' }]} />
//       )}
//       <View style={styles.content}>
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>{title}</Text>
//           <View style={styles.priceTag}>
//             <Ionicons name="pricetag-outline" size={14} color="#fff" />
//             <Text style={styles.price}>AED {price}</Text>
//           </View>
//         </View>
//         <View style={styles.infoRow}>
//           <Ionicons name="time-outline" size={14} color="#6b7280" />
//           <Text style={styles.duration}>{duration} mins</Text>
//         </View>
//         <Text style={styles.description}>{description}</Text>
//       </View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 3,
//     marginBottom: 16,
//     overflow: 'hidden'
//   },
//   image: {
//     width: '100%',
//     height: 140,
//   },
//   content: {
//     padding: 18,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     flex: 1,
//     paddingRight: 8,
//   },
//   priceTag: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#2563eb',
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 20,
//   },
//   price: {
//     color: '#fff',
//     fontWeight: '600',
//     marginLeft: 4,
//     fontSize: 14,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   duration: {
//     color: '#6b7280',
//     marginLeft: 4,
//     fontSize: 13,
//   },
//   description: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#374151',
//     lineHeight: 20,
//   },
// });

// export default ServiceCard;

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServiceCardProps {
  title: string;
  price: number;
  duration: number;
  onPress: () => void;
  description: string;
  image: string | any;
}

const ServiceCard = ({ title, price, duration, onPress, description, image }: ServiceCardProps) => {
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && Platform.OS === 'ios' ? { opacity: 0.95, transform: [{ scale: 0.99 }] } : {},
      ]}
      android_ripple={{ color: '#e5e7eb' }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ₹${price}, ${duration} minutes`}
      hitSlop={8}>
      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={36} color="#9ca3af" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.priceTag}>
            <Ionicons name="pricetag-outline" size={14} color="#fff" />
            <Text style={styles.price}>₹{price}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color="#6b7280" />
          <Text style={styles.duration}>{duration} mins</Text>
        </View>

        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginBottom: 18,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  price: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  duration: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
    marginTop: 2,
  },
});

export default ServiceCard;
