// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Original Demo Types (can be removed later)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// LV Feed Index App-Specific Types
export type FeedStatus = 'active' | 'inactive';
export interface GeoTag {
  id: string;
  lat?: number;
  lon?: number;
  confidence: number;
  source: string;
}
export interface UserPreferenceState {
  id: string; // Corresponds to userId
  subs: string[];
  favs: string[];
  geoAlerts: GeoTag[];
}
export interface AiSummary {
  id: string; // Corresponds to feedId
  narrative: string;
  cachedAt: number;
  ttl: number;
}