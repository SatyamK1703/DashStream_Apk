// import React, { useRef } from 'react';
// import {
//   View,
//   FlatList,
//   Dimensions,
//   Image,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from 'react-native';

// const { width } = Dimensions.get('window');
// const CARD_WIDTH = width * 0.92;
// const CARD_SPACING = (width - CARD_WIDTH) / 2;

// const OffersCarousel = ({ offers, currentIndex, setCurrentIndex }: any) => {
//   const scrollX = useRef(new Animated.Value(0)).current;

//   return (
//     <View style={styles.container}>
//       <Animated.FlatList
//         data={offers}
//         keyExtractor={(item) => item.id}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         snapToInterval={CARD_WIDTH + 10}
//         decelerationRate="fast"
//         contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
//         onMomentumScrollEnd={(e) => {
//           const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 10));
//           setCurrentIndex(index);
//         }}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//           { useNativeDriver: false }
//         )}
//         renderItem={({ item, index }) => {
//           const inputRange = [
//             (index - 1) * (CARD_WIDTH + 10),
//             index * (CARD_WIDTH + 10),
//             (index + 1) * (CARD_WIDTH + 10),
//           ];
//           const scale = scrollX.interpolate({
//             inputRange,
//             outputRange: [0.96, 1, 0.96],
//             extrapolate: 'clamp',
//           });

//           return (
//             <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
//               <TouchableOpacity activeOpacity={0.9}>
//                 <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

//                 {/* Overlayed Dots */}
//                 <View style={styles.indicatorRow}>
//                   {offers.map((_: any, idx: number) => (
//                     <View
//                       key={idx}
//                       style={[
//                         styles.indicatorDot,
//                         idx === currentIndex
//                           ? styles.activeDot
//                           : styles.inactiveDot,
//                       ]}
//                     />
//                   ))}
//                 </View>
//               </TouchableOpacity>
//             </Animated.View>
//           );
//         }}
//       />
//     </View>
//   );
// };

// export default OffersCarousel;

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 20,
//   },
//   cardWrapper: {
//     width: CARD_WIDTH,
//     height: 180,
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginRight: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   cardImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 16,
//   },
//   indicatorRow: {
//     position: 'absolute',
//     bottom: 12,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   indicatorDot: {
//     height: 8,
//     width: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   activeDot: {
//     backgroundColor: '#ffffff',
//     width: 18,
//   },
//   inactiveDot: {
//     backgroundColor: '#cccccc',
//   },
// });

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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const OffersCarousel = ({ offers, currentIndex, setCurrentIndex }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll every 3s
  useEffect(() => {
    if (!offers || offers.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [offers, currentIndex, setCurrentIndex]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={offers}
        keyExtractor={(item, idx) => (item?._id ?? item?.id ?? String(idx))}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + 10,
          offset: (CARD_WIDTH + 10) * index,
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
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + 10)
          );
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + 10),
            index * (CARD_WIDTH + 10),
            (index + 1) * (CARD_WIDTH + 10),
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.96, 1, 0.96],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[styles.cardWrapper, { transform: [{ scale }] }]}
            >
              <TouchableOpacity activeOpacity={0.9}>
                <Image
                  source={item.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                {/* Dots */}
                <View style={styles.indicatorRow}>
                  {offers.map((_: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.indicatorDot,
                        idx === currentIndex
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
    marginBottom: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 10,
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
    borderRadius: 16,
  },
  indicatorRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 18,
  },
  inactiveDot: {
    backgroundColor: '#cccccc',
  },
});
