import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "../screens/HomeScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import MyRecipesScreen from "../screens/MyRecipesScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import GroceryListScreen from "../screens/GroceryListScreen";
import NearbyStoresScreen from "../screens/NearbyStoresScreen";

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
      <Stack.Screen name="RecipeDetail" options={{ headerShown: false }}>
        {(props) => (
          <RecipeDetailScreen
            {...props}
            onAddRecipe={onAddRecipe}
            onAddFavorite={onAddFavorite}
            myRecipes={myRecipes}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function DrawerNavigator({
  myRecipes,
  favoriteRecipes,
  onAddRecipe,
  onMoveRecipeToMeal,
  onRemoveRecipe,
  onAddFavorite,
  onRemoveFavorite,
}) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerStyle: {
          backgroundColor: "#FFFFFF",
        },
        drawerActiveBackgroundColor: "#FFF1BE",
        drawerActiveTintColor: "#111827",
        drawerInactiveTintColor: "#374151",
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 10,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "700",
        },
      }}
    >
      <Drawer.Screen
        name="HomeRoot"
        options={{ title: "Home" }}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.navigate("HomeRoot", {
              screen: "Home",
              params: { resetToGrid: true },
            });
          },
        })}
      >
        {(props) => (
          <HomeStack
            {...props}
            onAddRecipe={onAddRecipe}
            onRemoveRecipe={onRemoveRecipe}
            onAddFavorite={onAddFavorite}
            onRemoveFavorite={onRemoveFavorite}
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
            onMoveRecipeToMeal={onMoveRecipeToMeal}
            onRemoveRecipe={onRemoveRecipe}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Favorites">
        {(props) => (
          <FavoritesScreen
            {...props}
            myRecipes={myRecipes}
            favoriteRecipes={favoriteRecipes}
            onAddRecipe={onAddRecipe}
            onAddFavorite={onAddFavorite}
            onRemoveFavorite={onRemoveFavorite}
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
  );
}
