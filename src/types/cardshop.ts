export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type ShopType = 'kami' | 'dujiao' | 'shopApi' | 'genericHtml' | 'other';

export type HealthStatus = 'healthy' | 'retrying' | 'failing' | 'unknown';

export interface CardShopProduct {
  name: string;
  platform: string;
  productType: string;
  price: number;
  stockStatus: StockStatus;
  stockCount?: number;
  warranty: string;
  url: string;
}

export interface CardShop {
  id: string;
  name: string;
  url: string;
  description: string;
  shopType: ShopType;
  products: CardShopProduct[];
  platforms: string[];
  productCount: number;
  inStockCount: number;
  lowestPrice: number | null;
  healthStatus: HealthStatus;
  updatedAt: string;
}

export type SortKey = 'price-asc' | 'price-desc' | 'products-desc' | 'updated-desc';

export const SHOP_TYPE_LABELS: Record<ShopType, string> = {
  kami: '卡密自动发货',
  dujiao: '独角数卡',
  shopApi: '链动小铺',
  genericHtml: '通用商城',
  other: '其他',
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: '有货',
  low_stock: '库存不足',
  out_of_stock: '缺货',
};
