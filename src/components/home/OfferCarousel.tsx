import React, { useRef, useEffect } from 'react';
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { scaleWidth, scaleHeight } from '../../utils/scaling';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const SPACING = (width - CARD_WIDTH) / 2;
const CARD_GAP = scaleWidth(12);

const OffersCarousel = ({ offers = [], currentIndex, setCurrentIndex, loading }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const isInteracting = useRef(false);

  useEffect(() => {
    if (!offers.length || isInteracting.current) return;

    const interval = setInterval(() => {
      const next = (currentIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentIndex, offers.length]);

  if (loading) {
    return <View style={styles.placeholderCard} />;
  }

  if (!offers.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.placeholderCard} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={offers}
        keyExtractor={(item, idx) => item?._id ?? item?.id ?? `${idx}`}
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        onScrollBeginDrag={() => (isInteracting.current = true)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
          setCurrentIndex(idx);
          isInteracting.current = false;
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_GAP),
            index * (CARD_WIDTH + CARD_GAP),
            (index + 1) * (CARD_WIDTH + CARD_GAP),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.94, 1, 0.94],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.75, 1, 0.75],
            extrapolate: 'clamp',
          });

          const src =
            typeof item?.image === 'string' ? { uri: item.image } : item?.image || undefined;

          return (
            <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
              <TouchableOpacity activeOpacity={0.9} onPress={item?.onPress}>
                {src ? (
                  <Image source={src} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#e5e5e5' }]} />
                )}

                {/* indicators */}
                <View style={styles.indicatorContainer}>
                  {offers.slice(0, 8).map((_, dotIdx) => {
                    const active = dotIdx === currentIndex % Math.min(offers.length, 8);
                    return (
                      <Animated.View
                        key={dotIdx}
                        style={[
                          styles.indicatorDot,
                          active ? styles.activeDot : styles.inactiveDot,
                        ]}
                      />
                    );
                  })}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

export default OffersCarousel;

const styles = StyleSheet.create({
  container: {
    marginBottom: scaleHeight(25),
  },
  emptyContainer: {
    marginBottom: scaleHeight(25),
    paddingHorizontal: scaleWidth(16),
  },
  placeholderCard: {
    width: CARD_WIDTH,
    height: scaleHeight(190),
    borderRadius: scaleWidth(18),
    backgroundColor: '#ececec',
    alignSelf: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: scaleHeight(190),
    borderRadius: scaleWidth(18),
    overflow: 'hidden',
    marginRight: CARD_GAP,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: scaleWidth(18),
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: scaleHeight(12),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaleWidth(4),
  },
  indicatorDot: {
    height: scaleWidth(8),
    width: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  activeDot: {
    width: scaleWidth(20),
    backgroundColor: '#ffffff',
  },
  inactiveDot: {
    backgroundColor: '#d1d1d1',
  },
});
