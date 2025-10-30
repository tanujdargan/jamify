# Quick Installation Guide

## Prerequisites
- Spotify Desktop App
- Spicetify CLI

## Install Spicetify

### Windows (PowerShell as Admin)
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.sh | sh
```

## Install Jamify Companion

### Option 1: Manual Installation

1. **Find your Spicetify Extensions directory:**

**Windows:** `%APPDATA%\spicetify\Extensions\`

**macOS:** `~/spicetify_data/Extensions/`

**Linux:** `~/.config/spicetify/Extensions/`

2. **Copy the `jamify-companion.js` file** into the `Extensions` directory

3. **Enable the extension:**
```bash
spicetify config extensions jamify-companion.js
spicetify backup apply
```

### Option 2: Command Line

**Windows:**
```powershell
# Navigate to the folder containing jamify-companion.js
cd path\to\jamify\spicetify-extension

# Copy to Spicetify directory
Copy-Item -Path "jamify-companion.js" -Destination "$env:APPDATA\spicetify\Extensions\" -Force

# Enable
spicetify config extensions jamify-companion.js
spicetify backup apply
```

**macOS/Linux:**
```bash
# Navigate to the folder containing jamify-companion.js
cd path/to/jamify/spicetify-extension

# Copy to Spicetify directory
cp jamify-companion.js ~/spicetify_data/Extensions/
# or for Linux: cp jamify-companion.js ~/.config/spicetify/Extensions/

# Enable
spicetify config extensions jamify-companion.js
spicetify backup apply
```

## Verify Installation

1. **Restart Spotify** (if it was open)
2. Look for a **"Jamify"** button in the top bar
3. Click it - you should see the settings panel

## Connect to Jamify

1. Go to https://jamify-mu.vercel.app
2. Create or join a room
3. Copy the Room ID from the URL
4. In Spotify, click **Jamify** → paste Room ID → **Connect**
5. Button turns green = connected!

## Troubleshooting

### Extension not showing?
```bash
spicetify restore backup apply
```

### Need to check Spicetify version?
```bash
spicetify -v
```

### Can't find Extensions folder?
```bash
spicetify path
```

### Want to enable DevTools for debugging?
```bash
spicetify enable-devtools
spicetify backup apply
# Then in Spotify: Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
```

## Need Help?

Check the full README.md for detailed instructions and troubleshooting.

