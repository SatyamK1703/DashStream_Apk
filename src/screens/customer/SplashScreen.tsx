import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={["#2563eb", "#1e40af"]} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/poster.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>DashStream</Text>
        <Text style={styles.subtitle}>Premium Car Wash & Detailing</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: 200, height: 200, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#e0e7ff', textAlign: 'center', marginBottom: 24 },
  loader: { marginTop: 16 }
});

export default SplashScreen;