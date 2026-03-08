import React, { useState } from "react";
import {
  Alert,
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
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import AppHeader from "../components/AppHeader";
import { fetchRecipeDetails } from "../api/spoonacular";

const GREEN = "#1F7A3A";
const INK = "#111827";

export default function MyRecipesScreen({
  navigation,
  myRecipes = [],
  onRemoveRecipe,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const getCaloriesText = (recipe) => {
    const nutrients = recipe?.nutrition?.nutrients;
    if (!Array.isArray(nutrients)) return "N/A";

    const caloriesNutrient = nutrients.find(
      (n) => n?.name?.toLowerCase() === "calories"
    );
    if (!caloriesNutrient?.amount) return "N/A";

    return `${Math.round(caloriesNutrient.amount)} kcal`;
  };

  const handleGenerateGroceryList = async () => {
    if (myRecipes.length === 0) {
      Alert.alert("No recipes", "Add recipes first to generate a grocery list.");
      return;
    }

    try {
      setIsGenerating(true);

      const selectedRecipes = await Promise.all(
        myRecipes.map(async (recipe) => {
          if (Array.isArray(recipe?.extendedIngredients) && recipe.extendedIngredients.length > 0) {
            return recipe;
          }

          try {
            return await fetchRecipeDetails(recipe.id);
          } catch {
            return recipe;
          }
        })
      );

      navigation.navigate("GroceryList", { selectedRecipes });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="My Recipes" />
      <View style={styles.container}>
        {myRecipes.length === 0 ? (
          <Text style={styles.message}>No recipes added yet.</Text>
        ) : (
          <FlatList
            data={myRecipes}
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

                <View style={styles.cardActionColumn}>
                  <Pressable
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => onRemoveRecipe?.(item.id)}
                  >
                    <Ionicons name="remove" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <Pressable
        style={styles.generateButton}
        onPress={handleGenerateGroceryList}
        disabled={isGenerating}
      >
        <Text style={styles.generateButtonText}>
          {isGenerating ? "Generating..." : "Generate Grocery List"}
        </Text>
      </Pressable>
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
    paddingBottom: 110,
    gap: 14,
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 20,
    paddingBottom: 20,
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
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: INK,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: INK,
    opacity: 0.8,
    marginBottom: 10,
  },
  metaBlock: { gap: 4 },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: INK,
    opacity: 0.85,
  },
  cardActionColumn: {
    justifyContent: "center",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  removeButton: {
    borderWidth: 1.5,
    borderColor: "#DC2626",
    backgroundColor: "rgba(220,38,38,0.15)",
  },
  generateButton: {
    position: "absolute",
    bottom: 31,
    alignSelf: "center",
    backgroundColor: "#FFCC00",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  generateButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});
