// @ts-check

(async function() {
  if (!Spicetify.Player || !Spicetify.Platform || !Spicetify.URI) {
    setTimeout(arguments.callee, 1000);
    return;
  }

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
    }

    async init() {
      console.log('[Jamify] Initializing companion app...');
      
      // Add button to Spotify UI
      this.addUIButton();
      
      // Start polling if room ID exists
      if (this.roomId) {
        this.startPolling();
      }

      this.initialized = true;
      console.log('[Jamify] Companion app initialized');
    }

    addUIButton() {
      // Add a button to the top bar
      const button = new Spicetify.Topbar.Button(
        'Jamify',
        'playlist',
        () => this.openSettings(),
        false
      );

      // Add indicator if connected
      if (this.roomId) {
        button.element.style.color = '#22c55e'; // Green when connected
      }
    }

    openSettings() {
      const currentRoom = this.roomId || 'Not connected';
      
      Spicetify.PopupModal.display({
        title: 'Jamify Companion',
        content: `
          <div style="padding: 20px; min-width: 400px;">
            <p style="margin-bottom: 16px;">Connect your Spotify to a Jamify room for full queue sync.</p>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                Current Room:
              </label>
              <div style="padding: 8px; background: #282828; border-radius: 4px;">
                ${currentRoom}
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                Room ID:
              </label>
              <input 
                id="jamify-room-input" 
                type="text" 
                placeholder="Enter room ID from Jamify web app"
                value="${this.roomId || ''}"
                style="width: 100%; padding: 8px; background: #282828; border: 1px solid #404040; border-radius: 4px; color: white;"
              />
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="jamify-connect-btn" style="flex: 1; padding: 12px; background: #1db954; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                Connect
              </button>
              <button id="jamify-disconnect-btn" style="flex: 1; padding: 12px; background: #e53e3e; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                Disconnect
              </button>
            </div>

            <div style="margin-top: 16px; padding: 12px; background: #1a1a1a; border-radius: 4px; font-size: 12px;">
              <p style="margin-bottom: 8px;"><strong>How it works:</strong></p>
              <ol style="margin-left: 20px; line-height: 1.6;">
                <li>Create or join a room on jamify-mu.vercel.app</li>
                <li>Copy the room ID from the URL</li>
                <li>Paste it here and click Connect</li>
                <li>Your Spotify queue will sync with Jamify in real-time</li>
              </ol>
            </div>
          </div>
        `,
        isLarge: true
      });

      // Add event listeners
      setTimeout(() => {
        document.getElementById('jamify-connect-btn')?.addEventListener('click', () => {
          const input = document.getElementById('jamify-room-input');
          const roomId = input.value.trim();
          
          if (roomId) {
            this.connectToRoom(roomId);
            Spicetify.PopupModal.hide();
          } else {
            Spicetify.showNotification('Please enter a room ID');
          }
        });

        document.getElementById('jamify-disconnect-btn')?.addEventListener('click', () => {
          this.disconnectFromRoom();
          Spicetify.PopupModal.hide();
        });
      }, 100);
    }

    connectToRoom(roomId) {
      this.roomId = roomId;
      localStorage.setItem(CONFIG.STORAGE_KEY, roomId);
      Spicetify.showNotification('Connected to Jamify room!');
      console.log('[Jamify] Connected to room:', roomId);
      
      this.startPolling();
      
      // Update button color
      const button = document.querySelector('[aria-label="Jamify"]');
      if (button) button.style.color = '#22c55e';
    }

    disconnectFromRoom() {
      this.roomId = null;
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      this.stopPolling();
      Spicetify.showNotification('Disconnected from Jamify room');
      console.log('[Jamify] Disconnected from room');
      
      // Reset button color
      const button = document.querySelector('[aria-label="Jamify"]');
      if (button) button.style.color = '';
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
        const response = await fetch(`${CONFIG.API_URL}/api/rooms/${this.roomId}/queue`);
        
        if (!response.ok) {
          console.error('[Jamify] Failed to fetch queue:', response.status);
          setTimeout(() => this.pollQueue(), CONFIG.POLL_INTERVAL);
          return;
        }

        const queueItems = await response.json();
        
        // Check if queue has changed
        if (this.hasQueueChanged(queueItems)) {
          console.log('[Jamify] Queue changed, syncing...', queueItems);
          await this.syncQueue(queueItems);
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
        // Get current Spotify queue
        const currentQueue = await this.getCurrentQueue();
        
        // Clear current queue (except currently playing)
        await this.clearQueue(currentQueue);
        
        // Add Jamify queue items
        for (const item of queueItems) {
          if (!item.isPlayed) {
            await this.addToQueue(item.spotifyTrackId);
          }
        }

        this.lastQueueState = queueItems;
        console.log('[Jamify] Queue synced successfully');
        
      } catch (error) {
        console.error('[Jamify] Error syncing queue:', error);
      }
    }

    async getCurrentQueue() {
      try {
        const queue = Spicetify.Platform.PlayerAPI._queue;
        return queue?.nextTracks || [];
      } catch (error) {
        console.error('[Jamify] Error getting current queue:', error);
        return [];
      }
    }

    async clearQueue(currentQueue) {
      try {
        // Remove tracks from queue
        for (const track of currentQueue) {
          try {
            await Spicetify.Platform.PlayerAPI.removeFromQueue([{
              uri: track.uri
            }]);
          } catch (error) {
            console.error('[Jamify] Error removing track:', error);
          }
        }
      } catch (error) {
        console.error('[Jamify] Error clearing queue:', error);
      }
    }

    async addToQueue(trackId) {
      try {
        const uri = `spotify:track:${trackId}`;
        await Spicetify.Platform.PlayerAPI.addToQueue([{
          uri: uri
        }]);
        console.log('[Jamify] Added to queue:', trackId);
      } catch (error) {
        console.error('[Jamify] Error adding to queue:', error);
      }
    }

    // Manual queue management methods
    async removeFromQueue(trackUri) {
      try {
        await Spicetify.Platform.PlayerAPI.removeFromQueue([{
          uri: trackUri
        }]);
        
        // Update Jamify web app
        if (this.roomId) {
          await this.notifyWebApp('remove', trackUri);
        }
        
        return true;
      } catch (error) {
        console.error('[Jamify] Error removing from queue:', error);
        return false;
      }
    }

    async notifyWebApp(action, data) {
      try {
        await fetch(`${CONFIG.API_URL}/api/rooms/${this.roomId}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, data })
        });
      } catch (error) {
        console.error('[Jamify] Error notifying web app:', error);
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

