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
import SettingsScreen from "./src/screens/SettingsScreen";
import GroceryListScreen from "./src/screens/GroceryListScreen";
import NearbyStoresScreen from "./src/screens/NearbyStoresScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack({
  onAddRecipe,
  onRemoveRecipe,
  onAddFavorite,
  onRemoveFavorite,
  myRecipes,
  favoriteRecipes,
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {(props) => (
          <HomeScreen
            {...props}
            onAddRecipe={onAddRecipe}
            onRemoveRecipe={onRemoveRecipe}
            onAddFavorite={onAddFavorite}
            onRemoveFavorite={onRemoveFavorite}
            myRecipes={myRecipes}
            favoriteRecipes={favoriteRecipes}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="RecipeDetail"
        options={{ headerShown: false }}
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

  const handleRemoveRecipe = (recipeId) => {
    setMyRecipes((prev) => prev.filter((item) => item.id !== recipeId));
  };

  const handleRemoveFavorite = (recipeId) => {
    setFavoriteRecipes((prev) => prev.filter((item) => item.id !== recipeId));
  };

  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{ headerShown: false, drawerPosition: "right" }}
      >
        <Drawer.Screen name="HomeRoot" options={{ title: "Home" }}>
          {(props) => (
            <HomeStack
              {...props}
              onAddRecipe={handleAddRecipe}
              onRemoveRecipe={handleRemoveRecipe}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              myRecipes={myRecipes}
              favoriteRecipes={favoriteRecipes}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="My Recipes">
          {(props) => (
            <MyRecipesScreen
              {...props}
              myRecipes={myRecipes}
              onRemoveRecipe={handleRemoveRecipe}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Favorites">
          {(props) => (
            <FavoritesScreen
              {...props}
              favoriteRecipes={favoriteRecipes}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="GroceryList" options={{ title: "Grocery List" }}>
         {(props) => (
           <GroceryListScreen
            {...props}
             myRecipes={myRecipes}
           />
          )}
        </Drawer.Screen>

        <Drawer.Screen
          name="NearbyStores"
          component={NearbyStoresScreen}
          options={{ title: "Nearby Stores" }}
        />

        <Drawer.Screen name="Preferences" component={PreferencesScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
