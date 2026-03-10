import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import AppHeader from "../components/AppHeader";
import { fetchRecipeDetails } from "../api/spoonacular";
import {
  MEAL_SECTIONS,
  getRecipeMealSection,
} from "../utils/mealSections";

const GREEN = "#1F7A3A";
const INK = "#111827";
const LONG_PRESS_DELAY_MS = 180;
const MOVE_CANCEL_THRESHOLD_PX = 8;

function measureInWindowAsync(node) {
  return new Promise((resolve) => {
    if (!node || typeof node.measureInWindow !== "function") {
      resolve(null);
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      resolve({ x, y, width, height });
    });
  });
}

function extractTouchPoint(nativeEvent) {
  if (!nativeEvent) {
    return null;
  }

  return {
    pageX: nativeEvent.pageX,
    pageY: nativeEvent.pageY,
  };
}

function getSectionAtPoint(pointX, pointY, sectionBounds = {}) {
  return MEAL_SECTIONS.find((section) => {
    const bounds = sectionBounds[section];
    if (!bounds) return false;

    return (
      pointX >= bounds.x &&
      pointX <= bounds.x + bounds.width &&
      pointY >= bounds.y &&
      pointY <= bounds.y + bounds.height
    );
  });
}

export default function MyRecipesScreen({
  navigation,
  myRecipes = [],
  onMoveRecipeToMeal,
  onRemoveRecipe,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });
  const cardRefs = useRef({});
  const sectionRefs = useRef({});
  const dragPosition = useRef(new Animated.ValueXY()).current;
  const dragTouchOffsetRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef(null);
  const suppressNextPressRef = useRef(false);
  const longPressTimeoutRef = useRef(null);
  const dragSessionRef = useRef({
    draggingRecipeId: null,
    touchMoved: false,
  });

  if (!fontsLoaded) return null;

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const getCaloriesText = (recipe) => {
    const nutrients = recipe?.nutrition?.nutrients;
    if (!Array.isArray(nutrients)) return "N/A";

    const caloriesNutrient = nutrients.find(
      (n) => n?.name?.toLowerCase() === "calories"
    );
    if (!caloriesNutrient?.amount) return "N/A";

    return `${Math.round(caloriesNutrient.amount)} kcal`;
  };

  const recipesBySection = MEAL_SECTIONS.reduce((sections, section) => {
    sections[section] = myRecipes.filter(
      (recipe) => getRecipeMealSection(recipe) === section
    );
    return sections;
  }, {});

  const handleGenerateGroceryList = async () => {
    if (myRecipes.length === 0) {
      Alert.alert("No recipes", "Add recipes first to generate a grocery list.");
      return;
    }

    try {
      setIsGenerating(true);

      const selectedRecipes = await Promise.all(
        myRecipes.map(async (recipe) => {
          if (Array.isArray(recipe?.extendedIngredients) && recipe.extendedIngredients.length > 0) {
            return recipe;
          }

          try {
            return await fetchRecipeDetails(recipe.id);
          } catch {
            return recipe;
          }
        })
      );

      navigation.navigate("GroceryList", { selectedRecipes });
    } finally {
      setIsGenerating(false);
    }
  };

  const startDragging = async (item, sourceSection, touchPoint) => {
    const cardNode = cardRefs.current[item.id];
    const cardBounds = await measureInWindowAsync(cardNode);

    if (!cardBounds) {
      return;
    }

    const sectionBoundsEntries = await Promise.all(
      MEAL_SECTIONS.map(async (section) => {
        const bounds = await measureInWindowAsync(sectionRefs.current[section]);
        return [section, bounds];
      })
    );

    const sectionBounds = Object.fromEntries(sectionBoundsEntries);
    const touchX = touchPoint?.pageX ?? cardBounds.x + cardBounds.width / 2;
    const touchY = touchPoint?.pageY ?? cardBounds.y + cardBounds.height / 2;

    dragTouchOffsetRef.current = {
      x: touchX - cardBounds.x,
      y: touchY - cardBounds.y,
    };

    dragPosition.setValue({
      x: cardBounds.x,
      y: cardBounds.y,
    });

    const nextDragState = {
      recipe: item,
      sourceSection,
      targetSection: sourceSection,
      width: cardBounds.width,
      height: cardBounds.height,
      sectionBounds,
    };

    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  };

  const updateDragPosition = (event) => {
    const currentDragState = dragStateRef.current;

    if (!currentDragState || !event?.nativeEvent) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const nextX = pageX - dragTouchOffsetRef.current.x;
    const nextY = pageY - dragTouchOffsetRef.current.y;

    dragPosition.setValue({ x: nextX, y: nextY });

    const nextSection =
      getSectionAtPoint(pageX, pageY, currentDragState.sectionBounds) ||
      currentDragState.targetSection;

    if (nextSection !== currentDragState.targetSection) {
      const nextDragState = {
        ...currentDragState,
        targetSection: nextSection,
      };

      dragStateRef.current = nextDragState;
      setDragState(nextDragState);
    }
  };

  const finishDragging = (event) => {
    const currentDragState = dragStateRef.current;

    if (!currentDragState) {
      return;
    }

    suppressNextPressRef.current = true;

    const dropX = event?.nativeEvent?.pageX;
    const dropY = event?.nativeEvent?.pageY;
    const dropSection =
      typeof dropX === "number" && typeof dropY === "number"
        ? getSectionAtPoint(dropX, dropY, currentDragState.sectionBounds)
        : currentDragState.targetSection;

    const finalSection = dropSection || currentDragState.sourceSection;

    if (
      finalSection &&
      finalSection !== currentDragState.sourceSection &&
      typeof onMoveRecipeToMeal === "function"
    ) {
      onMoveRecipeToMeal(currentDragState.recipe.id, finalSection);
    }

    dragStateRef.current = null;
    setDragState(null);
  };

  const clearPendingLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleCardPress = (item) => {
    if (suppressNextPressRef.current) {
      suppressNextPressRef.current = false;
      return;
    }

    navigation.navigate("HomeRoot", {
      screen: "RecipeDetail",
      params: { recipeId: item.id },
    });
  };

  const buildCardPanResponder = (item, section) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        clearPendingLongPress();
        dragSessionRef.current = {
          draggingRecipeId: null,
          touchMoved: false,
        };
        const touchPoint = extractTouchPoint(event?.nativeEvent);

        longPressTimeoutRef.current = setTimeout(() => {
          dragSessionRef.current.draggingRecipeId = item.id;
          startDragging(item, section, touchPoint);
        }, LONG_PRESS_DELAY_MS);
      },
      onPanResponderMove: (event, gestureState) => {
        if (dragSessionRef.current.draggingRecipeId === item.id) {
          updateDragPosition(event);
          return;
        }

        if (
          Math.abs(gestureState.dx) > MOVE_CANCEL_THRESHOLD_PX ||
          Math.abs(gestureState.dy) > MOVE_CANCEL_THRESHOLD_PX
        ) {
          dragSessionRef.current.touchMoved = true;
          clearPendingLongPress();
        }
      },
      onPanResponderRelease: (event) => {
        const isDraggingThisCard = dragSessionRef.current.draggingRecipeId === item.id;
        const touchMoved = dragSessionRef.current.touchMoved;

        clearPendingLongPress();
        dragSessionRef.current = {
          draggingRecipeId: null,
          touchMoved: false,
        };

        if (isDraggingThisCard) {
          finishDragging(event);
          return;
        }

        if (!touchMoved) {
          handleCardPress(item);
        }
      },
      onPanResponderTerminate: (event) => {
        const isDraggingThisCard = dragSessionRef.current.draggingRecipeId === item.id;

        clearPendingLongPress();
        dragSessionRef.current = {
          draggingRecipeId: null,
          touchMoved: false,
        };

        if (isDraggingThisCard) {
          finishDragging(event);
        }
      },
    });

  const renderRecipeCard = (item, section) => {
    const isBeingDragged = dragState?.recipe?.id === item.id;
    const panResponder = buildCardPanResponder(item, section);

    return (
    <View
      ref={(node) => {
        cardRefs.current[item.id] = node;
      }}
      style={[styles.recipeCard, isBeingDragged && styles.recipeCardHidden]}
    >
      <View
        style={styles.cardMain}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumbWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.thumbImage} />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
        </View>

        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || "Title"}
          </Text>

          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.servings ? `${item.servings} servings` : "Recipe"}
          </Text>

          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>
              Cook time: {item.readyInMinutes ? `${item.readyInMinutes} min` : "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Calories: {getCaloriesText(item)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActionColumn}>
        <Pressable
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => onRemoveRecipe?.(item.id)}
        >
          <Ionicons name="remove" size={20} color="#DC2626" />
        </Pressable>
      </View>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader navigation={navigation} centerText="My Recipes" />
      <View style={styles.container}>
        <ScrollView
          scrollEnabled={!dragState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {myRecipes.length === 0 ? (
            <Text style={styles.message}>No recipes added yet.</Text>
          ) : null}

          {MEAL_SECTIONS.map((section) => {
            const sectionRecipes = recipesBySection[section];
            const isDropTarget = dragState?.targetSection === section;

            return (
              <View
                key={section}
                ref={(node) => {
                  sectionRefs.current[section] = node;
                }}
                style={[styles.sectionBlock, isDropTarget && styles.sectionBlockActive]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{section}</Text>
                  <Text style={styles.sectionCount}>
                    {sectionRecipes.length} recipe{sectionRecipes.length === 1 ? "" : "s"}
                  </Text>
                </View>

                {sectionRecipes.length > 0 ? (
                  <FlatList
                    data={sectionRecipes}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalListContent}
                    scrollEnabled={!dragState}
                    renderItem={({ item }) => renderRecipeCard(item, section)}
                  />
                ) : (
                  <View style={styles.emptySectionCard}>
                    <Text style={styles.emptySectionText}>
                      No {section.toLowerCase()} recipes yet.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {dragState ? (
        <View pointerEvents="none" style={styles.dragLayer}>
          <Animated.View
            style={[
              styles.recipeCard,
              styles.dragCard,
              {
                width: dragState.width,
                transform: dragPosition.getTranslateTransform(),
              },
            ]}
          >
            <View style={styles.cardMain}>
              <View style={styles.thumbWrap}>
                {dragState.recipe.image ? (
                  <Image
                    source={{ uri: dragState.recipe.image }}
                    style={styles.thumbImage}
                  />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </View>

              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {dragState.recipe.title || "Title"}
                </Text>

                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {dragState.recipe.servings
                    ? `${dragState.recipe.servings} servings`
                    : "Recipe"}
                </Text>

                <View style={styles.metaBlock}>
                  <Text style={styles.metaText}>
                    Cook time:{" "}
                    {dragState.recipe.readyInMinutes
                      ? `${dragState.recipe.readyInMinutes} min`
                      : "N/A"}
                  </Text>
                  <Text style={styles.metaText}>
                    Calories: {getCaloriesText(dragState.recipe)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      ) : null}

      <Pressable
        style={styles.generateButton}
        onPress={handleGenerateGroceryList}
        disabled={isGenerating}
      >
        <Text style={styles.generateButtonText}>
          {isGenerating ? "Generating..." : "Generate Grocery List"}
        </Text>
      </Pressable>
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
    paddingHorizontal: 14,
  },
  message: {
    fontSize: 16,
    color: "#374151",
    marginTop: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 14,
    paddingBottom: 110,
    gap: 18,
  },
  sectionBlock: {
    borderRadius: 16,
    padding: 10,
    marginBottom: 6,
  },
  sectionBlockActive: {
    backgroundColor: "rgba(79,53,155,0.12)",
    borderWidth: 1,
    borderColor: "#4F359B",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: INK,
  },
  sectionCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
  },
  horizontalListContent: {
    paddingRight: 8,
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 20,
    paddingBottom: 20,
    marginRight: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }),
  },
  recipeCardHidden: {
    opacity: 0.15,
  },
  dragLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  dragCard: {
    position: "absolute",
    marginRight: 0,
    opacity: 0.96,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  thumbWrap: { marginLeft: 6, marginRight: 14 },
  thumbPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 5,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: GREEN,
  },
  thumbImage: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: INK,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: INK,
    opacity: 0.8,
    marginBottom: 10,
  },
  metaBlock: { gap: 4 },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: INK,
    opacity: 0.85,
  },
  cardActionColumn: {
    justifyContent: "center",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  removeButton: {
    borderWidth: 1.5,
    borderColor: "#DC2626",
    backgroundColor: "rgba(220,38,38,0.15)",
  },
  emptySectionCard: {
    minHeight: 126,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptySectionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  generateButton: {
    position: "absolute",
    bottom: 31,
    alignSelf: "center",
    backgroundColor: "#FFCC00",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
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
  generateButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});
