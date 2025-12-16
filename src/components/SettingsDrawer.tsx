import { Settings, Undo, Redo, ChevronsLeftRight, Trash2, Search, Star, Download, BarChart2, MapPin, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFeedStore } from '@/store/feed-store';
import { useModuleStore } from '@/store/module-store';
import { useMemo } from 'react';
export function SettingsDrawer() {
  const { density, setDensity, undo: undoFeed, redo: redoFeed, canUndo: canUndoFeed, canRedo: canRedoFeed } = useFeedStore(state => ({
    density: state.density,
    setDensity: state.setDensity,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
  }));
  const { modules, toggleModule, undo: undoModule, redo: redoModule, canUndo: canUndoModule, canRedo: canRedoModule } = useModuleStore(state => ({
    modules: state.modules,
    toggleModule: state.toggleModule,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
  }));
  const moduleList = useMemo(() => Object.values(modules).sort((a, b) => b.priority - a.priority), [modules]);
  const topModules = useMemo(() => moduleList.slice(0, 5), [moduleList]);
  const handleClearData = () => {
    localStorage.removeItem('lv-feed-index-storage');
    localStorage.removeItem('lv-module-storage');
    window.location.reload();
  };
  const canUndo = canUndoFeed() || canUndoModule();
  const canRedo = canRedoFeed() || canRedoModule();
  const handleUndo = () => {
    if (canUndoFeed()) undoFeed();
    if (canUndoModule()) undoModule();
  };
  const handleRedo = () => {
    if (canRedoFeed()) redoFeed();
    if (canRedoModule()) redoModule();
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Open Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Settings & Controls
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* History */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">History</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleUndo} disabled={!canUndo} variant="outline" size="sm" className="flex-1">
                  <Undo className="mr-2 h-4 w-4" /> Undo
                </Button>
                <Button onClick={handleRedo} disabled={!canRedo} variant="outline" size="sm" className="flex-1">
                  <Redo className="mr-2 h-4 w-4" /> Redo
                </Button>
              </div>
            </section>
            {/* Display Density */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Display Density</h3>
              <ToggleGroup type="single" value={density} onValueChange={(v) => v && setDensity(v as 'full' | 'compact')} className="w-full">
                <ToggleGroupItem value="full" aria-label="Full density" className="flex-1">Full</ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact density" className="flex-1">Compact</ToggleGroupItem>
              </ToggleGroup>
            </section>
            {/* Top Modules */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <BarChart2 className="h-4 w-4" /> Top Ranked Modules
              </h3>
              <ul className="space-y-2 text-sm">
                {topModules.map(m => (
                  <li key={m.id} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{m.name}</span>
                    <span className="font-mono font-semibold text-foreground">{m.priority}</span>
                  </li>
                ))}
              </ul>
            </section>
            {/* Module Toggles */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Enabled Modules
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {moduleList.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                    <label htmlFor={`module-toggle-${module.id}`} className="text-sm font-medium cursor-pointer pr-2">{module.name}</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{module.priority}</Badge>
                      <Switch id={`module-toggle-${module.id}`} checked={module.enabled} onCheckedChange={() => toggleModule(module.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Local Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your favorites and settings from this browser. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}