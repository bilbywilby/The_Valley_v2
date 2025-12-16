import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rss, Github, MapPin } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StickySearch } from '@/components/StickySearch';
import { FeedList } from '@/components/FeedList';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { ALL_FEEDS, CATEGORIES } from '@/data/feeds';
import { FeedStats, FeedItemWithStats, GeoTag, ModuleId } from '@/types';
import { api } from '@/lib/api-client';
import { useModuleStore } from '@/store/module-store';
import { useFeedStore } from '@/store/feed-store';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { ModuleSidebar } from '@/components/ModuleSidebar';
const voteSchema = z.object({
  id: z.string().uuid(),
  voteType: z.enum(['up', 'down']),
});
async function fetchFeedStats(): Promise<FeedStats[]> {
  return api('/api/feeds/stats');
}
async function fetchAllGeo(): Promise<GeoTag[]> {
  return api('/api/geo/all');
}
async function postVote(voteData: { id: string; voteType: 'up' | 'down' }): Promise<FeedStats> {
  const validatedData = voteSchema.parse(voteData);
  return api(`/api/feeds/${validatedData.id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ voteType: validatedData.voteType }),
  });
}
async function tagGeo(feedId: string): Promise<GeoTag> {
  return api('/api/geo/tag', {
    method: 'POST',
    body: JSON.stringify({ feedId }),
  });
}
export function HomePage() {
  const queryClient = useQueryClient();
  const density = useFeedStore(s => s.present.density);
  const setModules = useModuleStore(s => s.setModules);
  useEffect(() => {
    const initialModules = CATEGORIES.map(cat => ({
      id: cat.toLowerCase().replace(/[^a-z0-9]/g, '-') as ModuleId,
      name: cat,
      enabled: true,
      priority: 1,
    }));
    setModules(initialModules);
  }, [setModules]);
  const { data: stats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['feedStats'],
    queryFn: fetchFeedStats,
  });
  const { data: geoData = [], isLoading: isLoadingGeo } = useQuery({
    queryKey: ['geoData'],
    queryFn: fetchAllGeo,
  });
  const voteMutation = useMutation({
    mutationFn: postVote,
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(['feedStats'], (oldData: FeedStats[] | undefined) => {
        return oldData?.map(s => s.id === updatedStats.id ? updatedStats : s) ?? [updatedStats];
      });
      toast.success('Vote counted!');
    },
    onError: (error) => {
      toast.error(error instanceof z.ZodError ? 'Invalid vote data.' : 'Failed to record vote.');
    },
  });
  const geoTagMutation = useMutation({
    mutationFn: tagGeo,
    onSuccess: (newGeoTag) => {
      queryClient.setQueryData(['geoData'], (oldData: GeoTag[] | undefined) => {
        const existing = oldData?.find(g => g.id === newGeoTag.id);
        if (existing) {
          return oldData?.map(g => g.id === newGeoTag.id ? newGeoTag : g) ?? [newGeoTag];
        }
        return [...(oldData ?? []), newGeoTag];
      });
    }
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
  const handleVote = (id: string, voteType: 'up' | 'down') => {
    voteMutation.mutate({ id, voteType });
  };
  const handleBatchGeoTag = () => {
    const promise = Promise.all(ALL_FEEDS.map(feed => geoTagMutation.mutateAsync(feed.id)))
      .then(() => true);
    toast.promise(promise, {
        loading: 'Calibrating geospatial data for all sources...',
        success: 'Geospatial intelligence calibrated successfully!',
        error: 'An error occurred during geo-calibration.',
    });
  };
  const isLoading = isLoadingStats || isLoadingGeo;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      <ModuleSidebar />
      <div className="lg:pl-64">
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        <header className="py-10 md:py-16 border-b bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" id="main-header">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Rss className="h-10 w-10 text-indigo-500" />
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
                LV Civic Intelligence Dashboard
              </h1>
            </div>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              A modular civic dashboard aggregating 140+ Lehigh Valley intelligence sources across various categories.
            </p>
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
              <ExportButtons feeds={ALL_FEEDS} />
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/bilbywilby/The_Valley" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> Suggest a Source
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={handleBatchGeoTag} disabled={geoTagMutation.isPending}>
                <MapPin className="mr-2 h-4 w-4" /> Calibrate Geospatial Overlay
              </Button>
              <SettingsDrawer />
            </div>
          </div>
        </header>
        <StickySearch />
        <main role="main" aria-labelledby="main-header" className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              <FeedList feeds={feedsWithStats} isLoading={isLoading} onVote={handleVote} density={density} />
            </div>
          </div>
        </main>
        <footer className="py-8 border-t bg-background text-center text-sm text-muted-foreground">
          <p>Built with ❤️ at Cloudflare</p>
          <p className="mt-1">Data sourced from the Lehigh Valley Master Intelligence Feed project.</p>
        </footer>
        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}