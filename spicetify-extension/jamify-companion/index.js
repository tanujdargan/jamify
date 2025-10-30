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
        // Create button element
        const button = document.createElement('button');
        button.classList.add('main-topBar-button');
        button.setAttribute('data-tooltip', 'Jamify Companion');
        button.style.position = 'relative';
        button.innerHTML = `
          <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
            <path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zM8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
          <span style="margin-left: 4px;">Jamify</span>
        `;
        
        // Add click handler
        button.onclick = () => this.openSettings();
        
        // Update color if connected
        if (this.roomId) {
          button.style.color = '#22c55e';
        }
        
        // Add to topbar
        const topbar = document.querySelector('.main-topBar-topbarContent');
        if (topbar) {
          topbar.appendChild(button);
          this.buttonElement = button;
          console.log('[Jamify] Button added to topbar');
        } else {
          console.error('[Jamify] Topbar not found');
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

    async clearQueue(currentQueue) {
      try {
        // Use Player API to clear queue
        if (Spicetify.Player?.removeFromQueue) {
          for (const track of currentQueue) {
            try {
              await Spicetify.Player.removeFromQueue(track.uri);
              await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
            } catch (error) {
              console.error('[Jamify] Error removing track:', error);
            }
          }
        } else {
          console.warn('[Jamify] Queue removal not supported');
        }
      } catch (error) {
        console.error('[Jamify] Error clearing queue:', error);
      }
    }

    async addToQueue(trackId) {
      try {
        const uri = `spotify:track:${trackId}`;
        
        // Try Player API first
        if (Spicetify.Player?.addToQueue) {
          await Spicetify.Player.addToQueue(uri);
        } 
        // Fallback to Platform API
        else if (Spicetify.Platform?.PlayerAPI?.addToQueue) {
          await Spicetify.Platform.PlayerAPI.addToQueue([{ uri }]);
        }
        // Fallback to Queue API
        else if (Spicetify.Queue?.add) {
          await Spicetify.Queue.add({ uri });
        }
        
        console.log('[Jamify] Added to queue:', trackId);
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

