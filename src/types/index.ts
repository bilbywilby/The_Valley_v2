export type { UserPreferenceState, AiSummary } from '@shared/types';
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
export interface HousingTrend {
  id: string;
  metric: 'price' | 'inventory';
  value: number;
  trend: number; // % change
  period: string; // '1mo', '3mo', '6mo'
}
export interface MarketListing {
  id: string;
  title: string;
  price: number;
  location: string;
  url: string;
}
export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: 'arts' | 'civic' | 'sports';
  url: string;
}
export interface Rep {
  name: string;
  office: string;
  party: 'Republican' | 'Democratic' | 'Independent' | 'Nonpartisan' | 'Unknown';
  phones?: string[];
  urls?: string[];
  photoUrl?: string;
}
export interface AddressInput {
  address: string;
}
export interface CivicResponse {
  normalizedInput: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  divisions: Record<string, { name: string; officeIndices: number[] }>;
  officials: Rep[];
}
// New Types for Elements Pack
export type RiverLevelStatus = 'normal' | 'action' | 'minor' | 'moderate' | 'major';
export interface RiverStatus {
  id: string; // e.g., 'usgs-lehigh-bethlehem'
  name: string;
  level: number; // in feet
  flow: number; // in cfs
  status: RiverLevelStatus;
  timestamp: number;
}
export interface AirQuality {
  id: string; // e.g., 'purpleair-allentown-1'
  name: string;
  aqi: number;
  pm25: number;
  temp: number; // in Fahrenheit
  humidity: number; // in %
  timestamp: number;
}