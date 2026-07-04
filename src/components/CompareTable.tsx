import { useState, useEffect, useMemo } from 'react';
import type { Station } from '../types/station';
import { filterStationsBySlugs, extractAllModels, formatPrice } from '../utils/stations';
import { Check, X, Star, ExternalLink, ArrowLeft, Trash2, Download } from 'lucide-react';

interface Props {
  allStations: Station[];
}

export default function CompareTable({ allStations }: Props) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stations = params.get('stations');
    if (stations) {
      setSelectedSlugs(stations.split(',').filter(Boolean));
    }
  }, []);

  const selectedStations = filterStationsBySlugs(allStations, selectedSlugs);
  const allModels = extractAllModels(allStations);

  const clearSelection = () => {
    setSelectedSlugs([]);
    const url = new URL(window.location.href);
    url.searchParams.delete('stations');
    window.history.replaceState({}, '', url.toString());
  };

  // Export as CSV
  const exportCSV = () => {
    if (selectedStations.length === 0) return;

    const headers = ['对比维度', ...selectedStations.map((s) => s.name)];
    const rows: string[][] = [headers];

    // Basic info
    rows.push(['官网', ...selectedStations.map((s) => s.url)]);
    rows.push(['评分', ...selectedStations.map((s) => s.rating.toFixed(1))]);
    rows.push(['支持模型数', ...selectedStations.map((s) => String(s.models.length))]);
    rows.push(['特性', ...selectedStations.map((s) => s.features.join(', '))]);
    rows.push(['支付方式', ...selectedStations.map((s) => s.paymentMethods.join(', '))]);
    rows.push(['更新时间', ...selectedStations.map((s) => s.updatedAt)]);

    // Model pricing
    rows.push(['', ...Array(selectedStations.length).fill('')]);
    rows.push(['--- 模型定价 (输入/输出 每1M tokens) ---', ...Array(selectedStations.length).fill('')]);

    for (const model of allModels) {
      rows.push([
        model,
        ...selectedStations.map((s) => {
          const p = s.pricing[model];
          return p ? `${formatPrice(p.input)} / ${formatPrice(p.output)}` : '-';
        }),
      ]);
    }

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-hub-compare-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedSlugs.length < 2) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
          <ArrowLeft className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">至少选择 2 个中转站进行对比</h2>
        <p className="text-slate-400 text-sm mb-6">
          返回首页，在中转站卡片上勾选"对比"，然后回来查看对比结果。
        </p>
        <a href="/" className="btn-primary">
          返回首页选择
        </a>
      </div>
    );
  }

  // Find minimum price for each model
  const getMinPriceForModel = (model: string): number | null => {
    const prices = selectedStations
      .map((s) => s.pricing[model])
      .filter(Boolean)
      .map((p) => p.input + p.output);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">
          正在对比 <span className="text-blue-400 font-bold">{selectedStations.length}</span> 个中转站
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-ghost !py-1.5">
            <Download className="w-4 h-4" />
            导出 CSV
          </button>
          <button onClick={clearSelection} className="btn-ghost !py-1.5">
            <Trash2 className="w-4 h-4" />
            清空选择
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto card-base !p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e293b]">
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider p-4 sticky left-0 bg-surface z-10">
                对比维度
              </th>
              {selectedStations.map((station) => (
                <th key={station.slug} className="text-left p-4 min-w-[200px]">
                  <a href={`/stations/${station.slug}`} className="block">
                    <div className="text-base font-semibold text-slate-100 hover:text-blue-400 transition-colors">
                      {station.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="badge-rating inline-flex items-center gap-1">
                        <Star className="w-3 h-3" fill="currentColor" />
                        {station.rating.toFixed(1)}
                      </span>
                    </div>
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic info rows */}
            <tr className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
              <td className="p-4 text-sm text-slate-500 sticky left-0 bg-surface">官网</td>
              {selectedStations.map((s) => (
                <td key={s.slug} className="p-4">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    访问
                  </a>
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
              <td className="p-4 text-sm text-slate-500 sticky left-0 bg-surface">支持模型数</td>
              {selectedStations.map((s) => (
                <td key={s.slug} className="p-4 text-sm font-mono text-slate-300">
                  {s.models.length}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
              <td className="p-4 text-sm text-slate-500 sticky left-0 bg-surface">特性</td>
              {selectedStations.map((s) => (
                <td key={s.slug} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {s.features.map((f) => (
                      <span key={f} className="badge-feature">{f}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
              <td className="p-4 text-sm text-slate-500 sticky left-0 bg-surface">支付方式</td>
              {selectedStations.map((s) => (
                <td key={s.slug} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {s.paymentMethods.map((m) => (
                      <span key={m} className="badge-model">{m}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
              <td className="p-4 text-sm text-slate-500 sticky left-0 bg-surface">更新时间</td>
              {selectedStations.map((s) => (
                <td key={s.slug} className="p-4 text-xs font-mono text-slate-400">
                  {s.updatedAt}
                </td>
              ))}
            </tr>

            {/* Model coverage matrix */}
            <tr className="border-b border-[#1e293b]">
              <td colSpan={selectedStations.length + 1} className="p-4 bg-base/50">
                <span className="text-sm font-semibold text-slate-300">模型覆盖矩阵 & 定价对比</span>
              </td>
            </tr>

            {allModels.map((model) => {
              const minPrice = getMinPriceForModel(model);
              return (
                <tr key={model} className="border-b border-[#1e293b]/50 hover:bg-slate-800/20">
                  <td className="p-4 sticky left-0 bg-surface">
                    <span className="badge-model">{model}</span>
                  </td>
                  {selectedStations.map((s) => {
                    const pricing = s.pricing[model];
                    if (!pricing) {
                      return (
                        <td key={s.slug} className="p-4 text-center">
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        </td>
                      );
                    }
                    const totalPrice = pricing.input + pricing.output;
                    const isMin = minPrice !== null && totalPrice === minPrice;
                    return (
                      <td key={s.slug} className="p-4">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <div className={`text-sm font-mono ${isMin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {formatPrice(pricing.input)} / {formatPrice(pricing.output)}
                          </div>
                          {isMin && (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                              最低
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Back link */}
      <div className="mt-6">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </a>
      </div>
    </div>
  );
}
