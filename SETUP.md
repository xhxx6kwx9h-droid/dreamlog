# DreamLog Setup Guide

## Quick Start

### Prerequisites

Choose your OS:

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify Rust is installed (or install via https://rustup.rs/)
rustc --version
cargo --version

# Node.js 18+ (download from https://nodejs.org)
node --version
npm --version
```

#### Windows
```powershell
# Install Rust (https://rustup.rs/)
rustup update

# Install Visual Studio Build Tools 2019+
# Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Node.js 18+ (download from https://nodejs.org)
node --version
npm --version
```

### Installation Steps

1. **Navigate to project**
   ```bash
   cd dreamlog
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run tauri dev
   ```

   This will:
   - Start the Vite dev server on http://localhost:5173
   - Compile the Rust backend
   - Launch the Tauri application window
   - Enable hot-reload for React components

4. **Build for production**
   ```bash
   npm run tauri build
   ```

   This creates:
   - **macOS**: `.app` and `.dmg` files in `src-tauri/target/release/bundle/macos/`
   - **Windows**: `.exe` and `.msi` files in `src-tauri/target/release/bundle/msi/`

## Project Architecture

### Frontend (React + TypeScript)

**Location**: `/src`

Structure:
```
src/
├── pages/                 # Route pages
│   ├── Home.tsx          # Main dashboard with calendar & dream list
│   ├── DreamDetail.tsx   # Single dream view/edit
│   └── Settings.tsx      # Backup, PIN, settings
├── components/           # Reusable components
│   ├── Calendar.tsx      # Month calendar
│   ├── DreamModal.tsx    # Create/edit dream form
│   ├── Toast.tsx         # Notifications
│   ├── PinLock.tsx       # PIN lock screen
│   └── StarRating.tsx    # Intensity selector
├── api/                  # Tauri command wrappers
│   └── dream.ts         # API calls to Rust backend
├── types/               # TypeScript interfaces
│   └── dream.ts         # Dream type definitions
├── styles/              # Global styles
│   └── globals.css      # TailwindCSS setup
├── App.tsx              # Root component, routing
└── main.tsx             # React entry point
```

**Tech Stack**:
- React 18 - UI library
- React Router v6 - Client-side routing
- TailwindCSS - Styling
- TypeScript - Type safety
- Lucide React - Icons

### Backend (Rust + Tauri)

**Location**: `/src-tauri/src`

Modules:
- **main.rs** - Entry point, Tauri command handlers
- **models.rs** - Data structures (Dream, Mood, etc.)
- **db.rs** - SQLite database operations
- **security.rs** - PIN hashing with Argon2

**Tech Stack**:
- Tauri v2 - Desktop framework
- SQLx - Type-safe SQL queries
- Serde - Serialization/deserialization
- Chrono - Date/time handling
- Argon2 - Password hashing
- UUID - Unique identifiers

### Database

**Location**: `~/.cache/dreamlog/dreamlog.db` (auto-created on first run)

**Schema**:
```sql
CREATE TABLE dreams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL,              -- JSON array: ["tag1", "tag2"]
    mood TEXT NOT NULL,               -- "happy", "sad", "scary", "romantic", "weird", "neutral"
    intensity INTEGER NOT NULL,       -- 1-5
    lucid INTEGER NOT NULL,           -- 0 or 1 (boolean)
    created_at TEXT NOT NULL,         -- ISO 8601 datetime
    updated_at TEXT NOT NULL          -- ISO 8601 datetime
)
```

## Available Commands

### Tauri Commands (Rust Backend)

The frontend calls these commands via `@tauri-apps/api/core`:

```typescript
// List dreams with optional filters
await invoke("list_dreams", { 
  filters: { 
    query?: string,
    mood?: string,
    tags?: string[],
    dateFrom?: string,
    dateTo?: string,
    day?: string
  }
})

// Get single dream
await invoke("get_dream", { id: string })

// Create or update dream
await invoke("upsert_dream", { dream: Dream })

// Delete dream
await invoke("delete_dream", { id: string })

// Export all dreams as JSON
await invoke("export_json")

// Import dreams from JSON
await invoke("import_json", { json: string })

// Hash PIN
await invoke("hash_pin", { pin: string })

// Verify PIN
await invoke("verify_pin", { pin: string, hash: string })

// Get app paths (debugging)
await invoke("get_app_paths")
```

### NPM Scripts

```bash
# Development
npm run tauri dev          # Start dev server with hot-reload

# Production
npm run tauri build        # Build for current platform
npm run type-check         # TypeScript type checking
npm run preview            # Preview Vite build
```

## Features Walkthrough

### 1. Create a Dream
- Click "New Dream" button
- Fill in the form:
  - **Title** (required)
  - **Date & Time** (when the dream occurred)
  - **Mood** (emoji selector)
  - **Intensity** (1-5 star rating)
  - **Lucid Dream** (checkbox)
  - **Content** (full dream narrative)
  - **Tags** (add multiple tags)
- Click "Save Dream"

### 2. Browse Dreams
- **Calendar View** (left sidebar):
  - Dates with dreams are highlighted
  - Click a date to filter dreams
  - Navigate between months
- **Toggle "All Dreams"** to see all dreams vs. selected day only
- **Search Box** - Type to search titles and content
- **Mood Filter** - Filter by emoji mood
- **Tags Filter** - Multi-select tags to filter

### 3. View Dream Details
- Click any dream card to view full details
- See all metadata: mood, intensity, tags, lucid status
- Edit or delete from detail view

### 4. Backup & Import
- Go to Settings
- **Export Dreams**: Save all dreams as JSON file
- **Import Dreams**: Load previously exported JSON
  - Merges by dream ID
  - Updates existing, adds new

### 5. PIN Lock (Optional)
- Go to Settings
- **Enable PIN Lock**:
  - Set 4+ digit PIN
  - Confirm PIN
  - PIN is hashed locally (Argon2)
- On app restart, enter PIN to unlock
- **Disable PIN Lock**: Remove protection

## Troubleshooting

### "command not found: tauri"
```bash
# Reinstall dependencies
npm install
npm install -g @tauri-apps/cli@latest
```

### Database errors
```bash
# Reset database (backup first!)
rm -rf ~/.cache/dreamlog
# Or on macOS:
rm -rf ~/Library/Application\ Support/dreamlog
```

### Rust compilation errors
```bash
# Update Rust
rustup update

# Clean build
npm run tauri build -- --release --no-strip
```

### Port 5173 already in use
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9
# or change port in vite.config.ts
```

## Development Workflow

### Local Development
1. Keep `npm run tauri dev` running
2. Edit React code (auto-refreshes)
3. For Rust changes: restart dev server

### Version Bump
Edit version in:
- `package.json` - version field
- `src-tauri/Cargo.toml` - version field
- `src-tauri/tauri.conf.json` - version field

### Cross-Platform Testing
```bash
# Build for specific platform
npm run tauri build --target macos    # macOS only
npm run tauri build --target windows  # Windows only
npm run tauri build                   # Current platform
```

## Project Statistics

- **Frontend Files**: 15+ React/TypeScript files
- **Backend Files**: 4 Rust modules
- **Dependencies**: 25+ npm packages, 20+ Rust crates
- **Database**: Single SQLite table
- **Icons**: 50+ from Lucide React
- **Package Size**: ~50MB (development), ~30MB (production bundle)

## Support & Resources

- **Tauri Docs**: https://tauri.app/v1/guides/
- **React Docs**: https://react.dev
- **SQLx Docs**: https://github.com/launchbadge/sqlx
- **TailwindCSS**: https://tailwindcss.com

## License

MIT - Feel free to use and modify!
