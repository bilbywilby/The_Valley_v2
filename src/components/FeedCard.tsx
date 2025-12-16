import { Rss, Star, ThumbsUp, ThumbsDown, CheckCircle, XCircle, MapPin, TrendingUp, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { FeedItemWithStats } from '@/types';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
interface FeedCardProps {
  feed: FeedItemWithStats;
  onVote: (id: string, voteType: 'up' | 'down') => void;
  density: 'full' | 'compact';
}
const MOCK_LAST_UPDATED = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7);
export const FeedCard = React.memo(({ feed, onVote, density }: FeedCardProps) => {
  const isFavorite = useFeedStore(state => state.present.favorites.has(feed.id));
  const toggleFavorite = useFeedStore(state => state.toggleFavorite);
  const mockTrendData = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ name: i, uv: Math.random() * (feed.stats.upvotes + 10) })), [feed.stats.upvotes]);
  const newCount = useMemo(() => Math.floor(Math.random() * 5) + 1, []);
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    window.open(feed.url, '_blank', 'noopener,noreferrer');
  };
  const healthScore =
    feed.stats.upvotes + feed.stats.downvotes > 0
      ? Math.round((feed.stats.upvotes / (feed.stats.upvotes + feed.stats.downvotes)) * 100)
      : -1;
  const titleId = `title-${feed.id}`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full motion-reduce:transform-none motion-reduce:animate-none"
      role="group"
      aria-labelledby={titleId}
    >
      <Card
        className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`Open ${feed.title} in a new tab`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any);
        }}
      >
        {density === 'full' && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img src={`https://source.unsplash.com/random/400x225/?city,government&s=${feed.id}`} alt={`${feed.title} visual representation`} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <CardHeader className={cn(density === 'compact' ? 'p-4' : 'p-6')}>
          <div className="flex justify-between items-start gap-4">
            <CardTitle id={titleId} className="text-base font-semibold text-foreground">
              {feed.title}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8"
                    onClick={e => { e.stopPropagation(); toggleFavorite(feed.id); }}
                    aria-pressed={isFavorite}
                  >
                    <Star className={cn('h-5 w-5 transition-colors', isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-400')} />
                    <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Badge variant="secondary">{feed.category}</Badge>
            {feed.stats.status === 'active' ? (
              <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CheckCircle className="mr-1 h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                <XCircle className="mr-1 h-3 w-3" /> Inactive
              </Badge>
            )}
            {newCount > 0 && (
              <Badge variant="default" className="bg-primary/80 hover:bg-primary">
                <Newspaper className="mr-1 h-3 w-3" /> New: {newCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        {density === 'full' && (
          <CardContent className="flex-grow px-6 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground">Updated {formatDistanceToNow(MOCK_LAST_UPDATED, { addSuffix: true })}</p>
          </CardContent>
        )}
        <CardFooter className={cn('flex justify-between items-center mt-auto', density === 'compact' ? 'p-4 pt-0' : 'p-6 pt-0')}>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onVote(feed.id, 'up'); }} aria-label={`Vote up for ${feed.title}`}>
                    <ThumbsUp className="mr-1 h-4 w-4" /> {feed.stats.upvotes}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Upvote this source</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onVote(feed.id, 'down'); }} aria-label={`Vote down for ${feed.title}`}>
                    <ThumbsDown className="mr-1 h-4 w-4" /> {feed.stats.downvotes}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Downvote this source</p></TooltipContent>
              </Tooltip>
              {healthScore >= 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm font-medium text-muted-foreground">{healthScore}%</div>
                  </TooltipTrigger>
                  <TooltipContent><p>Community Health: {feed.stats.upvotes} up / {feed.stats.downvotes} down</p></TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <div className="w-20 h-8" aria-label="Recent activity trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <Line type="monotone" dataKey="uv" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button asChild size="sm" variant="outline" onClick={e => e.stopPropagation()}>
              <a href={feed.url} target="_blank" rel="noopener noreferrer">
                <Rss className="mr-2 h-4 w-4" /> Subscribe
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});