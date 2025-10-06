import { io } from 'socket.io-client';
import { BASE_URL } from './helper';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect(userId, token) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to socket server:', BASE_URL);
    
    this.socket = io(BASE_URL, {
      auth: {
        token: token,
        userId: userId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket && this.socket.connected) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Listen for new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('newNotification', (notification) => {
        console.log('Received new notification:', notification);
        callback(notification);
      });
    }
  }

  // Listen for notification updates (when marked as read)
  onNotificationUpdate(callback) {
    if (this.socket) {
      this.socket.on('notificationUpdate', (data) => {
        console.log('Received notification update:', data);
        callback(data);
      });
    }
  }

  // Listen for notification count updates
  onNotificationCount(callback) {
    if (this.socket) {
      this.socket.on('notificationCount', (count) => {
        console.log('Received notification count update:', count);
        callback(count);
      });
    }
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

  // Join specific chat room
  joinChatRoom(adId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinChatRoom', adId);
      console.log('Joined chat room:', adId);
    }
  }

  // Leave specific chat room
  leaveChatRoom(adId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveChatRoom', adId);
      console.log('Left chat room:', adId);
    }
  }

  // Emit chat message
  emitChatMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chatMessage', messageData);
      console.log('Emitted chat message:', messageData);
    }
  }

  // Listen for incoming chat messages
  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('chatMessage', (message) => {
        console.log('Received chat message:', message);
        callback(message);
      });
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
