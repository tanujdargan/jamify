# Jamify + Spicetify Full Queue Management Setup

## Why Spicetify?

The Spotify Web API has a major limitation: **you can't remove songs from the queue**. By using Spicetify with your Spotify Desktop client, you get:

- ✅ **Add** songs to queue
- ✅ **Remove** songs from queue  
- ✅ **Clear** the entire queue
- ✅ **Reorder** tracks (coming soon)
- ✅ **Real-time sync** with Jamify web app

## Quick Start

### 1. Install Spicetify

**Windows (PowerShell as Admin):**
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.sh | sh
```

### 2. Install Jamify Companion

```bash
# Navigate to your jamify folder
cd path/to/jamify

# Copy extension to Spicetify
# Windows:
Copy-Item -Path "spicetify-extension\jamify-companion.js" -Destination "$env:APPDATA\spicetify\Extensions\" -Force

# macOS:
cp spicetify-extension/jamify-companion.js ~/spicetify_data/Extensions/

# Linux:
cp spicetify-extension/jamify-companion.js ~/.config/spicetify/Extensions/
```

### 3. Enable Extension

```bash
spicetify config extensions jamify-companion.js
spicetify backup apply
```

### 4. Restart Spotify

Close and reopen Spotify Desktop. You should see a "Jamify" button in the top bar!

## Usage

### Connecting Your Spotify to Jamify

1. **Open Jamify Web App**: https://jamify-mu.vercel.app
   - Log in with Spotify
   - Create a room
   - Copy the **Room ID** from URL (e.g., `clxxxx123456`)

2. **Open Spotify Desktop**:
   - Click the **Jamify** button in top bar
   - Paste the Room ID
   - Click **Connect**
   - Button turns **green** when connected

3. **That's It!**
   - Songs added on Jamify web → appear in Spotify queue
   - Songs removed on Spotify → sync back to Jamify (coming soon)
   - Auto-syncs every 5 seconds

## How It Works

### The Problem
- Spotify Web API can ADD to queue
- But CAN'T remove or manage queue
- This means web-only queue management is limited

### The Solution
- Spicetify accesses Spotify's internal APIs
- Full control over the desktop client's queue
- Extension polls Jamify every 5 seconds
- Syncs queue automatically

### Architecture
```
Jamify Web App (jamify-mu.vercel.app)
    ↓ (via API)
Spicetify Extension (running in Spotify Desktop)
    ↓ (Spotify Internal API)
Spotify Queue (your actual queue)
```

## Features

### Current
- ✅ Real-time sync from Jamify → Spotify
- ✅ Add songs from web to Spotify queue
- ✅ Remove songs via Spotify controls
- ✅ Visual connection indicator
- ✅ Auto-reconnect on startup

### Coming Soon
- ⏳ Two-way sync (Spotify → Jamify)
- ⏳ Drag-and-drop reordering
- ⏳ Queue history
- ⏳ Mini player widget

## Troubleshooting

### Extension not appearing?
```bash
spicetify restore backup apply
```

### Queue not syncing?
1. Check button is green (connected)
2. Verify Room ID is correct
3. Check Spotify DevTools console (`Ctrl+Shift+I`)
4. Look for `[Jamify]` log messages

### Want to see logs?
```bash
spicetify enable-devtools
spicetify backup apply
```
Then in Spotify: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### Spotify crashes?
```bash
spicetify restore
spicetify backup apply
```

## Advanced Configuration

### Change Sync Interval

Edit `spicetify-extension/jamify-companion/index.js`:

```javascript
const CONFIG = {
  API_URL: 'https://jamify-mu.vercel.app',
  POLL_INTERVAL: 5000, // Change this (milliseconds)
  STORAGE_KEY: 'jamify_room_id'
};
```

Then reapply:
```bash
spicetify backup apply
```

### Multiple Rooms

Currently supports one room at a time. Disconnect from current room before connecting to another.

## Uninstalling

```bash
spicetify config extensions jamify-companion.js-
spicetify backup apply
```

Or completely remove Spicetify:
```bash
spicetify restore
```

## Development

### Debugging
1. Enable DevTools: `spicetify enable-devtools`
2. In Spotify: `Ctrl+Shift+I`
3. Check Console for `[Jamify]` logs
4. Test connection: `window.JamifyCompanion`

### File Structure
```
spicetify-extension/
├── jamify-companion.js   # Main extension code
├── README.md             # Detailed documentation
└── INSTALLATION.md       # Quick start guide
```

## FAQ

**Q: Do I need Spotify Premium?**  
A: Yes, queue management requires Premium.

**Q: Does this work on mobile?**  
A: No, only Spotify Desktop with Spicetify.

**Q: Can I use the web player?**  
A: No, Spicetify only works with the desktop app.

**Q: Is this safe?**  
A: Spicetify is widely used and safe. It only modifies your local Spotify installation.

**Q: Will this break Spotify updates?**  
A: Spicetify needs to be reapplied after Spotify updates. Just run `spicetify backup apply`.

## Resources

- **Spicetify Docs**: https://spicetify.app/docs/getting-started
- **Jamify Web App**: https://jamify-mu.vercel.app
- **GitHub Issues**: Open an issue if you encounter problems

## Complete Workflow

1. **Setup** (one-time):
   - Install Spicetify
   - Install Jamify Companion
   - Restart Spotify

2. **Each Session**:
   - Open Spotify Desktop
   - Open Jamify web app
   - Create/join room on web
   - Connect Spotify extension to room
   - Start jamming!

3. **Guests**:
   - Just use the web app (no Spicetify needed)
   - Scan QR code or visit link
   - Add songs
   - Songs appear in host's Spotify

Enjoy full queue management with Jamify! 🎵

