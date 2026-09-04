# Architecture

FlyVista deliberately keeps the runtime small and offline-first.

## Frontend

The user interface is a Vite-built React application. Three.js renders PLY neuropil meshes from `public/neuropils/`. Functional-system definitions and region descriptions live in `src/brain-data.ts`.

The production frontend is a static `dist/` directory. It has no server-side routes, database, authentication or remote runtime dependency.

## Desktop shell

Tauri 2 packages the static frontend for macOS and Windows. The Rust shell exposes only Tauri's default core permissions and defines no custom commands. This limits the native attack surface and keeps the same visualization code across Web and desktop builds.

## Data boundary

All 78 mesh files ship inside the application bundle. No file is loaded from DigitalFlyV3 or another sibling checkout. Dataset provenance and redistribution terms are documented in `DATA_LICENSE.md`.

## Release boundary

GitHub Actions builds each operating-system artifact on its native runner. Release artifacts are generated from version tags and are never committed to the repository.
