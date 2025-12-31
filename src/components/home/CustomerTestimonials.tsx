import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';
import { useTestimonials } from '../../hooks';

interface Testimonial {
  id: string;
  name: string;
  instagramUrl: string;
  thumbnail: {
    public_id?: string;
    url: string;
  };
}

const ITEM_WIDTH = Dimensions.get('window').width * 0.4;

const TestimonialItem = ({ item }: { item: Testimonial }) => {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(item.instagramUrl);
    if (supported) {
      Linking.openURL(item.instagramUrl);
    } else {
      alert("Can't open Instagram link.");
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <Image source={{ uri: item.thumbnail.url }} style={styles.thumbnail} />
      <View style={styles.overlay}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const CustomerTestimonials = () => {
  const { data: testimonialsData, loading, error } = useTestimonials();
  const testimonials = testimonialsData?.data || [];

  if (loading) {
    return (
      <View style={{ marginVertical: scaleHeight(10) }}>
        <Text style={styles.title}>Customer Testimonials</Text>
        <View style={{ height: scaleHeight(300), justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: scaleHeight(10) }}>
        <Text style={styles.title}>Customer Testimonials</Text>
        <View style={{ height: scaleHeight(300), justifyContent: 'center', alignItems: 'center' }}>
          <Text>Failed to load testimonials</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: scaleHeight(10) }}>
      <Text style={styles.title}>Customer Testimonials</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: scaleWidth(16) }}>
        {testimonials?.map((item: Testimonial) => (
          <TestimonialItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    marginHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(10),
  },
  card: {
    width: ITEM_WIDTH,
    height: scaleHeight(300),
    marginRight: scaleWidth(12),
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: scaleWidth(10),
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(16),
  },
});

export default CustomerTestimonials;
