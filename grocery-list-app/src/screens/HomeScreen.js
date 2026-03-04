import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Platform } from "react-native";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { fetchRecipesByCuisine } from "../api/spoonacular";
import logo from "../../assets/easycook-logo.png";

// console.log("fetchRecipesByCuisine is:", fetchRecipesByCuisine);

export default function HomeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState (false);
  const [activeCuisine, setActiveCuisine] = useState(null);

  const [fontsLoaded] = useFonts({
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
  Inter_400Regular,
  Inter_600SemiBold,
});

if (!fontsLoaded) return null;


  const loadRecipes = async (cuisine) => {
    try {
      setActiveCuisine (cuisine);
      setLoading (true);
      const data = await fetchRecipesByCuisine (cuisine, 10);
      setRecipes(data.results || []);
    } catch (err) {
      console.log ("Error fetching recipes:", err.message);
    } finally {
      setLoading (false);
    }
  };

  return (
  <SafeAreaView style={styles.safe}>
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={
        <>
          {/* ===== Top Bar ===== */}
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.7} style={styles.iconCircle}>
              <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            </TouchableOpacity>

            {/* ===== currently this is static text. I aim to change this to user's current location ===== */}

            <Text style={styles.locationText}>Santa Clara, CA</Text>

            <TouchableOpacity activeOpacity={0.7} style={styles.iconCircle}>
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ===== Title ===== */}
          <Text style={styles.header}>Choose a Cuisine</Text>

          {/* ===== tags ===== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagRow}
            style={styles.tagScroll}
          >
            <CuisineTag
              label="Indian"
              active={activeCuisine === "indian"}
              onPress={() => loadRecipes("indian")}
            />
            <CuisineTag
              label="Italian"
              active={activeCuisine === "italian"}
              onPress={() => loadRecipes("italian")}
            />
            <CuisineTag
              label="Mexican"
              active={activeCuisine === "mexican"}
              onPress={() => loadRecipes("mexican")}
            />
            <CuisineTag
              label="Thai"
              active={activeCuisine === "thai"}
              onPress={() => loadRecipes("thai")}
            />
            <CuisineTag
              label="Chinese"
              active={activeCuisine === "chinese"}
              onPress={() => loadRecipes("chinese")}
            />
            <CuisineTag
              label="Japanese"
              active={activeCuisine === "japanese"}
              onPress={() => loadRecipes("japanese")}
            />
          </ScrollView>

          {loading && <ActivityIndicator size="large" style={styles.loader} />}
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
        activeOpacity={0.85}
        onPress = {() =>
            navigation.navigate("RecipeDetail", {
                recipeId: item.id,
            })
        }
        >
        <View style={styles.recipeCard}>
          {/* <View style={styles.accentStripe} /> */}

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
    />
  </SafeAreaView>
);
}

function CuisineTag({ label, active, onPress}) {
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

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await fetchRecipesByCuisine("italian", 5);
//         console.log("Recipes:", data.results?.map(r => r.title));
//       } catch (e) {
//         console.log("API error:", e.message);
//       }
//     })();
//   }, []);

//   return (
//     <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Check console for Spoonacular results</Text>
//     </SafeAreaView>
//   );
// }

const GREEN = "#1F7A3A";
const INK = "#111827";
const styles = StyleSheet.create({
  safe:{
    flex:1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingTop: 8,
    // paddingBottom: 10,
    padding: 10,
  },
  iconCircle: {
    width: 52,
    height:52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  locationText: {
    fontFamily: "Inter_600SemiBold",
    color: INK,
    fontSize: 14,
  },

  menuIcon: { 
    gap: 4 
  },
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
    marginBottom: 14,
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
  tagActive: {
    backgroundColor: "#EAF6EE",
  },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    color: INK,
    fontSize: 14,
  },
  tagTextActive: {
    color: "#0B3D1A",
  },

  /* ===== Loader ===== */
  loader: {
    marginTop: 16,
  },

  /* ===== List ===== */
  listContainer: {
    padding: 14,
    gap: 14,
  },

  /* ===== Recipe Card ===== */
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }),
  },
  accentStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: GREEN,
  },

  thumbWrap: {
    marginLeft: 6, // creates breathing room from stripe
    marginRight: 14,
  },
  thumbPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: GREEN,
  },
  thumbImage: {
    width: 86,
    height: 86,
    borderRadius: 14,
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
