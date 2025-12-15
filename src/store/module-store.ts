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
          state.modules = modules.reduce((acc, module) => {
            acc[module.id] = module;
            return acc;
          }, {} as Record<ModuleId, ModuleConfig>);
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
    }
  )
);