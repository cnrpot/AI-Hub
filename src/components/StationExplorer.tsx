import { useState, useMemo, useEffect } from 'react';
import type { Station, SortKey } from '../types/station';
import { getPriceRange, formatPrice, getLowestPrice, sortStations } from '../utils/stations';
import { FavoriteToggle } from './Favorites';
import { Search, ArrowUpDown, Star, ArrowRight, X, Check } from 'lucide-react';

interface Props {
  stations: Station[];
  modelCategories: { label: string; models: string[] }[];
}

interface ModelCategory {
  label: string;
  models: string[];
}

export default function StationExplorer({ stations, modelCategories }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('rating-desc');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Sync from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cats = params.get('models');
    const sort = params.get('sort') as SortKey | null;
    const compare = params.get('stations');
    if (q) setSearchQuery(q);
    if (cats) setSelectedCategories(cats.split(',').filter(Boolean));
    if (sort && ['price-asc', 'price-desc', 'rating-desc', 'updated-desc'].includes(sort)) {
      setSortKey(sort);
    }
    if (compare) setSelectedForCompare(compare.split(',').filter(Boolean));
  }, []);

  // Sync to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (searchQuery) url.searchParams.set('q', searchQuery);
    else url.searchParams.delete('q');
    if (selectedCategories.length > 0) url.searchParams.set('models', selectedCategories.join(','));
    else url.searchParams.delete('models');
    url.searchParams.set('sort', sortKey);
    if (selectedForCompare.length > 0) url.searchParams.set('stations', selectedForCompare.join(','));
    else url.searchParams.delete('stations');
    window.history.replaceState({}, '', url.toString());
  }, [searchQuery, selectedCategories, sortKey, selectedForCompare]);

  const filteredStations = useMemo(() => {
    let result = stations;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.models.some((m) => m.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      const categoryModels = new Set<string>();
      selectedCategories.forEach((cat) => {
        const found = modelCategories.find((c) => c.label === cat);
        if (found) found.models.forEach((m) => categoryModels.add(m));
      });
      result = result.filter((s) => s.models.some((m) => categoryModels.has(m)));
    }

    // Sort
    result = sortStations(result, sortKey);

    return result;
  }, [stations, searchQuery, selectedCategories, sortKey, modelCategories]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const toggleCompare = (slug: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const hasFilters = searchQuery || selectedCategories.length > 0;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索中转站名称、描述或模型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="input-base pl-10 pr-8 cursor-pointer appearance-none"
            >
              <option value="rating-desc">评分最高</option>
              <option value="price-asc">价格最低</option>
              <option value="price-desc">价格最高</option>
              <option value="updated-desc">最近更新</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">模型分类:</span>
          {modelCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => toggleCategory(cat.label)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategories.includes(cat.label)
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
              <span className="ml-1 opacity-60">({cat.models.length})</span>
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-sm text-slate-500">
          共找到 <span className="text-blue-400 font-medium">{filteredStations.length}</span> 个中转站
        </div>
      </div>

      {/* Station grid */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">没有找到匹配的中转站</p>
          <p className="text-slate-500 text-sm">尝试调整搜索关键词或筛选条件</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost mt-4">
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const priceRange = getPriceRange(station);
            const isSelected = selectedForCompare.includes(station.slug);
            const isMaxSelected = selectedForCompare.length >= 4 && !isSelected;
            return (
              <div
                key={station.slug}
                className="card-base card-hover group relative"
              >
                {/* Top-right actions: favorite + compare */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
                  <FavoriteToggle slug={station.slug} />
                  <label
                    className={`flex items-center gap-1.5 cursor-pointer text-xs transition-colors ${
                      isMaxSelected ? 'opacity-40 cursor-not-allowed' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                      checked={isSelected}
                      onChange={() => toggleCompare(station.slug)}
                      disabled={isMaxSelected}
                    />
                    <span>对比</span>
                  </label>
                </div>

                {/* Content */}
                <a href={`/stations/${station.slug}`} className="block">
                  <div className="flex items-start justify-between mb-3 pr-28">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {station.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-rating inline-flex items-center gap-1">
                          <Star className="w-3 h-3" fill="currentColor" />
                          {station.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{station.models.length} 模型</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{station.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {station.models.slice(0, 5).map((model) => (
                      <span key={model} className="badge-model">{model}</span>
                    ))}
                    {station.models.length > 5 && (
                      <span className="text-xs text-slate-500 self-center">+{station.models.length - 5}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">价格区间</span>
                      <span className="text-sm font-mono text-blue-400">
                        {formatPrice(priceRange.min)} ~ {formatPrice(priceRange.max)}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare bar */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-surface border border-blue-500/30 rounded-xl px-5 py-3 shadow-xl shadow-blue-500/10">
          <span className="text-sm text-slate-300">
            已选 <span className="text-blue-400 font-bold">{selectedForCompare.length}</span> 个中转站
          </span>
          <a
            href={`/compare?stations=${selectedForCompare.join(',')}`}
            className="btn-primary !py-1.5"
          >
            开始对比
          </a>
          <button
            onClick={() => setSelectedForCompare([])}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            清空
          </button>
        </div>
      )}
    </div>
  );
}
