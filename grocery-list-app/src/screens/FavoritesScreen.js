import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";

const GREEN = "#1F7A3A";
const INK = "#111827";

export default function FavoritesScreen({
  navigation,
  favoriteRecipes = [],
  onAddFavorite,
  onRemoveFavorite,
}) {
  const getCaloriesText = (recipe) => {
    const nutrients = recipe?.nutrition?.nutrients;
    if (!Array.isArray(nutrients)) return "N/A";

    const caloriesNutrient = nutrients.find(
      (n) => n?.name?.toLowerCase() === "calories"
    );
    if (!caloriesNutrient?.amount) return "N/A";

    return `${Math.round(caloriesNutrient.amount)} kcal`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Favorites" />
      <View style={styles.container}>
        {favoriteRecipes.length === 0 ? (
          <Text style={styles.message}>No favorite recipes yet.</Text>
        ) : (
          <FlatList
            data={favoriteRecipes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.recipeCard}>
                <TouchableOpacity
                  style={styles.cardMain}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("HomeRoot", {
                      screen: "RecipeDetail",
                      params: { recipeId: item.id },
                    })
                  }
                >
                  <View style={styles.thumbWrap}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.thumbImage} />
                    ) : (
                      <View style={styles.thumbPlaceholder} />
                    )}
                  </View>

                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title || "Title"}
                    </Text>

                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {item.servings ? `${item.servings} servings` : "Recipe"}
                    </Text>

                    <View style={styles.metaBlock}>
                      <Text style={styles.metaText}>
                        Cook time: {item.readyInMinutes ? `${item.readyInMinutes} min` : "N/A"}
                      </Text>
                      <Text style={styles.metaText}>
                        Calories: {getCaloriesText(item)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <Pressable
                  style={[styles.actionButton, styles.heartButton, styles.heartButtonSelected]}
                  onPress={() => {
                    const isInFavorites = favoriteRecipes.some((r) => r.id === item.id);
                    if (isInFavorites) {
                      onRemoveFavorite?.(item.id);
                    } else {
                      onAddFavorite?.(item);
                    }
                  }}
                >
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          />
        )}
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
    paddingHorizontal: 14,
  },
  message: {
    fontSize: 16,
    color: "#374151",
    marginTop: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 14,
    gap: 14,
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }),
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  thumbWrap: { marginLeft: 6, marginRight: 14 },
  thumbPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 5,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: GREEN,
  },
  thumbImage: {
    width: 86,
    height: 86,
    borderRadius: 5,
    backgroundColor: "#F3F4F6",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: INK,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: INK,
    opacity: 0.8,
    marginBottom: 10,
  },
  metaBlock: { gap: 4 },
  metaText: {
    fontSize: 13,
    color: INK,
    opacity: 0.85,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  heartButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#F2508B",
    marginLeft: 8,
  },
  heartButtonSelected: {
    backgroundColor: "rgba(242,80,139,0.3)",
  },
});
