import { LayoutGrid, MapPin, Settings, BarChart2 } from 'lucide-react';
import { useModuleStore } from '@/store/module-store';
import { ModuleConfig, ModuleId, GeoTag } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useEffect, useRef } from 'react';
async function fetchModuleConfig(): Promise<ModuleConfig[]> {
  return api('/api/modules/config');
}
async function fetchAllGeo(): Promise<GeoTag[]> {
    return api('/api/geo/all');
}
function drawPins(ctx: CanvasRenderingContext2D, geoData: GeoTag[], width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
    // Bounding box for Lehigh Valley area (approx)
    const minLon = -75.8;
    const maxLon = -75.2;
    const minLat = 40.45;
    const maxLat = 40.75;
    geoData.forEach(geo => {
      if (geo.lat === undefined || geo.lon === undefined) return;
      // Normalize coordinates to canvas dimensions
      const x = ((geo.lon - minLon) / (maxLon - minLon)) * width;
      const y = ((maxLat - geo.lat) / (maxLat - minLat)) * height; // Invert Y-axis
      // Determine color and size based on confidence
      let color = 'rgba(239, 68, 68, 0.7)'; // Red for low confidence
      if (geo.confidence > 0.7) {
        color = 'rgba(34, 197, 94, 0.7)'; // Green for high
      } else if (geo.confidence >= 0.4) {
        color = 'rgba(59, 130, 246, 0.7)'; // Blue for medium
      }
      const radius = 2 + geo.confidence * 4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
    });
}
export function ModuleSidebar() {
  const modules = useModuleStore(s => s.modules);
  const setModules = useModuleStore(s => s.setModules);
  const toggleModule = useModuleStore(s => s.toggleModule);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: initialModules, isLoading: isLoadingModules } = useQuery({
    queryKey: ['moduleConfig'],
    queryFn: fetchModuleConfig,
    staleTime: Infinity,
  });
  const { data: geoData = [] } = useQuery({
    queryKey: ['geoData'],
    queryFn: fetchAllGeo,
  });
  useEffect(() => {
    if (initialModules && Object.keys(modules).length === 0) {
      setModules(initialModules);
    }
  }, [initialModules, modules, setModules]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawPins(ctx, geoData, canvas.width, canvas.height);
      }
    }
  }, [geoData]);
  const moduleList = Object.values(modules).sort((a, b) => b.priority - a.priority);
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background hidden lg:flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <span>Dashboard Modules</span>
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {isLoadingModules && <p className="text-sm text-muted-foreground px-2">Loading modules...</p>}
          {moduleList.map((module) => (
            <div key={module.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
              <label htmlFor={`module-${module.id}`} className="text-sm font-medium cursor-pointer">
                {module.name}
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{module.priority}</Badge>
                <Switch
                  id={`module-${module.id}`}
                  checked={module.enabled}
                  onCheckedChange={() => toggleModule(module.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Geo Pins</h3>
        <div className="aspect-video w-full bg-muted rounded-md center text-xs text-muted-foreground overflow-hidden">
          <canvas ref={canvasRef} width="220" height="124" className="bg-slate-800/20 dark:bg-slate-900/50" />
        </div>
      </div>
      <Separator />
      <div className="p-2 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-1">
                <BarChart2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Impact Ranking</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-1">
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