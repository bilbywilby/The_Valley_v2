export type FeedStatus = 'active' | 'inactive';

export interface GeoTag {
  /** Unique identifier for the geotag */
  id: string;
  lat?: number;
  lon?: number;
  confidence: number;
}

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
  geo?: GeoTag;
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

export type ModuleId =
  | 'news'
  | 'gov'
  | 'safety'
  | 'community'
  | 'arts'
  | 'transit'
  | 'business'
  | 'education'
  | 'lifestyle'
  | 'health'
  | 'sports'
  | 'media'
  | 'utilities';

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  enabled: boolean;
  priority: number;
  weights?: Record<string, number>;
}
//