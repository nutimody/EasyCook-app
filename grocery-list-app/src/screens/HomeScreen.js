import React, { useState } from "react";
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
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { fetchRecipesByCuisine } from "../api/spoonacular";
import logo from "../../assets/easycook-logo.png";


const CUISINES = [
  { key: "indian", label: "Indian", emoji: "🇮🇳" },
  { key: "italian", label: "Italian", emoji: "🇮🇹" },
  { key: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { key: "thai", label: "Thai", emoji: "🇹🇭" },
  { key: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { key: "japanese", label: "Japanese", emoji: "🇯🇵" },
];

export default function HomeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState(null);

  // NEW: whether we’re showing the initial tile grid or the recipe list
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

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

  const TopBar = (
    <View style={styles.topBar}>
      {/* Left: logo */}
      <TouchableOpacity activeOpacity={0.7} style={styles.iconCircle}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </TouchableOpacity>

      {/* Center: location (static for now) */}
      <Text style={styles.locationText}>Santa Clara, CA</Text>

      {/* Right: menu */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.iconCircle}
        onPress={() => navigation.openDrawer()}
      >
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>
    </View>
  );

  // =========================
  // MODE 1: CUISINE TILE GRID
  // =========================
  if (viewMode === "grid") {
    return (
      <SafeAreaView style={styles.safe}>
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
              {TopBar}
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
      <FlatList
        key="recipe-list"
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            {TopBar}

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
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("RecipeDetail", {
                recipeId: item.id,
              })
            }
          >
            <View style={styles.recipeCard}>
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
                  Subtitle
                </Text>

                <View style={styles.metaBlock}>
                  <Text style={styles.metaText}>Cook time:</Text>
                  <Text style={styles.metaText}>Calories:</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
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

  /* ===== Top Bar ===== */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: { width: 60, height: 60 },
  locationText: {
    fontFamily: "Inter_600SemiBold",
    color: INK,
    fontSize: 14,
  },
  menuIcon: { gap: 4 },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: INK,
  },

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
    borderRadius: 999,
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
    borderRadius: 0,
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
});