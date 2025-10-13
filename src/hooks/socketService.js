import io from 'socket.io-client';
import { BASE_URL } from "../Services/helper";

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.token = null;
    this.isConnected = false;
    this.activeRooms = new Set(); // Track active chat rooms
    // =================== (Track active chat rooms)===================
    this.isConnecting = false;
    // =================== (New state to track if a connection attempt is in progress)===================
  }
  
  // =================== (Check if already in a specific room)===================
  isInRoom(roomId) {
    return this.activeRooms.has(roomId);
  }

  // =================== (Connect to socket server)===================
  connect(userId, token) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected and active, skipping new connection.');
      return;
    } else if (this.socket && !this.socket.connected) {
      console.log('Socket exists but is not connected, attempting to reconnect/reuse.');
      this.disconnect();
      // =================== (Clean up any stale/disconnected socket instance)===================
    }

    if (this.isConnecting) {
      console.log('Already attempting to connect, skipping new connection request.');
      return;
    }

    this.userId = userId;
    this.token = token;

    console.log('Connecting to socket server with userId:', userId);
    
    // =================== (Create socket connection with improved configuration)===================
    this.socket = io(BASE_URL, {
      auth: { token },
      query: { userId },
      reconnection: true,
      // =================== (Enable automatic reconnection)===================
      reconnectionAttempts: 5,
      // =================== (Default is Infinity, but 5 is reasonable)===================
      reconnectionDelay: 1000,
      // =================== (Start with 1s, will increase automatically)===================
      timeout: 10000,
      transports: ['websocket', 'polling']
      // =================== (Prefer WebSocket, fallback to polling)===================
    });

    this.isConnecting = true;
    // =================== (Set connecting state)===================

    // =================== (Handle connection events)===================
    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket.id);
      this.isConnected = true;
      this.isConnecting = false;
      // =================== (Reset connecting state on successful connection)===================
      
      // =================== (Dispatch custom event for components to listen to)===================
      window.dispatchEvent(new CustomEvent('socket_connected', { 
        detail: { socketId: this.socket.id }
      }));
      
      // =================== (Join user-specific room immediately after connection)===================
      if (this.userId) {
        this.joinUserRoom(this.userId);
      }
      
      // =================== (Rejoin all active chat rooms after reconnection)===================
      this.rejoinActiveRooms();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      
      // =================== (Check if error is related to authentication)===================
      if (error.message.includes('auth') || error.message.includes('token')) {
        window.dispatchEvent(new CustomEvent('socket_auth_error', { 
          detail: { error }
        }));
        // =================== (Do not attempt to reconnect on auth errors, as it's a credential issue)===================
        if (this.socket) {
          this.socket.disconnect();
        }
        this.isConnecting = false;
        // =================== (Reset connecting state on connection error)===================
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.isConnecting = false;
      // =================== (Reset connecting state on disconnect)===================
      
      window.dispatchEvent(new CustomEvent('socket_disconnected', { 
        detail: { reason }
      }));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      
      // =================== (Re-join user room after reconnection)===================
      if (this.userId) {
        this.joinUserRoom(this.userId);
      }
      
      window.dispatchEvent(new CustomEvent('socket_reconnected'));
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      // =================== (Library handles this)===================
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts');
      window.dispatchEvent(new CustomEvent('socket_reconnect_failed', { 
        detail: { maxAttempts: this.maxReconnectAttempts }
      }));
      this.isConnecting = false;
      // =================== (Reset connecting state on reconnect failed)===================
    });
    
    // =================== (Setup notification listener)===================
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      window.dispatchEvent(new CustomEvent('notification_received', { 
        detail: { notification }
      }));
    });
  }
  
  // =================== (Rejoin all active chat rooms after reconnection)===================
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
  
  // =================== (Disconnect socket)===================
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      // =================== (Disconnect the socket first, then remove listeners to allow graceful shutdown)===================
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.isConnected = false;
      this.isConnecting = false;
      // =================== (Ensure connecting state is false on disconnect)===================
      
      // =================== (Dispatch a global event that socket is disconnected)===================
      window.dispatchEvent(new CustomEvent('socket_disconnected', { detail: { reason: 'manual_disconnect' } }));
    }
  }

  // =================== (Listen for new notifications (returns unsubscribe function))===================
  onNewNotification(callback) {
    if (this.socket) {
      // =================== (Remove any existing listeners to prevent duplicates)===================
      this.socket.off('notification');
      
      const handler = (notification) => {
        console.log('SocketService: Received new notification event', notification);
        callback(notification);
      };
      
      this.socket.on('notification', handler);
      
      console.log('SocketService: Subscribed to new notification event.');
 
      // =================== (Return unsubscribe function)===================
      return () => {
        if (this.socket) {
          this.socket.off('notification', handler);
          console.log('SocketService: Unsubscribed from new notification event.');
        }
      };
    }
    console.log('SocketService: Not subscribed to new notification (socket not available).');
    return () => {};
  }
 
  // =================== (Listen for notification updates (when marked as read))===================
  onNotificationUpdate(callback) {
    if (this.socket) {
      // =================== (Remove any existing listeners to prevent duplicates)===================
      this.socket.off('notificationUpdate');
      
      const handler = (data) => {
        console.log('SocketService: Received notification update event', data);
        callback(data);
      };
      
      this.socket.on('notificationUpdate', handler);
      
      console.log('SocketService: Subscribed to notification update event.');

      // =================== (Return unsubscribe function)===================
      return () => {
        if (this.socket) {
          this.socket.off('notificationUpdate', handler);
          console.log('SocketService: Unsubscribed from notification update event.');
        }
      };
    }
    console.log('SocketService: Not subscribed to notification update (socket not available).');
    return () => {};
  }
 
  // =================== (Listen for notification count updates)===================
  onNotificationCount(callback) {
    if (this.socket) {
      // =================== (Remove any existing listeners to prevent duplicates)===================
      this.socket.off('notificationCount');
      
      const handler = (count) => {
        console.log('SocketService: Received notification count event', count);
        callback(count);
      };
      
      this.socket.on('notificationCount', handler);
      
      console.log('SocketService: Subscribed to notification count event.');
 
      // =================== (Return unsubscribe function)===================
      return () => {
        if (this.socket) {
          this.socket.off('notificationCount', handler);
          console.log('SocketService: Unsubscribed from notification count event.');
        }
      };
    }
    console.log('SocketService: Not subscribed to notification count (socket not available).');
    return () => {};
  }
 
  // =================== (Remove specific event listeners)===================
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // =================== (Remove all listeners)===================
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // =================== (Join user-specific room)===================
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinUserRoom', userId);
      console.log('Joined user room:', userId);
    }
  }

  // =================== (Join a chat room for a specific ad)===================
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
    
    // =================== (Track this room as active)===================
    const roomId = `${adId}:chat`;
    this.activeRooms.add(roomId);
    
    // =================== (Listen for room join confirmation)===================
    this.socket.once('roomJoined', (data) => {
      console.log('Successfully joined chat room:', data);
      window.dispatchEvent(new CustomEvent('chat_room_joined', { 
        detail: { adId, data }
      }));
    });
    
    // =================== (Listen for room join errors)===================
    this.socket.once('roomJoinError', (error) => {
      console.error('Error joining chat room:', error);
      // =================== (Remove from active rooms if join failed)===================
      this.activeRooms.delete(roomId);
      window.dispatchEvent(new CustomEvent('chat_room_join_error', { 
        detail: { adId, error }
      }));
    });
    
    return true;
  }

  // =================== (Leave a chat room)===================
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
    
    // =================== (Remove from active rooms)===================
    const roomId = `${adId}:chat`;
    this.activeRooms.delete(roomId);
    
    return true;
  }

  // =================== (Emit a chat message)===================
  emitChatMessage(messageData) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot send message: Socket not connected');
      return false;
    }

    // =================== (Normalize adId from different possible payload shapes)===================
    const adId = messageData?.adId || (typeof messageData?.ad === 'object' 
      ? (messageData?.ad?._id || messageData?.ad?.id)
      : messageData?.ad);

    if (!messageData || !adId) {
      console.error('Cannot send message: Invalid message data (missing ad or adId)');
      return false;
    }

    // =================== (Ensure we're in the chat room before sending)===================
    const roomId = `${adId}:chat`;
    if (!this.activeRooms.has(roomId)) {
      console.log('Not in chat room, joining before sending message');
      this.joinChatRoom(adId);
    }

    // =================== (Add token to message data and ensure adId is present for server compatibility)===================
    const messageWithToken = {
      ...messageData,
      adId,
      token: this.token
    };

    console.log('Emitting chat message:', messageWithToken);
    this.socket.emit('sendMessage', messageWithToken);
    // =================== (Changed event name to match backend)===================
    
    return true;
  }

  // =================== (Listen for chat messages)===================
  onChatMessage(callback) {
    if (!this.socket) {
      console.error('Cannot listen for messages: Socket not initialized');
      return () => {};
    }

    // =================== (Remove any existing listeners to prevent duplicates)===================
    this.socket.off('chatMessage');
    this.socket.off('newChatMessage');
    this.socket.off('message');
    this.socket.off('chat message');
    // =================== (Also remove for 'chat message' (with space))===================
    this.socket.off('sendMessageAck');
    // =================== (Remove for sendMessageAck)===================

    // =================== (Set up listeners for different possible event names)===================
    const messageHandler = (message) => {
      console.log('SocketService: Received chat message event', message);
      
      // =================== (If message contains ad info, ensure we're in the right room)===================
      const adId = message?.adId || (typeof message?.ad === 'object'
        ? (message?.ad?._id || message?.ad?.id)
        : message?.ad);
      if (adId) {
        const roomId = `${adId}:chat`;
        if (!this.activeRooms.has(roomId)) {
          this.joinChatRoom(adId);
        }
      }
      
      // =================== (Dispatch a global event for this message)===================
      window.dispatchEvent(new CustomEvent('chat_message_received', { 
        detail: { message }
      }));
      
      callback(message);
    };

    this.socket.on('chatMessage', messageHandler);
    this.socket.on('newChatMessage', messageHandler);
    this.socket.on('message', messageHandler);
    this.socket.on('chat message', messageHandler);
    // =================== (Listen for 'chat message' with space)===================

    // =================== (Set up reconnect handler to re-register these listeners)===================
    const sendMessageAckHandler = (ackData) => {
      console.log('SocketService: Received sendMessageAck event', ackData);
      // =================== (You can implement specific logic here to update UI for message sent confirmation)===================
      // =================== (For now, we will just log it and the ChatPage component will handle the state update.)===================
      // =================== (Dispatch a global event for this acknowledgment)===================
      window.dispatchEvent(new CustomEvent('chat_message_sent_ack', {
        detail: { ackData }
      }));
    };

    this.socket.on('sendMessageAck', sendMessageAckHandler);
    // =================== (Listen for sendMessageAck)===================

    const reconnectHandler = () => {
      console.log('SocketService: Reconnected, re-registering chat message listeners');
      this.socket.on('chatMessage', messageHandler);
      this.socket.on('newChatMessage', messageHandler);
      this.socket.on('message', messageHandler);
      this.socket.on('chat message', messageHandler);
      // =================== (Re-register for 'chat message' with space)===================
      this.socket.on('sendMessageAck', sendMessageAckHandler);
      // =================== (Re-register for sendMessageAck)===================
    };
       
    this.socket.on('reconnect', reconnectHandler);

    // =================== (Return cleanup function)===================
    return () => {
      if (this.socket) {
        this.socket.off('chatMessage', messageHandler);
        this.socket.off('newChatMessage', messageHandler);
        this.socket.off('message', messageHandler);
        this.socket.off('chat message', messageHandler);
        // =================== (Clean up for 'chat message' with space)===================
        this.socket.off('sendMessageAck', sendMessageAckHandler);
        // =================== (Clean up for sendMessageAck)===================
        this.socket.off('reconnect', reconnectHandler);
      }
    };
  }
 
  // =================== (Check if socket is connected)===================
  isSocketConnected() {
    const isConnectedStatus = this.socket && this.socket.connected && this.isConnected;
    console.log('SocketService: isSocketConnected called, status:', isConnectedStatus);
    return isConnectedStatus;
  }
 
  // =================== (Get socket instance)===================
  getSocket() {
    return this.socket;
  }

  // =================== (Subscribe to connect event (returns unsubscribe))===================
  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback);
      return () => {
        if (this.socket) this.socket.off('connect', callback);
      };
    }
    return () => {};
  }
 
  // =================== (Emit fetchChatHistory event and listen for chat history)===================
  emitFetchChatHistory(senderId, receiverId, adId, callback) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot fetch chat history: Socket not connected');
      return () => {};
    }

    console.log('SocketService: Emitting fetchChatHistory:', { senderId, receiverId, adId });
    this.socket.emit('fetchChatHistory', { senderId, receiverId, adId });

    const handler = (history) => {
      console.log('SocketService: Received chat history event', history);
      callback(history);
    };

    this.socket.on('chat history', handler);

    return () => {
      if (this.socket) {
        this.socket.off('chat history', handler);
        console.log('SocketService: Unsubscribed from chat history event.');
      }
    };
  }
}

// =================== (Create singleton instance)===================
const socketService = new SocketService();

export default socketService;
