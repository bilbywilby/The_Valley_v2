import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useFeedStore } from '@/store/feed-store';
import { FeedItemWithStats } from '@/types';
import { FeedCard } from './FeedCard';
import { Skeleton } from '@/components/ui/skeleton';
interface FeedListProps {
  feeds: FeedItemWithStats[];
  isLoading: boolean;
  onVote: (id: string, voteType: 'up' | 'down') => void;
}
export function FeedList({ feeds, isLoading, onVote }: FeedListProps) {
  const searchQuery = useFeedStore(s => s.searchQuery);
  const selectedCategory = useFeedStore(s => s.selectedCategory);
  const viewMode = useFeedStore(s => s.viewMode);
  const favorites = useFeedStore(s => s.favorites);
  const filteredFeeds = useMemo(() => {
    return feeds
      .filter(feed => {
        if (viewMode === 'favorites') {
          return favorites.has(feed.id);
        }
        return true;
      })
      .filter(feed => {
        if (selectedCategory) {
          return feed.category === selectedCategory;
        }
        return true;
      })
      .filter(feed => {
        const query = searchQuery.toLowerCase();
        return feed.title.toLowerCase().includes(query) || feed.url.toLowerCase().includes(query);
      });
  }, [feeds, searchQuery, selectedCategory, viewMode, favorites]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (filteredFeeds.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-foreground">No Feeds Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredFeeds.map(feed => (
          <FeedCard key={feed.id} feed={feed} onVote={onVote} />
        ))}
      </AnimatePresence>
    </div>
  );
}