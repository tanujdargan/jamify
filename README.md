# Jamify - Collaborative Music Queue

A Next.js web application that lets you create collaborative music rooms where friends can scan a QR code and add songs to your Spotify queue.

## Features

- **Spotify Integration**: Connect your Spotify account to control playback
- **Room Creation**: Create rooms with unique QR codes
- **Collaborative Queue**: Let anyone scan the QR code and add songs
- **Real-time Updates**: Queue updates automatically as songs are added
- **Host Controls**: Play songs directly from the queue on your Spotify account

## Prerequisites

- Node.js 18+ installed
- Spotify Premium account
- Spotify Developer App credentials

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Once created, note your **Client ID** and **Client Secret**
6. Click "Edit Settings" and add the following Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/spotify
   ```

### 2. Configure Environment Variables

1. Copy `.env` file and update the values:
   ```bash
   DATABASE_URL="file:./dev.db"
   
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_key_here
   ```

2. Generate a secure random string for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migration

```bash
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### As a Host

1. Connect your Spotify account on the home page
2. Click "Create New Room"
3. Share the QR code with friends
4. Songs added by guests will appear in the queue
5. Click "Play" on any song to play it on your Spotify account

**Important**: Make sure you have an active Spotify device (mobile app, desktop app, or web player) running to control playback.

### As a Guest

1. Scan the QR code with your phone camera
2. Search for songs using the search bar
3. Click "Add" to add songs to the room's queue
4. Watch the queue update in real-time

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Spotify OAuth
- **Database**: PostgreSQL with Prisma ORM (Vercel Postgres for production)
- **Styling**: Tailwind CSS
- **QR Codes**: qrcode library
- **Real-time**: Polling-based updates (every 5 seconds)

## Important: Database Setup

- **Production (Vercel)**: Requires PostgreSQL (Vercel Postgres)
- **Local Development**: Currently configured for PostgreSQL

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for production deployment instructions.

## Project Structure

```
jamify/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth configuration
│   │   ├── rooms/          # Room management APIs
│   │   └── spotify/        # Spotify API integration
│   ├── room/[roomId]/      # Host view
│   ├── join/[roomId]/      # Guest view
│   └── page.tsx            # Landing page
├── components/
│   ├── QRCode.tsx          # QR code generator
│   ├── Queue.tsx           # Queue display
│   └── SongSearch.tsx      # Spotify song search
├── lib/
│   └── prisma.ts           # Prisma client
└── prisma/
    └── schema.prisma       # Database schema
```

## Troubleshooting

### Spotify Playback Not Working

- Ensure you have a Spotify Premium account
- Make sure you have an active Spotify device (open Spotify on your phone, desktop, or web)
- Check that your Spotify account is connected in the app

### QR Code Not Scanning

- Ensure your phone camera has permission to access the camera
- Try increasing the screen brightness
- Make sure the QR code is fully visible

### Search Not Working

- Verify your Spotify API credentials are correct
- Check that you're logged in with your Spotify account
- Ensure your access token hasn't expired (try logging out and back in)

## Future Enhancements

- WebSocket support for true real-time updates
- Automatic playback when queue changes
- Vote system for song priority
- Room passwords/access control
- Playlist export feature
- Mobile app

## License

MIT
