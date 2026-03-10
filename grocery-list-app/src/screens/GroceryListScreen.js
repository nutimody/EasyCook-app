import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import * as Location from "expo-location";
import { fetchNearbyGroceryStores } from "../api/googlePlaces";
import { fetchRecipeDetails } from "../api/spoonacular";

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
  rice: { label: "bag of rice", sizes: [16, 32, 64], unit: "oz" },
  pasta: { label: "pack of pasta", sizes: [16, 32], unit: "oz" },
  flour: { label: "bag of flour", sizes: [16, 32, 64], unit: "oz" },
  sugar: { label: "bag of sugar", sizes: [16, 32, 64], unit: "oz" },
  "brown sugar": { label: "bag of brown sugar", sizes: [16, 32], unit: "oz" },
  lentils: { label: "bag of lentils", sizes: [16, 32], unit: "oz" },
  chickpeas: { label: "bag of chickpeas", sizes: [16, 32], unit: "oz" },
};

function normalizeName(name = "") {
  const cleaned = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .split(",")[0]
    .replace(/\b(chopped|diced|minced|sliced|fresh|large|medium|small|extra-virgin)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return INGREDIENT_ALIASES[cleaned] || cleaned;
}

function normalizeUnit(amount = 0, unit = "") {
  const u = unit.toLowerCase().trim();

  if (u === "tsp" || u === "teaspoon" || u === "teaspoons") {
    return { amount, unit: "tsp" };
  }

  if (u === "tablespoon" || u === "tablespoons" || u === "tbsp") {
    return { amount, unit: "tbsp" };
  }

  if (u === "cup" || u === "cups") {
    return { amount, unit: "cup" };
  }

  if (u === "ml" || u === "milliliter" || u === "milliliters") {
    return { amount: amount / 4.92892, unit: "tsp" };
  }

  if (u === "l" || u === "liter" || u === "liters") {
    return { amount: amount * 202.884, unit: "tsp" };
  }

  if (u === "kg" || u === "kilogram" || u === "kilograms") {
    return { amount: amount * 35.274, unit: "oz" };
  }

  if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") {
    return { amount: amount * 16, unit: "oz" };
  }

  if (u === "oz" || u === "ounce" || u === "ounces") {
    return { amount, unit: "oz" };
  }

  if (u === "gram" || u === "grams") {
    return { amount: amount / 28.35, unit: "oz" };
  }

  return { amount, unit: u };
}

function roundToQuarter(value) {
  return Math.round(value * 4) / 4;
}

function formatAmountValue(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value);
}

function formatImperialAmount(amount, unit) {
  if (!unit || unit === "x") {
    return formatAmountValue(Math.max(1, Math.ceil(amount)));
  }

  if (unit === "oz") {
    if (amount >= 16) {
      const pounds = roundToQuarter(amount / 16);
      return `${formatAmountValue(pounds)} lb`;
    }
    const ounces = Math.max(1, roundToQuarter(amount));
    return `${formatAmountValue(ounces)} oz`;
  }

  if (unit === "cup") {
    if (amount < 1) {
      const tbsp = Math.max(1, roundToQuarter(amount * 16));
      return `${formatAmountValue(tbsp)} tbsp`;
    }
    const cups = roundToQuarter(amount);
    return `${formatAmountValue(cups)} cup`;
  }

  if (unit === "tbsp") {
    if (amount >= 16) {
      const cups = roundToQuarter(amount / 16);
      return `${formatAmountValue(cups)} cup`;
    }
    if (amount < 1) {
      const tsp = Math.max(1, Math.round(amount * 3));
      return `${formatAmountValue(tsp)} tsp`;
    }
    const tbsp = roundToQuarter(amount);
    return `${formatAmountValue(tbsp)} tbsp`;
  }

  if (unit === "tsp") {
    if (amount >= 3) {
      const tbsp = roundToQuarter(amount / 3);
      return `${formatAmountValue(tbsp)} tbsp`;
    }
    const tsp = Math.max(1, roundToQuarter(amount));
    return `${formatAmountValue(tsp)} tsp`;
  }

  const value = Math.max(1, roundToQuarter(amount));
  return `${formatAmountValue(value)} ${unit}`;
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
    const aisle = ing.aisle?.trim() || "";

    const key = `${name}__${unit}`;

    if (!map[key]) {
      map[key] = {
        name,
        amount: 0,
        unit,
        aisle,
      };
    }

    map[key].amount += amount;

    if (!map[key].aisle && aisle) {
      map[key].aisle = aisle;
    }
  }

  return Object.values(map);
}

function toPurchaseItem(item) {
  const { name, amount, unit, aisle } = item;
  const category = guessCategory(name);
  const subtitle = aisle || category;

  if (PRODUCE_COUNT_RULES[name]) {
    const qty = Math.max(1, Math.ceil(amount));
    const amountText = `${qty}`;

    return {
      id: `${name}-produce-${qty}`,
      name,
      amountText,
      checked: false,
      category,
      subtitle,
    };
  }

  if (BUNCH_RULES[name]) {
    const amountText = "1 bunch";

    return {
      id: `${name}-bunch-1`,
      name,
      amountText,
      checked: false,
      category,
      subtitle,
    };
  }

  if (BULB_RULES[name]) {
    const clovesPerBulb = BULB_RULES[name].clovesPerBulb || 8;
    const bulbs = Math.max(1, Math.ceil(amount / clovesPerBulb));
    const amountText = `${bulbs} ${bulbs === 1 ? "bulb" : "bulbs"}`;

    return {
      id: `${name}-bulb-${bulbs}`,
      name,
      amountText,
      checked: false,
      category,
      subtitle,
    };
  }

  if (BOTTLE_RULES[name]) {
    const amountText = "1 bottle";

    return {
      id: `${name}-bottle-1`,
      name,
      amountText,
      checked: false,
      category,
      subtitle,
    };
  }

  if (PACKAGE_RULES[name]) {
    const rule = PACKAGE_RULES[name];
    const totalAmount = unit === rule.unit ? amount : amount;
    const { packages, size } = roundUpToPackage(totalAmount, rule.sizes);
    const packageSizeText = formatImperialAmount(size, rule.unit);

    const amountText =
      packages === 1
        ? `1 x ${packageSizeText}`
        : `${packages} x ${packageSizeText}`;

    return {
      id: `${name}-package-${packages}-${size}${rule.unit}`,
      name,
      amountText,
      checked: false,
      category,
      subtitle,
    };
  }

  let fallbackAmount = amount;
  let fallbackUnit = unit;

  if (!fallbackUnit) {
    fallbackAmount = Math.max(1, Math.ceil(amount));
    fallbackUnit = "x";
  }

  const amountText = formatImperialAmount(fallbackAmount, fallbackUnit);

  return {
    id: `${name}-${fallbackUnit}-${fallbackAmount}`,
    name,
    amountText,
    checked: false,
    category,
    subtitle,
  };
}

function buildGroceryList(selectedRecipes = []) {
  const uniqueRecipes = Array.from(
    new Map(
      selectedRecipes
        .filter(Boolean)
        .map((recipe) => [recipe.id ?? JSON.stringify(recipe), recipe])
    ).values()
  );

  const allIngredients = uniqueRecipes.flatMap(
    (recipe) => recipe.extendedIngredients || []
  );

  const combined = combineIngredients(allIngredients);
  return combined.map(toPurchaseItem);
}

const CHECK_MOVE_DELAY_MS = 500;

export default function GroceryListScreen({ route, navigation, myRecipes = [] }) {
  const routeRecipes = route?.params?.selectedRecipes;
  const sourceRecipes = Array.isArray(routeRecipes) ? routeRecipes : myRecipes;
  const [groceryList, setGroceryList] = useState(() => buildGroceryList(sourceRecipes));
  const [pendingCheckIds, setPendingCheckIds] = useState(() => new Set());
  const [loadingNearbyStores, setLoadingNearbyStores] = useState(false);
  const [isPreparingList, setIsPreparingList] = useState(false);
  const pendingTimeoutsRef = useRef(new Map());

  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function hydrateGroceryList() {
      if (!Array.isArray(sourceRecipes) || sourceRecipes.length === 0) {
        setGroceryList([]);
        return;
      }

      try {
        setIsPreparingList(true);

        const detailedRecipes = await Promise.all(
          sourceRecipes.map(async (recipe) => {
            if (
              Array.isArray(recipe?.extendedIngredients) &&
              recipe.extendedIngredients.length > 0
            ) {
              return recipe;
            }

            try {
              return await fetchRecipeDetails(recipe.id);
            } catch {
              return recipe;
            }
          })
        );

        if (!isCancelled) {
          setGroceryList(buildGroceryList(detailedRecipes));
        }
      } finally {
        if (!isCancelled) {
          setIsPreparingList(false);
        }
      }
    }

    hydrateGroceryList();

    return () => {
      isCancelled = true;
    };
  }, [sourceRecipes]);

  function toggleChecked(id) {
    const tappedItem = groceryList.find((item) => item.id === id);
    if (!tappedItem) {
      return;
    }

    const existingTimeout = pendingTimeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      pendingTimeoutsRef.current.delete(id);
      setPendingCheckIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    if (tappedItem.checked) {
      setGroceryList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: false } : item
        )
      );
      return;
    }

    setPendingCheckIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const timeoutId = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);

      setPendingCheckIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setGroceryList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: true } : item
        )
      );
    }, CHECK_MOVE_DELAY_MS);

    pendingTimeoutsRef.current.set(id, timeoutId);
  }

  const uncheckedItems = groceryList.filter((item) => !item.checked);
  const checkedItems = groceryList.filter((item) => item.checked);

  async function handleNearbyStoresPress() {
    try {
      setLoadingNearbyStores(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Please allow location access to find nearby grocery stores."
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const stores = await fetchNearbyGroceryStores(coords.latitude, coords.longitude);
      navigation.navigate("NearbyStores", {
        stores,
        userLocation: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
    } catch (error) {
      Alert.alert(
        "Store Lookup Failed",
        "Could not open nearby stores right now. Please try again."
      );
      console.log("Nearby stores error:", error?.message || error);
    } finally {
      setLoadingNearbyStores(false);
    }
  }

  function renderItem({ item }) {
    const isPendingCheck = pendingCheckIds.has(item.id);
    const isVisuallyChecked = item.checked || isPendingCheck;

    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => toggleChecked(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isVisuallyChecked && styles.checkboxChecked]}>
          <Text style={styles.checkboxText}>{isVisuallyChecked ? "✓" : ""}</Text>
        </View>

        <View style={styles.itemTextWrap}>
          <Text style={[styles.itemText, isVisuallyChecked && styles.itemTextChecked]}>
            {item.name}
          </Text>
          <Text
            style={[styles.itemSubtext, isVisuallyChecked && styles.itemSubtextChecked]}
          >
            {item.subtitle}
          </Text>
        </View>

        <Text style={[styles.itemAmount, isVisuallyChecked && styles.itemTextChecked]}>
          {item.amountText}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="Grocery List" />
      <View style={styles.container}>
        <Text style={styles.title}>Grocery List</Text>
        <Text style={styles.subtitle}>
          Built from your selected recipes
        </Text>

        {isPreparingList ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Generating grocery list...</Text>
            <Text style={styles.emptySubtext}>
              Pulling ingredients from your saved recipes.
            </Text>
          </View>
        ) : groceryList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No grocery items yet.</Text>
            <Text style={styles.emptySubtext}>
              Add some recipes first, then generate your list.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.scoreboard}>
              <View style={[styles.scoreTile, styles.scoreTileLeft]}>
                <Text style={styles.scoreCount}>{uncheckedItems.length}</Text>
                <Text style={styles.scoreLabel}>to buy</Text>
              </View>
              <View style={styles.scoreTile}>
                <Text style={styles.scoreCount}>{checkedItems.length}</Text>
                <Text style={styles.scoreLabel}>in pantry</Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.nearbyStoresButton,
                loadingNearbyStores && styles.nearbyStoresButtonDisabled,
              ]}
              onPress={handleNearbyStoresPress}
              disabled={loadingNearbyStores}
            >
              <Text style={styles.nearbyStoresButtonText}>
                {loadingNearbyStores ? "Finding Nearby Stores..." : "Nearby Stores"}
              </Text>
            </Pressable>

            <FlatList
              data={[...uncheckedItems, ...checkedItems]}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={styles.list}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF1BE",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: "PlayfairDisplay_700Bold",
    fontWeight: "normal",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
  },
  scoreboard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scoreTile: {
    flex: 1,
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  scoreTileLeft: {
    marginRight: 10,
  },
  scoreCount: {
    fontSize: 34,
    lineHeight: 36,
    color: "#000000",
    fontWeight: "800",
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    textTransform: "lowercase",
  },
  nearbyStoresButton: {
    backgroundColor: "#FFCC00",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  nearbyStoresButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  nearbyStoresButtonDisabled: {
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 30,
  },
  list: {
    flex: 1,
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
    fontWeight: "600",
  },
  itemSubtext: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  itemSubtextChecked: {
    color: "#9CA3AF",
  },
  itemAmount: {
    marginLeft: 12,
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
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
