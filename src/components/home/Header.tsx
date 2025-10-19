import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleWidth, scaleHeight, scaleFont } from "../../utils/scaling";

const Header = ({ userName }: { userName: string }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [locationName, setLocationName] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Update location name when user selects a location
  useEffect(() => {
    if (route.params?.selectedLocation) {
      setLocationName(route.params.selectedLocation as string);
    }
  }, [route.params?.selectedLocation]);

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View>
        <Text style={styles.greeting}>{userName}</Text>

        <TouchableOpacity
          style={styles.locationRow}
          onPress={() =>
            navigation.navigate("LocationPicker")
          }
        >
          <Ionicons name="location-outline" size={scaleFont(16)} color="#2563eb" />
          <Text style={styles.locationText}>
            {locationName || "Select Location"}
          </Text>
          <Ionicons name="chevron-down" size={scaleFont(16)} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.iconGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={scaleFont(22)} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={scaleFont(22)} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scaleWidth(16),
    paddingBottom: scaleHeight(16),
    backgroundColor: '#fff',
  },
  greeting: { fontSize: scaleFont(18), fontWeight: "bold", color: "#1f2937" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: scaleHeight(4) },
  locationText: { fontSize: scaleFont(14), color: "#6b7280", marginHorizontal: scaleWidth(4) },
  iconGroup: { flexDirection: "row" },
  iconButton: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    backgroundColor: "#f3f4f6",
    borderRadius: scaleWidth(20),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scaleWidth(8),
  },
});
