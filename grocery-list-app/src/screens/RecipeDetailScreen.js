import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchRecipeDetails } from "../api/spoonacular";
import AppHeader from "../components/AppHeader";

export default function RecipeDetailScreen({ route, navigation, onAddRecipe }) {
  const { recipeId } = route.params ?? {};
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      if (!recipeId) {
        setError("Missing recipe id.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRecipeDetails(recipeId);
        setRecipe(data);
      } catch (err) {
        setError(err.message || "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [recipeId]);

  const handleAddRecipe = () => {
    if (!recipe) return;

    if (onAddRecipe) {
      onAddRecipe(recipe);
      Alert.alert("Added", "Recipe added to My Recipes.");
    } else {
      Alert.alert("Missing setup", "onAddRecipe is not connected yet.");
    }
  };

  const navigateDrawerScreen = (screenName) => {
    const parent = navigation?.getParent?.();
    if (parent && typeof parent.navigate === "function") {
      parent.navigate(screenName);
      return;
    }
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Recipe Details" />

      {loading ? (
        <ActivityIndicator size="large" style={styles.centered} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.message}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {recipe?.image ? (
            <Image source={{ uri: recipe.image }} style={styles.image} />
          ) : null}

          <Text style={styles.title}>{recipe?.title || "Recipe details"}</Text>

          <Text style={styles.message}>
            Ready in {recipe?.readyInMinutes ?? "?"} minutes
          </Text>

          <Text style={styles.message}>
            Servings: {recipe?.servings ?? "?"}
          </Text>

          <Text style={styles.sectionTitle}>Ingredients</Text>

          {Array.isArray(recipe?.extendedIngredients) &&
          recipe.extendedIngredients.length > 0 ? (
            recipe.extendedIngredients.map((ing, idx) => (
              <Text key={`${ing.id ?? "ingredient"}-${idx}`} style={styles.bullet}>
                • {ing.original}
              </Text>
            ))
          ) : (
            <Text style={styles.message}>No ingredients found.</Text>
          )}

          <Text style={styles.sectionTitle}>Cooking Steps</Text>

          {Array.isArray(recipe?.analyzedInstructions) &&
          recipe.analyzedInstructions.length > 0 &&
          Array.isArray(recipe.analyzedInstructions[0]?.steps) &&
          recipe.analyzedInstructions[0].steps.length > 0 ? (
            recipe.analyzedInstructions[0].steps.map((stepObj, idx) => (
              <Text key={`${stepObj.number ?? "step"}-${idx}`} style={styles.step}>
                {stepObj.number ?? idx + 1}. {stepObj.step}
              </Text>
            ))
          ) : (
            <Text style={styles.message}>No steps found.</Text>
          )}
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomButtonSpacing, !recipe && styles.bottomButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleAddRecipe}
          disabled={!recipe}
        >
          <Text style={styles.bottomButtonText}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomButtonSpacing]}
          activeOpacity={0.8}
          onPress={() => navigateDrawerScreen("My Recipes")}
        >
          <Text style={styles.bottomButtonText}>My Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          activeOpacity={0.8}
          onPress={() => navigateDrawerScreen("GroceryList")}
        >
          <Text style={styles.bottomButtonText}>Grocery List</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF1BE",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 24,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    fontWeight: "normal",
    color: "#111827",
  },
  message: {
    fontSize: 16,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
  },
  step: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFF1BE",
  },
  bottomButton: {
    flex: 1,
    backgroundColor: "#FFCC00",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 3 },
    }),
  },
  bottomButtonSpacing: {
    marginRight: 8,
  },
  bottomButtonDisabled: {
    opacity: 0.6,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
});
