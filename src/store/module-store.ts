import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ModuleConfig, ModuleId } from '@/types';
interface ModuleState {
  modules: Record<ModuleId, ModuleConfig>;
  setModules: (modules: ModuleConfig[]) => void;
  toggleModule: (id: ModuleId) => void;
}
export const useModuleStore = create<ModuleState>()(
  persist(
    immer((set) => ({
      modules: {} as Record<ModuleId, ModuleConfig>,
      setModules: (modules) => {
        set((state) => {
          const newModules = modules.reduce((acc, module) => {
            // Preserve existing enabled state if module already exists
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
    })),
    {
      name: 'lv-module-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the enabled status of each module
      partialize: (state) => ({
        modules: Object.fromEntries(
          Object.entries(state.modules).map(([id, config]) => [id, { enabled: config.enabled }])
        ),
      }),
    }
  )
);
// Selector to get an array of enabled module IDs (lowercase categories)
export const useEnabledModuleIds = () => {
  return useModuleStore((state) =>
    Object.values(state.modules)
      .filter((m) => m.enabled)
      .map((m) => m.id)
  );
};
// Selector to get an array of enabled module names (title case categories)
export const useEnabledModuleNames = () => {
    return useModuleStore((state) =>
      Object.values(state.modules)
        .filter((m) => m.enabled)
        .map((m) => m.name)
    );
  };