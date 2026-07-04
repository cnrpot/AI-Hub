import { useState, useMemo, useEffect } from 'react';
import type { Station } from '../types/station';
import { extractAllModels, formatPrice } from '../utils/stations';
import { Search, ArrowDown, ExternalLink, Star, TrendingDown } from 'lucide-react';

interface Props {
  stations: Station[];
}

interface PriceEntry {
  station: Station;
  input: number;
  output: number;
  total: number;
  isCheapest: boolean;
}

export default function BestPriceFinder({ stations }: Props) {
  const allModels = useMemo(() => extractAllModels(stations), [stations]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  // Read ?model= from URL on mount (e.g. from command palette)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const model = params.get('model');
    if (model && allModels.includes(model)) {
      setSelectedModel(model);
      setSearchQuery(model);
    }
  }, [allModels]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return allModels;
    const q = searchQuery.toLowerCase();
    return allModels.filter((m) => m.toLowerCase().includes(q));
  }, [searchQuery, allModels]);

  const results = useMemo<PriceEntry[]>(() => {
    if (!selectedModel) return [];

    const entries: PriceEntry[] = [];
    for (const station of stations) {
      const pricing = station.pricing[selectedModel];
      if (!pricing) continue;
      entries.push({
        station,
        input: pricing.input,
        output: pricing.output,
        total: pricing.input + pricing.output,
        isCheapest: false,
      });
    }

    entries.sort((a, b) => a.total - b.total);
    if (entries.length > 0) entries[0].isCheapest = true;
    return entries;
  }, [selectedModel, stations]);

  const selectModel = (model: string) => {
    setSelectedModel(model);
    setSearchQuery(model);
  };

  const clearSelection = () => {
    setSelectedModel('');
    setSearchQuery('');
  };

  return (
    <div>
      {/* Search + model picker */}
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">跨站最优价查找</h2>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索模型名称..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedModel && e.target.value !== selectedModel) {
                setSelectedModel('');
              }
            }}
            className="input-base w-full pl-10"
          />
        </div>

        {/* Model chips */}
        {!selectedModel && (
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {filteredModels.map((model) => (
              <button
                key={model}
                onClick={() => selectModel(model)}
                className="badge-model hover:bg-blue-500/20 hover:text-blue-300 cursor-pointer transition-colors"
              >
                {model}
              </button>
            ))}
            {filteredModels.length === 0 && (
              <p className="text-sm text-slate-500">没有找到匹配的模型</p>
            )}
          </div>
        )}

        {selectedModel && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">已选:</span>
            <span className="badge-model bg-blue-500/20 text-blue-300">{selectedModel}</span>
            <button onClick={clearSelection} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              重新选择
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {!selectedModel ? (
        <div className="card-base flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">搜索并选择一个模型，查看各中转站定价排名</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400 text-sm">没有中转站提供 <span className="font-mono text-slate-300">{selectedModel}</span> 的定价信息</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
            <span>
              共 <span className="text-blue-400 font-medium">{results.length}</span> 个中转站提供该模型
            </span>
            {results.length > 1 && (
              <span>
                价差: <span className="font-mono text-amber-400">
                  {formatPrice(results[results.length - 1].total - results[0].total)}
                </span>
              </span>
            )}
          </div>

          {results.map((entry, i) => (
            <div
              key={entry.station.slug}
              className={`card-base card-hover ${
                entry.isCheapest ? 'border-emerald-500/40 bg-emerald-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    entry.isCheapest
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>

                  <div>
                    <a
                      href={`/stations/${entry.station.slug}`}
                      className="text-base font-semibold text-slate-100 hover:text-blue-400 transition-colors"
                    >
                      {entry.station.name}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge-rating inline-flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3" fill="currentColor" />
                        {entry.station.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Pricing breakdown */}
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">输入</div>
                      <div className="font-mono text-slate-300">{formatPrice(entry.input)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">输出</div>
                      <div className="font-mono text-slate-300">{formatPrice(entry.output)}</div>
                    </div>
                  </div>

                  {/* Total price */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500">总计</div>
                    <div className={`font-mono font-bold ${entry.isCheapest ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {formatPrice(entry.total)}
                    </div>
                  </div>

                  {entry.isCheapest && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-2.5 py-1 font-medium">
                      <ArrowDown className="w-3.5 h-3.5" />
                      最低价
                    </span>
                  )}

                  <a
                    href={entry.station.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-slate-500 text-center mt-4">
            价格为每 1M tokens 的输入 + 输出总价 (USD)，价格信息仅供参考
          </p>
        </div>
      )}
    </div>
  );
}
