// import React, { useEffect, useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';
// import { useQuickFixes } from '../../hooks/useAdmin'; // Assuming you have a hook to get admin data

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const CARD_SPACING = scaleWidth(12);
// const CARD_WIDTH = (SCREEN_WIDTH - CARD_SPACING * 4 - scaleWidth(32)) / 3; // 3 columns + paddings
// type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

// const QuickFixes = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const { data: quickFixes, execute: getQuickFixes } = useQuickFixes();

//   useEffect(() => {
//     getQuickFixes();
//   }, []);

//   const handleSeeAll = () => {
//     navigation.navigate('AllServices'); // Assuming you have an 'AllServices' screen
//   };

//   return (
//     <View style={{ marginTop: scaleHeight(20) }}>
//       <Text style={styles.title}>Quick Fixes (Common Problems) </Text>
//       <View style={{ paddingHorizontal: scaleWidth(16) }}>
//         {(quickFixes || [])
//           .reduce((rows: any[], item: any, index: number) => {
//             if (index % 3 === 0) rows.push([]);
//             rows[rows.length - 1].push(item);
//             return rows;
//           }, [])
//           .map((row: any[], rowIndex: number) => (
//             <View key={rowIndex} style={styles.row}>
//               {row.map((item) => (
//                 <TouchableOpacity key={item.id} style={styles.card} onPress={handleSeeAll}>
//                   <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
//                   <View style={styles.labelWrapper}>
//                     <Text style={styles.label}>{item.label} →</Text>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))}}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: scaleFont(18),
//     fontWeight: 'bold',
//     marginBottom: scaleHeight(10),
//     marginHorizontal: scaleWidth(16),
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: scaleHeight(16),
//   },
//   card: {
//     width: CARD_WIDTH,
//     borderRadius: scaleWidth(12),
//     backgroundColor: '#f5f5f5',
//     overflow: 'hidden', // ⬅️ Ensures children respect border radius
//   },
//   image: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     aspectRatio: 1, // To maintain square shape
//     borderTopLeftRadius: scaleWidth(12),
//     borderTopRightRadius: scaleWidth(12),
//     height: scaleHeight(80),
//     width: '100%',
//   },
//   labelWrapper: {
//     backgroundColor: 'rgba(37,99,235,0.1)',
//     paddingVertical: scaleHeight(8),
//     paddingHorizontal: scaleWidth(6),
//   },
//   label: {
//     fontWeight: '600',
//     fontSize: scaleFont(13),
//   },
// });

// export default QuickFixes;
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';
import { useQuickFixes } from '../../hooks/useAdmin';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SPACING = scaleWidth(12);
const CARD_WIDTH = (SCREEN_WIDTH - CARD_SPACING * 4 - scaleWidth(32)) / 3;

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const QuickFixes = () => {
  const navigation = useNavigation<NavigationProp>();
  const { data: quickFixes, execute: getQuickFixes } = useQuickFixes();

  useEffect(() => {
    getQuickFixes();
  }, []);

  const handlePress = (item: any) => {
    navigation.navigate('AllServices');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Fixes</Text>
      <View style={styles.gridContainer}>
        {(quickFixes || []).map((item: any) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => handlePress(item)}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.bottomBar}>
              <Text numberOfLines={1} style={styles.label}>
                {item.label}
              </Text>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scaleHeight(20),
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
    marginHorizontal: scaleWidth(16),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: scaleHeight(16),
    borderRadius: scaleWidth(14),
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: scaleHeight(80),
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(10),
    backgroundColor: '#f2f6ff',
  },
  label: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    flex: 1,
  },
  arrow: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
});

export default QuickFixes;
