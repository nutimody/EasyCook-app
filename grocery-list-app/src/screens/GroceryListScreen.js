import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";

export default function GroceryListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Grocery List" />
      <View style={styles.container}>
        <Text style={styles.title}>Grocery List</Text>
        <Text style={styles.message}>Your generated grocery items will appear here.</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#374151",
  },
});
