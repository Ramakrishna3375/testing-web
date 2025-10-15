import io from 'socket.io-client';
import { BASE_URL } from "../Services/helper";

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.token = null;
    this.isConnected = false;
    this.activeRooms = new Set(); // Track active chat rooms
    this.onConnectCallback = null; // Callback for post-connection logic
    this.chatMessageSubscribers = new Set(); // Use a Set for direct subscribers
  }
  
  // Check if already in a specific room
  isInRoom(roomId) {
    return this.activeRooms.has(roomId);
  }

  // Set a callback to be executed upon successful connection
  setOnConnect(callback) {
    this.onConnectCallback = callback;
  }

  // Connect to socket server
  connect(userId, token) {
    if (this.isSocketConnected()) return;
    this.userId = userId;
    this.token = token;
    console.log('Connecting to socket server with token:', token); // debug
    this.socket = io(BASE_URL, {
      auth: { token }, // userId is inside the JWT only, not sent as a direct field for backend handshake
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket.id);
      this.isConnected = true;
      // Auto-join user room on initial connect to receive instant notifications
      if (this.userId) {
        try {
          // Some backends expect an explicit registration event
          this.socket.emit('registerUser', this.userId);
          console.log('Emitted registerUser with userId:', this.userId);
          this.joinUserRoom(this.userId);
        } catch (e) {
          console.warn('Failed to register/join user room on connect:', e);
        }
      } else {
        console.warn('Socket connected but userId is missing; cannot join user room');
      }
    });
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message, error);
    });

    // Debug: log any incoming socket events (helps verify if 'notification' arrives)
    this.socket.onAny((event, ...args) => {
      try {
        console.log('Socket incoming event:', event, args && args[0]);
      } catch {}
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      
      // Re-join user room after reconnection
      if (this.userId) {
        this.joinUserRoom(this.userId);
      }
      
      window.dispatchEvent(new CustomEvent('socket_reconnected'));
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error); // Library handles this
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts');
      window.dispatchEvent(new CustomEvent('socket_reconnect_failed', { 
        detail: { maxAttempts: this.maxReconnectAttempts }
      }));
    });
    
    // Centralized handler for incoming notifications
    const notificationHandler = (notification) => {
      console.log('Received notification event from server:', notification);
      window.dispatchEvent(new CustomEvent('notification_received', { 
        detail: { notification }
      }));
    };

    // Setup notification listeners for different possible event names
    // This makes the client more robust to potential server-side event name changes.
    this.socket.on('notification', notificationHandler);
    this.socket.on('newNotification', notificationHandler);


    // Setup chat message listener once
    const messageHandler = (message) => {
      console.log('Received chat message:', message);

      // If message contains ad info, and this user is the receiver, ensure we're in the right room
      const adId = message?.adId || (typeof message?.ad === 'object'
        ? (message?.ad?._id || message?.ad?.id)
        : message?.ad);
      
      // Check if the current user is the intended receiver of the message
      const receiverId = typeof message?.receiver === 'object' 
        ? (message.receiver?._id || message.receiver?.id) 
        : message?.receiver;

      if (adId && receiverId === this.userId) {
        const roomId = `${adId}:chat`;
        if (!this.activeRooms.has(roomId)) {
          console.log(`Received a message for a room I'm not in. Joining room for ad: ${adId}`);
          this.joinChatRoom(adId);
        }
      }

      // Dispatch a global event for this message
      window.dispatchEvent(new CustomEvent('chat_message_received', {
        detail: { message }
      }));

      // Also notify direct subscribers registered via onChatMessage
      try { this.messageHandler(message); } catch (e) {}
    };

    this.socket.on('newChatMessage', messageHandler);
    this.socket.on('message', messageHandler);
    this.socket.on('chat message', messageHandler);
  }

  // Centralized message handler that notifies direct subscribers
  messageHandler = (message) => {
    console.log('Received chat message from server:', message);
    this.chatMessageSubscribers.forEach(callback => callback(message));
  };

  rejoinActiveRooms() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      // Remove all listeners before disconnecting to prevent memory leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.isConnected = false;
      
      // Dispatch a global event that socket is disconnected
      window.dispatchEvent(new CustomEvent('socket_disconnected', { detail: { reason: 'manual_disconnect' } }));
    }
  }
  
  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      // Remove all listeners before disconnecting to prevent memory leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.isConnected = false;
      this.chatMessageSubscribers.clear(); // Clear subscribers on disconnect
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

    // Prevent re-joining a room we are already in
    const roomId = `${adId}:chat`;
    if (this.isInRoom(roomId)) {
      // console.log('Already in chat room:', adId); // Optional: for debugging
      return true;
    }

    console.log('Joining chat room for ad:', adId);
    this.socket.emit('joinRoom', { adId, token: this.token });
    
    // Add to active rooms immediately to prevent re-joining
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

    if (!messageData) {
      console.error('Cannot send message: Invalid message data');
      return false;
    }

    // Normalize receiverId as backend expects
    const receiverId = messageData?.receiverId 
      || (typeof messageData?.receiver === 'object' ? (messageData?.receiver?._id || messageData?.receiver?.id) : messageData?.receiver);

    if (!receiverId) {
      console.error('Cannot send message: Missing receiverId');
      return false;
    }

    // Ensure we're in the chat room before sending (optional)
    if (adId) {
      const roomId = `${adId}:chat`;
      if (!this.activeRooms.has(roomId)) {
        console.log('Not in chat room, joining before sending message');
        this.joinChatRoom(adId);
      }
    }

    // Add token to message data and ensure server-compatible fields
    const messageWithToken = {
      message: messageData.message,
      adId: adId || null,
      receiverId,
      token: this.token
    };

    console.log('Emitting chat message:', messageWithToken);
    this.socket.emit('sendMessage', messageWithToken);
    
    return true;
  }

  // Listen for chat messages
  onChatMessage(callback, adId) {
    const subscriber = (message) => {
      const messageAdId = message?.adId || message?.ad?._id || message?.ad?.id || message?.ad;
      // If an adId is provided, only fire callback for that chat, otherwise fire for any chat message.
      if (!adId || adId === messageAdId) callback(message);
    };

    this.chatMessageSubscribers.add(subscriber);

    return () => {
      this.chatMessageSubscribers.delete(subscriber);
    };
  }

  // Check if socket is connected
  isSocketConnected() {
    return !!(this.socket && this.isConnected);
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
