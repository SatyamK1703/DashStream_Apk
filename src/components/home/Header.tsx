import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const Header = ({ userName }: { userName: string }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [locationName, setLocationName] = useState<string | null>(null);

  // Update location name when user selects a location
  useEffect(() => {
    if (route.params?.selectedLocation) {
      setLocationName(route.params.selectedLocation as string);
    }
  }, [route.params?.selectedLocation]);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{userName}</Text>

        <TouchableOpacity
  style={styles.locationRow}
  onPress={() =>
    navigation.navigate("LocationPicker", {
      onLocationSelected: (location: string) => {
        setLocationName(location); // update state when user confirms
      },
    })
  }
>
  <Ionicons name="location-outline" size={16} color="#2563eb" />
  <Text style={styles.locationText}>
    {locationName || "Select Location"}
  </Text>
  <Ionicons name="chevron-down" size={16} color="#2563eb" />
</TouchableOpacity>

      </View>

      <View style={styles.iconGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={22} color="#2563eb" />
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  greeting: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { fontSize: 14, color: "#6b7280", marginHorizontal: 4 },
  iconGroup: { flexDirection: "row" },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
