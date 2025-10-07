import { useEffect, useCallback } from 'react';
import socketService from '../Services/socketService';

export const useSocket = (isLoggedIn) => {
  // Connect to socket when user is logged in
  const connectSocket = useCallback(() => {
    if (isLoggedIn) {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = user.id || user._id;

      if (token && userId) {
        socketService.connect(userId, token);
        
        // Join user room after a short delay
        setTimeout(() => {
          socketService.joinUserRoom(userId);
        }, 1000);
      }
    }
  }, [isLoggedIn]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
  }, []);

  // Subscribe to new notifications
  const subscribeToNotifications = useCallback((callback) => {
    socketService.onNewNotification(callback);
  }, []);

  // Subscribe to notification updates
  const subscribeToNotificationUpdates = useCallback((callback) => {
    socketService.onNotificationUpdate(callback);
  }, []);

  // Subscribe to notification count updates
  const subscribeToNotificationCount = useCallback((callback) => {
    socketService.onNotificationCount(callback);
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
    socketService.joinChatRoom(adId);
  }, []);

  const leaveChatRoom = useCallback((adId) => {
    socketService.leaveChatRoom(adId);
  }, []);

  const emitChatMessage = useCallback((messageData) => {
    socketService.emitChatMessage(messageData);
  }, []);

  const onChatMessage = useCallback((callback) => {
    return socketService.onChatMessage(callback);
  }, []);

  // Auto connect/disconnect based on login status
  useEffect(() => {
    if (isLoggedIn) {
      // Only connect if not already connected
      if (!socketService.isSocketConnected()) {
        connectSocket();
      }
    }

    return () => {
      // Only disconnect socket when user is logged out or not logged in
      if (!isLoggedIn && socketService.socket) {
        disconnectSocket();
      }
      // Do NOT remove all listeners globally here; individual components manage their own subscriptions
      // via the unsubscribe functions returned by onChatMessage/onConnect/etc. Removing all listeners here
      // can break other mounted components (e.g., Header notifications) that are using the same singleton socket.
    };
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
