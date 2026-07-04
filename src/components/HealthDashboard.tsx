import { useState, useEffect, useCallback, useRef } from 'react';
import type { Station } from '../types/station';
import { Activity, CheckCircle, XCircle, Clock, Loader, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  stations: Station[];
}

interface HealthResult {
  slug: string;
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  responseTime: number | null;
  checkedAt: string | null;
  error?: string;
}

export default function HealthDashboard({ stations }: Props) {
  const [results, setResults] = useState<HealthResult[]>(
    stations.map((s) => ({
      slug: s.slug,
      name: s.name,
      url: s.url,
      status: 'checking' as const,
      responseTime: null,
      checkedAt: null,
    }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckAll, setLastCheckAll] = useState<string | null>(null);

  const checkOne = useCallback(async (station: Station): Promise<HealthResult> => {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`/api/health-check?url=${encodeURIComponent(station.url)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const elapsed = Math.round(performance.now() - start);
      const data = await res.json();
      return {
        slug: station.slug,
        name: station.name,
        url: station.url,
        status: data.ok ? 'online' : 'offline',
        responseTime: data.responseTime ?? elapsed,
        checkedAt: new Date().toLocaleTimeString('zh-CN'),
        error: data.ok ? undefined : data.error,
      };
    } catch (err) {
      return {
        slug: station.slug,
        name: station.name,
        url: station.url,
        status: 'error',
        responseTime: null,
        checkedAt: new Date().toLocaleTimeString('zh-CN'),
        error: err instanceof Error ? err.message : '请求失败',
      };
    }
  }, []);

  const checkAll = useCallback(async () => {
    setIsChecking(true);
    setResults((prev) => prev.map((r) => ({ ...r, status: 'checking' as const })));

    // Check sequentially to avoid overwhelming
    const newResults: HealthResult[] = [];
    for (const station of stations) {
      const result = await checkOne(station);
      newResults.push(result);
      setResults((prev) =>
        prev.map((r) => (r.slug === station.slug ? result : r))
      );
    }

    setLastCheckAll(new Date().toLocaleString('zh-CN'));
    setIsChecking(false);
  }, [stations, checkOne]);

  // Auto-check on mount
  useEffect(() => {
    checkAll();
  }, []);

  const onlineCount = results.filter((r) => r.status === 'online').length;
  const offlineCount = results.filter((r) => r.status === 'offline').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const avgResponse = results.filter((r) => r.responseTime !== null).length > 0
    ? Math.round(
        results.filter((r) => r.responseTime !== null).reduce((sum, r) => sum + (r.responseTime ?? 0), 0) /
        results.filter((r) => r.responseTime !== null).length
      )
    : null;

  const getStatusIcon = (status: HealthResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'online':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusLabel = (status: HealthResult['status']) => {
    switch (status) {
      case 'checking': return '检测中';
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'error': return '异常';
    }
  };

  const getStatusColor = (status: HealthResult['status']) => {
    switch (status) {
      case 'checking': return 'text-blue-400';
      case 'online': return 'text-emerald-400';
      case 'offline': return 'text-red-400';
      case 'error': return 'text-amber-400';
    }
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card-base !p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">在线</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">{onlineCount}</div>
        </div>
        <div className="card-base !p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">离线</div>
          <div className="text-lg font-bold text-red-400 font-mono">{offlineCount}</div>
        </div>
        <div className="card-base !p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">异常</div>
          <div className="text-lg font-bold text-amber-400 font-mono">{errorCount}</div>
        </div>
        <div className="card-base !p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">平均响应</div>
          <div className="text-lg font-bold text-blue-400 font-mono">
            {avgResponse !== null ? `${avgResponse}ms` : '-'}
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-500">
          {lastCheckAll && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              上次检测: {lastCheckAll}
            </span>
          )}
        </div>
        <button
          onClick={checkAll}
          disabled={isChecking}
          className="btn-ghost !py-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? '检测中...' : '重新检测'}
        </button>
      </div>

      {/* Results grid */}
      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.slug} className="card-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <a
                    href={`/stations/${result.slug}`}
                    className="text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors"
                  >
                    {result.name}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${getStatusColor(result.status)}`}>
                      {getStatusLabel(result.status)}
                    </span>
                    {result.responseTime !== null && (
                      <span className="text-xs text-slate-500 font-mono">
                        {result.responseTime}ms
                      </span>
                    )}
                    {result.checkedAt && (
                      <span className="text-xs text-slate-600">
                        {result.checkedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {result.error && (
                  <span className="text-xs text-amber-400 hidden sm:inline">{result.error}</span>
                )}
                <a
                  href={result.url}
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
      </div>

      <p className="text-xs text-slate-500 text-center mt-6">
        检测方式为客户端 CORS 请求目标站点首页，部分站点可能因 CORS 策略限制显示异常
      </p>
    </div>
  );
}
