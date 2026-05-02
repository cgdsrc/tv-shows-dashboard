# ShowVault — TV Shows Dashboard

A TV show discovery app built with Vue 3 and TypeScript. It uses the free [TVMaze API](https://www.tvmaze.com/api) to display shows grouped by genre, allow searching, and show detailed information per show.

---

## Requirements

- **Node.js** v18 or higher (developed on v24)
- **npm** v9 or higher

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run unit tests (watch mode)
npm test

# Run unit tests once
npm run test:run
```

---

## Tech Stack

| Package             | Why it's here                                                                        |
| ------------------- | ------------------------------------------------------------------------------------ |
| **Vue 3**           | UI framework — Composition API with `<script setup>`                                 |
| **TypeScript**      | Type safety across the whole codebase                                                |
| **Vite**            | Build tool and dev server — fast HMR, bundles `.vue` and `.ts` files for the browser |
| **Vue Router 4**    | Client-side routing with lazy-loaded route components                                |
| **Pinia**           | State management — holds the current page of shows and pagination state              |
| **Vitest**          | Unit test runner — compatible with Vite config, no extra setup needed                |
| **@vue/test-utils** | Mounts Vue components in tests                                                       |
| **jsdom**           | Simulates a browser DOM environment for Vitest                                       |

No UI component library is used. All styles are custom CSS with CSS variables.

---

## Architecture Decisions

### Dashboard — Page-by-Page Loading

The TVMaze `/shows?page=N` endpoint returns up to 250 shows per page. Instead of fetching multiple pages at once and keeping them all in memory, the dashboard loads **one page at a time**.

When the user clicks "Next" or "Previous", the current page's data is **replaced** — not accumulated. This was a deliberate choice to avoid memory growth on higher page numbers. The Pinia store (`showStore`) holds only the shows for the current page.

The API does not expose a total page count, so the UI shows "Page N" only. When the API returns a 404, `hasMore` is set to `false` and the Next button is disabled.

### Genre View — Infinite Scroll

The genre detail page (`/genre/:name`) works differently from the dashboard. It fetches pages starting from 0 and **appends** shows as the user scrolls down. An `IntersectionObserver` watches a sentinel element at the bottom of the list and triggers the next fetch automatically.

This approach makes sense here because the user is browsing a single filtered list, and appending more results as they scroll is a natural UX pattern for that context. The genre view manages its own local state and does not share the dashboard's Pinia store — changing the genre resets the list and starts over.

### Show Detail Page — Self-Contained Data Fetching

The show detail page fetches its own data directly from the API using the show ID from the URL. It does not depend on the store for the main show data.

For the "You Might Also Like" section it uses `store.getRelatedShows()`, which looks up shows from whatever page the store currently holds. If the store is empty (e.g. the user opened the detail page directly), it triggers `fetchPage(0)` to get some data.

Episodes are fetched separately per season via `/seasons/:id/episodes` when the user selects a season from the dropdown.

### HorizontalScroll — Shared Component

Horizontal scrolling with hover-reveal arrows is used in three places on the detail page (cast, episodes, related shows) and also in the dashboard genre rows. This logic lives in a single `HorizontalScroll.vue` component instead of being repeated. It accepts a `listClass` prop so each consumer can control gap and padding independently.

### Routing

All route components are lazy-loaded using dynamic `import()`. This means the browser only downloads the code for a page when the user navigates to it.

| Route          | View           |
| -------------- | -------------- |
| `/`            | Dashboard      |
| `/show/:id`    | Show Detail    |
| `/genre/:name` | Genre Browse   |
| `/search`      | Search Results |

---

## Project Structure

```
src/
├── assets/
│   └── theme.css          # Global CSS variables, reset, dark theme
├── components/
│   ├── AppHeader.vue       # Sticky top navigation with search
│   ├── CustomSelect.vue    # Accessible dropdown (season picker)
│   ├── EpisodeCard.vue     # Single episode card
│   ├── GenreRow.vue        # Horizontal genre row on dashboard
│   ├── HorizontalScroll.vue # Reusable scroll container with arrows
│   ├── SearchBar.vue       # Search input with debounce
│   ├── ShowCard.vue        # Show poster card
│   └── SkeletonLoader.vue  # Loading placeholders
├── router/
│   └── index.ts            # Vue Router configuration
├── services/
│   └── tvmazeApi.ts        # All TVMaze API calls
├── stores/
│   └── showStore.ts        # Pinia store — pagination state
├── types/
│   └── show.ts             # TypeScript interfaces
└── views/
    ├── DashboardView.vue
    ├── GenreView.vue
    ├── SearchResultsView.vue
    └── ShowDetailView.vue
```

---

## Testing

Unit tests are in `src/stores/__tests__/`. They cover the Pinia store logic: genre grouping, rating sorting, multi-genre shows, and pagination state.

```bash
npm run test:run
```
