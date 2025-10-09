import { useEffect, useCallback, useState, useRef } from 'react';
import socketService from './socketService';

export const useSocket = (isLoggedIn) => {
  // Track active rooms to prevent duplicate joins
  const activeRooms = useRef(new Set());
  
  const [connectionStatus, setConnectionStatus] = useState({
    connected: socketService.isConnected,
    lastError: null,
    reconnecting: false
  });

  // Connect to socket when user is logged in or on page load if token exists
  const connectSocket = useCallback(() => {
    // Get token and user info from storage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.log('No token or user found in storage, cannot connect socket');
      return;
    }
    
    try {
      const user = JSON.parse(userStr || '{}');
      const userId = user.id || user._id;

      if (token && userId) {
        console.log('Connecting socket with userId:', userId);
        socketService.connect(userId, token);
        
        // Update connection status
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          reconnecting: false
        }));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
  }, []);

  // Subscribe to new notifications with proper cleanup
  const subscribeToNotifications = useCallback((callback) => {
    return socketService.onNewNotification(callback);
  }, []);

  // Subscribe to notification updates with proper cleanup
  const subscribeToNotificationUpdates = useCallback((callback) => {
    return socketService.onNotificationUpdate(callback);
  }, []);

  // Subscribe to notification count updates with proper cleanup
  const subscribeToNotificationCount = useCallback((callback) => {
    return socketService.onNotificationCount(callback);
  }, []);

  // Subscribe to connect event
  const onConnect = useCallback((callback) => {
    return socketService.onConnect(callback);
  }, []);

  // Check if socket is connected
  const isConnected = useCallback(() => {
    return socketService.isSocketConnected();
  }, []);

  // Chat specific socket functions
  const joinChatRoom = useCallback((adId) => {
    if (!adId) {
      console.error('Cannot join chat room: Missing adId');
      return false;
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      console.error('Cannot join chat room: No token available');
      return false;
    }
    
    // Check if we're already in this room
    if (activeRooms.current.has(adId)) {
      // Already in this room, no need to join again
      return true;
    }
    
    // If socket is not connected, try to connect first
    if (!socketService.isSocketConnected()) {
      console.log('Socket not connected, attempting to connect before joining room');
      connectSocket();
      
      // Set a timeout to join the room after connection attempt
      setTimeout(() => {
        if (socketService.isSocketConnected() && !activeRooms.current.has(adId)) {
          console.log(`useSocket: Retrying joining chat room for ad: ${adId} after reconnect`);
          const result = socketService.joinChatRoom(adId, token);
          if (result) activeRooms.current.add(adId);
        } else {
          console.error('Failed to connect socket, cannot join chat room');
        }
      }, 1000);
      
      return false;
    }
    
    console.log(`useSocket: Joining chat room for ad: ${adId} with token authentication`);
    const result = socketService.joinChatRoom(adId, token);
    if (result) activeRooms.current.add(adId);
    return result;
  }, [connectSocket]);

  const leaveChatRoom = useCallback((adId) => {
    if (!adId) {
      console.error('Cannot leave chat room: Missing adId');
      return false;
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      console.error('Cannot leave chat room: No token available');
      return false;
    }
    
    console.log(`useSocket: Leaving chat room for ad: ${adId}`);
    const result = socketService.leaveChatRoom(adId, token);
    if (result) activeRooms.current.delete(adId);
    return result;
  }, []);

  const emitChatMessage = useCallback((messageData) => {
    if (!messageData || !messageData.ad) {
      console.error('Cannot send message: Invalid message data', messageData);
      return false;
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      console.error('Cannot send message: No token available');
      return false;
    }
    
    // If socket is not connected, try to connect first
    if (!socketService.isSocketConnected()) {
      console.log('Socket not connected, attempting to connect before sending message');
      connectSocket();
      return false;
    }
    
    // Always join the chat room before sending a message
    // This ensures we're in the correct room
    const roomJoined = joinChatRoom(messageData.ad);
    if (!roomJoined && !activeRooms.current.has(messageData.ad)) {
      console.error('Failed to join chat room, cannot send message');
      return false;
    }
    
    console.log('useSocket: Emitting chat message:', messageData);
    return socketService.emitChatMessage(messageData);
  }, [connectSocket, joinChatRoom]);

  const onChatMessage = useCallback((callback) => {
    console.log('Setting up chat message listener');
    return socketService.onChatMessage((message) => {
      console.log('Chat message received in hook:', message);
      callback(message);
    });
  }, []);

  // Set up global socket connection and disconnection
  useEffect(() => {
    // Connect socket when component mounts - check for token regardless of isLoggedIn state
    // This ensures connection persists across page refreshes
    connectSocket();

    // Set up event listeners for socket status
    const handleSocketConnected = (event) => {
      console.log('Socket connected event received:', event.detail);
      setConnectionStatus(prev => ({
        ...prev,
        connected: true,
        reconnecting: false,
        lastError: null
      }));
    };

    const handleSocketDisconnected = (event) => {
      console.log('Socket disconnected event received:', event.detail);
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        lastError: event.detail?.reason || 'Unknown reason'
      }));
    };

    const handleSocketReconnecting = () => {
      console.log('Socket attempting to reconnect');
      setConnectionStatus(prev => ({
        ...prev,
        reconnecting: true
      }));
    };

    const handleSocketReconnected = (event) => {
      console.log('Socket reconnected after attempts:', event.detail);
      setConnectionStatus(prev => ({
        ...prev,
        connected: true,
        reconnecting: false,
        lastError: null
      }));
    };

    const handleSocketReconnectFailed = () => {
      console.log('Socket reconnection failed');
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        reconnecting: false,
        lastError: 'Reconnection failed after maximum attempts'
      }));
    };

    const handleSocketAuthError = (event) => {
      console.log('Socket authentication error:', event.detail);
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        lastError: 'Authentication error'
      }));
      
      // Clear token if auth error and redirect to login
      if (event.detail.error?.message?.includes('auth')) {
        console.warn('Authentication error detected, clearing session');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    };

    // Add event listeners
    window.addEventListener('socket_connected', handleSocketConnected);
    window.addEventListener('socket_disconnected', handleSocketDisconnected);
    window.addEventListener('socket_reconnect_attempt', handleSocketReconnecting);
    window.addEventListener('socket_reconnected', handleSocketReconnected);
    window.addEventListener('socket_reconnect_failed', handleSocketReconnectFailed);
    window.addEventListener('socket_auth_error', handleSocketAuthError);

    // Clean up on unmount
    return () => {
      // Only disconnect if we're unmounting the entire app
      // For normal component unmounts, keep the socket alive
      if (process.env.NODE_ENV === 'development') {
        // In development, we can disconnect to avoid socket connection issues during hot reloads
        disconnectSocket();
      }
      
      // Remove event listeners
      window.removeEventListener('socket_connected', handleSocketConnected);
      window.removeEventListener('socket_disconnected', handleSocketDisconnected);
      window.removeEventListener('socket_reconnect_attempt', handleSocketReconnecting);
      window.removeEventListener('socket_reconnected', handleSocketReconnected);
      window.removeEventListener('socket_reconnect_failed', handleSocketReconnectFailed);
      window.removeEventListener('socket_auth_error', handleSocketAuthError);
    };
  }, [connectSocket, disconnectSocket]);

  // Auto connect/disconnect based on login status
  useEffect(() => {
    if (isLoggedIn) {
      // Only connect if not already connected
      if (!socketService.isSocketConnected()) {
        connectSocket();
      }
      
      // Setup reconnection on storage events (for multi-tab support)
      const handleStorageChange = (e) => {
        if (e.key === 'token' && e.newValue) {
          console.log('Token changed in another tab, reconnecting socket');
          connectSocket();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } else {
      // Disconnect when logged out
      disconnectSocket();
    }
  }, [isLoggedIn, connectSocket, disconnectSocket]);

  return {
    connectSocket,
    disconnectSocket,
    subscribeToNotifications,
    subscribeToNotificationUpdates,
    subscribeToNotificationCount,
    isConnected,
    onConnect,
    joinChatRoom,
    leaveChatRoom,
    emitChatMessage,
    onChatMessage,
  };
};

export default useSocket;
