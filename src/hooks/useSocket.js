import { useEffect, useCallback, useState, useRef } from 'react';
import socketService from './socketService';

/**
 * A simplified hook to interact with the global socket service.
 * It assumes the connection is managed elsewhere (e.g., in Header.jsx).
 */
export const useSocket = () => {

  // Subscribe to connect event
  const onConnect = useCallback((callback) => {
    return socketService.onConnect(callback);
  }, []);

  const isConnected = useCallback(() => {
    return socketService.isSocketConnected();
  }, []);

  // Chat specific socket functions
  const joinChatRoom = useCallback((adId) => {
    if (!socketService.isSocketConnected()) {
      console.warn('useSocket: Attempted to join room, but socket is not connected.');
      return;
    }
    socketService.joinChatRoom(adId);
  }, []);

  const leaveChatRoom = useCallback((adId) => {
    socketService.leaveChatRoom(adId);
  }, []);

  const emitChatMessage = useCallback((messageData) => {
    if (!socketService.isSocketConnected()) {
      console.warn('useSocket: Attempted to send message, but socket is not connected.');
      return;
    }
    socketService.emitChatMessage(messageData);
  }, []);

  const onChatMessage = useCallback((callback) => {
    console.log('Setting up chat message listener');
    return socketService.onChatMessage(callback);
  }, []);

  return {
    isConnected,
    onConnect,
    joinChatRoom,
    leaveChatRoom,
    emitChatMessage,
    onChatMessage,
  };
};

export default useSocket;
