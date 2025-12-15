import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { FeedState } from '@/types';
export const useFeedStore = create<FeedState>()(
  persist(
    immer((set, get) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      selectedCategory: null,
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      viewMode: 'all',
      setViewMode: (mode) => set({ viewMode: mode }),
      favorites: new Set<string>(),
      toggleFavorite: (id) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          state.favorites = newFavorites;
        });
      },
      isFavorite: (id) => get().favorites.has(id),
    })),
    {
      name: 'lv-feed-index-storage',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (key === 'favorites') {
            return Array.from(value as Set<string>);
          }
          return value;
        },
        reviver: (key, value) => {
          if (key === 'favorites') {
            return new Set(value as string[]);
          }
          return value;
        },
      }),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);