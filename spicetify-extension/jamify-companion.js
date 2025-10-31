// @ts-check

(async function() {
  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('[Jamify] Starting initialization...');

  const CONFIG = {
    API_URL: 'https://jamify-mu.vercel.app',
    POLL_INTERVAL: 5000, // 5 seconds
    STORAGE_KEY: 'jamify_room_id'
  };

  class JamifyCompanion {
    constructor() {
      this.roomId = localStorage.getItem(CONFIG.STORAGE_KEY) || null;
      this.isPolling = false;
      this.lastQueueState = [];
      this.initialized = false;
      this.buttonElement = null;
    }

    async init() {
      try {
        console.log('[Jamify] Initializing companion app...');
        
        // Add button to Spotify UI
        await this.addUIButton();
        
        // Start polling if room ID exists
        if (this.roomId) {
          this.startPolling();
          Spicetify.showNotification('Jamify connected to room');
        }

        this.initialized = true;
        console.log('[Jamify] Companion app initialized successfully');
      } catch (error) {
        console.error('[Jamify] Initialization error:', error);
        Spicetify.showNotification('Jamify failed to initialize', true);
      }
    }

    async addUIButton() {
      try {
        console.log('[Jamify] Attempting to add UI button...');
        
        // Create button element
        const button = document.createElement('button');
        button.id = 'jamify-companion-button';
        button.setAttribute('aria-label', 'Jamify Companion');
        button.style.cssText = `
          position: fixed;
          top: 16px;
          right: 100px;
          z-index: 99999;
          padding: 8px 12px;
          background: rgba(40, 40, 40, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: ${this.roomId ? '#22c55e' : '#ffffff'};
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        `;
        button.innerHTML = `
          <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
            <path d="M11.5 6.5a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h7zM11 8a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h5A.5.5 0 0 1 11 8zm-.5 2.5a.5.5 0 0 0 0-1h-3a.5.5 0 0 0 0 1h3z"/>
          </svg>
          <span>Jamify</span>
        `;
        
        // Add hover effect
        button.onmouseenter = () => {
          button.style.background = 'rgba(60, 60, 60, 0.95)';
          button.style.transform = 'translateY(-1px)';
        };
        button.onmouseleave = () => {
          button.style.background = 'rgba(40, 40, 40, 0.9)';
          button.style.transform = 'translateY(0)';
        };
        
        // Add click handler
        button.onclick = () => this.openSettings();
        
        // Simply append to body - works everywhere
        document.body.appendChild(button);
        this.buttonElement = button;
        
        console.log('[Jamify] Button added to page successfully (fixed position)');
        
        // Show notification
        if (this.roomId) {
          Spicetify.showNotification('Jamify: Connected to room');
        }
        
      } catch (error) {
        console.error('[Jamify] Error adding button:', error);
      }
    }

    openSettings() {
      try {
        const currentRoom = this.roomId || 'Not connected';
        
        const modal = document.createElement('div');
        modal.id = 'jamify-modal';
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;
        
        modal.innerHTML = `
          <div style="background: #282828; border-radius: 8px; padding: 24px; min-width: 400px; max-width: 500px; color: white;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold;">Jamify Companion</h2>
            
            <p style="margin-bottom: 16px; color: #b3b3b3;">Connect your Spotify to a Jamify room for full queue sync.</p>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Current Room:</label>
              <div style="padding: 8px; background: #181818; border-radius: 4px;">${currentRoom}</div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room ID:</label>
              <input 
                id="jamify-room-input" 
                type="text" 
                placeholder="Enter room ID from Jamify web app"
                value="${this.roomId || ''}"
                style="width: 100%; padding: 8px; background: #181818; border: 1px solid #404040; border-radius: 4px; color: white; font-size: 14px; box-sizing: border-box;"
              />
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <button id="jamify-connect-btn" style="flex: 1; padding: 12px; background: #1db954; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">
                Connect
              </button>
              <button id="jamify-disconnect-btn" style="flex: 1; padding: 12px; background: #e22134; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">
                Disconnect
              </button>
            </div>

            <div style="padding: 12px; background: #181818; border-radius: 4px; font-size: 12px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px 0; font-weight: bold;">How it works:</p>
              <ol style="margin: 0 0 0 20px; padding: 0; line-height: 1.6; color: #b3b3b3;">
                <li>Create or join a room on jamify-mu.vercel.app</li>
                <li>Copy the room ID from the URL</li>
                <li>Paste it here and click Connect</li>
                <li>Your Spotify queue will sync with Jamify in real-time</li>
              </ol>
            </div>

            <button id="jamify-close-btn" style="width: 100%; padding: 10px; background: #535353; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 14px;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('jamify-connect-btn').onclick = () => {
          const input = document.getElementById('jamify-room-input');
          const roomId = input.value.trim();
          
          if (roomId) {
            this.connectToRoom(roomId);
            document.getElementById('jamify-modal').remove();
          } else {
            Spicetify.showNotification('Please enter a room ID', true);
          }
        };

        document.getElementById('jamify-disconnect-btn').onclick = () => {
          this.disconnectFromRoom();
          document.getElementById('jamify-modal').remove();
        };

        document.getElementById('jamify-close-btn').onclick = () => {
          document.getElementById('jamify-modal').remove();
        };

        modal.onclick = (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        };
      } catch (error) {
        console.error('[Jamify] Error opening settings:', error);
        Spicetify.showNotification('Failed to open settings', true);
      }
    }

    connectToRoom(roomId) {
      this.roomId = roomId;
      localStorage.setItem(CONFIG.STORAGE_KEY, roomId);
      Spicetify.showNotification('Connected to Jamify room!');
      console.log('[Jamify] Connected to room:', roomId);
      
      this.startPolling();
      
      // Update button color
      if (this.buttonElement) {
        this.buttonElement.style.color = '#22c55e';
      }
    }

    disconnectFromRoom() {
      this.roomId = null;
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      this.stopPolling();
      Spicetify.showNotification('Disconnected from Jamify room');
      console.log('[Jamify] Disconnected from room');
      
      // Reset button color
      if (this.buttonElement) {
        this.buttonElement.style.color = '';
      }
    }

    startPolling() {
      if (this.isPolling) return;
      
      this.isPolling = true;
      console.log('[Jamify] Started polling room:', this.roomId);
      this.pollQueue();
    }

    stopPolling() {
      this.isPolling = false;
      console.log('[Jamify] Stopped polling');
    }

    async pollQueue() {
      if (!this.isPolling || !this.roomId) return;

      try {
        // Ping status endpoint to show we're connected
        await fetch(`${CONFIG.API_URL}/api/rooms/${this.roomId}/status`, {
          method: 'POST',
        }).catch(err => console.warn('[Jamify] Status ping failed:', err));

        // Fetch queue
        const response = await fetch(`${CONFIG.API_URL}/api/rooms/${this.roomId}/queue`);
        
        if (!response.ok) {
          console.error('[Jamify] Failed to fetch queue:', response.status);
          setTimeout(() => this.pollQueue(), CONFIG.POLL_INTERVAL);
          return;
        }

        const queueItems = await response.json();
        
        // Check if queue has changed
        if (this.hasQueueChanged(queueItems)) {
          console.log('[Jamify] Queue changed, syncing...', queueItems.length, 'tracks');
          await this.syncQueue(queueItems);
        } else {
          console.log('[Jamify] Queue unchanged, skipping sync');
        }

      } catch (error) {
        console.error('[Jamify] Error polling queue:', error);
      }

      // Continue polling
      setTimeout(() => this.pollQueue(), CONFIG.POLL_INTERVAL);
    }

    hasQueueChanged(newQueue) {
      if (newQueue.length !== this.lastQueueState.length) return true;
      
      for (let i = 0; i < newQueue.length; i++) {
        if (newQueue[i].id !== this.lastQueueState[i]?.id) return true;
      }
      
      return false;
    }

    async syncQueue(queueItems) {
      try {
        console.log('[Jamify] Starting queue sync...');
        
        // Get current Spotify queue
        const currentQueue = await this.getCurrentQueue();
        const currentTrackIds = currentQueue.map(track => {
          const match = track.uri?.match(/spotify:track:(.+)/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        // Get desired track IDs from Jamify (in order)
        const desiredTrackIds = queueItems
          .filter(item => !item.isPlayed)
          .map(item => item.spotifyTrackId);
        
        console.log('[Jamify] Current Spotify queue:', currentTrackIds);
        console.log('[Jamify] Desired Jamify queue:', desiredTrackIds);
        
        // If queues match exactly (same tracks in same order), skip sync
        if (JSON.stringify(currentTrackIds) === JSON.stringify(desiredTrackIds)) {
          console.log('[Jamify] Queues match exactly, no sync needed');
          this.lastQueueState = queueItems;
          return;
        }
        
        // Strategy: Complete rebuild for accuracy
        // 1. Clear all tracks from Spotify queue
        console.log('[Jamify] Clearing Spotify queue...');
        for (const track of currentQueue) {
          try {
            await this.removeFromQueue(track.uri);
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error('[Jamify] Failed to remove track:', error);
          }
        }
        
        // Small delay to let Spotify update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 2. Add all Jamify tracks in order
        console.log('[Jamify] Adding tracks to Spotify queue in order...');
        for (const item of queueItems.filter(item => !item.isPlayed)) {
          try {
            await this.addToQueue(item.spotifyTrackId);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('[Jamify] Failed to add track:', error);
          }
        }
        
        this.lastQueueState = queueItems;
        console.log('[Jamify] Queue synced successfully -', desiredTrackIds.length, 'tracks');
        
        // Show notification
        Spicetify.showNotification(`Jamify: Synced ${desiredTrackIds.length} songs`);
        
      } catch (error) {
        console.error('[Jamify] Error syncing queue:', error);
        Spicetify.showNotification('Jamify: Sync failed', true);
      }
    }

    async getCurrentQueue() {
      try {
        // Try to get queue from Player API
        if (Spicetify.Player?.getQueue) {
          const queue = await Spicetify.Player.getQueue();
          return queue?.nextUp || [];
        }
        // Fallback to Platform API
        if (Spicetify.Platform?.PlayerAPI?._queue) {
          return Spicetify.Platform.PlayerAPI._queue.nextTracks || [];
        }
        return [];
      } catch (error) {
        console.error('[Jamify] Error getting current queue:', error);
        return [];
      }
    }

    async removeFromQueue(trackUri) {
      try {
        console.log('[Jamify] Removing from queue:', trackUri);
        
        // Try Player API first
        if (Spicetify.Player?.removeFromQueue) {
          await Spicetify.Player.removeFromQueue(trackUri);
          console.log('[Jamify] Removed via Player API');
          return true;
        } 
        // Fallback to Platform API
        else if (Spicetify.Platform?.PlayerAPI?.removeFromQueue) {
          await Spicetify.Platform.PlayerAPI.removeFromQueue([{ uri: trackUri }]);
          console.log('[Jamify] Removed via Platform API');
          return true;
        }
        else {
          console.warn('[Jamify] No remove method available');
          return false;
        }
      } catch (error) {
        console.error('[Jamify] Error removing from queue:', error);
        return false;
      }
    }

    async addToQueue(trackId) {
      try {
        const uri = `spotify:track:${trackId}`;
        console.log('[Jamify] Adding to queue:', uri);
        
        // Try Player API first
        if (Spicetify.Player?.addToQueue) {
          await Spicetify.Player.addToQueue(uri);
          console.log('[Jamify] Added via Player API');
        } 
        // Fallback to Platform API
        else if (Spicetify.Platform?.PlayerAPI?.addToQueue) {
          await Spicetify.Platform.PlayerAPI.addToQueue([{ uri }]);
          console.log('[Jamify] Added via Platform API');
        }
        // Fallback to Queue API
        else if (Spicetify.Queue?.add) {
          await Spicetify.Queue.add({ uri });
          console.log('[Jamify] Added via Queue API');
        }
        else {
          console.warn('[Jamify] No add method available');
        }
      } catch (error) {
        console.error('[Jamify] Error adding to queue:', error);
      }
    }
  }

  // Initialize the companion app
  const jamify = new JamifyCompanion();
  await jamify.init();

  // Expose to global for debugging
  window.JamifyCompanion = jamify;

  console.log('[Jamify] Companion app loaded successfully!');
})();

