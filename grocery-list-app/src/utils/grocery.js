export function mergeIngredients(allIngredients) {
  const map = new Map();

  for (const ing of allIngredients) {
    const key = ing.id ?? `${ing.name}-${ing.unit}`; // fallback
    const existing = map.get(key);

    // Prefer metric amount/unit if available, else use amount/unit
    const metricAmount = ing?.measures?.metric?.amount;
    const metricUnit = ing?.measures?.metric?.unitShort;
    const amount = metricAmount ?? ing.amount ?? 0;
    const unit = metricUnit ?? ing.unit ?? "";

    const name =
      ing.nameClean ||
      ing.originalName ||
      ing.name ||
      "Unknown ingredient";

    if (!existing) {
      map.set(key, { key, name, amount, unit });
    } else {
      // Only sum if the units match; otherwise keep separate lines
      if (existing.unit === unit) {
        existing.amount += amount;
      } else {
        // Different unit for same ingredient: create a new entry
        const altKey = `${key}-${unit}`;
        const altExisting = map.get(altKey);
        if (!altExisting) map.set(altKey, { key: altKey, name, amount, unit });
        else altExisting.amount += amount;
      }
    }
  }

  // Make it stable & readable
  return Array.from(map.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((x) => ({
      ...x,
      // round a bit for display (optional)
      amount: roundNice(x.amount),
    }));
}

function roundNice(n) {
  if (!Number.isFinite(n)) return n;
  if (n === 0) return 0;
  // 2 decimals max, but avoid ugly 0.333333
  return Math.round(n * 100) / 100;
}