export type FeedStatus = 'active' | 'inactive';
export interface GeoTag {
  /** Unique identifier for the geotag, matches the feed ID */
  id: string;
  lat?: number;
  lon?: number;
  confidence: number;
  /** The source of the geo data (e.g., 'civic-regex', 'intelligence-pipeline') */
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
// CRITICAL FIX: Changed from a strict union to `string` to allow for normalized IDs.
export type ModuleId = string;
export interface ModuleConfig {
  id: ModuleId;
  name: string;
  enabled: boolean;
  priority: number;
  weights?: Record<string, number>;
}
export interface CommuteIncident {
  id: string;
  type: 'accident' | 'roadwork' | 'congestion';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: { lat: number; lon: number };
  timestamp: number;
}
export interface GovWatchResult {
  id: string;
  document: string;
  excerpt: string;
  score: number;
  date: string;
}
export interface CivicLayer {
  id: 'parks' | 'flood-zones' | 'historic-sites';
  name: string;
  geoData: { type: string; features: any[] };
}