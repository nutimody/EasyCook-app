import { GOOGLE_MAPS_API_KEY } from "../config";

export async function fetchNearbyGroceryStores(
  latitude,
  longitude,
  radius = 3000
) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured.");
  }

  const url =
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
    `?location=${latitude},${longitude}` +
    `&radius=${radius}` +
    "&type=supermarket" +
    "&keyword=grocery%20store" +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message || `Google Places status: ${data.status}`);
  }

  return (data.results || []).map((store) => ({
    id: store.place_id,
    name: store.name || "Store",
    address: store.vicinity || store.formatted_address || "Address unavailable",
    rating: store.rating,
    location: {
      latitude: store?.geometry?.location?.lat,
      longitude: store?.geometry?.location?.lng,
    },
    placeId: store.place_id,
  }));
}
