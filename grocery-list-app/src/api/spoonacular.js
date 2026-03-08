// src/api/spoonacular.js
import { SPOONACULAR_API_KEY, SPOONACULAR_BASE_URL } from "../config";

async function request(path, params = {}) {
  const url = new URL(SPOONACULAR_BASE_URL + path);

  // Always include API key
  url.searchParams.set("apiKey", SPOONACULAR_API_KEY);

  // Add passed params
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") 
      url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spoonacular error ${res.status}: ${text}`);
  }
  return res.json();
}

// 1) Recipes by cuisine (simple starting point)
export function fetchRecipesByCuisine(cuisine, number = 10) {
  return request("/recipes/complexSearch", {
    cuisine,
    number,
    addRecipeInformation: true, // gives title, image, etc.
    addRecipeNutrition: true,
  });
}

// 2) Ingredients for a recipe
export function fetchIngredientsForRecipe(recipeId) {
  return request(`/recipes/${recipeId}/ingredientWidget.json`);
}

export function fetchRecipeDetails(recipeId) {
  return request(`/recipes/${recipeId}/information`, {
    includeNutrition: false,
  });
}
