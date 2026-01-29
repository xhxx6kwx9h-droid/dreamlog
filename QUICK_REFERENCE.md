# DreamLog - Quick Reference

## 🚀 Start Here

### Installation (5 minutes)
```bash
cd dreamlog
npm install
npm run tauri dev
```

### First Dream (2 minutes)
1. Click "New Dream"
2. Fill title, date, content, mood
3. Add tags and intensity
4. Click "Save Dream"

---

## 📚 File Locations

| What | Where |
|------|-------|
| React pages | `/src/pages/` |
| React components | `/src/components/` |
| Tauri commands | `/src-tauri/src/main.rs` |
| Database logic | `/src-tauri/src/db.rs` |
| Styles | `/src/styles/globals.css` |
| Config | `tailwind.config.ts`, `vite.config.ts` |

---

## 🛠️ Common Tasks

### Add a New Dream Field
1. Update `Dream` interface in `/src/types/dream.ts`
2. Add column to SQLite in `/src-tauri/src/db.rs`
3. Update form in `/src/components/DreamModal.tsx`
4. Update detail page `/src/pages/DreamDetail.tsx`

### Add a New Page
1. Create component in `/src/pages/NewPage.tsx`
2. Add route in `/src/App.tsx`
3. Update navigation links

### Customize Colors
- Edit `tailwind.config.ts` for color palette
- Edit `/src/styles/globals.css` for component classes
- Colors: purple (`dream-*`), slate grays, red/green for status

### Change Database Location
- Edit Tauri config: `src-tauri/tauri.conf.json`
- Currently: `~/.cache/dreamlog/dreamlog.db`

---

## 🔗 API Commands

### Frontend → Backend (TypeScript)
```typescript
import { dreamApi } from '@/api/dream';

// List dreams
await dreamApi.listDreams({ mood: 'happy' });

// Get single dream
await dreamApi.getDream(id);

// Create/update dream
await dreamApi.upsertDream(dream);

// Delete dream
await dreamApi.deleteDream(id);

// Backup/restore
await dreamApi.exportJson();
await dreamApi.importJson(jsonString);

// PIN security
await dreamApi.hashPin('1234');
await dreamApi.verifyPin('1234', hash);
```

---

## 📱 Component Usage

### DreamModal
```tsx
<DreamModal
  dream={existingDream}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={handleSave}
/>
```

### Calendar
```tsx
<Calendar
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  highlightedDates={dreamDates}
/>
```

### Toast Notification
```tsx
addToast("Dream saved!", "success");  // success, error, info
```

### StarRating
```tsx
<StarRating
  value={intensity}
  onChange={(v) => setIntensity(v)}
/>
```

---

## 🎨 TailwindCSS Classes

### Quick Styling
```tsx
// Button
<button className="btn-primary">Save</button>
<button className="btn-secondary">Cancel</button>
<button className="btn-danger">Delete</button>

// Card
<div className="card p-4 bg-white">Content</div>

// Form input
<input className="input-field w-full" />

// Badges
<span className="badge-mood">Happy</span>
<span className="badge-tag">adventure</span>
```

---

## 🐛 Debugging

### View Database
```bash
sqlite3 ~/.cache/dreamlog/dreamlog.db
SELECT * FROM dreams;
```

### Check Console Errors
- DevTools: Right-click → Inspect
- Or press F12 in dev mode

### Reset App
```bash
rm -rf ~/.cache/dreamlog
# Restart app to recreate
```

### Rust Compilation Error
```bash
cargo build --manifest-path src-tauri/Cargo.toml
```

---

## 📦 Build & Release

### Development
```bash
npm run tauri dev          # Hot-reload
npm run type-check         # TypeScript check
```

### Production
```bash
npm run tauri build        # Build for current OS
npm run tauri build -- --target universal-apple-darwin  # macOS universal
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
```

### Artifacts
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

---

## 📊 Database Schema

```sql
CREATE TABLE dreams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL,        -- JSON: ["tag1", "tag2"]
    mood TEXT NOT NULL,        -- "happy", "sad", etc.
    intensity INTEGER NOT NULL, -- 1-5
    lucid INTEGER NOT NULL,    -- 0/1 (false/true)
    created_at TEXT NOT NULL,  -- ISO 8601
    updated_at TEXT NOT NULL   -- ISO 8601
)
```

---

## 🔐 PIN Security

### How It Works
1. User sets 4+ digit PIN
2. PIN hashed with Argon2 (never stored plaintext)
3. Hash saved to LocalStorage
4. On app start: user enters PIN
5. App verifies against stored hash

### Enable PIN
- Go to Settings
- Enter PIN twice
- PIN activated on next app restart

### Disable PIN
- Go to Settings
- Click "Disable PIN Lock"
- PIN removed

---

## 🌐 Navigation

### Routes
- `/` - Main dashboard (Home)
- `/dream/:id` - Dream detail view
- `/settings` - Settings & backup

### Routing Implementation
```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dream/:id" element={<DreamDetail />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</BrowserRouter>
```

---

## 💾 Data Management

### Export
1. Go to Settings
2. Click "Export Dreams"
3. Choose location & filename
4. Gets saved as JSON

### Import
1. Go to Settings
2. Click "Import Dreams"
3. Select JSON file
4. Dreams merge by ID (new imported, existing updated)

### JSON Format
```json
[
  {
    "id": "uuid",
    "title": "Flying Dreams",
    "occurredAt": "2024-01-25T08:30:00Z",
    "content": "...",
    "tags": ["flight", "freedom"],
    "mood": "happy",
    "intensity": 4,
    "lucid": true,
    "createdAt": "2024-01-25T08:00:00Z",
    "updatedAt": "2024-01-25T08:30:00Z"
  }
]
```

---

## ⚡ Performance Tips

### Speed Up Dev
- Keep `npm run tauri dev` running
- Edit React → auto-refresh
- Edit Rust → restart dev server

### Reduce Build Time
```bash
# Skip code signing (dev only)
npm run tauri build -- --no-sign

# Faster Rust builds
cargo build -r -j 4  # Use 4 cores
```

### Database Optimization
- Currently: Single table
- Already optimized for small-to-medium dreams (1000s)
- Add indexes if needed:
  ```sql
  CREATE INDEX idx_mood ON dreams(mood);
  CREATE INDEX idx_date ON dreams(occurred_at);
  ```

---

## 📞 Support & Help

### Documentation
- `README.md` - Overview
- `SETUP.md` - Setup guide
- `PROJECT_STRUCTURE.md` - File tree
- `IMPLEMENTATION_COMPLETE.md` - Full details

### Resources
- Tauri: https://tauri.app
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- SQLx: https://github.com/launchbadge/sqlx

---

## 🎯 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Dream | Click "New Dream" button |
| Search | Type in search box |
| Filter by mood | Dropdown selector |
| Export | Settings → Export Dreams |
| Import | Settings → Import Dreams |

---

## ✨ Tips & Tricks

### Search Tips
- Search is case-insensitive
- Searches both title and content
- Matches partial text

### Calendar Tips
- Highlighted dates = dreams exist
- Click date to filter that day
- Toggle "All Dreams" to show everything

### Tag Tips
- Create custom tags
- Multi-select in filter
- Press Enter to add tag in form

### Mood Tips
- Each mood has emoji: 😊😢😨😍🤨😐
- Used for visual quick-scan
- Filter by mood to see patterns

---

**Happy dreaming! 🌙✨**
