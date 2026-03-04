import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchRecipeDetails } from "../api/spoonacular";

export default function RecipeDetailScreen({ route }) {
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

  return (
    <SafeAreaView style={styles.safe}>
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
});
