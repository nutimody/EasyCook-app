export const MEAL_SECTIONS = ["Breakfast", "Lunch", "Dinner"];

export function classifyRecipeMeal(recipe = {}) {
  const dishTypes = Array.isArray(recipe?.dishTypes)
    ? recipe.dishTypes.map((type) => String(type).toLowerCase())
    : [];
  const title = String(recipe?.title || "").toLowerCase();

  if (
    dishTypes.includes("breakfast") ||
    /breakfast|pancake|waffle|omelet|omelette|granola|oatmeal/.test(title)
  ) {
    return "Breakfast";
  }

  if (
    dishTypes.includes("lunch") ||
    /lunch|sandwich|wrap|salad|burger|bowl/.test(title)
  ) {
    return "Lunch";
  }

  if (
    dishTypes.includes("dinner") ||
    /dinner|pasta|curry|stew|roast|taco|stir fry|stir-fry/.test(title)
  ) {
    return "Dinner";
  }

  return "Dinner";
}

export function getRecipeMealSection(recipe = {}) {
  return recipe?.mealSection || classifyRecipeMeal(recipe);
}
