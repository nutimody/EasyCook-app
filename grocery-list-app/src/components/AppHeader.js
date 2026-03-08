import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import logo from "../../assets/easycook-logo.png";

export default function AppHeader({ navigation, centerText = "Santa Clara, CA" }) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  const handleOpenDrawer = () => {
    if (typeof navigation?.openDrawer === "function") {
      navigation.openDrawer();
      return;
    }

    const parent = navigation?.getParent?.();
    if (typeof parent?.openDrawer === "function") {
      parent.openDrawer();
    }
  };

  return (
    <View style={styles.topBar}>
      <View style={styles.iconCircle}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <Text
        style={[
          styles.centerText,
          fontsLoaded && styles.centerTextPlayfair,
        ]}
        numberOfLines={1}
      >
        {centerText}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.iconCircle}
        onPress={handleOpenDrawer}
      >
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  centerText: {
    flex: 1,
    textAlign: "center",
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  centerTextPlayfair: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontWeight: "normal",
  },
  menuIcon: {
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#111827",
  },
});
