# DreamLog Copilot Instructions

## Project Overview
DreamLog is a cross-platform offline-first dream journal built with Tauri v2, React, TypeScript, and SQLite.

## Tech Stack
- **Frontend**: React 18 + TypeScript + TailwindCSS + React Router
- **Backend**: Tauri v2 + Rust
- **Database**: SQLite
- **Build**: Vite + npm
- **Platforms**: macOS + Windows

## Key Features
✅ Create/Edit/Delete dreams
✅ Search and filter by mood, tags, date
✅ Calendar month view
✅ JSON export/import backup
✅ Optional PIN lock (Argon2 hashed)
✅ Sample seeded data on first run

## File Structure
- `/src` - React frontend code
  - `pages/` - Home, DreamDetail, Settings
  - `components/` - Reusable UI components
  - `api/` - Tauri command wrappers
  - `types/` - TypeScript interfaces
  - `styles/` - TailwindCSS globals
- `/src-tauri` - Rust backend
  - `src/main.rs` - Entry point + commands
  - `src/models.rs` - Dream data model
  - `src/db.rs` - SQLite operations
  - `src/security.rs` - PIN hashing
  - `tauri.conf.json` - Tauri config

## Running the App
1. `npm install` - Install dependencies
2. `npm run tauri dev` - Launch dev mode (Vite hot-reload + Tauri window)
3. `npm run tauri build` - Build for macOS .app/.dmg and Windows .exe/.msi

## Database
- SQLite file: `~/.cache/dreamlog/dreamlog.db` (Linux/macOS varies by OS)
- Single table: `dreams`
- 10 fields: id, title, occurred_at, content, tags (JSON), mood, intensity, lucid, created_at, updated_at
- Seeded with 3 sample dreams on first run if DB is empty

## Important Notes
- All data is local only (no cloud, no sync)
- PIN is stored as Argon2 hash, never plaintext
- Tags stored as JSON array in SQLite
- Tauri v2 uses new plugin system (dialog, fs plugins)
- React Router handles navigation (/, /dream/:id, /settings)
