import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { fetchRecipesByCuisine } from "./src/api/spoonacular";

import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen}
          // options={{ title: "Recipe" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}