# Jamify Companion - Spicetify Extension

A Spicetify extension that enables full queue management between your Jamify web app and Spotify desktop client.

## Features

- Real-time queue synchronization from Jamify to Spotify
- Full queue control (add, remove, reorder)
- Direct integration with Spotify's internal APIs
- Visual indicator when connected to a room
- Auto-sync every 5 seconds

## Prerequisites

1. **Spotify Desktop App** (Windows, macOS, or Linux)
2. **Spicetify** installed ([Installation Guide](https://spicetify.app/docs/getting-started))

## Installation

### Step 1: Install Spicetify

If you haven't already, install Spicetify:

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.sh | sh
```

### Step 2: Install Jamify Companion Extension

1. Download or clone this repository
2. Copy the `jamify-companion` folder to your Spicetify extensions directory:

**Windows:**
```powershell
Copy-Item -Path "jamify-companion" -Destination "$env:APPDATA\spicetify\CustomApps\" -Recurse
```

**macOS:**
```bash
cp -r jamify-companion ~/spicetify_data/CustomApps/
```

**Linux:**
```bash
cp -r jamify-companion ~/.config/spicetify/CustomApps/
```

### Step 3: Enable the Extension

Run these commands:

```bash
spicetify config custom_apps jamify-companion
spicetify backup apply
```

### Step 4: Verify Installation

1. Open Spotify Desktop
2. You should see a **"Jamify"** button in the top bar
3. Click it to open the settings panel

## Usage

### Connecting to a Room

1. **On Jamify Web App** (https://jamify-mu.vercel.app):
   - Log in with Spotify
   - Create or join a room
   - Copy the **Room ID** from the URL (e.g., `clxxxx123456`)

2. **On Spotify Desktop**:
   - Click the **Jamify** button in the top bar
   - Paste the Room ID in the input field
   - Click **Connect**
   - The button will turn green when connected

3. **That's it!** Your Spotify queue will now sync with the Jamify room:
   - Songs added on Jamify appear in your Spotify queue
   - Queue updates automatically every 5 seconds
   - Full queue management through Spotify

### Disconnecting

1. Click the **Jamify** button
2. Click **Disconnect**

## How It Works

1. **Polling**: The extension checks the Jamify room every 5 seconds
2. **Queue Comparison**: Compares Jamify queue with Spotify queue
3. **Sync**: If different, clears Spotify queue and adds Jamify tracks
4. **Real-time**: Near-instant updates for collaborative listening

## Features Explained

### Full Queue Management

Unlike the Spotify Web API (which can't remove tracks), this extension uses Spotify's internal APIs to:
- ✅ Add tracks to queue
- ✅ Remove tracks from queue
- ✅ Clear the entire queue
- ✅ Reorder tracks (coming soon)

### Auto-Sync

- Automatically syncs every 5 seconds
- Only syncs when queue changes (efficient)
- Preserves currently playing track

### Visual Feedback

- **Gray button**: Not connected
- **Green button**: Connected to a room
- **Notifications**: Connect/disconnect confirmations

## Troubleshooting

### Extension doesn't appear

```bash
# Reapply Spicetify
spicetify restore backup apply
```

### Queue not syncing

1. Check you're connected (button is green)
2. Verify Room ID is correct
3. Check browser console for errors
4. Try disconnecting and reconnecting

### Spotify crashes or freezes

```bash
# Restore original Spotify
spicetify restore
# Then reapply
spicetify backup apply
```

## Development

### File Structure

```
jamify-companion/
├── manifest.json       # Extension metadata
├── index.js           # Main extension code
└── README.md          # This file
```

### Debugging

Open Spotify's DevTools:
```bash
spicetify enable-devtools
```

Then in Spotify: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

Check console for `[Jamify]` logs.

### API Endpoints Used

- `GET /api/rooms/{roomId}/queue` - Fetch queue
- `POST /api/rooms/{roomId}/sync` - Notify web app (future)

## Updating

```bash
# Pull latest changes
cd path/to/jamify-companion

# Reapply
spicetify backup apply
```

## Uninstalling

```bash
spicetify config custom_apps jamify-companion-
spicetify backup apply
```

## Known Limitations

- Requires Spotify Desktop (doesn't work with web player)
- Needs Spicetify CLI installed
- Auto-sync interval is 5 seconds (configurable in code)
- Doesn't sync queue removes back to web app yet

## Future Features

- [ ] Two-way sync (Spotify → Jamify)
- [ ] Queue reordering via drag-and-drop
- [ ] Custom sync intervals
- [ ] Queue history
- [ ] Multiple room support
- [ ] Mini player widget

## Support

Issues? Check:
1. Spicetify is properly installed: `spicetify -v`
2. Extension is in CustomApps folder
3. Spotify is restarted after installation
4. Room ID is correct

## Credits

Built for **Jamify** - Collaborative Music Queue App

Powered by [Spicetify](https://spicetify.app)

## License

MIT

