import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';

const STORAGE_KEY = 'ai-hub-favorites';

function getFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // ignore
  }
}

interface Props {
  slug: string;
  className?: string;
}

export function FavoriteToggle({ slug, className = '' }: Props) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(getFavorites().includes(slug));
  }, [slug]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favs = getFavorites();
    const next = favs.includes(slug)
      ? favs.filter((s) => s !== slug)
      : [...favs, slug];
    saveFavorites(next);
    setIsFav(next.includes(slug));
  }, [slug]);

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
        isFav
          ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
          : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
      } ${className}`}
      title={isFav ? '取消收藏' : '收藏'}
    >
      <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  return { favorites, refresh };
}
