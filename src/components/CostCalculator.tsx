import { useState, useMemo } from 'react';
import type { Station } from '../types/station';
import { extractAllModels, formatPrice } from '../utils/stations';
import { Calculator, ArrowDown, Zap } from 'lucide-react';

interface Props {
  stations: Station[];
}

interface CostResult {
  station: Station;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  isCheapest: boolean;
}

export default function CostCalculator({ stations }: Props) {
  const allModels = useMemo(() => extractAllModels(stations), [stations]);
  const [selectedModel, setSelectedModel] = useState('');
  const [inputTokens, setInputTokens] = useState('1000000');
  const [outputTokens, setOutputTokens] = useState('1000000');

  const results = useMemo<CostResult[]>(() => {
    if (!selectedModel) return [];

    const input = parseFloat(inputTokens) || 0;
    const output = parseFloat(outputTokens) || 0;
    const inputMillions = input / 1_000_000;
    const outputMillions = output / 1_000_000;

    const costs: CostResult[] = [];

    for (const station of stations) {
      const pricing = station.pricing[selectedModel];
      if (!pricing) continue;

      const inputCost = pricing.input * inputMillions;
      const outputCost = pricing.output * outputMillions;

      costs.push({
        station,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
        isCheapest: false,
      });
    }

    costs.sort((a, b) => a.totalCost - b.totalCost);

    if (costs.length > 0) {
      costs[0].isCheapest = true;
    }

    return costs;
  }, [selectedModel, inputTokens, outputTokens, stations]);

  const cheapestSaving = useMemo(() => {
    if (results.length < 2) return 0;
    return results[results.length - 1].totalCost - results[0].totalCost;
  }, [results]);

  return (
    <div>
      {/* Calculator input */}
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">Token 用量计算器</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Model selector */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">选择模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-base w-full cursor-pointer"
            >
              <option value="">-- 选择模型 --</option>
              {allModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Input tokens */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">输入 Token 数</label>
            <input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(e.target.value)}
              placeholder="1000000"
              min="0"
              className="input-base w-full font-mono"
            />
            <div className="flex gap-1 mt-1.5">
              {['10000', '100000', '1000000'].map((v) => (
                <button
                  key={v}
                  onClick={() => setInputTokens(v)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    inputTokens === v
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {parseInt(v) >= 1000000 ? `${parseInt(v) / 1000000}M` : `${parseInt(v) / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Output tokens */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">输出 Token 数</label>
            <input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(e.target.value)}
              placeholder="1000000"
              min="0"
              className="input-base w-full font-mono"
            />
            <div className="flex gap-1 mt-1.5">
              {['10000', '100000', '1000000'].map((v) => (
                <button
                  key={v}
                  onClick={() => setOutputTokens(v)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    outputTokens === v
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {parseInt(v) >= 1000000 ? `${parseInt(v) / 1000000}M` : `${parseInt(v) / 1000}K`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {!selectedModel ? (
        <div className="card-base flex flex-col items-center justify-center py-12 text-center">
          <Calculator className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">选择一个模型开始计算</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400 text-sm">没有中转站提供该模型的定价信息</p>
        </div>
      ) : (
        <div>
          {/* Saving hint */}
          {cheapestSaving > 0 && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-300">
                选择最便宜的中转站可节省 <span className="font-mono font-bold">${cheapestSaving.toFixed(4)}</span>
              </span>
            </div>
          )}

          {/* Results table */}
          <div className="card-base !p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wider p-4 font-medium">排名</th>
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wider p-4 font-medium">中转站</th>
                  <th className="text-right text-xs text-slate-500 uppercase tracking-wider p-4 font-medium">输入费用</th>
                  <th className="text-right text-xs text-slate-500 uppercase tracking-wider p-4 font-medium">输出费用</th>
                  <th className="text-right text-xs text-slate-500 uppercase tracking-wider p-4 font-medium">总费用</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={r.station.slug}
                    className={`border-b border-[#1e293b]/50 hover:bg-slate-800/30 transition-colors ${
                      r.isCheapest ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {i === 0 ? (
                          <ArrowDown className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="w-4 text-center text-sm text-slate-500 font-mono">{i + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/stations/${r.station.slug}`}
                        className="text-sm font-medium text-slate-100 hover:text-blue-400 transition-colors"
                      >
                        {r.station.name}
                      </a>
                    </td>
                    <td className="p-4 text-right text-sm font-mono text-slate-300">
                      ${r.inputCost.toFixed(4)}
                    </td>
                    <td className="p-4 text-right text-sm font-mono text-slate-300">
                      ${r.outputCost.toFixed(4)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-mono font-bold ${r.isCheapest ? 'text-emerald-400' : 'text-blue-400'}`}>
                        ${r.totalCost.toFixed(4)}
                      </span>
                      {r.isCheapest && (
                        <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                          最优
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center">
            费用基于各中转站公示价格计算，实际费用以中转站扣费为准
          </p>
        </div>
      )}
    </div>
  );
}
