# Lehigh Valley Civic Intelligence Dashboard
[cloudflarebutton]
A comprehensive, interactive, and visually polished Progressive Web App (PWA) serving as a definitive civic intelligence dashboard for the Lehigh Valley region. The application aggregates over 140+ hyper-local feeds and presents them as modular overlays with geospatial intelligence capabilities.
## Features
- **Dynamic Civic Dashboard**: A categorized, responsive grid of intelligence sources with real-time search and filtering.
- **Sticky Search & Filtering**: Instant keyword and category search that sticks to the top while scrolling.
- **Personalization**: Star sources to curate a "My Feeds" view, persisted locally via LocalStorage.
- **Data Export**: Download feeds as OPML (RSS readers) or CSV (spreadsheets) with proper sanitization.
- **Community Vetting**: Thumbs up/down voting with backend storage for community-driven health scores.
- **Source Health Status**: Visual badges indicating Active/Inactive status.
- **PWA Support**: Installable app with offline capabilities and smooth mobile experience.
- **Advanced UX**: Keyboard shortcuts, pagination, sorting, skeletons for loading, and dark mode.
- **Modular Civic Overlays**: Toggle categories on/off to focus on specific intelligence areas like Government, Safety, or Arts.
- **Geospatial Intelligence Calibration**: Visualize the geographic distribution of sources and run calibration routines.
## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
- **State Management**: Zustand (local), TanStack Query (API)
- **Backend**: Hono (Cloudflare Workers), Durable Objects for stateful voting data
- **UI Components**: Radix UI primitives, Lucide icons, Sonner (toasts)
- **Deployment**: Cloudflare Workers/Pages, Wrangler CLI
- **Utilities**: clsx, tailwind-merge, date-fns, UUID
## Quick Start
1. **Install Bun** (recommended for speed):
   ```
   curl -fsSL https://bun.sh/install | bash
   ```
2. **Clone & Install**:
   ```
   git clone <your-repo-url>
   cd valley-feed-index
   bun install
   ```
3. **Development**:
   ```
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)
4. **Type-check & Lint**:
   ```
   bun run typecheck
   bun run lint
   ```
## Usage
- **Search & Filter**: Use the sticky search bar for keywords/categories.
- **Personalize**: Star feeds (⌘+S shortcut) and switch to "My Feeds" tab.
- **Vote**: Thumbs up/down to contribute to community health scores.
- **Export**: OPML for RSS readers (Feedly/Inoreader), CSV for analysis.
- **Install PWA**: Add to home screen for offline access.
- **Keyboard Shortcuts**:
  - `/` or `S`: Focus search
  - `F`: Toggle "My Feeds"
  - `E`: Export menu
## Development
### Scripts
```
bun run dev      # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run preview  # Preview production build
bun run lint     # Run ESLint
bun run typecheck # TypeScript check
cf-typegen       # Generate Cloudflare types (wrangler types)
```
### Folder Structure
```
src/
├── pages/          # Pages (HomePage.tsx is entry)
├── components/ui/  # shadcn/ui components (DO NOT MODIFY)
├── components/     # Custom components (FeedCard, StickySearch)
├── hooks/          # Custom hooks (useFeeds, useFavoritesStore)
├── lib/            # Utilities (api-client.ts, utils.ts)
└── store/          # Zustand stores
worker/
├── index.ts        # Hono app (DO NOT MODIFY)
├── user-routes.ts  # Add API routes here
└── entities.ts     # Durable Object entities (FeedVoteEntity)
```
### Adding API Endpoints
Extend `worker/user-routes.ts` using entities from `worker/entities.ts`:
```ts
// Example: Feed voting
app.post('/api/feeds/:id/vote', async (c) => {
  const id = c.req.param('id');
  const { upvote } = await c.req.json();
  // Use FeedVoteEntity.update(c.env, id, { upvote });
  return ok(c, updatedVote);
});
```
### Custom Entities
Extend `IndexedEntity` in `worker/entities.ts`:
```ts
export class FeedVoteEntity extends IndexedEntity<{ id: string; upvotes: number; downvotes: number }> {
  static readonly entityName = "feed-vote";
  static readonly indexName = "feed-votes";
}
```
Shared types in `shared/types.ts`.
## Deployment
Deploy to Cloudflare Workers/Pages:
1. **Build**:
   ```
   bun run build
   ```
2. **Deploy**:
   ```
   wrangler deploy
   ```
3. **One-Click Deploy**:
   [cloudflarebutton]
**Bindings**: Uses single `GlobalDurableObject` (managed automatically).
**Preview**: `wrangler deploy --env preview` (add environments to `wrangler.toml`).
## Environment Variables
No env vars required. All config in `wrangler.jsonc` (DO NOT MODIFY).
## Contributing
1. Fork & clone
2. `bun install`
3. Create branch: `git checkout -b feature/add-search`
4. Commit: `git commit -m "feat: add sticky search"`
5. PR to `main`
Follow ESLint/TypeScript rules. Lint before PR.
## License
MIT License. See [LICENSE](LICENSE) for details.
---
Built with ❤️ at Cloudflare. Suggest feeds via GitHub Issues!