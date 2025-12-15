import { Rss, Star, ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { FeedItemWithStats } from '@/types';
import { cn } from '@/lib/utils';
interface FeedCardProps {
  feed: FeedItemWithStats;
  onVote: (id: string, voteType: 'up' | 'down') => void;
}
export function FeedCard({ feed, onVote }: FeedCardProps) {
  const isFavorite = useFeedStore(state => state.favorites.has(feed.id));
  const toggleFavorite = useFeedStore(state => state.toggleFavorite);
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Allow clicks on buttons/links, but open link if clicking card body
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    window.open(feed.url, '_blank', 'noopener,noreferrer');
  };
  const healthScore = feed.stats.upvotes + feed.stats.downvotes > 0
    ? Math.round((feed.stats.upvotes / (feed.stats.upvotes + feed.stats.downvotes)) * 100)
    : -1;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">{feed.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleFavorite(feed.id); }}>
                    <Star className={cn("h-5 w-5 transition-colors", isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-400')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary">{feed.category}</Badge>
            {feed.stats.status === 'active' ? (
              <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="mr-1 h-3 w-3" /> Active</Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="mr-1 h-3 w-3" /> Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground truncate" title={feed.url}>{feed.url}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onVote(feed.id, 'up'); }}>
              <ThumbsUp className="mr-2 h-4 w-4" /> {feed.stats.upvotes}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onVote(feed.id, 'down'); }}>
              <ThumbsDown className="mr-2 h-4 w-4" /> {feed.stats.downvotes}
            </Button>
            {healthScore >= 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-sm font-medium text-muted-foreground">{healthScore}%</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Community Health Score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <a href={feed.url} target="_blank" rel="noopener noreferrer">
              <Rss className="mr-2 h-4 w-4" /> Subscribe
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}