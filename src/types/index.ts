export type FeedStatus = 'active' | 'inactive';
export interface FeedItem {
  id: string;
  title: string;
  url: string;
  category: string;
}
export interface FeedStats {
  id: string;
  upvotes: number;
  downvotes: number;
  status: FeedStatus;
}
export type FeedItemWithStats = FeedItem & {
  stats: FeedStats;
};
export type ViewMode = 'all' | 'favorites';
export interface FeedState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}