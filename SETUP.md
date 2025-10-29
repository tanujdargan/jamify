# Jamify Setup Guide

## Quick Start

Follow these steps to get Jamify running on your local machine.

### Prerequisites

- Node.js 18 or higher
- A Spotify Premium account
- A Spotify Developer account

---

## Step 1: Clone and Install

```bash
# Navigate to the project directory
cd jamify

# Install dependencies
npm install
```

---

## Step 2: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create an App"**
3. Fill in:
   - **App Name**: Jamify (or any name you prefer)
   - **App Description**: Collaborative music queue app
   - Click **"Create"**
4. On your app page:
   - Copy your **Client ID**
   - Click **"Show Client Secret"** and copy the **Client Secret**
5. Click **"Edit Settings"**
6. Add this to **Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/spotify
   ```
7. Click **"Save"**

---

## Step 3: Configure Environment Variables

The `.env` file should already exist. Open it and update these values:

```env
DATABASE_URL="file:./dev.db"

# Replace with your actual Spotify credentials from Step 2
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

NEXTAUTH_URL=http://localhost:3000
# Generate a random secret (see below)
NEXTAUTH_SECRET=your_random_secret_here
```

### Generate NEXTAUTH_SECRET

Run one of these commands:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or use any random string generator online.

---

## Step 4: Set Up Database

```bash
npm run db:migrate
```

This will create the SQLite database and run migrations.

---

## Step 5: Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Usage Instructions

### For Hosts

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Connect with Spotify"**
3. Log in with your Spotify account and authorize the app
4. Click **"Create New Room"**
5. **Important**: Open Spotify on your phone, desktop, or web player to have an active device
6. Share the QR code with friends

### For Guests

1. Scan the QR code with your phone camera
2. Search for songs
3. Click "Add" to add songs to the queue
4. Songs will appear in real-time

### Playing Music

As the host:
1. Make sure you have Spotify open on a device (phone/desktop/web)
2. Click the **"Play"** button next to any song in the queue
3. The song will start playing on your active Spotify device

---

## Troubleshooting

### "No active device found" error

**Solution**: Open Spotify on your phone, desktop, or at [https://open.spotify.com](https://open.spotify.com)

### "Invalid redirect URI" error

**Solution**: Make sure you added `http://localhost:3000/api/auth/callback/spotify` to your Spotify app's Redirect URIs

### Songs not playing

**Possible causes**:
- You need a Spotify Premium account
- No active Spotify device (see solution above)
- Access token expired (log out and log back in)

### QR code not scanning

**Solutions**:
- Increase screen brightness
- Try a different QR code scanner app
- Make sure the entire QR code is visible
- Manually copy and paste the URL shown below the QR code

---

## Testing Without Multiple Devices

You can test the app on a single device:

1. Open [http://localhost:3000](http://localhost:3000) in one browser tab (host view)
2. Create a room and copy the join URL (below the QR code)
3. Open the join URL in an incognito/private window or different browser (guest view)
4. Add songs from the guest view
5. Play songs from the host view

---

## Additional Commands

```bash
# View and edit database
npm run db:studio

# Rebuild the app
npm run build

# Start production server
npm run start
```

---

## Next Steps

- Customize the room names
- Invite friends to join your rooms
- Build a collaborative playlist together!

For more information, see the main [README.md](README.md).

