import { Settings, Undo, Redo, Trash2, BarChart2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { useModuleStore } from '@/store/module-store';
import { useMemo } from 'react';
export function SettingsDrawer() {
  const density = useFeedStore(state => state.present.density);
  const setDensity = useFeedStore(state => state.setDensity);
  const undoFeed = useFeedStore(state => state.undo);
  const redoFeed = useFeedStore(state => state.redo);
  const canUndoFeed = useFeedStore(state => state.past.length > 0);
  const canRedoFeed = useFeedStore(state => state.future.length > 0);
  const modules = useModuleStore(state => state.present.modules);
  const toggleModule = useModuleStore(state => state.toggleModule);
  const undoModule = useModuleStore(state => state.undo);
  const redoModule = useModuleStore(state => state.redo);
  const canUndoModule = useModuleStore(state => state.past.length > 0);
  const canRedoModule = useModuleStore(state => state.future.length > 0);
  const moduleList = useMemo(() => Object.values(modules).sort((a, b) => b.priority - a.priority), [modules]);
  const topModules = useMemo(() => moduleList.slice(0, 5), [moduleList]);
  const enabledCount = useMemo(() => moduleList.filter(m => m.enabled).length, [moduleList]);
  const handleClearData = () => {
    localStorage.removeItem('lv-feed-index-storage');
    localStorage.removeItem('lv-module-storage');
    window.location.reload();
  };
  const canUndo = canUndoFeed || canUndoModule;
  const canRedo = canRedoFeed || canRedoModule;
  const handleUndo = () => {
    if (canUndoFeed) undoFeed();
    if (canUndoModule) undoModule();
  };
  const handleRedo = () => {
    if (canRedoFeed) redoFeed();
    if (canRedoModule) redoModule();
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
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
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Display Density</h3>
              <ToggleGroup type="single" value={density} onValueChange={(v) => v && setDensity(v as 'full' | 'compact')} className="w-full motion-reduce:scale-100">
                <ToggleGroupItem value="full" aria-label="Full density" className="flex-1">Full</ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact density" className="flex-1">Compact</ToggleGroupItem>
              </ToggleGroup>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <BarChart2 className="h-4 w-4" /> Top Civic Modules
              </h3>
              <ul className="space-y-2 text-sm">
                {topModules.map(m => (
                  <li key={m.id} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{m.name}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={m.enabled ? "default" : "outline"}>{m.priority}</Badge>
                        </TooltipTrigger>
                        <TooltipContent><p>Priority sorts list order</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Enabled Civic Modules</span>
                <Badge variant="secondary">{enabledCount} / {moduleList.length}</Badge>
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {moduleList.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                    <label htmlFor={`module-toggle-${module.id}`} className="text-sm font-medium cursor-pointer pr-2">{module.name}</label>
                    <Switch id={`module-toggle-${module.id}`} checked={module.enabled} onCheckedChange={() => toggleModule(module.id)} />
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