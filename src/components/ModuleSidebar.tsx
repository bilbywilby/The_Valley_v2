import { LayoutGrid, MapPin } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useModuleStore } from '@/store/module-store';
import { GeoTag } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
async function fetchAllGeo(): Promise<GeoTag[]> {
    return api('/api/geo/all');
}
function drawPins(ctx: CanvasRenderingContext2D, geoData: GeoTag[], width: number, height: number, hoverPin: GeoTag | null) {
    ctx.clearRect(0, 0, width, height);
    const minLon = -75.8, maxLon = -75.2, minLat = 40.45, maxLat = 40.75;
    geoData.forEach(geo => {
      if (geo.lat === undefined || geo.lon === undefined) return;
      const x = ((geo.lon - minLon) / (maxLon - minLon)) * width;
      const y = ((maxLat - geo.lat) / (maxLat - minLat)) * height;
      let color = 'rgba(239, 68, 68, 0.7)'; // Red < 0.4
      if (geo.confidence > 0.7) color = 'rgba(34, 197, 94, 0.7)'; // Green > 0.7
      else if (geo.confidence >= 0.4) color = 'rgba(59, 130, 246, 0.7)'; // Blue >= 0.4
      const isHovered = hoverPin?.id === geo.id;
      const radius = (2 + geo.confidence * 4) * (isHovered ? 1.5 : 1);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
    });
}
function SidebarContent() {
  const modules = useModuleStore(useShallow(s => s.present.modules));
  const toggleModule = useModuleStore(s => s.toggleModule);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: geoData = [] } = useQuery({ queryKey: ['geoData'], queryFn: fetchAllGeo });
  const [hoverPin, setHoverPin] = useState<GeoTag | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
            drawPins(ctx, geoData, width, height, hoverPin);
        }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [geoData, hoverPin]);
  const moduleList = useMemo(() =>
    Object.values(modules).sort((a, b) => a.name.localeCompare(b.name))
  , [modules]);
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          className="p-4 space-y-1 motion-reduce:transition-none"
        >
          {moduleList.map((module) => (
            <motion.div
              key={module.id}
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
            >
              <label htmlFor={`module-${module.id}`} className="text-sm font-medium cursor-pointer pr-2">
                {module.name}
              </label>
              <Switch
                id={`module-${module.id}`}
                checked={module.enabled}
                onCheckedChange={() => toggleModule(module.id)}
                aria-label={`Toggle ${module.name} module`}
                aria-expanded={module.enabled}
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Geospatial Overlay Pins</h3>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="aspect-video w-full bg-muted rounded-md center text-xs text-muted-foreground overflow-hidden motion-reduce:animate-none">
                        <canvas ref={canvasRef} className="bg-slate-200/20 dark:bg-slate-900/50 w-full h-full" title="Geospatial intelligence pins for civic dashboard calibration (Green=High Confidence, Blue=Medium, Red=Low)." />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Civic geospatial intelligence overlay visualization.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
export function ModuleSidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  if (isMobile) {
    return (
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 p-3"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span>Civic Intelligence Modules</span>
              </SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background hidden lg:flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <span>Civic Intelligence Modules</span>
        </h2>
      </div>
      <SidebarContent />
    </aside>
  );
}