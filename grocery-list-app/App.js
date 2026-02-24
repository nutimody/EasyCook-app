// import { useEffect } from "react";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, FlatList,Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useFonts,PlayfairDisplay_400Regular, PlayfairDisplay_700Bold} from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { fetchRecipesByCuisine } from "./src/api/spoonacular";

// console.log("fetchRecipesByCuisine is:", fetchRecipesByCuisine);

export default function App() {
  const [recipes, setRecipes] = useState ([]);
  const [loading, setLoading] = useState (false);
  const [fontsLoaded] = useFonts({
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
  Inter_400Regular,
  Inter_600SemiBold,
});

if (!fontsLoaded) return null;


  const loadRecipes = async (cuisine) => {
    try {
      setLoading (true);
      const data = await fetchRecipesByCuisine (cuisine, 10);
      setRecipes(data.results);
    } catch (err) {
      console.log ("Error fetching recipes:", err.message);
    } finally {
      setLoading (false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}> 
        Choose a Cuisine 
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
        style={styles.button}
        onPress={() => loadRecipes("indian")}
        >
          <Text
          style={styles.buttonText}>
            Indian
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.button}
        onPress={() => loadRecipes("italian")}
        >
          <Text
          style={styles.buttonText}>
            Italian
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.button}
        onPress={() => loadRecipes("mexican")}
        >
          <Text
          style={styles.buttonText}>
            Mexican
          </Text>
        </TouchableOpacity>
        {/* <Button title="Italian" onPress={() => loadRecipes("italian")}/>
        <Button title="Mexican" onPress={() => loadRecipes("mexican")}/> */}
      </View>

      {loading && <ActivityIndicator size="large" style={styles.loader}/>}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Image source={{uri: item.image}} style={styles.image}/>
            <Text style={styles.body}> {item.title} </Text>
          </View>
        )
        }
      />
      </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E5E8B6",
  },
  header: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    // fontWeight: "bold",
    marginBottom: 16,
    color: "#004002",
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 8,
    textAlign: "Left",
  },
  button: {
  backgroundColor: "#004002",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
},
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    color: "white",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    textColor: "#004002",
  //   // fontFamily: "Inter_600SemiBold",
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  // title: {
  //   fontSize: 18,
  //   marginTop: 8,
  //   marginBottom: 12,
  //   marginLeft: 8,
  //   textAlign: "Left",
  // },
});
