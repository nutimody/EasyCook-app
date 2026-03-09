// src/config.js
// Expo only inlines environment variables prefixed with EXPO_PUBLIC_.

export const SPOONACULAR_API_KEY =
  process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "";
export const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

export const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";
export const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1";
