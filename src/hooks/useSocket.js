import { useEffect, useCallback } from 'react';
import socketService from './socketService';

/**
 * A simplified hook to interact with the global socket service.
 * It assumes the connection is managed elsewhere (e.g., in Header.jsx).
 */
export const useSocket = (isLoggedIn, currentUserId) => {
  // Connect to socket when user is logged in
  const connectSocket = useCallback(() => {
    if (!isLoggedIn) return; // Only try to connect if logged in

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userId = user.id || user._id;

    if (token && userId) {
      socketService.connect(userId, token);
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
    // Connect socket if logged in and not already connected
    if (isLoggedIn && !socketService.isSocketConnected()) {
      connectSocket();
    }

    // Listen for socket connection to join user room
    let offConnect;
    if (isLoggedIn && currentUserId) {
      offConnect = onConnect(() => {
        socketService.joinUserRoom(currentUserId);
      });
    }

    return () => {
      if (typeof offConnect === 'function') {
        offConnect();
      }
      // Only disconnect socket if user is logging out or not logged in, and socket is active
      if (!isLoggedIn && socketService.getSocket()) {
        disconnectSocket();
      }
      // Do NOT remove all listeners globally here; individual components manage their own subscriptions
      // via the unsubscribe functions returned by onChatMessage/onConnect/etc. Removing all listeners here
      // can break other mounted components (e.g., Header notifications) that are using the same singleton socket.
    };
  }, [isLoggedIn, connectSocket, disconnectSocket, onConnect, currentUserId]); // Update dependency

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
