import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const testimonials = [
  {
    id: '1',
    name: 'Aadarsh',
    videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: '2',
    name: 'Dolly Parma',
    videoUri: 'https://www.w3schools.com/html/movie.mp4',
  },
  {
    id: '3',
    name: 'Parma',
    videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];

const ITEM_WIDTH = Dimensions.get('window').width * 0.4;

const CustomerTestimonials = () => {
  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={styles.title}>Customer Testimonials</Text>
      <FlatList
        horizontal
        data={testimonials}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const player = useVideoPlayer(item.videoUri, (player) => {
            player.loop = true;
            player.play();
            player.muted = true;
          });
          return (
            <View style={styles.card}>
              <VideoView
                style={styles.video}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
              />
              <View style={styles.overlay}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </View>
          );
        }}
      />
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
  video: {
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
