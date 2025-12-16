import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ModuleConfig, ModuleId } from '@/types';
import { z } from 'zod';
const moduleConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  priority: z.number(),
});
interface ModuleState {
  modules: Record<ModuleId, ModuleConfig>;
}
interface ModuleActions {
  setModules: (modules: ModuleConfig[]) => void;
  toggleModule: (id: ModuleId) => void;
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
type ModuleStore = History<ModuleState> & ModuleActions;
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
export const useModuleStore = create<ModuleStore>()(
  persist(
    immer(
      temporal((set) => ({
        modules: {} as Record<ModuleId, ModuleConfig>,
        setModules: (modules) => {
          set((state) => {
            const validatedModules = z.array(moduleConfigSchema).safeParse(modules);
            if (!validatedModules.success) return;
            const newModules = validatedModules.data.reduce((acc, module) => {
              const existingModule = state.modules[module.id];
              acc[module.id] = {
                ...module,
                enabled: existingModule?.enabled ?? module.enabled,
              };
              return acc;
            }, {} as Record<ModuleId, ModuleConfig>);
            state.modules = newModules;
          });
        },
        toggleModule: (id) => {
          set((state) => {
            if (state.modules[id]) {
              state.modules[id].enabled = !state.modules[id].enabled;
            }
          });
        },
      }))
    ),
    {
      name: 'lv-module-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        present: {
          modules: Object.fromEntries(
            Object.entries(state.present.modules).map(([id, config]) => [id, { enabled: config.enabled }])
          ),
        },
      }),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState };
        if (persistedState && persistedState.present && persistedState.present.modules) {
          for (const id in merged.present.modules) {
            if (persistedState.present.modules[id]) {
              merged.present.modules[id].enabled = persistedState.present.modules[id].enabled;
            }
          }
        }
        return merged;
      },
    }
  )
);