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
export interface ModuleState {
  modules: Record<ModuleId, ModuleConfig>;
}
export interface ModuleActions {
  setModules: (modules: ModuleConfig[]) => void;
  toggleModule: (id: ModuleId) => void;
  undo: () => void;
  redo: () => void;
}
interface History<T> {
  past: T[];
  present: T;
  future: T[];
}
export type ModuleStore = History<ModuleState> & ModuleActions;
const initialState: ModuleState = {
  modules: {},
};
export const useModuleStore = create<ModuleStore>()(
  persist(
    immer((set) => ({
      past: [],
      present: initialState,
      future: [],
      setModules: (modules) => {
        const validatedModules = z.array(moduleConfigSchema).safeParse(modules);
        if (!validatedModules.success) return;
        set((state) => {
          state.past.push(state.present);
          const newModules = validatedModules.data.reduce((acc, module) => {
            const existingModule = state.present.modules[module.id];
            acc[module.id] = {
              ...module,
              enabled: existingModule?.enabled ?? module.enabled,
            };
            return acc;
          }, {} as Record<ModuleId, ModuleConfig>);
          state.present.modules = newModules;
          state.future = [];
        });
      },
      toggleModule: (id) => {
        set((state) => {
          if (state.present.modules[id]) {
            state.past.push(state.present);
            // Create a new object for the changed module to ensure immer detects the change
            const newModule = { ...state.present.modules[id], enabled: !state.present.modules[id].enabled };
            state.present.modules = { ...state.present.modules, [id]: newModule };
            state.future = [];
          }
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
      name: 'lv-module-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        present: {
          modules: Object.fromEntries(
            Object.entries(state.present.modules).map(([id, config]) => [id, { id: config.id, name: config.name, enabled: config.enabled, priority: config.priority }])
          ),
        },
      }),
      merge: (persisted, current) => {
        const merged = { ...current };
        const p = persisted as Partial<ModuleStore>;
        if (p?.present?.modules) {
          for (const id in merged.present.modules) {
            if (p.present.modules[id]) {
              merged.present.modules[id].enabled = p.present.modules[id].enabled;
            }
          }
        }
        return merged;
      },
    }
  )
);