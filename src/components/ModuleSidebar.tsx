import { LayoutGrid, MapPin, Menu, Car, Landmark, Search, ShoppingBag, Calendar, Users, Droplets } from 'lucide-react';
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
import { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { CanvasPins } from './CanvasPins';
import { CommuteOverlay } from './CommuteOverlay';
import { GovWatchSearch } from './GovWatchSearch';
import { CivicMapOverlay } from './CivicMapOverlay';
import { HousingPulseOverlay } from './HousingPulseOverlay';
import { ValleyMarketOverlay } from './ValleyMarketOverlay';
import { UnifiedEventsOverlay } from './UnifiedEventsOverlay';
import { RepFinderSheet } from './RepFinderSheet';
import { ElementsView } from './ElementsView';
async function fetchAllGeo(): Promise<GeoTag[]> {
    return api('/api/geo/all');
}
function SidebarContent() {
  const modules = useModuleStore(s => s.present.modules);
  const toggleModule = useModuleStore(s => s.toggleModule);
  const { data: geoData = [] } = useQuery({ queryKey: ['geoData'], queryFn: fetchAllGeo });
  const moduleList = useMemo(() =>
    Object.values(modules).sort((a, b) => a.name.localeCompare(b.name))
  , [modules]);
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Utility Modules</h3>
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Car className="mr-2 h-4 w-4" /> Commute Overlay</Button></SheetTrigger><SheetContent className="w-full sm:w-[480px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Commute Overlay</SheetTitle></SheetHeader><ScrollArea><CommuteOverlay /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Search className="mr-2 h-4 w-4" /> GovWatch Search</Button></SheetTrigger><SheetContent className="w-full sm:w-[480px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>GovWatch Search</SheetTitle></SheetHeader><ScrollArea><GovWatchSearch /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Landmark className="mr-2 h-4 w-4" /> Civic Map</Button></SheetTrigger><SheetContent className="w-full sm:w-[480px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Civic Map Layers</SheetTitle></SheetHeader><ScrollArea><CivicMapOverlay /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><LayoutGrid className="mr-2 h-4 w-4" /> Housing Pulse</Button></SheetTrigger><SheetContent className="w-full sm:w-[520px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Housing Pulse</SheetTitle></SheetHeader><ScrollArea className="p-4"><HousingPulseOverlay /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Droplets className="mr-2 h-4 w-4" /> Elements</Button></SheetTrigger><SheetContent className="w-full sm:w-[640px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Elements Pack</SheetTitle></SheetHeader><ScrollArea><ElementsView /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Users className="mr-2 h-4 w-4" /> My Reps Civic Lookup</Button></SheetTrigger><SheetContent className="w-full sm:w-[520px] p-0 flex flex-col z-[60]"><SheetHeader className="p-4 border-b"><SheetTitle>My Reps Civic Lookup</SheetTitle></SheetHeader><ScrollArea><RepFinderSheet /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><ShoppingBag className="mr-2 h-4 w-4" /> Valley Market</Button></SheetTrigger><SheetContent className="w-full sm:w-[520px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Valley Market</SheetTitle></SheetHeader><ScrollArea className="p-4"><ValleyMarketOverlay /></ScrollArea></SheetContent></Sheet>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start h-11"><Calendar className="mr-2 h-4 w-4" /> Unified Events</Button></SheetTrigger><SheetContent className="w-full sm:w-[520px] p-0 flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Unified Events</SheetTitle></SheetHeader><ScrollArea className="p-4"><UnifiedEventsOverlay /></ScrollArea></SheetContent></Sheet>
            </motion.div>
          </motion.div>
        </div>
        <Separator className="my-2" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          className="p-4 space-y-1 motion-reduce:transition-none"
        >
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Feed Modules</h3>
          {moduleList.map((module) => (
            <motion.div
              key={module.id}
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent motion-reduce:transform-none min-h-[44px]"
            >
              <label htmlFor={`module-${module.id}`} className="text-sm font-medium cursor-pointer pr-2">
                {module.name}
              </label>
              <Switch
                id={`module-${module.id}`}
                checked={module.enabled}
                onCheckedChange={() => toggleModule(module.id)}
                aria-label={`Toggle ${module.name} module`}
                aria-checked={module.enabled}
                role="switch"
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Geospatial Overlay</h3>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="aspect-video w-full bg-muted rounded-md center text-xs text-muted-foreground overflow-hidden motion-reduce:animate-none">
                        <CanvasPins geoData={geoData} title="Geospatial intelligence pins" ariaLabel="Intelligence map of Lehigh Valley" />
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
          <SheetContent side="left" className="w-80 p-0 flex flex-col h-full z-[60]">
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