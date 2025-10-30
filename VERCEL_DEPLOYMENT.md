# Deploying Jamify to Vercel

## Step 1: Set Up Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your Jamify project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., "jamify-db")
7. Select a region closest to your users
8. Click **Create**

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 2: Add Additional Environment Variables

In your Vercel project settings, go to **Settings → Environment Variables** and add:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_URL=https://jamify-mu.vercel.app
NEXTAUTH_SECRET=jK8mN2pQ7rT4vW9xZ3cF6hJ1lM5nP8sU2wY4aD7gK0mR3tV6xZ9bE2fH5jL8nQ1s
```

## Step 3: Update Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your Jamify app
3. Click **Edit Settings**
4. Add to **Redirect URIs**:
   ```
   https://jamify-mu.vercel.app/api/auth/callback/spotify
   ```
5. Click **Save**

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to your Vercel project
2. Go to **Deployments** tab
3. Click **Redeploy** (or push to your connected Git repository)

### Option B: Deploy via CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel --prod
```

## Step 5: Run Database Migration

After deployment, you need to run the database migration:

### Using Vercel CLI:

```bash
# Set up your connection to production database
vercel env pull .env.production

# Run migration
npx prisma migrate deploy
```

### Or manually via SQL:

Connect to your Vercel Postgres database and run:

```sql
-- Create Room table
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "spotifyAccessToken" TEXT,
    "spotifyRefreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- Create QueueItem table
CREATE TABLE "QueueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumArt" TEXT,
    "duration" INTEGER NOT NULL,
    "addedBy" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playedAt" TIMESTAMP(3),
    "isPlayed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QueueItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index
CREATE INDEX "QueueItem_roomId_idx" ON "QueueItem"("roomId");
```

## Troubleshooting

### "Failed to create room" 500 Error

**Cause**: Database not set up or migrations not run

**Solution**: Make sure Vercel Postgres is created and run the migration (Step 5)

### "Invalid Redirect URI" Error

**Cause**: Spotify app doesn't have the production URL in allowed redirects

**Solution**: Add `https://jamify-mu.vercel.app/api/auth/callback/spotify` to your Spotify app settings

### Database Connection Issues

**Cause**: Environment variables not set correctly

**Solution**: 
1. Check that Vercel has automatically added the `POSTGRES_*` variables
2. Go to Settings → Environment Variables and verify they exist
3. Redeploy after adding any missing variables

### Build Fails

**Cause**: Prisma client not generated

**Solution**: The `postinstall` script should handle this, but you can manually add to your build command:
```bash
prisma generate && next build
```

## Monitoring

Check your deployment logs in Vercel:
1. Go to your project
2. Click on **Deployments**
3. Click on the latest deployment
4. View **Build Logs** and **Function Logs**

For database queries and monitoring:
1. Go to **Storage** tab
2. Click on your database
3. View **Insights** for performance metrics

## Local Development vs Production

- **Local**: Uses SQLite (file:./dev.db) for simplicity
- **Production**: Uses Vercel Postgres for scalability and serverless compatibility

To test with production database locally:
```bash
# Pull production environment variables
vercel env pull .env.local

# Update your local .env to use production database
# Then run normally
npm run dev
```

## Next Steps

1. Test the deployment thoroughly
2. Monitor error logs in Vercel dashboard
3. Set up alerts for errors
4. Consider adding rate limiting for API routes
5. Add monitoring with Vercel Analytics

## Useful Commands

```bash
# View deployment logs
vercel logs

# Open production URL
vercel open

# Pull environment variables
vercel env pull

# Connect to production database
vercel postgres connect
```

