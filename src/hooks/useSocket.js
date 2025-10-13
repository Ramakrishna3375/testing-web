import { useEffect, useCallback } from 'react';
import socketService from './socketService';

/**
 * A simplified hook to interact with the global socket service.
 * It assumes the connection is managed elsewhere (e.g., in Header.jsx).
 */
export const useSocket = (isLoggedIn, currentUserId) => {
  // =================== (Connect to socket when user is logged in)===================
  const connectSocket = useCallback(() => {
    // =================== (isLoggedIn is captured from the hook's arguments, no need for it as a dependency here.)===================
    if (!isLoggedIn) return;

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userId = user.id || user._id;

    if (token && userId) {
      socketService.connect(userId, token);
    }
  }, []);
  // =================== (Removed isLoggedIn from dependencies)===================

  // =================== (Disconnect socket)===================
  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
  }, []);
  // =================== (No dependencies for disconnectSocket)===================

  // =================== (Subscribe to new notifications)===================
  const subscribeToNotifications = useCallback((callback) => {
    return socketService.onNewNotification(callback);
  }, []);

  // =================== (Subscribe to notification updates)===================
  const subscribeToNotificationUpdates = useCallback((callback) => {
    return socketService.onNotificationUpdate(callback);
  }, []);

  // =================== (Subscribe to notification count updates)===================
  const subscribeToNotificationCount = useCallback((callback) => {
    return socketService.onNotificationCount(callback);
  }, []);

  // =================== (Subscribe to connect event)===================
  const onConnect = useCallback((callback) => {
    return socketService.onConnect(callback);
  }, []);

  // =================== (Check if socket is connected)===================
  const isConnected = useCallback(() => {
    return socketService.isSocketConnected();
  }, []);

  // =================== (Chat specific socket functions)===================
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

  const emitFetchChatHistory = useCallback((senderId, receiverId, adId, callback) => {
    return socketService.emitFetchChatHistory(senderId, receiverId, adId, callback);
  }, []);

  // =================== (Auto connect/disconnect based on login status)===================

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
    emitFetchChatHistory,
  };
};

export default useSocket;
