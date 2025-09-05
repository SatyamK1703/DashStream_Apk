import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  AppState,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const LocationPickerScreen = () => {
  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const appState = useRef(AppState.currentState);

  const navigation = useNavigation();
  const route = useRoute();

  // Monitor app state changes to handle app coming to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground, refresh location if needed
        if (mapRef.current && region) {
          try {
            mapRef.current.animateToRegion(region, 500);
          } catch (error) {
            console.log("Map animation error:", error);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [region]);

  useEffect(() => {
    let isMounted = true;
    const getInitialLocation = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setErrorMessage(null);
        
        // Request location permissions
        let permissionResult;
        try {
          permissionResult = await Location.requestForegroundPermissionsAsync();
        } catch (permError: any) {
          console.log("Permission request error:", permError);
          throw new Error("Failed to request location permissions: " + (permError.message || "Unknown error"));
        }
        
        if (!isMounted) return;
        
        if (permissionResult.status !== "granted") {
          setLoading(false);
          setErrorMessage("Location permission not granted");
          Alert.alert(
            "Location Permission Required",
            "Please enable location services to use this feature.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => navigation.goBack(),
              },
              {
                text: "Open Settings",
                onPress: () => {
                  try {
                    Location.getForegroundPermissionsAsync();
                  } catch (error) {
                    console.log("Error opening settings:", error);
                  }
                },
              },
            ]
          );
          return;
        }

        // Get current position with timeout
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(error => {
          console.log("getCurrentPositionAsync error:", error);
          throw new Error("Failed to get current position: " + (error.message || "Unknown error"));
        });
        
        // Set a timeout for location retrieval
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Location request timed out")), 15000);
        });
        
        // Race between location retrieval and timeout
        let loc;
        try {
          loc = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
        } catch (error: any) {
          console.log("Location race error:", error);
          throw error;
        }
        
        if (!isMounted) return;
        
        if (!loc || !loc.coords) {
          throw new Error("Invalid location data received");
        }
        
        const newRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        
        setRegion(newRegion);
        setLoading(false);
      } catch (error: any) {
        if (!isMounted) return;
        
        console.log("Location Error:", error);
        setLoading(false);
        setErrorMessage(error.message || "Could not fetch your location");
        
        // Set default region if location fails
        setRegion({
          latitude: 37.7749, // Default to San Francisco or another appropriate default
          longitude: -122.4194,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        
        Alert.alert(
          "Location Error",
          `Could not fetch your current location: ${error.message || "Unknown error"}`,
          [{ text: "OK" }]
        );
      }
    };

    getInitialLocation();
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Cancel any pending location requests if possible
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let geo;
      try {
        geo = await Location.geocodeAsync(searchQuery).catch(error => {
          console.log("Geocoding promise error:", error);
          throw new Error("Failed to search for location: " + (error.message || "Unknown error"));
        });
      } catch (geocodeError: any) {
        console.log("Geocoding catch error:", geocodeError);
        throw geocodeError;
      }
      
      if (!geo || geo.length === 0) {
        Alert.alert("No Results", "No locations found for your search. Please try a different query.");
        setSearchResults([]);
        return;
      }
      
      // Validate each result's coordinates
      const validResults = geo.filter(result => 
        isValidCoordinate(result.latitude, result.longitude)
      );
      
      if (validResults.length === 0) {
        Alert.alert("Invalid Results", "The search returned invalid location data. Please try a different query.");
        setSearchResults([]);
        return;
      }
      
      setSearchResults(validResults);
    } catch (error: any) {
      console.log("Geocoding error:", error);
      setSearchResults([]);
      Alert.alert(
        "Search Error", 
        `Could not search for locations: ${error.message || "Please try again."}`,
        [{ text: "OK" }]
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setRegion({
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSearchQuery(result.name || result.formattedAddress || searchQuery);
    setSearchResults([]);
  };

  const handleConfirm = async () => {
    if (!region) {
      Alert.alert("Error", "Please select a location first.");
      return;
    }

    try {
      // Validate coordinates before reverse geocoding
      if (!isValidCoordinate(region.latitude, region.longitude)) {
        throw new Error("Invalid coordinates selected");
      }
      
      let addresses;
      try {
        addresses = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
        }).catch(error => {
          console.log("Reverse geocoding error:", error);
          throw new Error("Failed to get address from coordinates: " + (error.message || "Unknown error"));
        });
      } catch (geocodeError: any) {
        console.log("Reverse geocoding catch error:", geocodeError);
        throw geocodeError;
      }

      if (!addresses || addresses.length === 0) {
        throw new Error("Could not determine address for selected location");
      }
      
      const address = addresses[0];
      const locationName = address.street || address.city || address.region || "Selected Location";

      // ✅ Pass location back to previous screen
      if (route.params?.onLocationSelected) {
        route.params.onLocationSelected(locationName);
      }

      navigation.goBack();
    } catch (error: any) {
      console.log("Reverse geocoding error:", error);
      Alert.alert(
        "Address Error", 
        `Could not get address details: ${error.message || "Please try again."}`,
        [{ text: "OK" }]
      );
    }
  };
  
  // Validate coordinates to prevent invalid location data
  const isValidCoordinate = (latitude: number, longitude: number): boolean => {
    return (
      latitude !== null && 
      longitude !== null && 
      !isNaN(latitude) && 
      !isNaN(longitude) && 
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180
    );
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      // Check if location permission is granted
      let permissionStatus;
      try {
        permissionStatus = await Location.getForegroundPermissionsAsync();
      } catch (permError: any) {
        console.log("Permission check error:", permError);
        throw new Error("Failed to check location permissions: " + (permError.message || "Unknown error"));
      }
      
      if (permissionStatus.status !== "granted") {
        // Request permission if not granted
        try {
          const requestResult = await Location.requestForegroundPermissionsAsync();
          if (requestResult.status !== "granted") {
            throw new Error("Location permission not granted");
          }
        } catch (requestError: any) {
          console.log("Permission request error:", requestError);
          throw new Error("Failed to request location permissions: " + (requestError.message || "Unknown error"));
        }
      }
      
      // Get current position with timeout and error handling
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      }).catch(posError => {
        console.log("getCurrentPositionAsync error:", posError);
        throw new Error("Failed to get current position: " + (posError.message || "Unknown error"));
      });
      
      // Set a timeout for location retrieval
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Location request timed out")), 10000);
      });
      
      // Race between location retrieval and timeout
      let loc;
      try {
        loc = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
      } catch (raceError: any) {
        console.log("Location race error:", raceError);
        throw raceError;
      }
      
      if (!loc || !loc.coords) {
        throw new Error("Invalid location data received");
      }
      
      // Validate coordinates before using them
      if (!isValidCoordinate(loc.coords.latitude, loc.coords.longitude)) {
        throw new Error("Invalid coordinates received from location service");
      }
      
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // Animate map to new region if map is ready
      if (mapRef.current && mapReady) {
        try {
          mapRef.current.animateToRegion(newRegion, 500);
        } catch (mapError) {
          console.log("Map animation error:", mapError);
          // Don't throw here, just log the error as this is not critical
        }
      }
    } catch (error: any) {
      console.log("Current location error:", error);
      Alert.alert(
        "Location Error", 
        `Could not get current location: ${error.message || "Please try again."}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectSearchResult(item)}
    >
      <Ionicons name="location-outline" size={20} color="#2563eb" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultTitle}>
          {item.name || item.street || "Unknown location"}
        </Text>
        <Text style={styles.searchResultSubtitle}>
          {item.city && item.region ? `${item.city}, ${item.region}` : item.formattedAddress}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </SafeAreaView>
    );
  }
  
  if (errorMessage && !region) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setErrorMessage(null);
            handleUseCurrentLocation();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an address or place"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => index.toString()}
              style={styles.searchResultsList}
            />
          </View>
        )}

        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={(r) => {
              try {
                if (r && isValidCoordinate(r.latitude, r.longitude)) {
                  setRegion(r);
                }
              } catch (error) {
                console.log("Region change error:", error);
                // Don't update region if there's an error
              }
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            onMapReady={() => {
              try {
                setMapReady(true);
                // Ensure map is properly centered on initial load
                if (mapRef.current && region) {
                  try {
                    mapRef.current.animateToRegion(region, 500);
                  } catch (animError) {
                    console.log("Initial animation error:", animError);
                  }
                }
              } catch (readyError) {
                console.log("Map ready error:", readyError);
              }
            }}
            onError={(error) => {
              console.log("Map error:", error);
              setErrorMessage("Error loading map. Please try again.");
              // Provide fallback UI or retry mechanism
              setTimeout(() => {
                if (mapRef.current && region && mapReady) {
                  try {
                    mapRef.current.animateToRegion(region, 500);
                  } catch (retryError) {
                    console.log("Retry animation error:", retryError);
                  }
                }
              }, 2000);
            }}
          >
            {region && isValidCoordinate(region.latitude, region.longitude) && (
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude
                }}
                draggable
                onDragEnd={(e) => {
                  try {
                    const newCoord = e.nativeEvent.coordinate;
                    if (isValidCoordinate(newCoord.latitude, newCoord.longitude)) {
                      setRegion({
                        ...region,
                        latitude: newCoord.latitude,
                        longitude: newCoord.longitude
                      });
                    }
                  } catch (dragError) {
                    console.log("Marker drag error:", dragError);
                  }
                }}
                pinColor="#2563eb"
              />
            )}
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocationPickerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#6b7280" },
  errorText: { marginTop: 16, color: "#ef4444", textAlign: "center", paddingHorizontal: 32 },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButtonAlt: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: "#6b7280",
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 4,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 4,
  },

  // Search Results
  searchResultsContainer: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultsList: {
    borderRadius: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Map
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  confirmButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});