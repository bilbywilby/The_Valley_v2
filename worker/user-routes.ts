import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, FeedStatsEntity, GeoEntity, QueryEntity, SentimentEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
const MODULES = ['news', 'gov', 'safety', 'community', 'arts', 'transit', 'business', 'education', 'lifestyle', 'health', 'sports', 'media', 'utilities'];
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
    ]);
    await next();
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
}