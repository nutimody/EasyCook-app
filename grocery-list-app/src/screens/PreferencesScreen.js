import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";

export default function PreferencesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Preferences" />
      <View style={styles.container}>
        <Text style={styles.text}>Preferences</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
});
