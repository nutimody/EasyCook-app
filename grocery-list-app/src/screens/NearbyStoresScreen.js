import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AppHeader from "../components/AppHeader";
import { fetchNearbyGroceryStores } from "../api/googlePlaces";
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold} from "@expo-google-fonts/playfair-display";

export default function NearbyStoresScreen({ navigation, route }) {
  const [stores, setStores] = useState(route?.params?.stores || []);
  const [loading, setLoading] = useState(!route?.params?.stores?.length);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(route?.params?.userLocation || null);

  useEffect(() => {
    if (route?.params?.stores?.length && route?.params?.userLocation) {
      return;
    }

    loadStores();
  }, []);

  async function loadStores() {
    try {
      setLoading(true);
      setError("");

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Location permission denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);

      const results = await fetchNearbyGroceryStores(
        coords.latitude,
        coords.longitude
      );
      setStores(results);
    } catch (err) {
      setError(err?.message || "Failed to load stores.");
    } finally {
      setLoading(false);
    }
  }

  const mapRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
    }

    if (stores.length > 0) {
      const first = stores[0].location;
      return {
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
    }

    return {
      latitude: 37.3541,
      longitude: -121.9552,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [stores, userLocation]);

  function openDirections(store) {
    const lat = store?.location?.latitude;
    const lng = store?.location?.longitude;
    if (!lat || !lng) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  }

  function renderStore({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => openDirections(item)}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        {item.rating ? <Text style={styles.rating}>Rating: {item.rating}</Text> : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Nearby Stores" />
      <View style={styles.container}>
        <Text style={styles.title}>Nearby Stores</Text>
        <Text style={styles.subtitle}>Tap a store card below for directions</Text>

        <View style={styles.mapWrap}>
          <MapView style={styles.map} initialRegion={mapRegion} region={mapRegion}>
            {userLocation ? (
              <Marker coordinate={userLocation} title="You are here" pinColor="#2563EB" />
            ) : null}
            {stores
              .filter(
                (store) =>
                  typeof store?.location?.latitude === "number" &&
                  typeof store?.location?.longitude === "number"
              )
              .map((store) => (
                <Marker
                  key={store.id}
                  coordinate={store.location}
                  title={store.name}
                  description={store.address}
                  pinColor="#DC2626"
                />
              ))}
          </MapView>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.statusText}>Finding nearby grocery stores...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.statusText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={renderStore}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF1BE",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: "PlayfairDisplay_700Bold",
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 14,
  },
  mapWrap: {
    height: "40%",
    minHeight: 220,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  map: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  statusText: {
    marginTop: 10,
    color: "#374151",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#FFCC00",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#374151",
  },
  rating: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
});
