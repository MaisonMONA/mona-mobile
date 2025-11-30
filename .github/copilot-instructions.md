# MONA Copilot Instructions

## Architecture Snapshot
- Vue 3 + Ionic (`src/main.ts`) mounts a single `ion-app` with a global `BadgeUnlockModal` and uses Pinia (`createPinia`) plus Vue Router configured in `src/router/index.ts`.
- Navigation is tab-centric: `/tabs/*` renders `TabsPage.vue`, whose children lazily load `MapPage`, `ListPage`, `CollectionPage`, and `MorePage`; deep links such as `/discovery-details/:type/:id` bypass the tab shell for modal-style flows.
- "Views" under `src/views/` are thin Ion page wrappers—real logic lives in `src/components/**` and `src/internal/**`; prefer editing containers/components when changing feature behaviour.

## Data & Persistence
- Static catalogues live in `src/internal/databases/*Database.ts`, each extending `Database` to pull JSON from `Capacitor Filesystem` (Directory.Data/appdata) or fall back to the hosted API endpoints declared in `src/internal/Globals.ts`.
- User-specific state (`token`, collected/targeted discoveries, cached photos, badge progress) is centralized in `UserData` (`src/internal/databases/UserData.ts`) and mirrored to `Capacitor Filesystem`; always go through the provided `UserData` methods instead of mutating components directly.
- `UserData.loadCache()` builds alphabetical and distance-ordered discovery lists saved to Directory.Cache—call `UserData.buildCache()`/`sortByDistance()` whenever discovery data changes, otherwise the map/list will desynchronize.
- Badge metadata is provided by `BadgeDatabase`; invocation of `CollectedBadge.determineCollectedBadges()` (see `DataLoadingPage.vue`) must occur after databases and user data load so earned badges are persisted before UI renders.

## State, Stores & Events
- Pinia stores in `src/stores/` wrap `UserData` for reactivity: `useCollection` exposes `collected` via `UserData.getCollectedChronologically()`, and `useBadgesCollections` orchestrates badge progress counters plus unlock side effects.
- The lightweight event bus in `src/internal/eventBus.ts` is the only cross-cutting notification mechanism; currently only the `badge-unlocked` event is emitted (from `useBadgesCollections.showBadgeNotification`) and consumed globally by `BadgeUnlockModal.vue`. Reuse this bus for additional global overlays instead of ad-hoc `window` listeners.

## Location, Map & Distance
- `MapContainer.vue` (used by `MapPage.vue`) wraps OpenLayers (`ol/*`) for rendering all discoveries; pin styling depends on `UserData.isCollected`/`isTargeted`, so ensure those helpers stay performant.
- Real-time positioning is abstracted by `src/internal/LocationService.ts`, which wraps `@capacitor/geolocation.watchPosition` and lets components subscribe/unsubscribe; update this service instead of touching the plugin directly.
- Distance helpers in `src/internal/Distance.ts` drive UI labels and sorting for nearby discoveries; any new proximity logic should import `Distance.calculateDistance` to stay consistent with the accordion output.

## Capture & Upload Flow
- Discovery interactions (`DiscoveryDetails.vue`, `DiscoveryDetailsFullModale.vue`) use `UserData.addCollected`, `addPendingUpload`, `addTargeted`, etc. plus the `Utils` camera helpers (`takePicture`, `savePicture`, `sendPictureAndDetails`). Always await these utilities so the Capacitor Filesystem stays coherent.
- After photos are saved locally they are queued in `UserData.pendingUpload`; `UserData.tryUploadingPendingDiscoveries()` (kicked off in `DataLoadingPage.vue`) retries missed uploads, so new flows that enqueue uploads must leave pending entries untouched.

## Auth & Bootstrapping
- Login/Register pages (`src/views/LoginPage.vue`, `RegisterPage.vue`) call `UserData.populate()` before checking tokens; redirecting anywhere else before `DataLoadingPage.vue` finishes will leave the in-memory DB empty.
- `DataLoadingPage.vue` is the gatekeeper: it sequentially populates all databases, fetches remote user state, computes badges, kicks off async refresh tasks (`UserData.checkForDBUpdate`, `UserData.tryUploadingPendingDiscoveries`), and finally routes to `/tabs/map`. Any new initialization must hook into this lifecycle.

## Styling & Assets
- Global styles live in `src/global.css` and Ionic theme variables are declared in `src/theme/(DEFAULT_FILE)_variables.css`; component-scoped CSS often `@import`s from `src/theme/*.css` so keep shared rules there.
- Static imagery, pins, and animations reside under `public/assets/**`; the giant files under `android/app/src/main/assets/public/assets` are generated bundles—do not edit them manually.

## Build, Run & Test
- Local web dev: `npm install` then `npm run dev` (Vite) or `ionic serve` (reuses the same Vite config but adds Ionic tooling). Mobile hot reload: `ionic cap run ios -l --external` or `ionic cap run android -l --external` after `ionic cap sync`.
- Production build: `npm run build` (runs `vue-tsc` type-check + `vite build`); skip type-checking with `npm run build:skip-check` when debugging Capacitor issues.
- Tests: `npm run test:unit` uses Vitest/JSdom (see `vite.config.ts` test block) and `npm run test:e2e` drives Cypress pointing at `http://localhost:8100` (ionic serve default). Lint with `npm run lint` before committing.

## Conventions & Gotchas
- Use the `@` alias from `vite.config.ts` for any import into `src/**`; keep absolute paths for Capacitor asset references (e.g., `/assets/drawable/...`).
- Many components still read/write via DOM APIs (`document.querySelector`, `document.getElementById`); when modernizing, prefer Vue refs but ensure legacy selectors stay functional until both web and native builds are verified.
- When adding new Pinia state derived from `UserData`, expose an action that refreshes from `UserData` to avoid stale singleton references.
- Capacitor plugins (Camera, Filesystem, Geolocation, Native Settings, App) are assumed to exist; browser builds need graceful error handling similar to `LocationService.startWatching()` so keep try/catch blocks and avoid unguarded plugin calls.
