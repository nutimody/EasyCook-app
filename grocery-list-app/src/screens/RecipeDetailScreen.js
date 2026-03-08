import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
          <TouchableOpacity onPress={handleAddRecipe} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>

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
              <Text key={ing.id ?? `${ing.original}-${idx}`} style={styles.bullet}>
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
              <Text key={stepObj.number ?? idx} style={styles.step}>
                {stepObj.number ?? idx + 1}. {stepObj.step}
              </Text>
            ))
          ) : (
            <Text style={styles.message}>No steps found.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
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
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
