import "react-native-gesture-handler";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import MyRecipesScreen from "./src/screens/MyRecipesScreen";

import PreferencesScreen from "./src/screens/PreferencesScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import CartScreen from "./src/screens/CartScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack({ onAddRecipe, onAddFavorite }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: "#111827",
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecipeDetail"
        options={{
          title: "Recipe",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      >
        {(props) => (
          <RecipeDetailScreen
            {...props}
            onAddRecipe={onAddRecipe}
            onAddFavorite={onAddFavorite}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  const handleAddRecipe = (recipe) => {
    setMyRecipes((prev) => {
      const alreadyAdded = prev.some((item) => item.id === recipe.id);
      if (alreadyAdded) return prev;
      return [...prev, recipe];
    });
  };

  const handleAddFavorite = (recipe) => {
    setFavoriteRecipes((prev) => {
      const alreadyAdded = prev.some((item) => item.id === recipe.id);
      if (alreadyAdded) return prev;
      return [...prev, recipe];
    });
  };

  return (
    <NavigationContainer>
      <Drawer.Navigator screenOptions={{ headerShown: false }}>
        <Drawer.Screen name="HomeRoot" options={{ title: "Home" }}>
          {(props) => (
            <HomeStack
              {...props}
              onAddRecipe={handleAddRecipe}
              onAddFavorite={handleAddFavorite}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="My Recipes">
          {(props) => <MyRecipesScreen {...props} myRecipes={myRecipes} />}
        </Drawer.Screen>

        <Drawer.Screen name="Favorites">
          {(props) => (
            <FavoritesScreen
              {...props}
              favoriteRecipes={favoriteRecipes}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Preferences" component={PreferencesScreen} />
        <Drawer.Screen name="My Cart" component={CartScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}