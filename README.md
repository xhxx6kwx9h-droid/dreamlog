# DreamLog

A beautiful, offline-first dream journal desktop application built with Tauri, React, and TypeScript.

## Features

- 📝 Create, edit, and delete dreams with rich details
- 🔍 Search and filter dreams by mood, tags, date
- 📅 Month calendar view to browse dreams by date
- 💾 JSON export/import for backups
- 🔐 Optional PIN lock for privacy (locally hashed)
- 🎨 Modern, responsive UI with TailwindCSS
- 💻 Cross-platform: macOS and Windows

## Prerequisites

### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Node.js 18+ (https://nodejs.org)

### Windows
- Rust (https://rustup.rs/)
- Visual Studio Build Tools 2019+

## Setup

1. **Clone and navigate**
   ```bash
   cd dreamlog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Development

```bash
npm run tauri dev
```

This will start the Vite dev server and launch the Tauri application.

## Building

```bash
npm run tauri build
```

This creates:
- **macOS**: `.app` and `.dmg` in `src-tauri/target/release/bundle/macos/`
- **Windows**: `.exe` and `.msi` in `src-tauri/target/release/bundle/msi/`

## Project Structure

```
dreamlog/
├── src/                      # React frontend
│   ├── pages/               # Routes (Home, DreamDetail, Settings)
│   ├── components/          # React components
│   ├── api/                 # Tauri command calls
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── models.rs       # Data models
│   │   ├── db.rs           # SQLite database
│   │   └── security.rs     # PIN hashing
│   ├── tauri.conf.json    # Tauri config
│   └── Cargo.toml
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

## Data Model

```typescript
Dream {
  id: string (UUID)
  title: string
  occurredAt: ISO datetime
  content: string
  tags: string[]
  mood: "happy" | "sad" | "scary" | "romantic" | "weird" | "neutral"
  intensity: 1-5
  lucid: boolean
  createdAt: ISO datetime
  updatedAt: ISO datetime
}
```

## Features

### Dream Management
- Create new dreams with title, date, content, mood, tags, intensity, lucid indicator
- Edit existing dreams
- Delete dreams (with confirmation)
- Soft-deleted dreams recover with undo

### Browsing
- Calendar month view with highlighted dream dates
- Click any date to view that day's dreams
- Search across all dream titles and content
- Filter by mood, tags, date range

### Backup
- Export all dreams as JSON
- Import previously exported dreams (merge by ID)
- Settings page for backup management

### Security
- Optional PIN lock at startup
- PIN stored with Argon2 hashing (no plaintext)
- If enabled, shows lock screen before app loads

## Tauri Commands

The backend exposes:
- `list_dreams(filters)` → Dream[]
- `get_dream(id)` → Dream | null
- `upsert_dream(dream)` → Dream
- `delete_dream(id)` → void
- `export_json()` → string
- `import_json(json)` → { imported, updated }
- `hash_pin(pin)` → string
- `verify_pin(pin, hash)` → boolean

## Development Tips

- Hot reload: Changes to React code auto-refresh the UI
- Rust changes: Restart `npm run tauri dev`
- Database: Stored in app data directory (~/.cache/dreamlog on Linux, ~/Library/Application Support/dreamlog on macOS)

## License

MIT
