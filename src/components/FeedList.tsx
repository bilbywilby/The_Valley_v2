import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedStore, useEnabledModuleNames } from '@/store/feed-store';
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
  const enabledModuleNames = useEnabledModuleNames();
  const filteredFeeds = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const enabledModulesSet = new Set(enabledModuleNames);
    return feeds
      .filter(feed => {
        // Module filter (only applies in 'all' view)
        if (viewMode === 'all') {
          return enabledModulesSet.has(feed.category);
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
  }, [feeds, searchQuery, selectedCategory, viewMode, favorites, enabledModuleNames]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }
  if (filteredFeeds.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <h3 className="text-xl font-semibold text-foreground">No Feeds Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters, or enable more modules.</p>
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