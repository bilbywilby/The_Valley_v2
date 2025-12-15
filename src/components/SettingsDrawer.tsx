import { Settings, Undo, Redo, Trash2, LayoutGrid, Save, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePrivacyStore } from '@/store/privacy-store';
import { useFeedStore } from '@/store/feed-store';
import { useModuleStore } from '@/store/module-store';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getMockToken, getUserIdFromToken } from '@/lib/auth';
import { toast } from 'sonner';
import type { UserPreferenceState } from '@/types';
import { RepFinderSheet } from './RepFinderSheet';
interface SavedQuery {
  id: string;
  searchQuery: string;
  alerts: { dailyDigest: boolean };
}
async function fetchQueries(): Promise<SavedQuery[]> { return api('/api/queries'); }
async function saveQuery(data: any): Promise<SavedQuery> { return api('/api/query/save', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteQuery(id: string): Promise<{ id: string }> { return api(`/api/query/${id}`, { method: 'DELETE' }); }
async function toggleAlerts(data: { id: string, enabled: boolean }): Promise<SavedQuery> { return api('/api/query/alerts', { method: 'POST', body: JSON.stringify(data) }); }
async function postUserPrefs(data: Partial<UserPreferenceState>): Promise<UserPreferenceState> {
  return api('/api/user/prefs', { method: 'POST', headers: { Authorization: `Bearer ${getMockToken()}` }, body: JSON.stringify(data) });
}
function UserPreferencesSection() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken(getMockToken());
  const { data: userPrefsData } = useQuery({
    queryKey: ['userPrefs', userId],
    queryFn: () => api<{ userPrefs: UserPreferenceState }>(`/api/user/prefs/${userId}`, { headers: { Authorization: `Bearer ${getMockToken()}` } }),
    enabled: !!userId && userId !== 'anon',
  });
  const [subs, setSubs] = useState('');
  useEffect(() => {
    if (userPrefsData?.userPrefs.subs) {
      setSubs(userPrefsData.userPrefs.subs.join(', '));
    }
  }, [userPrefsData]);
  const savePrefsMutation = useMutation({
    mutationFn: postUserPrefs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrefs', userId] });
      toast.success('Preferences saved!');
    },
    onError: () => toast.error('Failed to save preferences.'),
  });
  const handleSave = () => {
    savePrefsMutation.mutate({ subs: subs.split(',').map(s => s.trim()).filter(Boolean) });
  };
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> User Preferences</h3>
      <div className="space-y-2">
        <label htmlFor="subs-input" className="text-xs font-medium text-muted-foreground">Feed Subscriptions (comma-separated)</label>
        <Input id="subs-input" placeholder="e.g., https://..., http://..." value={subs} onChange={e => setSubs(e.target.value)} />
        <Button onClick={handleSave} size="sm" className="w-full" disabled={savePrefsMutation.isPending}>Save Preferences</Button>
      </div>
    </section>
  );
}
function SavedQueriesSection() {
  const queryClient = useQueryClient();
  const { data: queries = [] } = useQuery({ queryKey: ['savedQueries'], queryFn: fetchQueries });
  const searchQuery = useFeedStore(s => s.present.searchQuery);
  const selectedCategory = useFeedStore(s => s.present.selectedCategory);
  const velocityWindow = useFeedStore(s => s.present.velocityWindow);
  const saveMutation = useMutation({
    mutationFn: saveQuery,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savedQueries'] }); toast.success('Query saved!'); },
    onError: () => toast.error('Failed to save query.'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteQuery,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savedQueries'] }); toast.success('Query deleted.'); },
    onError: () => toast.error('Failed to delete query.'),
  });
  const alertMutation = useMutation({
    mutationFn: toggleAlerts,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savedQueries'] }); toast.success('Alert settings updated.'); },
    onError: () => toast.error('Failed to update alerts.'),
  });
  const handleSave = () => saveMutation.mutate({ searchQuery, selectedCategory, velocityWindow });
  return (
    <section className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground">Saved Queries</h3>
        <Button onClick={handleSave} size="sm" variant="outline" disabled={saveMutation.isPending}><Save className="mr-2 h-4 w-4" /> Save Current</Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {queries.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No saved queries yet.</p>}
        {queries.map(q => (
          <div key={q.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm min-h-[44px]">
            <span className="truncate pr-2" title={q.searchQuery || 'All Feeds'}>{q.searchQuery || 'All Feeds'}</span>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Switch checked={q.alerts.dailyDigest} onCheckedChange={(c) => alertMutation.mutate({ id: q.id, enabled: c })} /></TooltipTrigger>
                  <TooltipContent><p>Toggle daily digest</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TooltipTrigger>
                  <TooltipContent><p>Delete query</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export function SettingsDrawer() {
  const density = useFeedStore(state => state.present.density);
  const setDensity = useFeedStore(state => state.setDensity);
  const undoFeed = useFeedStore(state => state.undo);
  const privacyMode = usePrivacyStore(state => state.privacyMode);
  const togglePrivacyMode = usePrivacyStore(state => state.togglePrivacyMode);
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
  const enabledCount = useMemo(() => moduleList.filter(m => m.enabled).length, [moduleList]);
  const handleClearData = () => { localStorage.clear(); window.location.reload(); };
  const handlePrivacyToggle = () => {
    togglePrivacyMode();
    toast.success(`Duck Shield ${!privacyMode ? 'activated' : 'deactivated'}.`, { description: !privacyMode ? 'Analytics disabled.' : 'Analytics re-enabled.' });
  };
  const canUndo = canUndoFeed || canUndoModule;
  const canRedo = canRedoFeed || canRedoModule;
  const handleUndo = () => { if (canUndoFeed) undoFeed(); if (canUndoModule) undoModule(); };
  const handleRedo = () => { if (canRedoFeed) redoFeed(); if (canRedoModule) redoModule(); };
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Settings</Button></SheetTrigger>
      <SheetContent className="z-[60] w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b"><SheetTitle className="flex items-center gap-2 text-lg"><Settings className="h-5 w-5" />Settings & Controls</SheetTitle></SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Privacy</h3>
              <div className="flex items-center justify-between p-2 rounded-md bg-accent/50 min-h-[44px]">
                <label htmlFor="privacy-mode-toggle" className="text-sm font-medium cursor-pointer pr-2">Duck Shield<p className="text-xs text-muted-foreground">Disable remote analytics.</p></label>
                <Switch id="privacy-mode-toggle" checked={privacyMode} onCheckedChange={handlePrivacyToggle} />
              </div>
              <Badge variant={privacyMode ? "default" : "secondary"} className="w-full justify-center">{privacyMode ? '���️ Active (Local Only)' : 'Off'}</Badge>
            </section>
            <UserPreferencesSection />
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Civic Lookup</h3>
              <Sheet><SheetTrigger asChild><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Find My Reps</Button></SheetTrigger><SheetContent className="w-full sm:w-[520px] p-0 flex flex-col z-[70]"><SheetHeader className="p-4 border-b"><SheetTitle>My Reps Civic Lookup</SheetTitle></SheetHeader><ScrollArea><RepFinderSheet /></ScrollArea></SheetContent></Sheet>
            </section>
            <SavedQueriesSection />
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">History</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleUndo} disabled={!canUndo} variant="outline" size="sm" className="flex-1"><Undo className="mr-2 h-4 w-4" /> Undo</Button>
                <Button onClick={handleRedo} disabled={!canRedo} variant="outline" size="sm" className="flex-1"><Redo className="mr-2 h-4 w-4" /> Redo</Button>
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Display Density</h3>
              <ToggleGroup type="single" value={density} onValueChange={(v) => v && setDensity(v as 'full' | 'compact')} className="w-full">
                <ToggleGroupItem value="full" aria-label="Full density" className="flex-1">Full</ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact density" className="flex-1">Compact</ToggleGroupItem>
              </ToggleGroup>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Enabled Civic Modules</span>
                <Badge variant="secondary">{enabledCount} / {moduleList.length}</Badge>
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {moduleList.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent min-h-[44px]">
                    <label htmlFor={`mt-${m.id}`} className="text-sm font-medium cursor-pointer pr-2">{m.name}</label>
                    <Switch id={`mt-${m.id}`} checked={m.enabled} onCheckedChange={() => toggleModule(m.id)} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4 space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Clear Local Data</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all your favorites and settings from this browser.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearData}>Continue</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}