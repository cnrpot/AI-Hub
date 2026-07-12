import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const CARDSHOPS_PATH = path.join(DATA_DIR, 'cardshops.json');

/**
 * Helper to fetch HTML or JSON
 */
async function fetchSafe(url, isJson = false) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': isJson ? 'application/json' : 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
      // Timeout is important for unresponsive sites
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    return isJson ? await res.json() : await res.text();
  } catch (err) {
    console.error(`[!] Fetch error for ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Strategy for Dujiao (独角数卡)
 * Tries API first, falls back to HTML parsing
 */
async function checkDujiao(shopUrl) {
  const products = [];
  const apiUrl = new URL('/api/v1/product', shopUrl).toString();
  const apiData = await fetchSafe(apiUrl, true);
  
  if (apiData && apiData.data) {
    // Has API response
    const list = Array.isArray(apiData.data) ? apiData.data : Object.values(apiData.data);
    for (const item of list) {
      if (!item.name || typeof item.price === 'undefined') continue;
      
      const stock = item.in_stock || item.stock || 0;
      let stockStatus = 'out_of_stock';
      if (stock > 10) stockStatus = 'in_stock';
      else if (stock > 0) stockStatus = 'low_stock';
      
      products.push({
        name: item.name,
        platform: 'Generic',
        productType: 'Digital',
        price: Number(item.price),
        stockStatus,
        stockCount: stock,
        warranty: '未知',
        url: `${shopUrl}/buy/${item.id || ''}`
      });
    }
  } else {
    // Fallback: Parse HTML for prices and stock
    const html = await fetchSafe(shopUrl, false);
    if (html) {
      // Find all prices (e.g. ¥ 10.00)
      const priceRegex = /¥\s*([0-9.]+)/g;
      let match;
      while ((match = priceRegex.exec(html)) !== null) {
        products.push({
          name: '提取商品',
          platform: 'Generic',
          productType: 'Digital',
          price: Number(match[1]),
          stockStatus: html.includes('缺货') ? 'out_of_stock' : 'in_stock',
          warranty: '未知',
          url: shopUrl
        });
      }
    }
  }
  return products;
}

/**
 * Strategy for Generic HTML
 */
async function checkGenericHtml(shopUrl) {
  const products = [];
  const html = await fetchSafe(shopUrl, false);
  if (html) {
    const priceRegex = /(?:¥|\$)\s*([0-9.]+)/g;
    let match;
    while ((match = priceRegex.exec(html)) !== null) {
      products.push({
        name: '未知商品',
        platform: 'Generic',
        productType: 'Digital',
        price: Number(match[1]),
        stockStatus: 'in_stock',
        warranty: '未知',
        url: shopUrl
      });
    }
  }
  return products;
}

/**
 * Recompute cardshop stats based on products
 */
function recomputeStats(shop) {
  shop.productCount = shop.products.length;
  shop.inStockCount = shop.products.filter(p => p.stockStatus !== 'out_of_stock').length;
  const prices = shop.products.filter(p => p.price > 0).map(p => p.price);
  shop.lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  shop.updatedAt = new Date().toISOString();
}

/**
 * Main routine
 */
async function main() {
  if (!fs.existsSync(CARDSHOPS_PATH)) {
    console.error(`Cardshops file not found at ${CARDSHOPS_PATH}`);
    process.exit(1);
  }

  const shops = JSON.parse(fs.readFileSync(CARDSHOPS_PATH, 'utf-8'));
  let updatedCount = 0;

  for (const shop of shops) {
    console.log(`\n--- Monitoring CardShop: ${shop.name} (${shop.shopType}) ---`);
    let newProducts = [];
    
    try {
      if (shop.shopType === 'dujiao') {
        newProducts = await checkDujiao(shop.url);
      } else {
        // Fallback for kami, genericHtml, other
        newProducts = await checkGenericHtml(shop.url);
      }
      
      if (newProducts.length > 0) {
        shop.healthStatus = 'healthy';
        // Only keep unique prices to avoid massive duplication in generic parsing
        const uniqueProducts = [];
        const seenPrices = new Set();
        for (const p of newProducts) {
          if (!seenPrices.has(p.price)) {
            uniqueProducts.push(p);
            seenPrices.add(p.price);
          }
        }
        shop.products = uniqueProducts;
      } else {
        // Did not extract anything, but might still be reachable
        // Try a simple ping
        const html = await fetchSafe(shop.url, false);
        shop.healthStatus = html ? 'healthy' : 'failing';
      }
    } catch (err) {
      console.error(`[!] Shop check failed: ${err.message}`);
      shop.healthStatus = 'failing';
    }

    recomputeStats(shop);
    updatedCount++;
    console.log(`[+] Status: ${shop.healthStatus}, Products: ${shop.productCount}, Lowest Price: ${shop.lowestPrice}`);
  }

  if (updatedCount > 0) {
    fs.writeFileSync(CARDSHOPS_PATH, JSON.stringify(shops, null, 2), 'utf-8');
    console.log(`\nDone! Updated ${updatedCount} card shops in cardshops.json`);
  }
}

main().catch(console.error);
