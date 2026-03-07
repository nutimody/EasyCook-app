import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyRecipesScreen({ navigation, myRecipes }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>My Recipes</Text>

        {myRecipes.length === 0 ? (
          <Text style={styles.message}>No recipes added yet.</Text>
        ) : (
          <FlatList
            data={myRecipes}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("HomeRoot", {
                    screen: "RecipeDetail",
                    params: { recipeId: item.id },
                  })
                }
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} />
                ) : null}
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#374151",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 14,
  },
});