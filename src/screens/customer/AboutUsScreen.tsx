import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={require('../../assets/images/image.png')} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <Text style={styles.brandName}>DashSteam</Text>
          <Text style={styles.brandTagline}>Fast • Reliable • Innovative</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Intro */}
          <Text style={styles.paragraph}>
            We build experiences that bring convenience and speed right to your doorstep. Our goal
            is simple: empower everyday life with seamless, dependable services backed by modern
            technology.
          </Text>

          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mission</Text>
            <Text style={styles.sectionBody}>
              Deliver meaningful experiences that simplify how people access daily services while
              pushing the boundaries of what tech can do.
            </Text>
          </View>

          {/* Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Values</Text>

            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
              <Text style={styles.bulletText}>Customer-driven decisions at every step.</Text>
            </View>

            <View style={styles.bulletRow}>
              <Ionicons name="sparkles" size={18} color="#2563eb" />
              <Text style={styles.bulletText}>Innovation that adapts and evolves with time.</Text>
            </View>

            <View style={styles.bulletRow}>
              <Ionicons name="shield-checkmark" size={18} color="#2563eb" />
              <Text style={styles.bulletText}>
                Transparency, trust, and unwavering reliability.
              </Text>
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <Text style={styles.sectionBody}>
              DashStream is built by a passionate crew of creators, engineers, and problem-solvers
              dedicated to one mission—making life easier for you.
            </Text>
          </View>

          <Text style={styles.footerText}>support@dashstream.com • www.dashstream.com</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  safeArea: {
    backgroundColor: '#ffffff',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  heroContainer: {
    height: 260,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },

  brandTagline: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 22,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  bulletText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },

  footerText: {
    marginTop: 26,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
  },
});
