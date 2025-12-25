import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import CompactServerItem from '../components/CompactServerItem';

export default function Favorites() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);

  const loadData = useCallback(async () => {
    const favs = await window.api.getFavorites();
    setFavorites(favs || []);
  }, []);

  useEffect(() => {
    loadData();
    const removeListener = window.api.onServerUpdate(() => loadData());
    return () => removeListener && removeListener();
  }, [loadData]);

  const handleStart = async (path) => {
    try {
      await window.api.startServer(path);
      // No need to reload active servers here as we don't display them differently
      // But we might want to if we wanted to show status. 
      // The requirement says "same service item display style as history".
      // History uses CompactServerItem which shows Start button.
      // If it's already running, History/Compact currently just shows Start button (and maybe does nothing or restarts?).
      // The user didn't ask to show running status in Favorites, just "same style as history".
      // So we stick to CompactServerItem.
    } catch (err) {
      alert('Failed to start server: ' + err.message);
    }
  };

  const handleToggleFavorite = async (root, favorite) => {
    await window.api.updateMeta(root, { favorite });
    loadData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">{t('favorites')}</h2>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 text-gray-400 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Star size={28} className="opacity-50" />
          </div>
          <p className="text-base font-medium mb-1">{t('noFavorites')}</p>
          <p className="text-sm text-gray-400">{t('emptyFavoritesHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {favorites.map((item) => (
            <CompactServerItem
              key={item.root}
              server={{ ...item }}
              onStart={handleStart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
