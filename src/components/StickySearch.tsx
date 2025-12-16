import { Search, Star, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useFeedStore } from '@/store/feed-store';
import { CATEGORIES } from '@/data/feeds';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
export function StickySearch() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, viewMode, setViewMode, density } = useFeedStore(state => ({
    ...state.present,
    setSearchQuery: state.setSearchQuery,
    setSelectedCategory: state.setSelectedCategory,
    setViewMode: state.setViewMode,
    density: state.density,
  }));
  const searchInputRef = useRef<HTMLInputElement>(null);
  useHotkeys('s, /', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, { preventDefault: true });
  return (
    <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 py-3">
          <div className="relative w-full sm:flex-1">
            <label htmlFor="feed-search" className="sr-only">Search feeds</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              id="feed-search"
              ref={searchInputRef}
              placeholder="Search 140+ feeds..."
              className={cn("pl-10 w-full", density === 'compact' ? 'sm:max-w-xs' : '')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="sr-only" aria-live="assertive">{searchQuery ? `Searching for ${searchQuery}` : ''}</div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select value={selectedCategory ?? 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'all' | 'favorites')} aria-label="View mode">
              <ToggleGroupItem value="all" aria-label="All feeds"><List className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="favorites" aria-label="Favorite feeds"><Star className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}