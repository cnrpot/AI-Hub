import { useState, useMemo, useEffect } from 'react';
import type { Station, SortKey } from '../types/station';
import { getPriceRange, formatPrice, getLowestPrice, sortStations } from '../utils/stations';
import { FavoriteToggle, useFavorites } from './Favorites';
import { Heart, ArrowRight, Star, ArrowUpDown, Search, X, Inbox } from 'lucide-react';

interface Props {
  stations: Station[];
  modelCategories: { label: string; models: string[] }[];
}

export default function FavoritesExplorer({ stations, modelCategories }: Props) {
  const { favorites, refresh } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating-desc');

  const favoriteStations = useMemo(() => {
    const favSet = new Set(favorites);
    return stations.filter((s) => favSet.has(s.slug));
  }, [stations, favorites]);

  const filteredStations = useMemo(() => {
    let result = favoriteStations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.models.some((m) => m.toLowerCase().includes(q))
      );
    }

    result = sortStations(result, sortKey);
    return result;
  }, [favoriteStations, searchQuery, sortKey]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索收藏的中转站..."
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

        <div className="text-sm text-slate-500">
          共 <span className="text-rose-400 font-medium">{favoriteStations.length}</span> 个收藏
        </div>
      </div>

      {/* Content */}
      {favoriteStations.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800 border border-[#1e293b] mb-4">
            <Heart className="w-7 h-7 text-slate-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-300 mb-1">还没有收藏</h2>
          <p className="text-sm text-slate-500 mb-4">浏览中转站时点击爱心图标即可收藏</p>
          <a href="/" className="btn-primary">
            去浏览中转站
          </a>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">没有找到匹配的中转站</p>
          <button onClick={() => setSearchQuery('')} className="btn-ghost mt-4">
            清除搜索
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const priceRange = getPriceRange(station);
            return (
              <div key={station.slug} className="card-base card-hover group relative">
                {/* Favorite toggle */}
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteToggle slug={station.slug} />
                </div>

                <a href={`/stations/${station.slug}`} className="block">
                  <div className="flex items-start justify-between mb-3 pr-12">
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
    </div>
  );
}
