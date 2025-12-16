import { Rss, Star, ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { FeedItemWithStats } from '@/types';
import { cn } from '@/lib/utils';
import React from 'react';
interface FeedCardProps {
  feed: FeedItemWithStats;
  onVote: (id: string, voteType: 'up' | 'down') => void;
  density: 'full' | 'compact';
}
export const FeedCard = React.memo(({ feed, onVote, density }: FeedCardProps) => {
  const favorites = useFeedStore(state => state.present.favorites);
  const toggleFavorite = useFeedStore(state => state.toggleFavorite);
  const isFavorite = favorites.has(feed.id);
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    window.open(feed.url, '_blank', 'noopener,noreferrer');
  };
  const healthScore = feed.stats.upvotes + feed.stats.downvotes > 0
    ? Math.round((feed.stats.upvotes / (feed.stats.upvotes + feed.stats.downvotes)) * 100)
    : -1;
  const statusId = `status-${feed.id}`;
  const categoryId = `category-${feed.id}`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full motion-reduce:transform-none"
      role="article"
      aria-labelledby={`title-${feed.id}`}
      aria-describedby={`${categoryId} ${statusId}`}
    >
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" onClick={handleCardClick}>
        <CardHeader className={cn(density === 'compact' ? 'p-4' : 'p-6')}>
          <div className="flex justify-between items-start gap-4">
            <CardTitle id={`title-${feed.id}`} className="text-base font-semibold text-foreground">{feed.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleFavorite(feed.id); }}>
                    <Star className={cn("h-5 w-5 transition-colors", isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-400')} />
                    <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge id={categoryId} variant="secondary">{feed.category}</Badge>
            {feed.stats.status === 'active' ? (
              <Badge id={statusId} variant="outline" className="text-green-600 border-green-200"><CheckCircle className="mr-1 h-3 w-3" /> Active</Badge>
            ) : (
              <Badge id={statusId} variant="outline" className="text-red-600 border-red-200"><XCircle className="mr-1 h-3 w-3" /> Inactive</Badge>
            )}
          </div>
        </CardHeader>
        {density === 'full' && (
          <CardContent className="flex-grow px-6 pb-4">
            <p className="text-sm text-muted-foreground truncate" title={feed.url}>{feed.url}</p>
          </CardContent>
        )}
        <CardFooter className={cn("flex justify-between items-center", density === 'compact' ? 'p-4 pt-0' : 'p-6 pt-0')}>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onVote(feed.id, 'up'); }}><ThumbsUp className="mr-1 h-4 w-4" /> {feed.stats.upvotes}</Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onVote(feed.id, 'down'); }}><ThumbsDown className="mr-1 h-4 w-4" /> {feed.stats.downvotes}</Button>
            {density === 'full' && healthScore >= 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><div className="text-sm font-medium text-muted-foreground">{healthScore}%</div></TooltipTrigger>
                  <TooltipContent><p>Community Health Score</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <a href={feed.url} target="_blank" rel="noopener noreferrer"><Rss className="mr-2 h-4 w-4" /> Subscribe</a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});