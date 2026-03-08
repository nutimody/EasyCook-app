import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/*
  EXPECTED INPUT:
  Pass selected recipes into this screen through navigation, like:
  navigation.navigate("GroceryList", { selectedRecipes: myRecipes })

  Each recipe is expected to contain:
  recipe.extendedIngredients = [
    {
      id,
      name,
      originalName,
      amount,
      unit
    }
  ]
*/

const INGREDIENT_ALIASES = {
  onions: "onion",
  "red onion": "onion",
  "yellow onion": "onion",
  "white onion": "onion",
  tomatoes: "tomato",
  potatoes: "potato",
  lemons: "lemon",
  limes: "lime",
  garlics: "garlic",
  scallions: "green onion",
  "spring onions": "green onion",
  "cilantro leaves": "cilantro",
  "coriander leaves": "cilantro",
};

const PRODUCE_COUNT_RULES = {
  onion: { label: "onions" },
  tomato: { label: "tomatoes" },
  potato: { label: "potatoes" },
  lemon: { label: "lemons" },
  lime: { label: "limes" },
  carrot: { label: "carrots" },
  cucumber: { label: "cucumbers" },
  "bell pepper": { label: "bell peppers" },
  apple: { label: "apples" },
  banana: { label: "bananas" },
};

const BUNCH_RULES = {
  cilantro: { label: "bunches of cilantro" },
  parsley: { label: "bunches of parsley" },
  mint: { label: "bunches of mint" },
  spinach: { label: "bags of spinach" },
  lettuce: { label: "heads of lettuce" },
};

const BULB_RULES = {
  garlic: { label: "garlic bulbs", clovesPerBulb: 8 },
};

const BOTTLE_RULES = {
  "olive oil": { label: "bottle of olive oil" },
  "soy sauce": { label: "bottle of soy sauce" },
  vinegar: { label: "bottle of vinegar" },
  "sesame oil": { label: "bottle of sesame oil" },
};

const PACKAGE_RULES = {
  rice: { label: "bag of rice", sizes: [500, 1000, 2000], unit: "g" },
  pasta: { label: "pack of pasta", sizes: [500, 1000], unit: "g" },
  flour: { label: "bag of flour", sizes: [500, 1000, 2000], unit: "g" },
  sugar: { label: "bag of sugar", sizes: [500, 1000, 2000], unit: "g" },
  "brown sugar": { label: "bag of brown sugar", sizes: [500, 1000], unit: "g" },
  lentils: { label: "bag of lentils", sizes: [500, 1000], unit: "g" },
  chickpeas: { label: "bag of chickpeas", sizes: [500, 1000], unit: "g" },
};

function normalizeName(name = "") {
  const cleaned = name.toLowerCase().trim();
  return INGREDIENT_ALIASES[cleaned] || cleaned;
}

function normalizeUnit(amount = 0, unit = "") {
  const u = unit.toLowerCase().trim();

  if (u === "tsp" || u === "teaspoon" || u === "teaspoons") {
    return { amount: amount / 3, unit: "tbsp" };
  }

  if (u === "cup" || u === "cups") {
    return { amount: amount * 240, unit: "ml" };
  }

  if (u === "kg" || u === "kilogram" || u === "kilograms") {
    return { amount: amount * 1000, unit: "g" };
  }

  if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") {
    return { amount: amount * 454, unit: "g" };
  }

  if (u === "oz" || u === "ounce" || u === "ounces") {
    return { amount: amount * 28.35, unit: "g" };
  }

  if (u === "tablespoon" || u === "tablespoons") {
    return { amount, unit: "tbsp" };
  }

  if (u === "gram" || u === "grams") {
    return { amount, unit: "g" };
  }

  if (u === "milliliter" || u === "milliliters") {
    return { amount, unit: "ml" };
  }

  return { amount, unit: u };
}

function guessCategory(name) {
  if (PRODUCE_COUNT_RULES[name] || BUNCH_RULES[name] || BULB_RULES[name]) {
    return "Produce";
  }

  if (BOTTLE_RULES[name] || PACKAGE_RULES[name]) {
    return "Pantry";
  }

  return "Other";
}

function roundUpToPackage(totalAmount, sizes) {
  for (const size of sizes) {
    if (totalAmount <= size) {
      return { packages: 1, size };
    }
  }

  const largest = sizes[sizes.length - 1];
  return {
    packages: Math.ceil(totalAmount / largest),
    size: largest,
  };
}

function combineIngredients(allIngredients) {
  const map = {};

  for (const ing of allIngredients) {
    const rawName =
      ing.name || ing.originalName || ing.original || "unknown ingredient";

    const name = normalizeName(rawName);
    const { amount, unit } = normalizeUnit(Number(ing.amount || 0), ing.unit || "");

    const key = `${name}__${unit}`;

    if (!map[key]) {
      map[key] = {
        name,
        amount: 0,
        unit,
      };
    }

    map[key].amount += amount;
  }

  return Object.values(map);
}

function toPurchaseItem(item) {
  const { name, amount, unit } = item;
  const category = guessCategory(name);

  if (PRODUCE_COUNT_RULES[name]) {
    const qty = Math.max(1, Math.ceil(amount));
    return {
      id: `${name}-produce`,
      name,
      label: `${qty} ${PRODUCE_COUNT_RULES[name].label}`,
      checked: false,
      category,
    };
  }

  if (BUNCH_RULES[name]) {
    return {
      id: `${name}-bunch`,
      name,
      label: `1 ${BUNCH_RULES[name].label}`,
      checked: false,
      category,
    };
  }

  if (BULB_RULES[name]) {
    const clovesPerBulb = BULB_RULES[name].clovesPerBulb || 8;
    const bulbs = Math.max(1, Math.ceil(amount / clovesPerBulb));
    return {
      id: `${name}-bulb`,
      name,
      label: `${bulbs} ${bulbs === 1 ? "garlic bulb" : "garlic bulbs"}`,
      checked: false,
      category,
    };
  }

  if (BOTTLE_RULES[name]) {
    return {
      id: `${name}-bottle`,
      name,
      label: `1 ${BOTTLE_RULES[name].label}`,
      checked: false,
      category,
    };
  }

  if (PACKAGE_RULES[name]) {
    const rule = PACKAGE_RULES[name];
    const totalAmount = unit === rule.unit ? amount : amount;
    const { packages, size } = roundUpToPackage(totalAmount, rule.sizes);

    return {
      id: `${name}-package`,
      name,
      label:
        packages === 1
          ? `1 ${rule.label} (${size}${rule.unit})`
          : `${packages} ${rule.label}s (${size}${rule.unit} each)`,
      checked: false,
      category,
    };
  }

  // fallback for items without a custom retail rule
  let fallbackAmount = amount;
  let fallbackUnit = unit;

  if (!fallbackUnit) {
    fallbackAmount = Math.max(1, Math.ceil(amount));
    fallbackUnit = "x";
  } else if (fallbackUnit === "tbsp" || fallbackUnit === "ml" || fallbackUnit === "g") {
    fallbackAmount = Math.ceil(amount);
  } else {
    fallbackAmount = Math.ceil(amount);
  }

  return {
    id: `${name}-${unit || "unit"}`,
    name,
    label:
      fallbackUnit === "x"
        ? `${fallbackAmount} ${name}`
        : `${fallbackAmount} ${fallbackUnit} ${name}`,
    checked: false,
    category,
  };
}

function buildGroceryList(selectedRecipes = []) {
  const allIngredients = selectedRecipes.flatMap(
    (recipe) => recipe.extendedIngredients || []
  );

  const combined = combineIngredients(allIngredients);
  return combined.map(toPurchaseItem);
}

export default function GroceryListScreen({ route }) {
  const selectedRecipes = route?.params?.selectedRecipes || [];

  const initialList = useMemo(() => buildGroceryList(selectedRecipes), [selectedRecipes]);
  const [groceryList, setGroceryList] = useState(initialList);

  function toggleChecked(id) {
    setGroceryList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  const uncheckedItems = groceryList.filter((item) => !item.checked);
  const checkedItems = groceryList.filter((item) => item.checked);

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => toggleChecked(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          <Text style={styles.checkboxText}>{item.checked ? "✓" : ""}</Text>
        </View>

        <View style={styles.itemTextWrap}>
          <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
            {item.label}
          </Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Grocery List</Text>
        <Text style={styles.subtitle}>
          Built from your selected recipes
        </Text>

        {groceryList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No grocery items yet.</Text>
            <Text style={styles.emptySubtext}>
              Add some recipes first, then generate your list.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...uncheckedItems, ...checkedItems]}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>
                  {uncheckedItems.length} remaining • {checkedItems.length} checked
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F6F2",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 30,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#111827",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  itemTextWrap: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  emptyWrap: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 280,
  },
});
