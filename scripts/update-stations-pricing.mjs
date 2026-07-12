import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATIONS_PATH = path.join(DATA_DIR, 'stations.json');

// Base quota rate in One API / New API (typically 1 Quota = $0.002 USD)
// This can be adjusted if a specific site uses a different base rate (like 1 RMB = 1 Quota, etc)
const BASE_QUOTA_USD = 0.002;

/**
 * Fetch pricing from a New API / One API style endpoint
 */
async function fetchStationPricing(stationUrl, token) {
  // Try /api/pricing first (common in New API)
  const pricingUrl = new URL('/api/pricing', stationUrl).toString();
  try {
    console.log(`Fetching ${pricingUrl}...`);
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(pricingUrl, { headers });
    if (!res.ok) {
      console.warn(`[!] HTTP ${res.status} for ${pricingUrl}`);
      return null;
    }
    
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const pricing = {};
      const models = [];
      
      json.data.forEach(item => {
        const modelName = item.model_name;
        if (!modelName) return;
        
        models.push(modelName);
        
        // Default ratios
        const modelRatio = item.model_ratio || 1;
        const groupRatio = item.group_ratio || 1;
        const completionRatio = item.completion_ratio || 1; // sometimes completion is separate

        // Calculate actual price per 1k tokens
        // Formula: model_ratio * group_ratio * 0.002 (input)
        // Output: model_ratio * completion_ratio * group_ratio * 0.002
        const inputPrice = modelRatio * groupRatio * BASE_QUOTA_USD;
        const outputPrice = modelRatio * completionRatio * groupRatio * BASE_QUOTA_USD;
        
        pricing[modelName] = {
          input: Number(inputPrice.toFixed(6)),
          output: Number(outputPrice.toFixed(6)),
          unit: '1k tokens'
        };
      });
      
      return { pricing, models: Array.from(new Set(models)) };
    } else {
      console.warn(`[!] Invalid data format from ${pricingUrl}`);
      return null;
    }
  } catch (err) {
    console.error(`[!] Failed to fetch ${pricingUrl}:`, err.message);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(STATIONS_PATH)) {
    console.error(`Stations file not found at ${STATIONS_PATH}`);
    process.exit(1);
  }

  const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf-8'));
  let updatedCount = 0;

  for (const station of stations) {
    console.log(`\n--- Processing Station: ${station.name} (${station.slug}) ---`);
    
    // Look for token in environment variables, e.g., TOKEN_aizzz for slug 'aizzz'
    const envKey = `TOKEN_${station.slug.replace(/-/g, '_').toUpperCase()}`;
    const token = process.env[envKey] || '';
    
    if (!token) {
      console.log(`[i] No token provided for ${station.name}. Set ${envKey} if it requires auth.`);
    }

    const result = await fetchStationPricing(station.url, token);
    
    if (result) {
      station.pricing = result.pricing;
      // Optionally merge models or replace them
      if (result.models && result.models.length > 0) {
        station.models = result.models;
      }
      station.updatedAt = new Date().toISOString().split('T')[0];
      updatedCount++;
      console.log(`[+] Successfully updated pricing for ${station.name} (${result.models.length} models)`);
    } else {
      console.log(`[-] Could not update pricing for ${station.name}`);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(STATIONS_PATH, JSON.stringify(stations, null, 2), 'utf-8');
    console.log(`\nDone! Updated ${updatedCount} stations in stations.json`);
  } else {
    console.log('\nNo stations were updated.');
  }
}

main().catch(console.error);
