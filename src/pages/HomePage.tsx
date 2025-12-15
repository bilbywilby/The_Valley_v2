import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rss, Github } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StickySearch } from '@/components/StickySearch';
import { FeedList } from '@/components/FeedList';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { ALL_FEEDS } from '@/data/feeds';
import { FeedStats, FeedItemWithStats } from '@/types';
import { api } from '@/lib/api-client';
async function fetchFeedStats(): Promise<FeedStats[]> {
  return api('/api/feeds/stats');
}
async function postVote({ id, voteType }: { id: string; voteType: 'up' | 'down' }): Promise<FeedStats> {
  return api(`/api/feeds/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ voteType }),
  });
}
export function HomePage() {
  const queryClient = useQueryClient();
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['feedStats'],
    queryFn: fetchFeedStats,
  });
  const voteMutation = useMutation({
    mutationFn: postVote,
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(['feedStats'], (oldData: FeedStats[] | undefined) => {
        return oldData?.map(s => s.id === updatedStats.id ? updatedStats : s) ?? [updatedStats];
      });
      toast.success('Vote counted!');
    },
    onError: () => {
      toast.error('Failed to record vote. Please try again.');
    },
  });
  const feedsWithStats = useMemo((): FeedItemWithStats[] => {
    const statsMap = new Map(stats.map(s => [s.id, s]));
    return ALL_FEEDS.map(feed => ({
      ...feed,
      stats: statsMap.get(feed.id) ?? { id: feed.id, upvotes: 0, downvotes: 0, status: 'active' },
    }));
  }, [stats]);
  const handleVote = (id: string, voteType: 'up' | 'down') => {
    voteMutation.mutate({ id, voteType });
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle className="fixed top-4 right-4" />
      <header className="py-10 md:py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Rss className="h-10 w-10 text-indigo-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              LV Intelligence Feed Index
            </h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            140+ Categorized RSS/Atom Feeds for the Lehigh Valley Region.
          </p>
          <div className="mt-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-lg shadow-sm max-w-2xl mx-auto">
            <p className="font-medium text-sm">
              This is an index only. Use the "Subscribe" button to add feeds to your preferred RSS reader.
            </p>
          </div>
          <div className="mt-8 flex justify-center items-center gap-4">
            <ExportButtons feeds={ALL_FEEDS} />
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/bilbywilby/The_Valley" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> Suggest a Feed
              </a>
            </Button>
          </div>
        </div>
      </header>
      <StickySearch />
      <main className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeedList feeds={feedsWithStats} isLoading={isLoading} onVote={handleVote} />
        </div>
      </main>
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>Built with ��️ at Cloudflare</p>
        <p className="mt-1">Data sourced from the Lehigh Valley Master Intelligence Feed project.</p>
      </footer>
      <Toaster richColors />
    </div>
  );
}