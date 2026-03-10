import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import pageUnderConstruction from "../../assets/Page_under_construction.jpg";

export default function SettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Settings" />
      <View style={styles.container}>
        <Image
          source={pageUnderConstruction}
          style={styles.placeholderImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  placeholderImage: {
    width: "100%",
    maxWidth: 520,
    height: 420,
  },
});
