// Seed script: generates initial price-history.json from current stations.json
// Run: node scripts/seed-price-history.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATIONS_PATH = path.join(DATA_DIR, 'stations.json');
const HISTORY_PATH = path.join(DATA_DIR, 'price-history.json');

const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf-8'));

// Generate 7 days of history with slight random variations
const history = [];
const today = new Date();

for (let i = 6; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];

  const data = {};
  for (const station of stations) {
    if (Object.keys(station.pricing).length === 0) continue;
    data[station.slug] = {};
    for (const [model, pricing] of Object.entries(station.pricing)) {
      // Add small random variation (+-5%) for historical data, exact for today
      const factor = i === 0 ? 1 : (1 + (Math.random() - 0.5) * 0.1);
      data[station.slug][model] = {
        input: Math.round(pricing.input * factor * 10000) / 10000,
        output: Math.round(pricing.output * factor * 10000) / 10000,
      };
    }
  }

  history.push({ date: dateStr, data });
}

fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
console.log(`Seeded ${history.length} days of price history to ${HISTORY_PATH}`);
