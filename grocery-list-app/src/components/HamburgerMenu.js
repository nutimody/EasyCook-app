import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";

const MENU_ITEMS = [
  { key: "preferences", label: "Preferences" },
  { key: "favorites", label: "Favorites" },
  { key: "settings", label: "Settings" },
  { key: "signout", label: "Sign Out", danger: true },
];

export default function HamburgerMenu({ visible, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Dimmed background - tap to close */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Slide panel */}
      <View style={styles.panel}>
        <Text style={styles.title}>Menu</Text>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={styles.item}
            activeOpacity={0.7}
          >
            <Text style={[styles.itemText, item.danger && styles.dangerText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 280,
    backgroundColor: "white",
    paddingTop: 60,
    paddingHorizontal: 18,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 2, height: 0 },
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
  },
  dangerText: {
    color: "#c62828",
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 18,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});