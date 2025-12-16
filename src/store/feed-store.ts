import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { z } from 'zod';
type Density = 'full' | 'compact';
type ViewMode = 'all' | 'favorites';
export interface FeedState {
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: ViewMode;
  favorites: Set<string>;
  density: Density;
}
const searchQuerySchema = z.string().max(100, "Search query is too long");
export interface FeedActions {
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (id: string) => void;
  setDensity: (density: Density) => void;
  undo: () => void;
  redo: () => void;
}
interface History<T> {
  past: T[];
  present: T;
  future: T[];
}
export type FeedStore = History<FeedState> & FeedActions;
const initialState: FeedState = {
  searchQuery: '',
  selectedCategory: null,
  viewMode: 'all',
  favorites: new Set<string>(),
  density: 'full',
};
export const useFeedStore = create<FeedStore>()(
  persist(
    immer((set, get) => ({
      past: [],
      present: initialState,
      future: [],
      setSearchQuery: (query) => {
        if (!searchQuerySchema.safeParse(query).success) return;
        set((state) => {
          state.past.push(state.present);
          state.present.searchQuery = query;
          state.future = [];
        });
      },
      setSelectedCategory: (category) => set((state) => {
        state.past.push(state.present);
        state.present.selectedCategory = category;
        state.future = [];
      }),
      setViewMode: (mode) => set((state) => {
        state.past.push(state.present);
        state.present.viewMode = mode;
        state.future = [];
      }),
      toggleFavorite: (id) => set((state) => {
        state.past.push(state.present);
        const newFavorites = new Set(state.present.favorites);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        state.present.favorites = newFavorites;
        state.future = [];
      }),
      setDensity: (density) => set((state) => {
        state.past.push(state.present);
        state.present.density = density;
        state.future = [];
      }),
      undo: () => set((state) => {
        if (state.past.length > 0) {
          const newPast = [...state.past];
          const newPresent = newPast.pop()!;
          state.future.unshift(state.present);
          state.present = newPresent;
          state.past = newPast;
        }
      }),
      redo: () => set((state) => {
        if (state.future.length > 0) {
          const newFuture = [...state.future];
          const newPresent = newFuture.shift()!;
          state.past.push(state.present);
          state.present = newPresent;
          state.future = newFuture;
        }
      }),
    })),
    {
      name: 'lv-feed-index-storage',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (key === 'present' && value instanceof Object && 'favorites' in value) {
            const present = value as FeedState;
            return { ...present, favorites: Array.from(present.favorites) };
          }
          return value;
        },
        reviver: (key, value) => {
          if (key === 'present' && value instanceof Object && 'favorites' in value) {
            const present = value as Omit<FeedState, 'favorites'> & { favorites: string[] };
            return { ...present, favorites: new Set(present.favorites) };
          }
          return value;
        },
      }),
      partialize: (state) => ({
        present: {
          favorites: state.present.favorites,
          density: state.present.density,
        },
      }),
      merge: (persisted, current) => {
        const merged = { ...current };
        const p = persisted as Partial<FeedStore>;
        if (p?.present) {
            merged.present.favorites = p.present.favorites ?? new Set();
            merged.present.density = p.present.density ?? 'full';
        }
        return merged;
      },
    }
  )
);