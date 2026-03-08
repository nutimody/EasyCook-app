import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { fetchRecipesByCuisine } from "../api/spoonacular";
import AppHeader from "../components/AppHeader";
import * as Location from "expo-location";


const CUISINES = [
  { key: "indian", label: "Indian", emoji: "🇮🇳" },
  { key: "italian", label: "Italian", emoji: "🇮🇹" },
  { key: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { key: "thai", label: "Thai", emoji: "🇹🇭" },
  { key: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { key: "japanese", label: "Japanese", emoji: "🇯🇵" },
];

export default function HomeScreen({
  navigation,
  onAddRecipe,
  onRemoveRecipe,
  onAddFavorite,
  onRemoveFavorite,
  myRecipes = [],
  favoriteRecipes = [],
}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState(null);
  const [headerLocation, setHeaderLocation] = useState("Santa Clara, CA");

  // NEW: whether we’re showing the initial tile grid or the recipe list
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const loadCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [place] = await Location.reverseGeocodeAsync({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });

        if (!place) {
          return;
        }

        const city = place.city || place.subregion || place.region;
        const region = place.region || place.country;

        if (city && region) {
          setHeaderLocation(`${city}, ${region}`);
        } else if (city) {
          setHeaderLocation(city);
        }
      } catch (error) {
        console.log("Error getting location:", error?.message || error);
      }
    };

    loadCurrentLocation();
  }, []);

  if (!fontsLoaded) return null;


  const loadRecipes = async (cuisine) => {
    try {
      setActiveCuisine(cuisine);
      setLoading(true);

      // switch to list immediately so user sees the UI change right away
      setViewMode("list");

      const data = await fetchRecipesByCuisine(cuisine, 10);
      setRecipes(data.results || []);
    } catch (err) {
      console.log("Error fetching recipes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToGrid = () => {
    setViewMode("grid");
    setActiveCuisine(null);
    setRecipes([]);
    setLoading(false);
  };

  const getCaloriesText = (recipe) => {
    const nutrients = recipe?.nutrition?.nutrients;
    if (!Array.isArray(nutrients)) return "N/A";

    const caloriesNutrient = nutrients.find(
      (n) => n?.name?.toLowerCase() === "calories"
    );
    if (!caloriesNutrient?.amount) return "N/A";

    return `${Math.round(caloriesNutrient.amount)} kcal`;
  };

  const handleRecipeToggle = (recipe) => {
    if (!recipe) return;
    const isInMyRecipes = myRecipes.some((r) => r.id === recipe.id);

    if (isInMyRecipes && onRemoveRecipe) {
      onRemoveRecipe(recipe.id);
      return;
    }

    if (!isInMyRecipes && onAddRecipe) {
      onAddRecipe(recipe);
    }
  };

  const handleFavoriteToggle = (recipe) => {
    if (!recipe) return;
    const isInFavorites = favoriteRecipes.some((r) => r.id === recipe.id);

    if (isInFavorites && onRemoveFavorite) {
      onRemoveFavorite(recipe.id);
      return;
    }

    if (!isInFavorites && onAddFavorite) {
      onAddFavorite(recipe);
    }
  };

  // =========================
  // MODE 1: CUISINE TILE GRID
  // =========================
  if (viewMode === "grid") {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader navigation={navigation} centerText={headerLocation} />
        <FlatList
          key="cuisine-grid"
          data={CUISINES}
          keyExtractor={(item) => item.key}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          ListHeaderComponent={
            <>
              <Text style={styles.header}>Choose a Cuisine</Text>
              <Text style={styles.subHeader}>
                Tap a cuisine to see recipes
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => loadRecipes(item.key)}
              style={styles.tile}
            >
              <Text style={styles.tileEmoji}>{item.emoji}</Text>
              <Text style={styles.tileLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // =========================
  // MODE 2: YOUR CURRENT LIST
  // =========================
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText={headerLocation} />
      <FlatList
        key="recipe-list"
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            {/* Back to grid */}
            <View style={styles.backRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={resetToGrid}
                style={styles.backPill}
              >
                <Text style={styles.backPillText}>← All cuisines</Text>
              </TouchableOpacity>

              {activeCuisine ? (
                <Text style={styles.activeCuisineText}>
                  {activeCuisine.toUpperCase()}
                </Text>
              ) : (
                <View />
              )}
            </View>

            <Text style={styles.header}>Choose a Cuisine</Text>

            {/* tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagRow}
              style={styles.tagScroll}
            >
              {CUISINES.map((c) => (
                <CuisineTag
                  key={c.key}
                  label={c.label}
                  active={activeCuisine === c.key}
                  onPress={() => loadRecipes(c.key)}
                />
              ))}
            </ScrollView>

            {loading && <ActivityIndicator size="large" style={styles.loader} />}
          </>
        }
        renderItem={({ item }) => {
          const isInMyRecipes = myRecipes.some((r) => r.id === item.id);
          const isInFavorites = favoriteRecipes.some((r) => r.id === item.id);

          return (
            <View style={styles.recipeCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.cardMain}
              onPress={() =>
                navigation.navigate("RecipeDetail", {
                  recipeId: item.id,
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
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.addButton,
                  isInMyRecipes && styles.addButtonSelected,
                ]}
                onPress={() => handleRecipeToggle(item)}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={GREEN}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.actionButton,
                  styles.heartButton,
                  isInFavorites && styles.heartButtonSelected,
                ]}
                onPress={() => handleFavoriteToggle(item)}
              >
                <Ionicons
                  name={isInFavorites ? "heart" : "heart-outline"}
                  size={16}
                  color={isInFavorites ? "#FFFFFF" : "#F2508B"}
                />
              </TouchableOpacity>
            </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              Pick a cuisine to load recipes.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function CuisineTag({ label, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.tag, active && styles.tagActive]}
    >
      <Text style={[styles.tagText, active && styles.tagTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const GREEN = "#1F7A3A";
const INK = "#111827";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  /* ===== Title ===== */
  header: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    color: INK,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  subHeader: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: INK,
    opacity: 0.75,
    textAlign: "center",
    marginBottom: 14,
  },

  /* ===== GRID MODE ===== */
  gridContainer: {
    paddingHorizontal: 14,
    paddingBottom: 18,
    gap: 14,
  },
  gridRow: {
    gap: 14,
  },
  tile: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: GREEN,
    padding: 18,
    minHeight: 140,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
    }),
  },
  tileEmoji: {
    fontSize: 34,
  },
  tileLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: INK,
  },

  /* ===== List Mode ===== */
  listContainer: {
    padding: 14,
    gap: 14,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  backPill: {
    borderWidth: 2,
    borderColor: GREEN,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  backPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: INK,
  },
  activeCuisineText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: INK,
    opacity: 0.7,
  },

  /* ===== tags ===== */
  tagRow: {
    padding: 6,
    gap: 14,
    alignItems: "center",
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    alignItems: "center",
    minHeight: 42,
  },
  tagActive: { backgroundColor: "#EAF6EE" },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    color: INK,
    fontSize: 14,
  },
  tagTextActive: { color: "#0B3D1A" },

  loader: { marginTop: 16 },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Inter_400Regular",
    color: INK,
    opacity: 0.7,
  },

  /* ===== Recipe Card ===== */
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
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  addButtonSelected: {
    backgroundColor: "rgba(31,122,58,0.3)",
  },
  heartButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#F2508B",
  },
  heartButtonSelected: {
    backgroundColor: "rgba(242,80,139,0.3)",
  },
  
});
