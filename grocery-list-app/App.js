import "react-native-gesture-handler";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import {
  classifyRecipeMeal,
  MEAL_SECTIONS,
} from "./src/utils/mealSections";

export default function App() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  const handleAddRecipe = (recipe) => {
    setMyRecipes((prev) => {
      const alreadyAdded = prev.some((item) => item.id === recipe.id);
      if (alreadyAdded) return prev;
      return [
        ...prev,
        {
          ...recipe,
          mealSection: MEAL_SECTIONS.includes(recipe?.mealSection)
            ? recipe.mealSection
            : classifyRecipeMeal(recipe),
        },
      ];
    });
  };

  const handleMoveRecipeToMeal = (recipeId, mealSection) => {
    if (!MEAL_SECTIONS.includes(mealSection)) {
      return;
    }

    setMyRecipes((prev) =>
      prev.map((item) =>
        item.id === recipeId ? { ...item, mealSection } : item
      )
    );
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
      <DrawerNavigator
        myRecipes={myRecipes}
        favoriteRecipes={favoriteRecipes}
        onAddRecipe={handleAddRecipe}
        onMoveRecipeToMeal={handleMoveRecipeToMeal}
        onRemoveRecipe={handleRemoveRecipe}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </NavigationContainer>
  );
}
