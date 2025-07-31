import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      {/* SafeAreaView fixes iOS notch issue */}
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 40 }} /> {/* Placeholder to balance header */}
        </View>
      </SafeAreaView>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero Banner */}
        <Image
          source={require("../../assets/images/image.png")}
          style={styles.banner}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>DashStream</Text>
          <Text style={styles.subtitle}>Fast • Reliable • Innovative</Text>

          <Text style={styles.description}>
            DashStream is built to transform the way you experience daily
            services. We combine technology and trust to deliver fast, reliable,
            and innovative solutions at your fingertips.
          </Text>

          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              To empower people by connecting them with seamless services and
              experiences that simplify their lives.
            </Text>
          </View>

          {/* Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Values</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Customer-first mindset in everything we do.
              </Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Innovation-driven solutions that adapt with time.
              </Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Reliability and transparency at all stages.
              </Text>
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <Text style={styles.sectionText}>
              DashStream is powered by passionate innovators and professionals
              working tirelessly to deliver excellence. We believe in building
              meaningful connections with our customers.
            </Text>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            📧 support@dashstream.com | 🌐 www.dashstream.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  container: {
    flexGrow: 1,
  },
  banner: {
    width: "100%",
    height: 220,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    marginRight: 6,
    color: "#2563eb",
  },
  bulletText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
  footer: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 30,
  },
});
