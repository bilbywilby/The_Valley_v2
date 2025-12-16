import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, FeedStatsEntity, GeoEntity, QueryEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
const MODULES = ['news', 'gov', 'safety', 'community', 'arts', 'transit', 'business', 'education', 'lifestyle', 'health', 'sports', 'media', 'utilities'];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
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
    };
    const saved = await QueryEntity.create(c.env, queryData);
    return ok(c, saved);
  });
}