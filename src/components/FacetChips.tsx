import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeedItemWithStats } from '@/types';
import { useFeedStore } from '@/store/feed-store';
import { motion } from 'framer-motion';
interface FacetChipsProps {
  feeds: FeedItemWithStats[];
}
type Facet = {
  name: string;
  count: number;
};
export function FacetChips({ feeds }: FacetChipsProps) {
  const selectedCategory = useFeedStore(state => state.present.selectedCategory);
  const setSelectedCategory = useFeedStore(state => state.setSelectedCategory);
  const facets = useMemo((): Facet[] => {
    const categoryCount = feeds.reduce((acc, feed) => {
      acc[feed.category] = (acc[feed.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [feeds]);
  if (!facets.length) {
    return null;
  }
  return (
    <div className="w-full pt-2">
      <TooltipProvider>
        <motion.div 
          className="flex flex-wrap items-center gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.02 } }
          }}
        >
          <span className="text-sm font-medium text-muted-foreground mr-2">Facets:</span>
          {facets.slice(0, 10).map(facet => (
            <Tooltip key={facet.name}>
              <TooltipTrigger asChild>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Badge
                    variant={selectedCategory === facet.name ? 'default' : 'secondary'}
                    onClick={() => setSelectedCategory(selectedCategory === facet.name ? null : facet.name)}
                    className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedCategory(selectedCategory === facet.name ? null : facet.name);
                      }
                    }}
                  >
                    {facet.name} <span className="ml-1.5 rounded-full bg-background/50 px-1.5 py-0.5 text-xs font-semibold">{facet.count}</span>
                  </Badge>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by {facet.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </motion.div>
      </TooltipProvider>
    </div>
  );
}