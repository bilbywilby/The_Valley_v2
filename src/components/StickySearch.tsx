import { Search, Star, List, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedStore } from '@/store/feed-store';
import { CATEGORIES } from '@/data/feeds';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FacetChips } from './FacetChips';
import { FeedItemWithStats } from '@/types';
interface StickySearchProps {
  feeds: FeedItemWithStats[];
}
export function StickySearch({ feeds }: StickySearchProps) {
  const searchQuery = useFeedStore(state => state.present.searchQuery);
  const selectedCategory = useFeedStore(state => state.present.selectedCategory);
  const viewMode = useFeedStore(state => state.present.viewMode);
  const density = useFeedStore(state => state.present.density);
  const velocityWindow = useFeedStore(state => state.present.velocityWindow);
  const setSearchQuery = useFeedStore(state => state.setSearchQuery);
  const setSelectedCategory = useFeedStore(state => state.setSelectedCategory);
  const setViewMode = useFeedStore(state => state.setViewMode);
  const setVelocityWindow = useFeedStore(state => state.setVelocityWindow);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const focusSearch = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, []);
  useHotkeys('s, /', focusSearch, { preventDefault: true }, [focusSearch]);
  return (
    <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border motion-reduce:transition-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-2 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:flex-1">
              <label htmlFor="feed-search" className="sr-only">Search feeds</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="feed-search"
                ref={searchInputRef}
                placeholder="Search 140+ feeds..."
                className={cn("pl-10 w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", density === 'compact' ? 'sm:max-w-xs' : '')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-describedby="search-results-count"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={selectedCategory ?? 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
                      <SelectTrigger className="w-full sm:w-[180px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:scale-100" aria-label="Filter by category">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent><p>Filter by category</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Select value={String(velocityWindow)} onValueChange={(v) => setVelocityWindow(Number(v) as 1 | 6 | 24)}>
                      <SelectTrigger className="w-full sm:w-[120px]" aria-label="Select time window for velocity">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Time Window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Last 1h</SelectItem>
                        <SelectItem value="6">Last 6h</SelectItem>
                        <SelectItem value="24">Last 24h</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent><p>Data Velocity Time Window</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'all' | 'favorites')} aria-label="View mode" className="motion-reduce:scale-100">
                      <ToggleGroupItem value="all" aria-label="All feeds" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><List className="h-4 w-4" /></ToggleGroupItem>
                      <ToggleGroupItem value="favorites" aria-label="Favorite feeds" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><Star className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                  </TooltipTrigger>
                  <TooltipContent><p>Toggle view mode</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <FacetChips feeds={feeds} />
        </div>
      </div>
    </div>
  );
}