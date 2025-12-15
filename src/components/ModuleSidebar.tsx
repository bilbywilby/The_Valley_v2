import { LayoutGrid, MapPin, Settings } from 'lucide-react';
import { useModuleStore } from '@/store/module-store';
import { ModuleConfig, ModuleId } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useEffect } from 'react';
async function fetchModuleConfig(): Promise<ModuleConfig[]> {
  return api('/api/modules/config');
}
export function ModuleSidebar() {
  const modules = useModuleStore(s => s.modules);
  const setModules = useModuleStore(s => s.setModules);
  const toggleModule = useModuleStore(s => s.toggleModule);
  const { data: initialModules, isLoading } = useQuery({
    queryKey: ['moduleConfig'],
    queryFn: fetchModuleConfig,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (initialModules && Object.keys(modules).length === 0) {
      setModules(initialModules);
    }
  }, [initialModules, modules, setModules]);
  const moduleList = Object.values(modules);
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background hidden lg:flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <span>Dashboard Modules</span>
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading modules...</p>}
          {moduleList.map((module) => (
            <div key={module.id} className="flex items-center justify-between">
              <label htmlFor={`module-${module.id}`} className="text-sm font-medium">
                {module.name}
              </label>
              <Switch
                id={`module-${module.id}`}
                checked={module.enabled}
                onCheckedChange={() => toggleModule(module.id)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Geo Pins</h3>
        <div className="aspect-video w-full bg-muted rounded-md center text-xs text-muted-foreground">
          Geo-visualization canvas
        </div>
      </div>
      <Separator />
      <div className="p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full">
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}