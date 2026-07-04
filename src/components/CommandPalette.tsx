import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Station } from '../types/station';
import { extractAllModels } from '../utils/stations';
import { Command, Search, ArrowRight, Zap, BarChart3, Calculator, TrendingDown, Heart, Activity } from 'lucide-react';

interface Props {
  stations: Station[];
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export default function CommandPalette({ stations }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allModels = useMemo(() => extractAllModels(stations), [stations]);

  const items = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = [
      { id: 'home', label: '首页', description: '浏览所有中转站', icon: <Zap className="w-4 h-4" />, action: () => navigate('/'), category: '页面' },
      { id: 'compare', label: '对比', description: '中转站对比', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/compare'), category: '页面' },
      { id: 'calculator', label: '用量计算器', description: 'Token 用量费用计算', icon: <Calculator className="w-4 h-4" />, action: () => navigate('/calculator'), category: '页面' },
      { id: 'best-price', label: '最优价查找', description: '跨站价格对比', icon: <TrendingDown className="w-4 h-4" />, action: () => navigate('/best-price'), category: '页面' },
      { id: 'favorites', label: '我的收藏', description: '收藏的中转站', icon: <Heart className="w-4 h-4" />, action: () => navigate('/favorites'), category: '页面' },
      { id: 'health', label: '健康监控', description: '中转站可用状态', icon: <Activity className="w-4 h-4" />, action: () => navigate('/health'), category: '页面' },
      { id: 'cardshops', label: '卡网汇总', description: 'AI 卡网信息聚合', icon: <Zap className="w-4 h-4" />, action: () => navigate('/cardshops'), category: '页面' },
      { id: 'report', label: '上报中转站', description: '提交新的中转站信息', icon: <Zap className="w-4 h-4" />, action: () => navigate('/report'), category: '页面' },
      { id: 'about', label: '关于', description: '关于 AI Hub', icon: <Zap className="w-4 h-4" />, action: () => navigate('/about'), category: '页面' },
    ];

    const stationItems: CommandItem[] = stations.map((s) => ({
      id: `station-${s.slug}`,
      label: s.name,
      description: s.description.slice(0, 40) + '...',
      icon: <ArrowRight className="w-4 h-4" />,
      action: () => navigate(`/stations/${s.slug}`),
      category: '中转站',
    }));

    const modelItems: CommandItem[] = allModels.map((m) => ({
      id: `model-${m}`,
      label: m,
      description: '查看定价信息',
      icon: <Search className="w-4 h-4" />,
      action: () => navigate(`/best-price?model=${encodeURIComponent(m)}`),
      category: '模型',
    }));

    return [...pages, ...stationItems, ...modelItems];
  }, [stations, allModels]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 12);
    const q = query.toLowerCase();
    return items
      .filter((item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [items, query]);

  const navigate = useCallback((url: string) => {
    setIsOpen(false);
    setQuery('');
    window.location.href = url;
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setActiveIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      filtered[activeIndex].action();
    }
  };

  if (!isOpen) return null;

  // Group by category
  const grouped: Record<string, CommandItem[]> = {};
  for (const item of filtered) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative mx-auto mt-[15vh] max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-surface border border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e293b]">
            <Command className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索页面、中转站、模型..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                没有匹配的结果
              </div>
            ) : (
              Object.entries(grouped).map(([category, catItems]) => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-xs text-slate-500 font-medium">{category}</div>
                  {catItems.map((item) => {
                    const idx = globalIdx++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.action()}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          idx === activeIndex ? 'bg-blue-500/10 text-slate-100' : 'text-slate-300'
                        }`}
                      >
                        <span className={`${idx === activeIndex ? 'text-blue-400' : 'text-slate-500'}`}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-slate-500 truncate">{item.description}</div>
                          )}
                        </div>
                        {idx === activeIndex && (
                          <kbd className="text-xs text-slate-600 font-mono">↵</kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#1e293b] text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↑↓</kbd>
                导航
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↵</kbd>
                选择
              </span>
            </div>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">Cmd+K</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
