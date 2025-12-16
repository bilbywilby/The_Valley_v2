import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rss, Github, BrainCircuit, Shield, Bot } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StickySearch } from '@/components/StickySearch';
import { FeedList } from '@/components/FeedList';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_FEEDS, CATEGORIES } from '@/data/feeds';
import { FeedStats, FeedItemWithStats, GeoTag, ModuleId, UserPreferenceState, AiSummary } from '@/types';
import { api } from '@/lib/api-client';
import { getMockToken, getUserIdFromToken } from '@/lib/auth';
import { useModuleStore } from '@/store/module-store';
import { usePrivacyStore } from '@/store/privacy-store';
import { useFeedStore } from '@/store/feed-store';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { ModuleSidebar } from '@/components/ModuleSidebar';
const DashboardViz = lazy(() => import('@/components/DashboardViz').then(module => ({ default: module.DashboardViz })));
const voteSchema = z.object({ id: z.string(), voteType: z.enum(['up', 'down']) });
const aiSummarySchema = z.object({ feedId: z.string(), rawText: z.string() });
async function fetchFeedStats(): Promise<FeedStats[]> { return api('/api/feeds/stats'); }
async function fetchAllGeo(): Promise<GeoTag[]> { return api('/api/geo/all'); }
async function postVote(voteData: { id: string; voteType: 'up' | 'down' }): Promise<FeedStats> {
  const validatedData = voteSchema.parse(voteData);
  return api(`/api/feeds/${validatedData.id}/vote`, { method: 'POST', body: JSON.stringify({ voteType: validatedData.voteType }) });
}
async function extractEntities(feedIds: string[]): Promise<any> {
  return api('/api/entities/extract', { method: 'POST', body: JSON.stringify({ feedIds }) });
}
async function fetchUserPrefs(userId: string): Promise<{ userPrefs: UserPreferenceState }> {
  return api(`/api/user/prefs/${userId}`, { headers: { Authorization: `Bearer ${getMockToken()}` } });
}
async function postAiSummary(data: { feedId: string, rawText: string }): Promise<AiSummary> {
  const validatedData = aiSummarySchema.parse(data);
  return api('/api/ai/summarize', { method: 'POST', body: JSON.stringify(validatedData) });
}
function VizSkeleton() {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
      <Skeleton className="h-[350px] lg:col-span-2" />
      <Skeleton className="h-[350px]" />
    </div>
  );
}
export function HomePage() {
  const queryClient = useQueryClient();
  const density = useFeedStore(s => s.present.density);
  const setModules = useModuleStore(s => s.setModules);
  const privacyMode = usePrivacyStore(s => s.privacyMode);
  const setSelectedCategory = useFeedStore(s => s.setSelectedCategory);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const userId = getUserIdFromToken(getMockToken());
  const { data: userPrefsData } = useQuery({
    queryKey: ['userPrefs', userId],
    queryFn: () => fetchUserPrefs(userId),
    enabled: !!userId && userId !== 'anon',
  });
  useEffect(() => {
    if (userPrefsData?.userPrefs?.favs && Array.isArray(userPrefsData.userPrefs.favs)) {
      const serverFavs = new Set<string>(userPrefsData.userPrefs.favs);
      useFeedStore.setState(state => {
        state.present.favorites = serverFavs;
      });
    }
  }, [userPrefsData]);
  useEffect(() => {
    const initialModules = CATEGORIES.map(cat => ({
      id: cat.toLowerCase().replace(/[^a-z0-9]/g, '-') as ModuleId,
      name: cat,
      enabled: true,
      priority: 1,
    }));
    setModules(initialModules);
    if (window.location.hash && window.location.hash.startsWith('#feed-')) {
      const element = document.getElementById(window.location.hash.substring(1));
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [setModules]);
  const { data: stats = [], isLoading: isLoadingStats } = useQuery({ queryKey: ['feedStats'], queryFn: fetchFeedStats });
  const { data: geoData = [], isLoading: isLoadingGeo } = useQuery({ queryKey: ['geoData'], queryFn: fetchAllGeo });
  const voteMutation = useMutation({
    mutationFn: postVote,
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(['feedStats'], (oldData: FeedStats[] | undefined) =>
        oldData?.map(s => s.id === updatedStats.id ? updatedStats : s) ?? [updatedStats]
      );
      toast.success('Vote counted!');
    },
    onError: (error) => toast.error(error instanceof z.ZodError ? 'Invalid vote data.' : 'Failed to record vote.'),
  });
  const entityMutation = useMutation({
    mutationFn: extractEntities,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['geoData'] }),
  });
  const aiSummaryMutation = useMutation({
    mutationFn: postAiSummary,
    onSuccess: (data) => toast.success("AI Summary Generated", { description: data.narrative, duration: 10000 }),
    onError: () => toast.error("Failed to generate AI summary."),
  });
  const feedsWithStats = useMemo((): FeedItemWithStats[] => {
    const statsMap = new Map(stats.map(s => [s.id, s]));
    const geoMap = new Map(geoData.map(g => [g.id, g]));
    return ALL_FEEDS.map(feed => ({
      ...feed,
      stats: statsMap.get(feed.id) ?? { id: feed.id, upvotes: 0, downvotes: 0, status: 'active' },
      geo: geoMap.get(feed.id),
    }));
  }, [stats, geoData]);
  const handleVote = (id: string, voteType: 'up' | 'down') => voteMutation.mutate({ id, voteType });
  const handleBatchEntityExtract = () => {
    const promise = entityMutation.mutateAsync(ALL_FEEDS.map(f => f.id));
    toast.promise(promise, {
      loading: 'Extracting entities from all sources...',
      success: 'Entity extraction complete! Geospatial data updated.',
      error: 'An error occurred during entity extraction.',
    });
  };
  const handleAiSummary = (feed: FeedItemWithStats) => {
    aiSummaryMutation.mutate({ feedId: feed.id, rawText: `${feed.title} from ${feed.category}` });
  };
  const handleVizFilter = (category: string | null) => {
    setSelectedCategory(category);
    document.getElementById('feed-list-container')?.scrollIntoView({ behavior: 'smooth' });
  };
  const isLoading = isLoadingStats || isLoadingGeo;
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsInitialLoad(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {isInitialLoad && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center motion-safe:animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <ModuleSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        {privacyMode && (
          <Badge variant="default" className="fixed top-16 right-4 z-50 bg-blue-600 hover:bg-blue-700">
            <Shield className="mr-2 h-4 w-4" /> Duck Shield Active
          </Badge>
        )}
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-10 md:py-16 border-b bg-background/50 backdrop-blur-sm text-center" id="main-header">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Rss className="h-10 w-10 text-primary" />
                <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                  LV Civic Intelligence Dashboard
                </h1>
              </div>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                A modular civic dashboard aggregating 140+ Lehigh Valley intelligence sources across various categories.
              </p>
              <div className="mt-8 flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
                <ExportButtons feeds={ALL_FEEDS} />
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com/bilbywilby/The_Valley" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> Suggest
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleBatchEntityExtract} disabled={entityMutation.isPending}>
                  <BrainCircuit className="mr-2 h-4 w-4" /> Extract Entities
                </Button>
                <SettingsDrawer />
              </div>
            </div>
          </div>
        </header>
        <StickySearch feeds={feedsWithStats} />
        <main role="main" aria-labelledby="main-header" className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              <Suspense fallback={<VizSkeleton />}>
                <DashboardViz feeds={feedsWithStats} onFilter={handleVizFilter} />
              </Suspense>
            </div>
          </div>
          <div id="feed-list-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              <FeedList feeds={feedsWithStats} isLoading={isLoading} onVote={handleVote} density={density} onAiSummary={handleAiSummary} />
            </div>
          </div>
        </main>
        <footer className="bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 border-t text-center text-sm text-muted-foreground">
              <p>Built with ❤�� at Cloudflare</p>
              <p className="mt-1">Data sourced from the Lehigh Valley Master Intelligence Feed project.</p>
            </div>
          </div>
        </footer>
        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}