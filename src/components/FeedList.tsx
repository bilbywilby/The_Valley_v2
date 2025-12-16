import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedStore } from '@/store/feed-store';
import { useModuleStore } from '@/store/module-store';
import { FeedItemWithStats } from '@/types';
import { FeedCard } from './FeedCard';
import { Skeleton } from '@/components/ui/skeleton';
interface FeedListProps {
  feeds: FeedItemWithStats[];
  isLoading: boolean;
  onVote: (id: string, voteType: 'up' | 'down') => void;
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
export function FeedList({ feeds, isLoading, onVote }: FeedListProps) {
  const searchQuery = useFeedStore(s => s.searchQuery);
  const selectedCategory = useFeedStore(s => s.selectedCategory);
  const viewMode = useFeedStore(s => s.viewMode);
  const favorites = useFeedStore(s => s.favorites);
  const modules = useModuleStore(s => s.modules);
  const enabledModuleIds = useMemo(
    () => Object.values(modules).filter((m) => m.enabled).map((m) => m.id),
    [modules]
  );
  const filteredFeeds = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    // The enabledModuleIds from the store are already normalized.
    const enabledModulesSet = new Set(enabledModuleIds);
    return feeds
      .filter(feed => {
        // Module filter (only applies in 'all' view)
        if (viewMode === 'all') {
          // Normalize the feed's category string in the same way module IDs are generated.
          const feedModuleId = feed.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return enabledModulesSet.has(feedModuleId);
        }
        return true;
      })
      .filter(feed => {
        // Favorites filter
        if (viewMode === 'favorites') {
          return favorites.has(feed.id);
        }
        return true;
      })
      .filter(feed => {
        // Category filter
        if (selectedCategory) {
          return feed.category === selectedCategory;
        }
        return true;
      })
      .filter(feed => {
        // Search query filter
        return feed.title.toLowerCase().includes(lowerCaseQuery) || feed.url.toLowerCase().includes(lowerCaseQuery);
      });
  }, [feeds, searchQuery, selectedCategory, viewMode, favorites, enabledModuleIds]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{Array.from({ length: 12 }).map((_, i) => (
  <Skeleton key={`skeleton-${i}`} className="h-48 w-full rounded-xl" />
))}
      </div>
    );
  }
  if (filteredFeeds.length === 0) {
    return (
      <div className="text-center py-16 col-span-full animate-fade-in">
        <h3 className="text-xl font-semibold text-foreground">No Feeds Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters, or enable more modules in the sidebar.</p>
      </div>
    );
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {filteredFeeds.map(feed => (
          <FeedCard key={feed.id} feed={feed} onVote={onVote} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}