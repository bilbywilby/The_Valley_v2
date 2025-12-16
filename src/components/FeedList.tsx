import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useFeedStore } from '@/store/feed-store';
import { useModuleStore } from '@/store/module-store';
import { FeedItemWithStats } from '@/types';
import { FeedCard } from './FeedCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
interface FeedListProps {
  feeds: FeedItemWithStats[];
  isLoading: boolean;
  onVote: (id: string, voteType: 'up' | 'down') => void;
  density: 'full' | 'compact';
}
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};
export function FeedList({ feeds, isLoading, onVote, density }: FeedListProps) {
  const searchQuery = useFeedStore(s => s.present.searchQuery);
  const selectedCategory = useFeedStore(s => s.present.selectedCategory);
  const viewMode = useFeedStore(s => s.present.viewMode);
  const favorites = useFeedStore(s => s.present.favorites);
  // CRITICAL FIX: Use useShallow to get a stable reference to the modules object.
  // This prevents re-renders that cause the "dispatcher is null" invalid hook call error.
  const modules = useModuleStore(useShallow(s => s.present.modules));
  const enabledModuleIds = useMemo(() =>
    new Set(Object.values(modules).filter((m) => m.enabled).map((m) => m.id)),
    [modules]
  );
  const filteredFeeds = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return feeds
      .filter(feed => {
        if (viewMode === 'all') {
          const feedModuleId = feed.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return enabledModuleIds.has(feedModuleId);
        }
        return true;
      })
      .filter(feed => viewMode === 'favorites' ? favorites.has(feed.id) : true)
      .filter(feed => selectedCategory ? feed.category === selectedCategory : true)
      .filter(feed =>
        feed.title.toLowerCase().includes(lowerCaseQuery) ||
        feed.url.toLowerCase().includes(lowerCaseQuery)
      );
  }, [feeds, searchQuery, selectedCategory, viewMode, favorites, enabledModuleIds]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className={cn("w-full rounded-xl shimmer-bg", density === 'compact' ? 'h-40' : 'h-64')} />
        ))}
      </div>
    );
  }
  return (
    <>
      <div id="search-results-count" className="sr-only" aria-live="polite" role="status">
        {`${filteredFeeds.length} feeds found.`}
      </div>
      {filteredFeeds.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 col-span-full"
        >
          <h3 className="text-xl font-semibold text-foreground">No Feeds Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search (e.g., "police"), filters, or enable more modules in the sidebar.</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 motion-reduce:transition-none"
        >
          <AnimatePresence>
            {filteredFeeds.map(feed => (
              <FeedCard key={feed.id} feed={feed} onVote={onVote} density={density} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}