import io from 'socket.io-client';
import { BASE_URL } from "../Services/helper";

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.token = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.activeRooms = new Set(); // Track active chat rooms
  }
  
  // Check if already in a specific room
  isInRoom(roomId) {
    return this.activeRooms.has(roomId);
  }

  // Connect to socket server
  connect(userId, token) {
    if (this.socket) {
      console.log('Socket already connected, disconnecting first');
      this.disconnect();
    }

    this.userId = userId;
    this.token = token;

    console.log('Connecting to socket server with userId:', userId);
    
    // Create socket connection with improved configuration
    this.socket = io(BASE_URL, {
      auth: { token },
      query: { userId },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
      transports: ['websocket', 'polling'] // Prefer WebSocket, fallback to polling
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('socket_connected', { 
        detail: { socketId: this.socket.id }
      }));
      
      // Join user-specific room immediately after connection
      if (this.userId) {
        this.joinUserRoom(this.userId);
      }
      
      // Rejoin all active chat rooms after reconnection
      this.rejoinActiveRooms();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      
      // Check if error is related to authentication
      if (error.message.includes('auth') || error.message.includes('token')) {
        window.dispatchEvent(new CustomEvent('socket_auth_error', { 
          detail: { error }
        }));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      window.dispatchEvent(new CustomEvent('socket_disconnected', { 
        detail: { reason }
      }));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      
      // Handle authentication errors specifically
      if (error.message === 'Authentication error' || error.message.includes('auth')) {
        console.error('Socket authentication failed. Will not attempt reconnection.');
        // Try to refresh token or notify user to login again
        window.dispatchEvent(new CustomEvent('socket_auth_error', { detail: { error } }));
      } else {
        this.handleManualReconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Re-join user room after reconnection
      if (this.userId) {
        this.joinUserRoom(this.userId);
      }
      
      window.dispatchEvent(new CustomEvent('socket_reconnected'));
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      this.handleManualReconnect();
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts');
      window.dispatchEvent(new CustomEvent('socket_reconnect_failed', { 
        detail: { maxAttempts: this.maxReconnectAttempts }
      }));
    });
    
    // Setup notification listener
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      window.dispatchEvent(new CustomEvent('notification_received', { 
        detail: { notification }
      }));
    });
  }
  
  // Rejoin all active chat rooms after reconnection
  rejoinActiveRooms() {
    if (!this.isConnected || !this.socket) return;
    
    console.log('Rejoining active chat rooms:', Array.from(this.activeRooms));
    this.activeRooms.forEach(roomId => {
      const [adId, roomType] = roomId.split(':');
      if (roomType === 'chat' && adId) {
        this.joinChatRoom(adId);
      }
    });
  }
  
  // Handle manual reconnection with exponential backoff
  handleManualReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      window.dispatchEvent(new CustomEvent('socket_reconnect_failed'));
      return;
    }
    
    // Clear any existing timer
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
    }
    
    // Calculate backoff delay (exponential with jitter)
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, this.reconnectAttempts));
    const jitter = Math.random() * 0.5 + 0.75; // Random between 0.75 and 1.25
    const delay = Math.floor(exponentialDelay * jitter);
    
    console.log(`Attempting manual reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectionTimer = setTimeout(() => {
      this.reconnectAttempts++;
      
      // Only attempt reconnection if we have credentials and socket is not already connected
      if (this.userId && this.token && (!this.socket || !this.isConnected)) {
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        this.connect(this.userId, this.token);
      }
    }, delay);
  }

  // Disconnect socket
  disconnect() {
    // Clear any reconnection timer
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
    
    if (this.socket) {
      console.log('Disconnecting socket...');
      // Remove all listeners before disconnecting to prevent memory leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      
      // Dispatch a global event that socket is disconnected
      window.dispatchEvent(new CustomEvent('socket_disconnected', { detail: { reason: 'manual_disconnect' } }));
    }
  }

  // Listen for new notifications (returns unsubscribe function)
  onNewNotification(callback) {
    if (this.socket) {
      // Remove any existing listeners to prevent duplicates
      this.socket.off('newNotification');
      
      const handler = (notification) => {
        console.log('Received new notification:', notification);
        callback(notification);
      };
      
      this.socket.on('newNotification', handler);
      
      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off('newNotification', handler);
        }
      };
    }
    return () => {};
  }

  // Listen for notification updates (when marked as read)
  onNotificationUpdate(callback) {
    if (this.socket) {
      // Remove any existing listeners to prevent duplicates
      this.socket.off('notificationUpdate');
      
      const handler = (data) => {
        console.log('Received notification update:', data);
        callback(data);
      };
      
      this.socket.on('notificationUpdate', handler);
      
      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off('notificationUpdate', handler);
        }
      };
    }
    return () => {};
  }

  // Listen for notification count updates
  onNotificationCount(callback) {
    if (this.socket) {
      // Remove any existing listeners to prevent duplicates
      this.socket.off('notificationCount');
      
      const handler = (count) => {
        console.log('Received notification count update:', count);
        callback(count);
      };
      
      this.socket.on('notificationCount', handler);
      
      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off('notificationCount', handler);
        }
      };
    }
    return () => {};
  }

  // Remove specific event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Join user-specific room
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinUserRoom', userId);
      console.log('Joined user room:', userId);
    }
  }

  // Join a chat room for a specific ad
  joinChatRoom(adId) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot join chat room: Socket not connected');
      return false;
    }

    if (!adId) {
      console.error('Cannot join chat room: Missing adId');
      return false;
    }

    console.log('Joining chat room for ad:', adId);
    this.socket.emit('joinRoom', { adId, token: this.token });
    
    // Track this room as active
    const roomId = `${adId}:chat`;
    this.activeRooms.add(roomId);
    
    // Listen for room join confirmation
    this.socket.once('roomJoined', (data) => {
      console.log('Successfully joined chat room:', data);
      window.dispatchEvent(new CustomEvent('chat_room_joined', { 
        detail: { adId, data }
      }));
    });
    
    // Listen for room join errors
    this.socket.once('roomJoinError', (error) => {
      console.error('Error joining chat room:', error);
      // Remove from active rooms if join failed
      this.activeRooms.delete(roomId);
      window.dispatchEvent(new CustomEvent('chat_room_join_error', { 
        detail: { adId, error }
      }));
    });
    
    return true;
  }

  // Leave a chat room
  leaveChatRoom(adId) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot leave chat room: Socket not connected');
      return false;
    }

    if (!adId) {
      console.error('Cannot leave chat room: Missing adId');
      return false;
    }

    console.log('Leaving chat room for ad:', adId);
    this.socket.emit('leaveRoom', { adId, token: this.token });
    
    // Remove from active rooms
    const roomId = `${adId}:chat`;
    this.activeRooms.delete(roomId);
    
    return true;
  }

  // Emit a chat message
  emitChatMessage(messageData) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot send message: Socket not connected');
      return false;
    }

    // Normalize adId from different possible payload shapes
    const adId = messageData?.adId || (typeof messageData?.ad === 'object' 
      ? (messageData?.ad?._id || messageData?.ad?.id)
      : messageData?.ad);

    if (!messageData || !adId) {
      console.error('Cannot send message: Invalid message data (missing ad or adId)');
      return false;
    }

    // Ensure we're in the chat room before sending
    const roomId = `${adId}:chat`;
    if (!this.activeRooms.has(roomId)) {
      console.log('Not in chat room, joining before sending message');
      this.joinChatRoom(adId);
    }

    // Add token to message data and ensure adId is present for server compatibility
    const messageWithToken = {
      ...messageData,
      adId,
      token: this.token
    };

    console.log('Emitting chat message:', messageWithToken);
    this.socket.emit('chatMessage', messageWithToken);
    
    return true;
  }

  // Listen for chat messages
  onChatMessage(callback) {
    if (!this.socket) {
      console.error('Cannot listen for messages: Socket not initialized');
      return () => {};
    }

    // Remove any existing listeners to prevent duplicates
    this.socket.off('chatMessage');
    this.socket.off('newChatMessage');
    this.socket.off('message');

    // Set up listeners for different possible event names
    const messageHandler = (message) => {
      console.log('Received chat message:', message);
      
      // If message contains ad info, ensure we're in the right room
      const adId = message?.adId || (typeof message?.ad === 'object'
        ? (message?.ad?._id || message?.ad?.id)
        : message?.ad);
      if (adId) {
        const roomId = `${adId}:chat`;
        if (!this.activeRooms.has(roomId)) {
          this.joinChatRoom(adId);
        }
      }
      
      // Dispatch a global event for this message
      window.dispatchEvent(new CustomEvent('chat_message_received', { 
        detail: { message }
      }));
      
      callback(message);
    };

    this.socket.on('chatMessage', messageHandler);
    this.socket.on('newChatMessage', messageHandler);
    this.socket.on('message', messageHandler);

    // Set up reconnect handler to re-register these listeners
    const reconnectHandler = () => {
      console.log('Reconnected, re-registering chat message listeners');
      this.socket.on('chatMessage', messageHandler);
      this.socket.on('newChatMessage', messageHandler);
      this.socket.on('message', messageHandler);
    };
    
    this.socket.on('reconnect', reconnectHandler);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off('chatMessage', messageHandler);
        this.socket.off('newChatMessage', messageHandler);
        this.socket.off('message', messageHandler);
        this.socket.off('reconnect', reconnectHandler);
      }
    };
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Subscribe to connect event (returns unsubscribe)
  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback);
      return () => {
        if (this.socket) this.socket.off('connect', callback);
      };
    }
    return () => {};
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
