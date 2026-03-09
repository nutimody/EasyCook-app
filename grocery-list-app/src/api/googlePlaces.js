// src/api/googlePlaces.js

import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACES_BASE_URL,
} from "../config";

export async function fetchNearbyGroceryStores(latitude, longitude) {
  const response = await fetch(
    `${GOOGLE_PLACES_BASE_URL}/places:searchNearby`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.primaryType",
      },
      body: JSON.stringify({
        includedPrimaryTypes: ["grocery_store"],
        maxResultCount: 12,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius: 2000.0,
          },
        },
        rankPreference: "DISTANCE",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places error: ${errorText}`);
  }

  const data = await response.json();
  return data.places || [];
}