import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { z } from 'zod';
/** Represents the display density of the feed list. */
type Density = 'full' | 'compact';
/** Represents the current view mode, either all feeds or only favorites. */
type ViewMode = 'all' | 'favorites';
/** Represents the time window for calculating data velocity in hours. */
type VelocityWindow = 1 | 6 | 24;
/**
 * Represents the state of the feed view, including search, filters, and user preferences.
 */
export interface FeedState {
  /** The current text in the search input field. */
  searchQuery: string;
  /** The currently selected category for filtering, or null for all categories. */
  selectedCategory: string | null;
  /** The current view mode ('all' or 'favorites'). */
  viewMode: ViewMode;
  /** A Set containing the IDs of favorited feed items. */
  favorites: Set<string>;
  /** The display density for feed cards. */
  density: Density;
  /** The time window for velocity calculations. */
  velocityWindow: VelocityWindow;
  /** A list of user-saved queries. */
  savedQueries: any[]; // Simplified for this phase
}
/** Zod schema for validating the search query to prevent overly long inputs. */
const searchQuerySchema = z.string().max(100, "Search query is too long");
/**
 * Defines the actions available to modify the feed state.
 */
export interface FeedActions {
  /** Sets the search query text, with history tracking. */
  setSearchQuery: (query: string) => void;
  /** Sets the selected category for filtering, with history tracking. */
  setSelectedCategory: (category: string | null) => void;
  /** Sets the view mode, with history tracking. */
  setViewMode: (mode: ViewMode) => void;
  /** Toggles the favorite status of a feed item, with history tracking. */
  toggleFavorite: (id: string) => void;
  /** Sets the display density, with history tracking. */
  setDensity: (density: Density) => void;
  /** Sets the velocity time window, with history tracking. */
  setVelocityWindow: (window: VelocityWindow) => void;
  /** Saves the current search and filter settings as a new query. */
  saveCurrentQuery: () => void;
  /** Reverts to the previous state in the history. */
  undo: () => void;
  /** Moves forward to the next state in the history. */
  redo: () => void;
}
/** Represents a snapshot of the store's state for undo/redo functionality. */
interface History<T> {
  past: T[];
  present: T;
  future: T[];
}
/** The complete type for the feed store, including state, actions, and history. */
export type FeedStore = History<FeedState> & FeedActions;
/** The initial state of the feed store. */
const initialState: FeedState = {
  searchQuery: '',
  selectedCategory: null,
  viewMode: 'all',
  favorites: new Set<string>(),
  density: 'full',
  velocityWindow: 24,
  savedQueries: [],
};
/**
 * Zustand store for managing the state of the feed index UI.
 * Includes undo/redo history and persists state to localStorage.
 */
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