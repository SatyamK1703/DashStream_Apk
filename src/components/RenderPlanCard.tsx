// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';





// const renderPlanCard = (plan: MembershipPlan) => (
//   <TouchableOpacity 
//     key={plan.id}
//     style={[styles.card, plan.popular ? styles.popularCard : styles.defaultCard]}
//     onPress={() => handleSelectPlan(plan)}
//     activeOpacity={0.85}
//   >
//     {plan.popular && (
//       <View style={styles.popularBadge}>
//         <Text style={styles.popularText}>POPULAR</Text>
//       </View>
//     )}
    
//     <Text style={styles.planName}>{plan.name}</Text>
//     <View style={styles.priceRow}>
//       <Text style={styles.price}>₹{plan.price}</Text>
//       <Text style={styles.duration}>/{plan.duration}</Text>
//     </View>
    
//     <View style={styles.divider} />
    
//     {plan.features.map((feature, index) => (
//       <View key={index} style={styles.featureRow}>
//         <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
//         <Text style={styles.featureText}>{feature}</Text>
//       </View>
//     ))}
    
//     <TouchableOpacity 
//       style={[styles.button, plan.popular ? styles.popularButton : styles.defaultButton]}
//       onPress={() => handleSelectPlan(plan)}
//     >
//       <Text style={styles.buttonText}>Choose Plan</Text>
//     </TouchableOpacity>
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 2,
//     position: 'relative'
//   },
//   popularCard: {
//     borderColor: '#f97316',
//   },
//   defaultCard: {
//     borderColor: '#f3f4f6',
//   },
//   popularBadge: {
//     position: 'absolute',
//     top: -12,
//     right: 20,
//     backgroundColor: '#f97316',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 16,
//   },
//   popularText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: '700'
//   },
//   planName: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1f2937'
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginTop: 4,
//     marginBottom: 12,
//   },
//   price: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#2563eb'
//   },
//   duration: {
//     color: '#6b7280',
//     marginLeft: 4,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#f3f4f6',
//     marginVertical: 12,
//   },
//   featureRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   featureText: {
//     color: '#374151',
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   button: {
//     marginTop: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   popularButton: {
//     backgroundColor: '#f97316',
//   },
//   defaultButton: {
//     backgroundColor: '#2563eb',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '700'
//   }
// });

// export default renderPlanCard;\

