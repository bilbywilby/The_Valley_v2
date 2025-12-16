import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { z } from 'zod';
type Density = 'full' | 'compact';
type ViewMode = 'all' | 'favorites';
type VelocityWindow = 1 | 6 | 24;
export interface FeedState {
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: ViewMode;
  favorites: Set<string>;
  density: Density;
  velocityWindow: VelocityWindow;
  savedQueries: any[]; // Simplified for this phase
}
const searchQuerySchema = z.string().max(100, "Search query is too long");
export interface FeedActions {
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (id: string) => void;
  setDensity: (density: Density) => void;
  setVelocityWindow: (window: VelocityWindow) => void;
  saveCurrentQuery: () => void;
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
  velocityWindow: 24,
  savedQueries: [],
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
      setVelocityWindow: (window) => set((state) => {
        state.past.push(state.present);
        state.present.velocityWindow = window;
        state.future = [];
      }),
      saveCurrentQuery: () => {
        const { searchQuery, selectedCategory, velocityWindow } = get().present;
        const newQuery = { searchQuery, selectedCategory, velocityWindow, id: Date.now().toString() };
        set(state => {
            state.past.push(state.present);
            state.present.savedQueries.push(newQuery);
            state.future = [];
        });
        // In a real app, you'd also POST this to /api/query/save
      },
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
          if (value instanceof Set) {
            return Array.from(value);
          }
          return value;
        },
        reviver: (key, value) => {
          if (key === 'favorites' && Array.isArray(value)) {
            return new Set(value);
          }
          return value;
        },
      }),
      partialize: (state) => ({
        present: {
          ...state.present,
          favorites: state.present.favorites,
        },
      }),
      merge: (persisted, current) => {
        const merged = { ...current };
        const p = persisted as Partial<FeedStore>;
        if (p?.present) {
            merged.present.favorites = p.present.favorites ?? new Set();
            merged.present.density = p.present.density ?? 'full';
            merged.present.velocityWindow = p.present.velocityWindow ?? 24;
            merged.present.savedQueries = p.present.savedQueries ?? [];
        }
        return merged;
      },
    }
  )
);