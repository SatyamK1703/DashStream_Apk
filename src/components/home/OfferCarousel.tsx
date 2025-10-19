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
const CARD_WIDTH = width * 0.92;
const CARD_SPACING = (width - CARD_WIDTH) / 2;
const CARD_MARGIN_RIGHT = scaleWidth(10);

const OffersCarousel = ({ offers = [], currentIndex, setCurrentIndex, loading, error }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const isInteracting = useRef(false);

  // Auto-scroll every 3s, pause while interacting
  useEffect(() => {
    if (!offers || offers.length === 0 || isInteracting.current) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [offers, currentIndex, setCurrentIndex]);

  if (loading) {
    return (
      <View style={styles.placeholderCard} />
    );
  }

  if (!offers || offers.length === 0) {
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
        keyExtractor={(item, idx) => (item?._id ?? item?.id ?? String(idx))}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN_RIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        removeClippedSubviews
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={2}
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_MARGIN_RIGHT,
          offset: (CARD_WIDTH + CARD_MARGIN_RIGHT) * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 300));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: Math.min(info.index, offers.length - 1),
              animated: true,
            });
          });
        }}
        onScrollBeginDrag={() => {
          isInteracting.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN_RIGHT)
          );
          setCurrentIndex(index);
          isInteracting.current = false;
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_MARGIN_RIGHT),
            index * (CARD_WIDTH + CARD_MARGIN_RIGHT),
            (index + 1) * (CARD_WIDTH + CARD_MARGIN_RIGHT),
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.96, 1, 0.96],
            extrapolate: 'clamp',
          });

          const imageSource =
            typeof item?.image === 'string'
              ? { uri: item.image }
              : item?.image || undefined;

          return (
            <Animated.View
              style={[styles.cardWrapper, { transform: [{ scale }] }]}
            >
              <TouchableOpacity activeOpacity={0.9}>
                {imageSource ? (
                  <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#e5e5e5' }]} />
                )}

                {/* Dots (cap at 8 for performance) */}
                <View style={styles.indicatorRow}>
                  {offers.slice(0, 8).map((_: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.indicatorDot,
                        idx === (currentIndex % Math.min(offers.length, 8))
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />
                  ))}
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
    marginBottom: scaleHeight(20),
  },
  emptyContainer: {
    marginBottom: scaleHeight(20),
    paddingHorizontal: scaleWidth(16),
  },
  placeholderCard: {
    width: CARD_WIDTH,
    height: scaleHeight(180),
    borderRadius: scaleWidth(16),
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: scaleHeight(180),
    borderRadius: scaleWidth(16),
    overflow: 'hidden',
    marginRight: CARD_MARGIN_RIGHT,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: scaleWidth(16),
  },
  indicatorRow: {
    position: 'absolute',
    bottom: scaleHeight(12),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorDot: {
    height: scaleWidth(8),
    width: scaleWidth(8),
    borderRadius: scaleWidth(4),
    marginHorizontal: scaleWidth(4),
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: scaleWidth(18),
  },
  inactiveDot: {
    backgroundColor: '#cccccc',
  },
});