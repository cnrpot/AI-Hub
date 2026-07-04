import { useState, useMemo } from 'react';
import type { Station } from '../types/station';
import { formatPrice } from '../utils/stations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

interface Props {
  stations: Station[];
  history: PriceSnapshot[];
}

interface PriceSnapshot {
  date: string;
  data: Record<string, Record<string, { input: number; output: number }>>;
}

export default function PriceHistoryChart({ stations, history }: Props) {
  const allModels = useMemo(() => {
    const models = new Set<string>();
    stations.forEach((s) => s.models.forEach((m) => models.add(m)));
    return Array.from(models).sort();
  }, [stations]);

  const [selectedModel, setSelectedModel] = useState(allModels[0] || '');

  const chartData = useMemo(() => {
    if (!selectedModel || history.length === 0) return [];

    return history.map((snapshot) => {
      const point: Record<string, number | string> = { date: snapshot.date };
      for (const station of stations) {
        const pricing = snapshot.data[station.slug]?.[selectedModel];
        if (pricing) {
          point[station.slug] = Math.round((pricing.input + pricing.output) * 10000) / 10000;
        }
      }
      return point;
    });
  }, [selectedModel, history, stations]);

  const stationColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  ];

  const availableStations = useMemo(() => {
    if (chartData.length === 0) return [];
    const lastPoint = chartData[chartData.length - 1];
    return stations.filter((s) => lastPoint[s.slug] !== undefined);
  }, [chartData, stations]);

  return (
    <div>
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">价格历史趋势</h2>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1.5">选择模型</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="input-base max-w-xs cursor-pointer"
          >
            {allModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Info className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm">暂无该模型的历史价格数据</p>
            <p className="text-slate-500 text-xs mt-1">价格数据会随时间自动积累</p>
          </div>
        ) : (
          <div>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickFormatter={(v) => `$${v}`}
                    label={{
                      value: '每 1M tokens (USD)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#64748b', fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`$${value.toFixed(4)}`, '']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => {
                      const station = availableStations.find((s) => s.slug === value);
                      return <span style={{ color: '#94a3b8' }}>{station?.name || value}</span>;
                    }}
                  />
                  {availableStations.map((station, i) => (
                    <Line
                      key={station.slug}
                      type="monotone"
                      dataKey={station.slug}
                      stroke={stationColors[i % stationColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1e293b]">
              <div className="flex flex-wrap gap-3">
                {availableStations.map((station, i) => {
                  const lastPoint = chartData[chartData.length - 1];
                  const price = lastPoint[station.slug] as number;
                  return (
                    <div key={station.slug} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stationColors[i % stationColors.length] }}
                      />
                      <span className="text-slate-400">{station.name}</span>
                      <span className="font-mono text-slate-300">{formatPrice(price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center">
        价格单位为每 1M tokens 的输入 + 输出总价 (USD)
      </p>
    </div>
  );
}
