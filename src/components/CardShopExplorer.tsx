import { useState, useMemo } from 'react';
import { Search, TrendingUp, Package, Clock, ExternalLink, ChevronDown, Store, ShieldCheck, AlertCircle, X } from 'lucide-react';
import type { CardShop, SortKey, StockStatus, ShopType } from '../types/cardshop';
import { SHOP_TYPE_LABELS, STOCK_STATUS_LABELS } from '../types/cardshop';

interface Props {
  shops: CardShop[];
}

const PLATFORMS = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'API/CDK', '邮箱', '接码', '其他'] as const;
const SHOP_TYPES: ShopType[] = ['kami', 'dujiao', 'shopApi', 'genericHtml', 'other'];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'price-asc', label: '价格低→高' },
  { value: 'price-desc', label: '价格高→低' },
  { value: 'products-desc', label: '商品多→少' },
  { value: 'updated-desc', label: '最近更新' },
];

const stockColors: Record<StockStatus, string> = {
  in_stock: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  low_stock: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  out_of_stock: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const healthColors: Record<string, string> = {
  healthy: 'bg-emerald-500/10 text-emerald-400',
  retrying: 'bg-amber-500/10 text-amber-400',
  failing: 'bg-red-500/10 text-red-400',
  unknown: 'bg-slate-700 text-slate-400',
};

const healthLabels: Record<string, string> = {
  healthy: '正常',
  retrying: '重试中',
  failing: '异常',
  unknown: '未知',
};

function formatPrice(price: number | null): string {
  if (price === null) return '暂无';
  return `¥${price}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function CardShopExplorer({ shops }: Props) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [shopTypeFilter, setShopTypeFilter] = useState<ShopType | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('price-asc');
  const [expandedShop, setExpandedShop] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = shops.filter((shop) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = shop.name.toLowerCase().includes(q);
        const matchDesc = shop.description.toLowerCase().includes(q);
        const matchProducts = shop.products.some((p) => p.name.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchProducts) return false;
      }
      if (platformFilter && !shop.platforms.includes(platformFilter)) return false;
      if (shopTypeFilter && shop.shopType !== shopTypeFilter) return false;
      if (stockFilter === 'in_stock' && shop.inStockCount === 0) return false;
      if (stockFilter === 'out_of_stock' && shop.inStockCount > 0) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'price-asc':
          return (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity);
        case 'price-desc':
          return (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0);
        case 'products-desc':
          return b.productCount - a.productCount;
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [shops, search, platformFilter, shopTypeFilter, stockFilter, sortKey]);

  const stats = useMemo(() => {
    const totalShops = shops.length;
    const totalProducts = shops.reduce((sum, s) => sum + s.productCount, 0);
    const totalInStock = shops.reduce((sum, s) => sum + s.inStockCount, 0);
    const allPrices = shops.flatMap((s) => s.products.map((p) => p.price));
    const lowest = allPrices.length > 0 ? Math.min(...allPrices) : null;
    return { totalShops, totalProducts, totalInStock, lowest };
  }, [shops]);

  const togglePlatform = (p: string) => {
    setPlatformFilter((prev) => (prev === p ? null : p));
  };

  const toggleShopType = (t: ShopType) => {
    setShopTypeFilter((prev) => (prev === t ? null : t));
  };

  const clearFilters = () => {
    setSearch('');
    setPlatformFilter(null);
    setShopTypeFilter(null);
    setStockFilter('all');
    setSortKey('price-asc');
  };

  const hasActiveFilters = search || platformFilter || shopTypeFilter || stockFilter !== 'all';

  return (
    <div class="space-y-6">
      {/* Stats Bar */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card-base !p-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Store className="w-3.5 h-3.5" /> 卡网数量
          </div>
          <div class="text-2xl font-bold text-slate-100">{stats.totalShops}</div>
        </div>
        <div class="card-base !p-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Package className="w-3.5 h-3.5" /> 商品总数
          </div>
          <div class="text-2xl font-bold text-slate-100">{stats.totalProducts}</div>
        </div>
        <div class="card-base !p-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> 有货商品
          </div>
          <div class="text-2xl font-bold text-emerald-400">{stats.totalInStock}</div>
        </div>
        <div class="card-base !p-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <span class="text-xs">¥</span> 全站最低价
          </div>
          <div class="text-2xl font-bold text-cyan-400">{formatPrice(stats.lowest)}</div>
        </div>
      </div>

      {/* Search + Sort */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索卡网名称、商品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            class="input-base w-full !pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          class="input-base !w-auto cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filter Chips */}
      <div class="space-y-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-slate-500 mr-1">平台:</span>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              class={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                platformFilter === p
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-slate-500 mr-1">类型:</span>
          {SHOP_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleShopType(t)}
              class={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                shopTypeFilter === t
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {SHOP_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-slate-500 mr-1">库存:</span>
          {(['all', 'in_stock', 'out_of_stock'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStockFilter(s)}
              class={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                stockFilter === s
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {s === 'all' ? '全部' : s === 'in_stock' ? '有货' : '缺货'}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              class="px-3 py-1 rounded-full text-xs font-medium text-red-400 hover:text-red-300 transition-colors ml-2"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div class="text-sm text-slate-500">
        找到 <span class="text-slate-300 font-medium">{filtered.length}</span> 家卡网
      </div>

      {/* Shop Cards */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((shop) => {
          const isExpanded = expandedShop === shop.id;
          const visibleProducts = isExpanded ? shop.products : shop.products.slice(0, 3);
          return (
            <div key={shop.id} class="card-base card-hover !p-0 overflow-hidden">
              {/* Shop Header */}
              <div class="p-5 border-b border-slate-800">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-lg font-semibold text-slate-100 truncate">{shop.name}</h3>
                      <span class={`px-2 py-0.5 rounded text-xs font-medium ${healthColors[shop.healthStatus]}`}>
                        {healthLabels[shop.healthStatus]}
                      </span>
                    </div>
                    <p class="text-sm text-slate-400 line-clamp-2">{shop.description}</p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span class="badge-model">{SHOP_TYPE_LABELS[shop.shopType]}</span>
                      <span class="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {shop.productCount} 商品
                      </span>
                      <span class="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(shop.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="text-xs text-slate-500 mb-0.5">最低价</div>
                    <div class="text-xl font-bold text-cyan-400">{formatPrice(shop.lowestPrice)}</div>
                  </div>
                </div>
                {/* Platform badges */}
                <div class="flex items-center gap-1.5 mt-3 flex-wrap">
                  {shop.platforms.map((p) => (
                    <span key={p} class="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div class="p-5">
                <div class="space-y-2">
                  {visibleProducts.map((product, idx) => (
                    <div
                      key={idx}
                      class="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-slate-200 truncate">{product.name}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{product.productType}</span>
                          <span>·</span>
                          <span>质保: {product.warranty}</span>
                          {product.stockCount !== undefined && product.stockCount > 0 && (
                            <>
                              <span>·</span>
                              <span>库存 {product.stockCount}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <span class={`px-2 py-0.5 rounded text-xs border ${stockColors[product.stockStatus]}`}>
                          {STOCK_STATUS_LABELS[product.stockStatus]}
                        </span>
                        <span class="text-base font-semibold text-slate-100">¥{product.price}</span>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-slate-500 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand button */}
                {shop.products.length > 3 && (
                  <button
                    onClick={() => setExpandedShop(isExpanded ? null : shop.id)}
                    class="w-full mt-3 flex items-center justify-center gap-1 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {isExpanded ? '收起' : `查看全部 ${shop.products.length} 个商品`}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div class="card-base text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p class="text-slate-400">没有找到匹配的卡网</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} class="btn-ghost mt-4">
              清除筛选条件
            </button>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div class="card-base !p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
        <p class="text-xs text-slate-500 leading-relaxed">
          本站仅提供卡网信息聚合，不卖货、不收款、不替任何渠道担保。价格和库存信息仅供参考，购买前请自行核实。低价渠道存在风险，建议优先选择有质保的商家。
        </p>
      </div>
    </div>
  );
}
