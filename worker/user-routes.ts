import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, FeedStatsEntity, GeoEntity, QueryEntity, SentimentEntity, UserPreferenceEntity, AiSummaryEntity, CivicEntity } from "./entities";
import { ok, bad, notFound, isStr, HousingTrend, MarketListing, EventItem } from './core-utils';
import type { UserPreferenceState, CivicResponse, Rep } from "@shared/types";
const MODULES = ['news', 'gov', 'safety', 'community', 'arts', 'transit', 'business', 'education', 'lifestyle', 'health', 'sports', 'media', 'utilities'];
/**
 * Mock JWT verification. In a real app, use a proper JWT library.
 * @param token The Authorization header value (e.g., "Bearer mock-token").
 * @returns The user ID from the token, or 'anon'.
 */
function mockVerifyJWT(token: string | undefined): string {
  if (!token) return 'anon';
  const parts = token.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return 'anon';
  return parts[1]?.split('.')[0] || 'anon';
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Security Headers Middleware
  app.use('/api/*', async (c, next) => {
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data: blob:; connect-src 'self'; frame-ancestors 'none';");
    c.header('X-Frame-Options', 'DENY');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    await next();
  });
  // Ensure seed data on first load
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      UserEntity.ensureSeed(c.env),
      ChatBoardEntity.ensureSeed(c.env),
      QueryEntity.ensureSeed(c.env),
      UserPreferenceEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // USER PREFERENCES (Protected Routes)
  app.get('/api/user/prefs/:userId', async (c) => {
    const auth = c.req.header('Authorization');
    const authUserId = mockVerifyJWT(auth);
    const reqUserId = c.req.param('userId');
    if (authUserId !== reqUserId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const entity = new UserPreferenceEntity(c.env, reqUserId);
    if (!(await entity.exists())) {
      return notFound(c, 'User preferences not found.');
    }
    const prefs = await entity.getState();
    return ok(c, { userPrefs: prefs });
  });
  app.post('/api/user/prefs', async (c) => {
    const auth = c.req.header('Authorization');
    const userId = mockVerifyJWT(auth);
    if (userId === 'anon') {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const prefsData = await c.req.json<Partial<UserPreferenceState>>();
    const entity = new UserPreferenceEntity(c.env, userId);
    if (!(await entity.exists())) {
      const newPrefs = { ...UserPreferenceEntity.initialState, ...prefsData, id: userId };
      await UserPreferenceEntity.create(c.env, newPrefs);
      return ok(c, newPrefs);
    }
    const updatedPrefs = await entity.mutate(s => ({ ...s, ...prefsData }));
    return ok(c, updatedPrefs);
  });
  // CIVIC LOOKUP
  app.post('/api/civic/lookup', async (c) => {
    const { address } = await c.req.json<{ address: string }>();
    if (!isStr(address)) return bad(c, 'Address is required.');
    const MOCK_REPS: Rep[] = [
      { name: 'Susan Wild', office: 'U.S. Representative PA-7', party: 'Democratic', phones: ['(202) 225-6411'], urls: ['https://wild.house.gov/'] },
      { name: 'Bob Casey Jr.', office: 'U.S. Senator', party: 'Democratic', phones: ['(202) 224-6324'], urls: ['https://www.casey.senate.gov/'] },
      { name: 'John Fetterman', office: 'U.S. Senator', party: 'Democratic', phones: ['(202) 224-4254'], urls: ['https://www.fetterman.senate.gov/'] },
      { name: 'Matt Tuerk', office: 'Mayor of Allentown', party: 'Democratic', phones: ['(610) 437-7511'], urls: ['https://www.allentownpa.gov/'] },
      { name: 'J. William Reynolds', office: 'Mayor of Bethlehem', party: 'Democratic', phones: ['(610) 865-7100'], urls: ['https://www.bethlehem-pa.gov/'] },
    ];
    const mockResponse: CivicResponse = {
      normalizedInput: { line1: address, city: 'Allentown', state: 'PA', zip: '18101' },
      divisions: {
        'ocd-division/country:us': { name: 'United States', officeIndices: [1, 2] },
        'ocd-division/country:us/state:pa/cd:7': { name: 'Pennsylvania\'s 7th congressional district', officeIndices: [0] },
        'ocd-division/country:us/state:pa/place:allentown': { name: 'Allentown city', officeIndices: [3] },
      },
      officials: MOCK_REPS,
    };
    const auth = c.req.header('Authorization');
    const userId = mockVerifyJWT(auth);
    if (userId !== 'anon') {
      const entity = new CivicEntity(c.env, userId);
      await entity.save({ id: userId, address, response: mockResponse, updatedAt: Date.now() });
    }
    return ok(c, mockResponse);
  });
  // AI SUMMARY
  app.post('/api/ai/summarize', async (c) => {
    const { feedId, rawText } = await c.req.json<{ feedId: string, rawText: string }>();
    if (!isStr(feedId) || !isStr(rawText)) {
      return bad(c, 'feedId and rawText are required.');
    }
    const entity = new AiSummaryEntity(c.env, feedId);
    const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    if (await entity.exists()) {
      const summary = await entity.getState();
      if (Date.now() - summary.cachedAt < summary.ttl) {
        return ok(c, summary);
      }
    }
    // Mock Llama/Mistral call
    const summaryText = `Summary: ${rawText.slice(0, 100)}... analyzed via mock Workers AI. Key insight 1. Insight 2. Insight 3.`;
    const newSummary = {
      id: feedId,
      narrative: summaryText,
      cachedAt: Date.now(),
      ttl: TTL_MS,
    };
    await entity.save(newSummary);
    return ok(c, newSummary);
  });
  // FEED STATS
  app.get('/api/feeds/stats', async (c) => {
    const { items } = await FeedStatsEntity.list(c.env, null, 1000);
    return ok(c, items);
  });
  app.post('/api/feeds/:id/vote', async (c) => {
    const id = c.req.param('id');
    const { voteType } = (await c.req.json()) as { voteType?: 'up' | 'down' };
    if (voteType !== 'up' && voteType !== 'down') {
      return bad(c, 'Invalid voteType. Must be "up" or "down".');
    }
    const entity = new FeedStatsEntity(c.env, id);
    if (!(await entity.exists())) {
      await FeedStatsEntity.create(c.env, { id, upvotes: 0, downvotes: 0, status: 'active' });
    }
    const updatedStats = await entity.mutate(s => ({ ...s, [voteType === 'up' ? 'upvotes' : 'downvotes']: s[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1 }));
    return ok(c, updatedStats);
  });
  // GET single feed with stats + geo
  app.get('/api/feeds/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'invalid id');
    const statsEntity = new FeedStatsEntity(c.env, id);
    if (!(await statsEntity.exists())) return notFound(c, 'feed stats not found');
    const stats = await statsEntity.getState();
    const geoEntity = new GeoEntity(c.env, id);
    const geo = await geoEntity.exists() ? await geoEntity.getState() : null;
    return ok(c, { id, stats, geo });
  });
  // POST toggle feed status active/inactive
  app.post('/api/feeds/:id/toggle-status', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'invalid id');
    const entity = new FeedStatsEntity(c.env, id);
    if (!(await entity.exists())) {
      await FeedStatsEntity.create(c.env, { id, upvotes: 0, downvotes: 0, status: 'inactive' });
    }
    const updated = await entity.mutate((s) => ({
      ...s,
      status: s.status === 'active' ? 'inactive' : 'active',
    }));
    return ok(c, updated);
  });
  // GEOSPATIAL & MODULES
  app.get('/api/geo/all', async (c) => {
    const { items } = await GeoEntity.list(c.env, null, 1000);
    return ok(c, items);
  });
  app.post('/api/entities/extract', async (c) => {
    const { feedIds } = (await c.req.json()) as { feedIds?: string[] };
    if (!Array.isArray(feedIds) || feedIds.length === 0) return bad(c, 'feedIds array required');
    const results = await Promise.all(feedIds.map(async (feedId) => {
      const lat = 40.60 + (Math.random() - 0.5) * 0.2;
      const lon = -75.47 + (Math.random() - 0.5) * 0.2;
      const confidence = Math.random() * 0.5 + 0.4;
      const geoData = { id: feedId, lat, lon, confidence, source: "mock-ner" };
      const entity = new GeoEntity(c.env, feedId);
      if (!(await entity.exists())) {
        await GeoEntity.create(c.env, geoData);
      } else {
        await entity.patch(geoData);
      }
      return geoData;
    }));
    return ok(c, { extracted: results.length });
  });
  app.get('/api/modules/config', (c) => {
    const moduleConfigs = MODULES.map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      enabled: true,
      priority: 1
    }));
    return ok(c, moduleConfigs);
  });
  // SENTIMENT
  app.get('/api/sentiment/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new SentimentEntity(c.env, id);
    if (!(await entity.exists())) {
      const mockSentiment = { id, positive: Math.random() * 0.4 + 0.3 };
      await SentimentEntity.create(c.env, mockSentiment);
      return ok(c, mockSentiment);
    }
    const sentiment = await entity.getState();
    return ok(c, sentiment);
  });
  // SAVED QUERIES
  app.get('/api/queries', async (c) => {
    const { items } = await QueryEntity.list(c.env, null, 100);
    return ok(c, items);
  });
  app.post('/api/query/save', async (c) => {
    const { facets, velocityWindow, searchQuery } = (await c.req.json()) as any;
    const queryData = {
      id: crypto.randomUUID(),
      facets: facets ?? {},
      velocityWindow: velocityWindow ?? 24,
      searchQuery: searchQuery ?? '',
      createdAt: new Date().toISOString(),
      alerts: { dailyDigest: false },
    };
    const saved = await QueryEntity.create(c.env, queryData);
    return ok(c, saved);
  });
  app.post('/api/query/alerts', async (c) => {
    const { id, enabled } = (await c.req.json()) as { id: string, enabled: boolean };
    if (!isStr(id)) return bad(c, 'Query ID is required');
    const entity = new QueryEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Query not found');
    const updated = await entity.mutate(q => ({ ...q, alerts: { ...q.alerts, dailyDigest: !!enabled } }));
    return ok(c, updated);
  });
  app.delete('/api/query/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await QueryEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Query not found');
    return ok(c, { id });
  });
  // NEW UTILITY MODULE ENDPOINTS
  app.get('/api/commute', (c) => {
    const mockIncidents = [
      { id: 'inc1', type: 'accident', severity: 'high', description: 'Multi-vehicle accident on PA-22 E at Fullerton Ave.', location: { lat: 40.62, lon: -75.48 }, timestamp: Date.now() - 300000 },
      { id: 'inc2', type: 'roadwork', severity: 'medium', description: 'Lane closure on I-78 W near exit 60 for construction.', location: { lat: 40.56, lon: -75.43 }, timestamp: Date.now() - 3600000 },
      { id: 'inc3', type: 'congestion', severity: 'low', description: 'Heavy traffic on MacArthur Rd near Lehigh Valley Mall.', location: { lat: 40.64, lon: -75.49 }, timestamp: Date.now() - 600000 },
    ];
    return ok(c, mockIncidents);
  });
  app.get('/api/gov/search', (c) => {
    const q = c.req.query('q');
    if (!q) return ok(c, []);
    const mockResults = [
      { id: 'res1', document: 'Allentown_City_Council_Minutes_2024-04.pdf', excerpt: `...the motion to approve the new zoning variance for the downtown area passed with a 5-2 vote...`, score: 0.92, date: '2024-04-18' },
      { id: 'res2', document: 'Bethlehem_Planning_Commission_Agenda_2024-05.pdf', excerpt: `...a public hearing is scheduled to discuss the proposed 'Greenway Extension' project...`, score: 0.85, date: '2024-05-02' },
    ];
    return ok(c, mockResults.filter(r => r.excerpt.toLowerCase().includes(q.toLowerCase())));
  });
  app.get('/api/geo/layers', (c) => {
    const mockLayers = [
      { id: 'parks', name: 'Parks & Rec', geoData: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [-75.47, 40.60] }, properties: { name: 'Allentown Central Park' } }] } },
      { id: 'flood-zones', name: 'Flood Zones', geoData: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [-75.37, 40.61] }, properties: { name: 'Lehigh River Floodplain' } }] } },
      { id: 'historic-sites', name: 'Historic Sites', geoData: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [-75.37, 40.62] }, properties: { name: 'Historic Bethlehem' } }] } },
    ];
    return ok(c, mockLayers);
  });
  app.get('/api/economy/housing', (c) => {
    const mockTrends: HousingTrend[] = [
      { id: 'price-1mo', metric: 'price', value: 320000, trend: 5.2, period: '1mo' },
      { id: 'price-3mo', metric: 'price', value: 318000, trend: 3.8, period: '3mo' },
      { id: 'inventory-1mo', metric: 'inventory', value: 180, trend: -2.1, period: '1mo' },
      { id: 'inventory-3mo', metric: 'inventory', value: 195, trend: -8.5, period: '3mo' },
    ];
    return ok(c, mockTrends);
  });
  app.get('/api/market', (c) => {
    const mockListings: MarketListing[] = [
      { id: 'l1', title: '2BR Allentown Condo', price: 285000, location: 'Center City', url: 'https://example.com/listing1' },
      { id: 'l2', title: '3BR Bethlehem Townhome', price: 425000, location: 'Southside', url: 'https://example.com/listing2' },
      { id: 'l3', title: 'Single Family Home in Easton', price: 350000, location: 'College Hill', url: 'https://example.com/listing3' },
      { id: 'l4', title: 'Luxury Apartment Downtown', price: 2200, location: 'Allentown', url: 'https://example.com/listing4' },
      { id: 'l5', title: 'Historic Bethlehem Property', price: 650000, location: 'Historic District', url: 'https://example.com/listing5' },
      { id: 'l6', title: 'Suburban House with Yard', price: 410000, location: 'Lower Macungie', url: 'https://example.com/listing6' },
      { id: 'l7', title: 'Starter Home in Whitehall', price: 295000, location: 'Whitehall', url: 'https://example.com/listing7' },
      { id: 'l8', title: 'Loft in Easton Silk Mill', price: 315000, location: 'Easton', url: 'https://example.com/listing8' },
      { id: 'l9', title: 'Ranch Home in Emmaus', price: 340000, location: 'Emmaus', url: 'https://example.com/listing9' },
      { id: 'l10', title: 'New Construction in Upper Macungie', price: 550000, location: 'Upper Macungie', url: 'https://example.com/listing10' },
      { id: 'l11', title: 'Bethlehem Twin with Updates', price: 310000, location: 'North Bethlehem', url: 'https://example.com/listing11' },
      { id: 'l12', title: 'Allentown Row Home', price: 190000, location: 'West End', url: 'https://example.com/listing12' },
    ];
    return ok(c, mockListings);
  });
  app.get('/api/events', (c) => {
    const mockEvents: EventItem[] = Array.from({ length: 20 }).map((_, i) => ({
      id: `e${i + 1}`,
      title: i % 3 === 0 ? 'Musikfest Performance' : (i % 3 === 1 ? 'City Council Meeting' : 'D&L Trail Hike'),
      date: new Date(Date.now() + i * 1000 * 60 * 60 * 24).toISOString(),
      location: i % 3 === 0 ? 'ArtsQuest' : (i % 3 === 1 ? 'Allentown City Hall' : 'Jacobsburg Park'),
      category: i % 3 === 0 ? 'arts' : (i % 3 === 1 ? 'civic' : 'sports'),
      url: 'https://example.com/event' + (i + 1),
    }));
    return ok(c, mockEvents);
  });
}