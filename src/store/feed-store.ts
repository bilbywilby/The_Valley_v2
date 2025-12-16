import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { z } from 'zod';
type Density = 'full' | 'compact';
type ViewMode = 'all' | 'favorites';
interface FeedState {
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: ViewMode;
  favorites: Set<string>;
  density: Density;
}
const searchQuerySchema = z.string().max(100, "Search query is too long");
interface FeedActions {
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setDensity: (density: Density) => void;
}
interface History<T> {
  past: T[];
  present: T;
  future: T[];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
type FeedStore = History<FeedState> & FeedActions;
const temporal = <T extends object>(config: (set: (fn: (state: T) => void) => void, get: () => History<T>) => T) => (
  set: (fn: (state: History<T>) => void) => void,
  get: () => History<T>
): History<T> & T => {
  const present = config(
    (fn) => {
      set((state) => {
        const newPresent = { ...state.present };
        fn(newPresent);
        state.past.push(state.present);
        state.present = newPresent;
        state.future = [];
      });
    },
    get
  );
  return {
    past: [],
    present,
    future: [],
    undo: () => {
      set((state) => {
        if (state.past.length > 0) {
          const newPast = [...state.past];
          const newPresent = newPast.pop()!;
          state.future.unshift(state.present);
          state.present = newPresent;
          state.past = newPast;
        }
      });
    },
    redo: () => {
      set((state) => {
        if (state.future.length > 0) {
          const newFuture = [...state.future];
          const newPresent = newFuture.shift()!;
          state.past.push(state.present);
          state.present = newPresent;
          state.future = newFuture;
        }
      });
    },
    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
    ...present,
  };
};
export const useFeedStore = create<FeedStore>()(
  persist(
    immer(
      temporal((set, get) => ({
        searchQuery: '',
        selectedCategory: null,
        viewMode: 'all',
        favorites: new Set<string>(),
        density: 'full',
        setSearchQuery: (query) => {
          if (searchQuerySchema.safeParse(query).success) {
            set(state => { state.searchQuery = query; });
          }
        },
        setSelectedCategory: (category) => set(state => { state.selectedCategory = category; }),
        setViewMode: (mode) => set(state => { state.viewMode = mode; }),
        toggleFavorite: (id) => {
          set(state => {
            const newFavorites = new Set(state.favorites);
            if (newFavorites.has(id)) newFavorites.delete(id);
            else newFavorites.add(id);
            state.favorites = newFavorites;
          });
        },
        isFavorite: (id) => get().present.favorites.has(id),
        setDensity: (density) => set(state => { state.density = density; }),
      }))
    ),
    {
      name: 'lv-feed-index-storage',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (key === 'present' && value.favorites) {
            return { ...value, favorites: Array.from(value.favorites as Set<string>) };
          }
          return value;
        },
        reviver: (key, value) => {
          if (key === 'present' && value.favorites) {
            return { ...value, favorites: new Set(value.favorites as string[]) };
          }
          return value;
        },
      }),
      partialize: (state) => ({ present: { favorites: state.present.favorites, density: state.present.density } }),
    }
  )
);