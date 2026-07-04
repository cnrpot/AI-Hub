import type { Station, SortKey } from '../types/station';

/* ------------------------------------------------------------------ */
/*  Pure utility functions (safe for client-side use)                  */
/*  Data-reading functions live in src/server/db.ts (server-only)      */
/* ------------------------------------------------------------------ */

export function getPriceRange(station: Station): { min: number; max: number } {
  const prices = Object.values(station.pricing).map((p) => p.input + p.output);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getLowestPrice(station: Station): number {
  const prices = Object.values(station.pricing).map((p) => p.input + p.output);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

export function sortStations(stations: Station[], sortKey: SortKey): Station[] {
  const sorted = [...stations];
  switch (sortKey) {
    case 'price-asc':
      sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      break;
    case 'price-desc':
      sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'updated-desc':
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
  }
  return sorted;
}

export function formatPrice(price: number): string {
  if (price < 0.001) return `$${price.toFixed(4)}`;
  if (price < 0.01) return `$${price.toFixed(3)}`;
  return `$${price.toFixed(2)}`;
}

export function extractAllModels(stations: Station[]): string[] {
  const models = new Set<string>();
  stations.forEach((s) => s.models.forEach((m) => models.add(m)));
  return Array.from(models).sort();
}

export function getModelCategoriesFromStations(stations: Station[]): { label: string; models: string[] }[] {
  const allModels = extractAllModels(stations);
  const categories: Record<string, string[]> = {
    GPT: [],
    Claude: [],
    Gemini: [],
    其他: [],
  };
  allModels.forEach((m) => {
    if (m.startsWith('gpt') || m.startsWith('o1')) {
      categories.GPT.push(m);
    } else if (m.startsWith('claude')) {
      categories.Claude.push(m);
    } else if (m.startsWith('gemini')) {
      categories.Gemini.push(m);
    } else {
      categories.其他.push(m);
    }
  });
  return Object.entries(categories)
    .filter(([, models]) => models.length > 0)
    .map(([label, models]) => ({ label, models }));
}

export function filterStationsBySlugs(stations: Station[], slugs: string[]): Station[] {
  return stations.filter((s) => slugs.includes(s.slug));
}
