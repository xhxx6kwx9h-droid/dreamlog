# DreamLog Project File Tree

## Complete Directory Structure

```
dreamlog/
├── .github/
│   ├── copilot-instructions.md    # Copilot instructions for project
│   └── workflows/
│       └── build.yml              # GitHub Actions CI/CD
├── .gitignore                     # Git ignore rules
├── public/                        # Static assets (icons, etc.)
├── src/                           # Frontend (React + TypeScript)
│   ├── api/
│   │   └── dream.ts              # Tauri command wrappers
│   ├── components/
│   │   ├── Calendar.tsx           # Month calendar view
│   │   ├── DreamModal.tsx         # Create/edit form
│   │   ├── PinLock.tsx            # PIN lock screen
│   │   ├── StarRating.tsx         # 5-star intensity selector
│   │   └── Toast.tsx              # Toast notifications
│   ├── pages/
│   │   ├── Home.tsx               # Main dashboard
│   │   ├── DreamDetail.tsx        # Dream detail view
│   │   └── Settings.tsx           # Settings & backup
│   ├── styles/
│   │   └── globals.css            # TailwindCSS setup
│   ├── types/
│   │   └── dream.ts               # TypeScript interfaces
│   ├── App.tsx                    # Root component, routing
│   └── main.tsx                   # React entry point
├── src-tauri/                     # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── main.rs                # Entry point, commands
│   │   ├── models.rs              # Data structures
│   │   ├── db.rs                  # Database operations
│   │   └── security.rs            # PIN hashing
│   ├── tauri.conf.json            # Tauri configuration
│   └── Cargo.toml                 # Rust dependencies
├── index.html                     # HTML entry point
├── package.json                   # npm dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tsconfig.app.json              # App TypeScript config
├── tsconfig.path.json             # Path aliases
├── tailwind.config.ts             # TailwindCSS config
├── postcss.config.js              # PostCSS config
├── vite.config.ts                 # Vite config
├── README.md                      # Project overview
├── SETUP.md                       # Setup & development guide
└── .gitignore                     # Git ignore rules
```

## File Count & Sizes

### Frontend Files (~15 files)
- React Components: 7
- Pages: 3
- API & Types: 2
- Config & Styles: 3

### Backend Files (~4 files)
- Rust modules: 4
- Configuration: 2

### Configuration Files (~10 files)
- Build & Package config: 6
- TypeScript config: 3
- Environment: 1

**Total: 31+ project files**

## Key Configuration Files

### tsconfig.json
- Strict mode enabled
- ES2020 target
- JSX React support
- Path aliases (@/*) for clean imports

### vite.config.ts
- React plugin
- Path alias resolution
- ES2020 build target

### tailwind.config.ts
- Custom color palette (dream-* colors)
- Custom badge and button component classes

### postcss.config.js
- Tailwind CSS integration
- Autoprefixer for cross-browser support

### src-tauri/tauri.conf.json
- App name: "DreamLog"
- Package identifier: "com.dreamlog.app"
- macOS & Windows bundle configuration
- Minimum macOS version: 10.13

### src-tauri/Cargo.toml
- Tauri v2 with plugins
- SQLx async database
- Serde for serialization
- Argon2 for password hashing

## Development vs Production

### Development Build
```bash
npm run tauri dev
```
- Hot-reload enabled for React
- Unminified JavaScript
- SQLite database in app data directory
- Full error messages

### Production Build
```bash
npm run tauri build
```
- Minified & optimized bundle
- Tree-shaking applied
- Platform-specific bundles
- DMG (macOS) and MSI (Windows) installers

## Database Initialization

On first app launch:
1. Creates `~/.cache/dreamlog/dreamlog.db` (or platform equivalent)
2. Creates `dreams` table
3. Seeds with 3 sample dreams:
   - "Flying Over Mountains" (happy, lucid)
   - "Lost in an Old Library" (weird)
   - "Dancing Under Starlight" (romantic)

## Component Hierarchy

```
App (root with Router)
├── PinLock (if locked)
└── Routes
    ├── / (Home)
    │   ├── Calendar
    │   ├── DreamModal
    │   └── Dream Cards
    ├── /dream/:id (DreamDetail)
    │   └── DreamModal
    └── /settings (Settings)
        └── Import/Export/PIN controls
```

## Type Definitions

### Dream
```typescript
interface Dream {
  id: string              // UUID
  title: string
  occurredAt: string      // ISO 8601
  content: string
  tags: string[]
  mood: Mood
  intensity: number       // 1-5
  lucid: boolean
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}

type Mood = "happy" | "sad" | "scary" | "romantic" | "weird" | "neutral"
```

## Styling System

### TailwindCSS Utility Classes
- Custom colors: `dream-*` color palette
- Component classes:
  - `.btn-primary` - Primary action button
  - `.btn-secondary` - Secondary button
  - `.btn-danger` - Destructive action
  - `.card` - Card container
  - `.input-field` - Form input
  - `.badge` - Tag/label
  - `.badge-mood` - Mood indicator
  - `.badge-tag` - Dream tag

## Icons

Using Lucide React icons:
- `Plus` - Add/create
- `Trash2` - Delete
- `Edit2` - Edit
- `Search` - Search
- `Lock` - PIN lock
- `Star` - Rating/intensity
- `ChevronLeft/Right` - Calendar navigation
- `ArrowLeft` - Back navigation
- `Download/Upload` - Export/import
- `Check/X` - Validation

## Deployment

### GitHub Actions CI/CD

The `.github/workflows/build.yml` automatically:
- Builds on macOS (x86_64 + ARM64)
- Builds on Windows (x86_64)
- Creates release artifacts
- Uploads to release assets

### Manual Build

```bash
# macOS
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Performance Optimizations

- React lazy loading (pages via React Router)
- SQLite connection pooling (5 max connections)
- TailwindCSS purging (production builds)
- Vite code splitting
- Efficient re-renders (React memoization)
- Vector DB queries (indexed by date)

## Security

- PIN stored as Argon2 hash (never plaintext)
- No network requests (fully offline)
- SQLite parameterized queries (SQL injection prevention)
- Local data only (no cloud sync)
- HTTPS not needed (local desktop app)

## Future Enhancement Ideas

- [ ] Dark mode toggle
- [ ] Dream voice recording
- [ ] Search by content AI analysis
- [ ] Statistics dashboard
- [ ] Tag suggestions
- [ ] Dream templates
- [ ] Recurring dream tracking
- [ ] Color themes
- [ ] Dream sharing (local network)
- [ ] Mobile companion app
- [ ] Cloud sync (optional)
- [ ] Dream diary export (PDF)
