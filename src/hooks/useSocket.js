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

  // Check if socket is connected
  const isConnected = useCallback(() => {
    return socketService.isSocketConnected();
  }, []);

  // Auto connect/disconnect based on login status
  useEffect(() => {
    if (isLoggedIn) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      if (!isLoggedIn) {
        socketService.removeAllListeners();
        disconnectSocket();
      }
    };
  }, [isLoggedIn, connectSocket, disconnectSocket]);

  return {
    connectSocket,
    disconnectSocket,
    subscribeToNotifications,
    subscribeToNotificationUpdates,
    subscribeToNotificationCount,
    isConnected
  };
};

export default useSocket;
