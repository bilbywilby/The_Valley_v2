import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, FeedStats, GeoTag, CommuteIncident, GovWatchResult, CivicLayer } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
}
// FEED STATS ENTITY
export class FeedStatsEntity extends IndexedEntity<FeedStats> {
  static readonly entityName = "feed-stats";
  static readonly indexName = "feed-stats-index";
  static readonly initialState: FeedStats = { id: "", upvotes: 0, downvotes: 0, status: 'active' };
}
// GEO ENTITY
export type GeoEntityState = GeoTag & { id: string; source: string };
export class GeoEntity extends IndexedEntity<GeoEntityState> {
  static readonly entityName = "geo";
  static readonly indexName = "geos";
  static readonly initialState: GeoEntityState = { id: "", lat: 0, lon: 0, confidence: 0, source: "" };
}
// SAVED QUERY ENTITY
export interface SavedQuery {
    id: string;
    searchQuery: string;
    facets: Record<string, any>;
    velocityWindow: number;
    createdAt: string;
    alerts: { dailyDigest: boolean };
}
export class QueryEntity extends IndexedEntity<SavedQuery> {
    static readonly entityName = "query";
    static readonly indexName = "queries";
    static readonly initialState: SavedQuery = { id: "", searchQuery: "", facets: {}, velocityWindow: 24, createdAt: "", alerts: { dailyDigest: false } };
    static seedData = [];
}
// SENTIMENT ENTITY
export interface Sentiment {
    id: string; // Corresponds to feed ID
    positive: number; // Score from 0 to 1
}
export class SentimentEntity extends IndexedEntity<Sentiment> {
    static readonly entityName = "sentiment";
    static readonly indexName = "sentiments";
    static readonly initialState: Sentiment = { id: "", positive: 0.5 };
}
// Add types to shared module
declare module "@shared/types" {
  export interface FeedStats {
    id: string;
    upvotes: number;
    downvotes: number;
    status: 'active' | 'inactive';
  }
  export interface GeoTag {
    id: string;
    lat?: number;
    lon?: number;
    confidence: number;
    source: string;
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
    // In a real app, this would be a GeoJSON FeatureCollection
    geoData: { type: string; features: any[] };
  }
}