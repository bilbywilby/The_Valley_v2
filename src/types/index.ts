export type FeedStatus = 'active' | 'inactive';
export interface GeoTag {
  /** Unique identifier for the geotag, matches the feed ID */
  id: string;
  lat?: number;
  lon?: number;
  confidence: number;
  /** The source of the geo data (e.g., 'mock-regex', 'ner-pipeline') */
  source: string;
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
  | 'news - regional'
  | 'news - local'
  | 'gov - municipal'
  | 'gov - county'
  | 'safety - police & courts'
  | 'lv business'
  | 'education - higher ed'
  | 'education - k12'
  | 'community & civic'
  | 'media / culture'
  | 'lifestyle - arts & events'
  | 'lifestyle - food & drink'
  | 'lifestyle - environment'
  | 'lifestyle - outdoors'
  | 'sports'
  | 'transit & weather'
  | 'health'
  | 'utilities / infrastructure';
export interface ModuleConfig {
  id: ModuleId;
  name: string;
  enabled: boolean;
  priority: number;
  weights?: Record<string, number>;
}