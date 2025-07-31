import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.85;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const OffersCarousel = ({ offers, currentIndex, setCurrentIndex }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Special Offers</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <Animated.FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => {
          // Scale animation for active card
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
              <TouchableOpacity activeOpacity={0.85}>
                <ImageBackground
                  source={item.image}
                  style={styles.card}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                    style={styles.overlay}
                  >
                    <Text style={styles.offerTitle}>{item.title}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Indicators */}
      <View style={styles.indicatorRow}>
        {offers.map((_: any, idx: number) => (
          <View
            key={idx}
            style={[
              styles.indicatorDot,
              idx === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default OffersCarousel;

const styles = StyleSheet.create({
  container: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  sectionLink: { color: '#2563eb', fontWeight: '600' },

  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
    height: '100%',
  },
  offerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  indicatorRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: { width: 20, backgroundColor: '#2563eb' },
  inactiveDot: { width: 8, backgroundColor: '#d1d5db' },
});
