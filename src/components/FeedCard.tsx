import { Rss, Star, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Code, Share, Shield, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { usePrivacyStore } from '@/store/privacy-store';
import { FeedItemWithStats } from '@/types';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { genMinimalSnippet } from '@/utils/story-to-code';
import { toast } from 'sonner';
interface FeedCardProps {
  feed: FeedItemWithStats;
  onVote: (id: string, voteType: 'up' | 'down') => void;
  onAiSummary: (feed: FeedItemWithStats) => void;
  density: 'full' | 'compact';
}
const MOCK_LAST_UPDATED = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7);
const DuckWaddle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400 duck-waddle">
    <path d="M20.93,13.23a1,1,0,0,0-.3-1.05,4.85,4.85,0,0,1-1.46-3.18,1,1,0,0,0-1-1,11.2,11.2,0,0,0-11,0,1,1,0,0,0-1,1,4.85,4.85,0,0,1-1.46,3.18,1,1,0,0,0-.3,1.05,10.43,10.43,0,0,0,3.2,4.33A8.5,8.5,0,0,0,12,19.5a8.5,8.5,0,0,0,5.73-1.94A10.43,10.43,0,0,0,20.93,13.23ZM12,5.5A2.5,2.5,0,1,1,9.5,8,2.5,2.5,0,0,1,12,5.5Z" />
  </svg>
);
export const FeedCard = React.memo(({ feed, onVote, onAiSummary, density }: FeedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isFavorite = useFeedStore(state => state.present.favorites.has(feed.id));
  const toggleFavorite = useFeedStore(state => state.toggleFavorite);
  const privacyMode = usePrivacyStore(state => state.privacyMode);
  const incrementLocalVote = usePrivacyStore(state => state.incrementLocalVote);
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    window.open(feed.url, '_blank', 'noopener,noreferrer');
  };
  const handleVoteClick = (voteType: 'up' | 'down') => {
    if (privacyMode) {
      incrementLocalVote(feed.id, voteType);
      toast.success("Vote counted locally.", { description: "Your vote is saved on this device in Privacy Mode." });
    } else {
      onVote(feed.id, voteType);
    }
  };
  const handleStoryToCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const snippet = genMinimalSnippet(feed);
    navigator.clipboard.writeText(snippet);
    toast.success("Story-to-Code snippet copied!");
  };
  const handleDuckDive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.hash = `feed-${feed.id}`;
    const shareData = { title: `LV Feed: ${feed.title}`, text: `Check out this Lehigh Valley intelligence source: ${feed.title}`, url: url.toString() };
    if (navigator.share) {
      navigator.share(shareData).catch(() => { navigator.clipboard.writeText(shareData.url); toast.info("Link copied to clipboard."); });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Duck-Dive link copied to clipboard!");
    }
  };
  const healthScore = feed.stats.upvotes + feed.stats.downvotes > 0 ? Math.round((feed.stats.upvotes / (feed.stats.upvotes + feed.stats.downvotes)) * 100) : -1;
  const titleId = `title-${feed.id}`;
  return (
    <motion.div
      id={`feed-${feed.id}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full motion-reduce:transform-none motion-reduce:animate-none"
      role="group"
      aria-labelledby={titleId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`Open ${feed.title} in a new tab`}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any); }}
      >
        <AnimatePresence>
          {isHovered && density === 'full' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img src={`https://source.unsplash.com/random/400x225/?city,government&s=${feed.id}`} alt={`${feed.title} visual representation`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CardHeader className={cn(density === 'compact' ? 'p-4' : 'p-6')}>
          <div className="flex justify-between items-start gap-4">
            <CardTitle id={titleId} className="text-base font-semibold text-foreground">{feed.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={e => { e.stopPropagation(); toggleFavorite(feed.id); }} aria-pressed={isFavorite}>
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
              <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"><CheckCircle className="mr-1 h-3 w-3" /> Active</Badge>
            ) : (
              <Badge variant="outline" className="text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"><XCircle className="mr-1 h-3 w-3" /> Inactive</Badge>
            )}
            {privacyMode && (<Badge variant="default" className="bg-blue-600 hover:bg-blue-700"><Shield className="mr-1 h-3 w-3" /> Shielded</Badge>)}
          </div>
        </CardHeader>
        <CardContent className={cn('flex-grow space-y-2', density === 'compact' ? 'p-4 pt-0' : 'p-6 pt-0')}>
          <AnimatePresence>
            {isHovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Updated {formatDistanceToNow(MOCK_LAST_UPDATED, { addSuffix: true })}</p>
                <DuckWaddle />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className={cn('flex justify-between items-center mt-auto', density === 'compact' ? 'p-4 pt-0' : 'p-6 pt-0')}>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleVoteClick('up'); }}><ThumbsUp className="mr-1 h-4 w-4" /> {feed.stats.upvotes}</Button></TooltipTrigger><TooltipContent><p>Upvote</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleVoteClick('down'); }}><ThumbsDown className="mr-1 h-4 w-4" /> {feed.stats.downvotes}</Button></TooltipTrigger><TooltipContent><p>Downvote</p></TooltipContent></Tooltip>
              {healthScore >= 0 && (<Tooltip><TooltipTrigger asChild><div className="text-sm font-medium text-muted-foreground">{healthScore}%</div></TooltipTrigger><TooltipContent><p>Community Health</p></TooltipContent></Tooltip>)}
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isHovered && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onAiSummary(feed); }}><Bot className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleStoryToCode}><Code className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDuckDive}><Share className="h-4 w-4" /></Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button asChild size="sm" variant="outline" onClick={e => e.stopPropagation()}><a href={feed.url} target="_blank" rel="noopener noreferrer"><Rss className="mr-2 h-4 w-4" /> Subscribe</a></Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});