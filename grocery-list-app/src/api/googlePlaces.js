// src/api/googlePlaces.js

import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACES_BASE_URL,
} from "../config";

function normalizePlace(place) {
  const latitude = place?.location?.latitude;
  const longitude = place?.location?.longitude;

  return {
    id: place?.id || `${latitude}-${longitude}`,
    name: place?.displayName?.text || "Unknown store",
    address: place?.formattedAddress || "Address unavailable",
    rating: place?.rating ?? null,
    primaryType: place?.primaryType || null,
    location:
      typeof latitude === "number" && typeof longitude === "number"
        ? { latitude, longitude }
        : null,
    rawPlace: place,
  };
}

export async function fetchNearbyGroceryStores(latitude, longitude) {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("Missing Google Places API key.");
  }

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
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius: 5000.0,
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
  return (data.places || []).map(normalizePlace);
}
