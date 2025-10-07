import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Image, Linking } from 'react-native';

const testimonials = [
  {
    id: '1',
    name: 'Aadarsh',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy', // Replace with real links
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+1', // Optional: preview image
  },
  {
    id: '2',
    name: 'Dolly Parma',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy',
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+2',
  },
  {
    id: '3',
    name: 'Parma',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy',
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+3',
  },
];

const ITEM_WIDTH = Dimensions.get('window').width * 0.4;

const TestimonialItem = ({ item }) => {
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
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.overlay}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const CustomerTestimonials = () => {
  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={styles.title}>Customer Testimonials</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {testimonials.map((item) => (
          <TestimonialItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    width: ITEM_WIDTH,
    height: 300,
    marginRight: 12,
    borderRadius: 12,
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
    padding: 10,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomerTestimonials;
