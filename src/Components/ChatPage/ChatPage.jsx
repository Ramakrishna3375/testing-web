import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import { getChatUsers, getChatMessagesByUserId,  getUserDetails , getAllActiveAds, sendChatMessage, deleteMessage, deleteChat } from '../../Services/api';
import { useSocket } from '../../hooks/useSocket.js';
import UserProfile from '../../assets/Website logos/UserProfile.jpg';
import socketService from '../../hooks/socketService';
import { FaTrash, FaCheckDouble } from 'react-icons/fa';
import { Skeleton } from '../SkeletonLoader/FilesLoader';
 
const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: paramUserId } = useParams(); // seller's userId from route

  // Get adId from location state if available
  const initialAdId = location.state?.adId || null;

  // useAuth logic moved here
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    let parsedUser = null;

    if (storedUser && storedUser !== "null") {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error("Auth - Error parsing stored user:", e);
      }
    }

    let userId = parsedUser?.id || parsedUser?._id;
    let userEmail = parsedUser?.email;
    let userName = parsedUser?.name || parsedUser?.firstName || parsedUser?.lastName;
    let userProfilePicture = parsedUser?.profilePicture;
    let userToken = storedToken;

    if (userToken && typeof userToken === 'string' && userToken.split('.').length === 3) {
      try {
        const base64Url = userToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);

        if (decodedToken.id) userId = decodedToken.id;
        if (decodedToken.email) userEmail = decodedToken.email;
        if (!userName && decodedToken.name) userName = decodedToken.name;

      } catch (e) {
        console.error("Auth - Error decoding token:", e);
      }
    }

    if (userId && userToken) {
      return {
        id: userId,
        name: userName,
        email: userEmail,
        token: userToken,
        profilePicture: userProfilePicture,
      };
    } else {
      return null;
    }
  });

  useEffect(() => {
    if (user && user.token) {
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', user.token);
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  }, [user]);

  const isLoggedIn = !!user;
  // End useAuth logic
 
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [chatUsers, setChatUsers] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [adError, setAdError] = useState(null); // Added adError state
  const [lastMessages, setLastMessages] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const [loadingAd, setLoadingAd] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState(null);

  // State for receiver ID
  const [receiverId, setReceiverId] = useState(null);
  const [adDetails, setAdDetails] = useState(null); // New state for ad details, initialized to null
  const [currentAdId, setCurrentAdId] = useState(initialAdId); // New state for current ad ID
  const [historyStack, setHistoryStack] = useState([{ name: "Home", path: "/homepage" }]); // Initialize with Home

  // Use the simplified socket hook. Connection is managed by Header.
  const { isConnected, onConnect, joinChatRoom, leaveChatRoom, onChatMessage } = useSocket();
 
  // State for other participant's info
  const [otherParticipantInfo, setOtherParticipantInfo] = useState(null);
  const [otherDisplayEmail, setOtherDisplayEmail] = useState(null);
  const [otherProfilePicture, setOtherProfilePicture] = useState(null);
 
  // Placeholder info (replace with real data if available)
  const currentUserInfo = { name: 'Chat User', email: 'user@example.com', phone: '+1 (000) 000-0000', location: 'Location', joinDate: 'Recently', rating: 0, totalAds: 0, avatar: null };
  const currentProductInfo = { name: 'Product', category: 'Category', price: 'Price on request', location: 'Location' };
 
  // Fetch chat users
  useEffect(() => {
    console.log('DEBUG: user object:', user);
    console.log('DEBUG: user.id:', user?.id);
    console.log('DEBUG: user.token:', user?.token);
    console.log('DEBUG: sessionStorage token:', sessionStorage.getItem('token'));
    if (!user?.id) {
      console.log('DEBUG: user.id is missing, skipping chat user fetch.');
      setLoadingInbox(false); // Stop loading if no user ID
      return;
    }
    setLoadingInbox(true);
    console.log('Fetching chat users...', { userId: user.id, token: sessionStorage.getItem('token') ? 'present' : 'missing' });
    getChatUsers(user.id, sessionStorage.getItem('token'))
      .then(res => {
        console.log('DEBUG: getChatUsers raw response:', res);
        console.log('DEBUG: getChatUsers response data:', res.data);
        // Assuming res.data.chatUsers is an array of user objects
        const formattedChatUsers = (res.data.chatUsers || []).map(userObj => ({
          id: userObj._id, // Renamed adId to id as it's a user ID
          email: userObj.email,
          profilePicture: userObj.profilePicture,
          displayName: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.email,
        }));
        setChatUsers(formattedChatUsers);
      })
      .catch(error => {
        console.error('Error fetching chat users:', error);
        setChatUsers([]);
      })
      .finally(() => setLoadingInbox(false));
  }, [user]);

  // Fetch last message for each chat user
  useEffect(() => {
    if (!chatUsers.length || !user?.token) return;
    Promise.all(chatUsers.map(async chatUser => {
      try {
        const res = await getChatMessagesByUserId(chatUser.id, user.token);
        const msgs = res.data?.chatMessages || [];
        return { adId: chatUser.id, lastMsg: msgs.at(-1) || null };
      } catch { return { adId: chatUser.id, lastMsg: null }; }
    })).then(results => {
      const obj = {};
      results.forEach(({ adId, lastMsg }) => { obj[adId] = lastMsg; });
      setLastMessages(obj);
    });
  }, [chatUsers, user]);
 
  // Effect to set receiverId when paramUserId or chatUsers change
  useEffect(() => {
    if (!paramUserId) return;
    if (chatUsers.length > 0) {
      const activeChatUser = chatUsers.find(chatUser => chatUser.id === paramUserId);
      if (activeChatUser) {
        setReceiverId(activeChatUser.id);
        return;
      }
    }
    // Fallback to URL seller id directly if not found in chatUsers yet
    setReceiverId(paramUserId);
  }, [paramUserId, chatUsers]);
 
  // Fetch ad details based on currentAdId
  useEffect(() => {
    const fetchAdDetails = async () => {
      setLoadingAd(true);
      setAdError(null);
      if (!currentAdId) {
        setAdDetails(null);
        setLoadingAd(false);
        return;
      }
      try {
        const res = await getAllActiveAds();
        if (res && res.data && Array.isArray(res.data.postAds)) {
          const foundAd = res.data.postAds.find(item => (item.id || item._id) === currentAdId);
          setAdDetails(foundAd || null);
          console.log("DEBUG: Ad Details fetched:", foundAd); // Debug log to inspect adDetails

          if (foundAd) {
            let newHistoryStack = [{ name: "Home", path: "/homepage" }];

            if (location.state && location.state.from) {
              const { from, categoryName, categoryPath } = location.state;
              if (from === "homepage" || from === "category") {
                newHistoryStack.push({ name: categoryName || "Category", path: categoryPath });
              }
            } else if (foundAd.category?.name && (foundAd.category?.id || foundAd.category?._id)) {
              newHistoryStack.push({
                name: "Category",
                path: `/ads/${foundAd.category.id || foundAd.category._id}`
              });
            }
            newHistoryStack.push({ name: foundAd.title, path: `/ad/${foundAd._id || foundAd.id}` });

            setHistoryStack(newHistoryStack);
          }

        } else {
          setAdDetails(null);
          setAdError("Could not fetch ads");
        }
      } catch (error) {
        setAdDetails(null);
        setAdError("Error fetching ad");
        console.error('Error fetching ad details:', error);
      }
      setLoadingAd(false);
    };
    fetchAdDetails();
  }, [currentAdId, location.state]);
 
 
  // Filter chat users
  const filteredMessages = chatUsers.filter(u =>
    activeFilter === 'unread' ? !u.isRead :
    activeFilter === 'important' ? u.isImportant : true
  );
  // Sort by latest message timestamp (desc)
  const sortedFilteredMessages = [...filteredMessages].sort((a, b) => {
    const taRaw = lastMessages[a.id]?.timestamp || lastMessages[a.id]?.createdAt;
    const tbRaw = lastMessages[b.id]?.timestamp || lastMessages[b.id]?.createdAt;
    const ta = taRaw ? new Date(taRaw).getTime() : 0;
    const tb = tbRaw ? new Date(tbRaw).getTime() : 0;
    return tb - ta;
  });
 
  // Function to fetch chat messages from API
  const fetchChatMessages = async (userId, token) => {
    console.log('Fetching chat messages with userId:', userId);
    
    if (!token || !user?.id) {
      console.error('Cannot fetch messages: No token or user ID available');
      return null;
    }
    
    try {
      setLoadingChat(true);
      const res = await getChatMessagesByUserId(userId, token);
      console.log('API messages received:', res.data);
      
      if (!res.data || !res.data.chatMessages) {
        console.error('Invalid response format from getChatMessagesByUserId:', res);
        setLoadingChat(false);
        return null;
      }
      
      // Sort messages by timestamp to ensure oldest messages are at the top
      const sortedMessages = (res.data.chatMessages || []).sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt).getTime();
        const timeB = new Date(b.timestamp || b.createdAt).getTime();
        return timeA - timeB; // Ascending order - oldest first
      });
      
      // Ensure we have all message data properly formatted
      const normalizedMessages = sortedMessages.map(msg => ({
        ...msg,
        _id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
        sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender },
        receiver: typeof msg.receiver === 'object' ? msg.receiver : { _id: msg.receiver },
        ad: typeof msg.ad === 'object' ? msg.ad : { _id: msg.ad || msg.adId },
        message: msg.message || msg.content,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString()
      }));
      
      console.log('Normalized messages:', normalizedMessages);
      
      // Check if we have both sent and received messages
      const sentMessages = normalizedMessages.filter(msg => 
        msg.sender?._id === user?.id || msg.sender?.id === user?.id);
      const receivedMessages = normalizedMessages.filter(msg => 
        msg.receiver?._id === user?.id || msg.receiver?.id === user?.id);
      
      console.log(`Found ${sentMessages.length} sent messages and ${receivedMessages.length} received messages`);
      
      // Set all messages
      setMessages(normalizedMessages);
      
      // Extract adId from messages if not provided
      let chatAdId = null;
      if (normalizedMessages.length > 0) {
        chatAdId = normalizedMessages[0].ad?._id || normalizedMessages[0].ad?.id || normalizedMessages[0].adId;
      }
      
      setLoadingChat(false);
      return { messages: normalizedMessages, chatAdId };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setLoadingChat(false);
      return null;
    }
  };
  
  // Function to fetch and listen for chat messages
  const fetchAndListenForChatMessages = async (userId, token, adId) => {
    console.log('Fetching and listening for chat messages with userId:', userId);
    
    if (!token || !user?.id) {
      console.error('Cannot fetch messages: No token or user ID available');
      setLoadingChat(false);
      return null;
    }
    
    try {
      // First, fetch messages from API
      const result = await fetchChatMessages(userId, token);
      
      if (!result) {
        console.error('Failed to fetch chat messages');
        return null;
      }
      
      const { messages, chatAdId: extractedAdId } = result;
      
      // Use provided adId or extracted one
      const finalAdId = adId || extractedAdId;
      if (finalAdId) {
        setCurrentAdId(finalAdId);
        // The useSocket hook will handle joining the room
      }
      
      return finalAdId;
    } catch (error) {
      console.error('Error in fetchAndListenForChatMessages:', error);
      return null;
    }
  };
  
  // Set up socket message listener
  const setupMessageListener = (userId) => {
    console.log(`Setting up message listener for userId: ${userId} and adId: ${currentAdId}`);

    // Then, add a new listener
    const offChatMessage = onChatMessage((newMessage) => {
      console.log('Received new chat message via socket:', newMessage);

      // The new onChatMessage implementation in socketService already filters by adId.
      // We just need to check if the message is relevant to the current conversation partners.
      const senderId = newMessage.sender?._id || newMessage.sender;
      const isFromCurrentChatPartner = senderId === userId;
      if (!isFromCurrentChatPartner) return;
      
      // Normalize message format
      const normalized = {
        ...newMessage,
        _id: newMessage._id || newMessage.id || `temp-${Date.now()}`,
        sender: typeof newMessage.sender === 'object' 
          ? newMessage.sender 
          : { _id: newMessage.sender },
        receiver: typeof newMessage.receiver === 'object'
          ? newMessage.receiver
          : { _id: newMessage.receiver },
        ad: typeof newMessage.ad === 'object'
          ? newMessage.ad
          : { _id: newMessage.ad || newMessage.adId || currentAdId }, // Fallback to currentAdId if needed
        message: newMessage.message || newMessage.content,
        timestamp: newMessage.timestamp || newMessage.createdAt || new Date().toISOString()
      };
      
      console.log('Processing normalized message:', normalized);
      
      // Add to messages if not already present
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => 
          msg._id === normalized._id || 
          (msg.message === normalized.message && 
           msg.sender?._id === normalized.sender?._id &&
           msg.receiver?._id === normalized.receiver?._id &&
           Math.abs(new Date(msg.timestamp) - new Date(normalized.timestamp)) < 1000)
        );
        
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        
        console.log('Adding new message to chat');
        // Add new message and sort by timestamp
        return [...prev, normalized].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      
      // Update last message for this chat
      setLastMessages(prev => ({ ...prev, [userId]: normalized }));
    }, currentAdId); // Pass currentAdId to filter messages for this chat room
    return offChatMessage;
  }

  // Separate function to fetch participant details
  const fetchParticipantDetails = async () => {
    if (!paramUserId || !user?.token) return;
    
    try {
      const res = await getChatMessagesByUserId(paramUserId, user.token);
      if (res?.data?.chatMessages && res.data.chatMessages.length > 0) {
        const firstMessage = res.data.chatMessages[0];
        const otherId = firstMessage.sender._id === user.id ? firstMessage.receiver._id : firstMessage.sender._id;
        if (otherId) {
          const participantRes = await getUserDetails(user.token, otherId);
          console.log('DEBUG: other participant details:', participantRes.data);
          setOtherParticipantInfo(participantRes.data.data);
          // Update currentUserInfo for display purposes
          currentUserInfo.name = participantRes.data.data.firstName || 'Unknown User';
          currentUserInfo.email = participantRes.data.data.email || 'N/A';
          currentUserInfo.phone = participantRes.data.data.mobileNumber || 'Not provided';
          currentUserInfo.location = `${participantRes.data.data.city?.name || ''}, ${participantRes.data.data.state?.name || ''}`.trim().replace(/^, |^ /, '') || 'N/A';
          currentUserInfo.joinDate = participantRes.data.data.createdAt ? new Date(participantRes.data.data.createdAt).toLocaleDateString() : 'N/A';
          currentUserInfo.avatar = participantRes.data.data.profilePicture || null;
        }
      }
    } catch (error) {
      console.error('Error fetching participant details:', error);
    }
  };

  // Fetch messages for selected ad - using socket for real-time updates
  useEffect(() => {
    // Only fetch when a specific chat is selected
    if (!paramUserId || !user?.token) {
      setLoadingChat(false);
      return;
    }
    // Use the combined function to fetch and listen for messages
    fetchAndListenForChatMessages(paramUserId, user.token, currentAdId)
      .then((adId) => {
        if (adId) {
          console.log(`Successfully connected to chat room for ad: ${adId}`);
        }
      });
      
    // Fetch participant details separately
    fetchParticipantDetails();
  }, [paramUserId, user?.token]);
  
  // Load initial messages and ensure socket connection
  useEffect(() => {
    if (paramUserId && user?.token) {
      fetchAndListenForChatMessages(paramUserId, user.token, currentAdId);
    }
    
    // Make sure we're connected to the socket and joined to the chat room
    if (user?.id && currentAdId) {
      console.log(`Joining chat room on mount: ${currentAdId}`);
      if (isConnected()) joinChatRoom(currentAdId);
    }
    
    return () => {
      setLoadingChat(false);
      // Don't leave the chat room when unmounting to keep receiving messages
    };
  }, [paramUserId, user, currentAdId, joinChatRoom]);
 
  // Derive and show seller email in header when entering from product page or when messages/users load
  useEffect(() => {
    let displayName = null;
    let profilePicture = null;
    setOtherProfilePicture(null); // Reset on change
    
    // 1) Prioritize name from navigation state (most direct)
    if (location.state?.sellerName) {
      displayName = location.state.sellerName;
      profilePicture = location.state?.sellerProfilePicture || null;
    } else if (location.state?.sellerEmail) {
      displayName = location.state.sellerEmail; // Fallback to email if only that is passed
    }
 
    // 2) Fallback to chatUsers list
    const match = chatUsers.find(u => u.id === paramUserId);
    if (!displayName && match) {
      displayName = match.displayName;
      profilePicture = match.profilePicture;
    }

    // 3) If this is a new chat (user not in chatUsers list), add them optimistically
    if (paramUserId && displayName && !match) {
      const newChatUser = { id: paramUserId, displayName, profilePicture, email: location.state?.sellerEmail || '' };
      setChatUsers(prev => [newChatUser, ...prev.filter(u => u.id !== paramUserId)]);
    }
 
    setOtherDisplayEmail(displayName || null);
    setOtherProfilePicture(profilePicture || null);
  }, [chatUsers, paramUserId, messages, user, location.state]);

  // Fallback: if we still don't have the seller email, fetch it directly by seller (param) userId
  useEffect(() => {
    if (!paramUserId || !user?.token) return;
    if (otherDisplayEmail) return; // already resolved from other sources

    getUserDetails(user.token, paramUserId)
      .then((res) => {
        const data = res?.data?.data;
        const email = data?.email;
        if (email) {
          setOtherDisplayEmail(email);
          setOtherProfilePicture(data?.profilePicture || null);
          setOtherParticipantInfo((prev) => prev || data);
          // Ensure the desktop inbox (left side) shows this seller even if not part of chat list yet
          setChatUsers((prev) => {
            if (prev.some((u) => u.id === paramUserId)) return prev;
            return [
              ...prev,
              {
                id: paramUserId,
                email,
                profilePicture: data?.profilePicture || null,
                displayName: email,
              },
            ];
          });
          // Allow showing the list immediately if it was waiting
          setLoadingInbox(false);
        }
      })
      .catch((err) => {
        console.error('Fallback fetch of seller user details failed:', err);
      });
  }, [paramUserId, user?.token, otherDisplayEmail]);

  // Scroll to bottom on new message
  useEffect(() => {
    // Only scroll if the container exists
    if (chatMessagesEndRef.current) {
      // Use a more controlled approach to scroll the chat container only
      const chatContainer = document.querySelector('.relative.z-10.h-full.overflow-y-auto.p-3');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);
 
  // Join chat room and listen for messages
  useEffect(() => {
    if (!(user?.id && currentAdId)) return;

    if (isConnected()) {
      joinChatRoom(currentAdId);
    }
 
    const offConnect = onConnect(() => {
      if (currentAdId) joinChatRoom(currentAdId);
    });
 
    // Use the more robust message listener setup
    const offMsg = setupMessageListener(paramUserId);
 
    return () => {
      if (typeof offMsg === 'function') offMsg();
      if (typeof offConnect === 'function') offConnect();
    };
  }, [user?.id, currentAdId, isConnected, joinChatRoom, onConnect, onChatMessage, paramUserId]);
  
  const [socketReady, setSocketReady] = useState(socketService.isSocketConnected());
  useEffect(() => {
    const handleConnect = () => setSocketReady(true);
    const handleDisconnect = () => setSocketReady(false);
    socketService.getSocket()?.on('connect', handleConnect);
    socketService.getSocket()?.on('disconnect', handleDisconnect);
    // Initial debug
    console.log('ChatPage: useEffect - initial socketReady:', socketService.isSocketConnected());
    return () => {
      socketService.getSocket()?.off('connect', handleConnect);
      socketService.getSocket()?.off('disconnect', handleDisconnect);
    };
  }, []);
  useEffect(() => { console.log('socketReady changed:', socketReady); }, [socketReady]);
 
  // Auto-connect socket if not connected when ChatPage has user and token
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const socket = socketService.getSocket();
    if (user?.id && token && (!socket || !socket.connected)) {
      try {
        console.log('[ChatPage] Socket not connected, attempting connect...');
        socketService.connect(user.id, token);
      } catch (e) {
        console.warn('[ChatPage] Failed to initiate socket connect:', e);
      }
    }
  }, [user?.id]);
 
  // Send message using socket for instant delivery
  const handleSendMessage = async () => {
    // Prevent sending a message to yourself
    if (user?.id && (receiverId === user.id || paramUserId === user.id)) {
      const err = "Cannot send message to yourself.";
      console.warn('Send blocked:', err);
      alert(JSON.stringify(err, null, 2));
      return;
    }
    if (!message.trim() || !user?.id || !paramUserId || !receiverId || !currentAdId) return; // Ensure currentAdId is present
    
    // Create message object
    // Optimistically add message to UI
    const optimisticMessage = {
      _id: `temp-${Date.now()}`, // Temporary ID until server confirms
      message: message.trim(),
      timestamp: new Date().toISOString(),
      sender: {
        _id: user.id,
        id: user.id, // Add 'id' for consistency with rendering logic
        profilePicture: user.profilePicture || null
      },
      receiver: {
        _id: receiverId
      },
      ad: {
        _id: currentAdId
      },
      pending: true // Mark as pending until confirmed
    };

    // This is the data that will be sent to the backend
    const messageDataForBackend = {
      senderId: user.id,
      receiver: receiverId,
      adId: currentAdId,
      message: message.trim(),
    };
    
    // Add message to UI and sort by timestamp
    setMessages(prev => {
      const updated = [...prev, optimisticMessage].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt).getTime();
        const timeB = new Date(b.timestamp || b.createdAt).getTime();
        return timeA - timeB; // Ascending order - oldest first
      });
      return updated;
    });
    
    // Update last message for this chat
    setLastMessages(prev => ({ ...prev, [paramUserId]: optimisticMessage }));
    
    setMessage(''); // Clear input field immediately
    
    try {
      console.log("SocketReady state at send:", socketReady, { userId: user?.id });
      if (socketReady) {
        // Ensure we're in the room
        try { socketService.joinChatRoom(currentAdId); } catch {}
        // Send via socket using the 'emitChatMessage' method from the service
        console.log('Emitting chat message via socket service:', messageDataForBackend);
        socketService.emitChatMessage({
          message: message.trim(),
          adId: currentAdId,
          receiverId
        });

      } else {
        // Attempt to connect and send once connected
        const token = sessionStorage.getItem('token');
        const sock = socketService.getSocket();
        if (!sock || !sock.connected) {
          console.log('[ChatPage] Attempting socket connect before send...');
          socketService.connect(user.id, token);
          const onceConnect = () => {
            try { socketService.joinChatRoom(currentAdId); } catch {}
            console.log('Emitting chat message via socket service (post-connect):', messageDataForBackend);
            socketService.emitChatMessage({
              message: message.trim(),
              adId: currentAdId,
              receiverId
            });
            socketService.getSocket()?.off('connect', onceConnect);
          };
          socketService.getSocket()?.on('connect', onceConnect);
        }
        console.warn('Socket not connected, falling back to API only');
      }
      
      // Also send via API as backup and to ensure persistence
      console.log('Sending message via API:', {
        receiverId,
        adId: currentAdId,
        message: message.trim()
      });
      const res = await sendChatMessage(receiverId, currentAdId, message.trim(), user.token);
      console.log('API message response:', res);
      
      if (res && res.data && res.data.chatMessage) {
        const sent = res.data.chatMessage;
        const normalized = {
          ...sent,
          sender: {
            ...(sent.sender || {}),
            _id: sent?.sender?._id || sent?.sender?.id || user.id,
            profilePicture: user?.profilePicture || sent?.sender?.profilePicture || null
          }
        };
        
        // Replace the optimistic message with the confirmed one
        setMessages(prev => prev.map(msg => 
          msg._id === optimisticMessage._id ? normalized : msg
        ));
        
        setLastMessages(prev => ({ ...prev, [paramUserId]: normalized }));
      } else {
        console.error('Failed to send message: Unexpected API response', res);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark the optimistic message as failed
      setMessages(prev => prev.map(msg => 
        msg._id === optimisticMessage._id ? {...msg, failed: true, pending: false} : msg
      ));
    }
  };
 
  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !user?.token) return;

    // Optimistically remove the message from the UI for a responsive feel
    setMessages(prev => prev.filter(msg => msg._id !== messageId));

    try {
      const res = await deleteMessage(messageId, user.token);
      // Check for a successful HTTP status code (e.g., 200 OK, 204 No Content)
      if (!res || res.status < 200 || res.status >= 300) {
        // If deletion fails on the server, log it.
        // For a more robust UI, you could add the message back to the list here.
        console.error('Failed to delete message on server:', res?.data?.message || `Server responded with status ${res?.status}`);
        // To revert: You would need to temporarily store the deleted message and add it back on failure.
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      // Handle API call error, e.g., show a notification and add the message back.
    }
  };

  const handleDeleteChat = async (chatUserId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!chatUserId || !user?.token) return;

    if (window.confirm('Are you sure you want to delete this entire chat? This action cannot be undone.')) {
      setDeletingChatId(chatUserId);
      try {
        // Assuming chatUserId is the other participant's ID, which acts as the chatId for this context.
        const res = await deleteChat(chatUserId, user.token);
        if (res && (res.status === 200 || res.status === 204)) {
          // Optimistically remove from UI
          setChatUsers(prev => prev.filter(u => u.id !== chatUserId));
          // If the deleted chat was the active one, navigate away
          if (paramUserId === chatUserId) {
            navigate('/inbox');
          }
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      } finally {
        setDeletingChatId(null);
      }
    }
  };


  // UI
  if (!isLoggedIn) {
    return (
      <div className="font-sans min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <main className="flex-1 flex items-center justify-center p-2 md:p-4 lg:p-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login to View Chat</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access your conversations.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Login Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 min-h-screen p-2 md:p-4 lg:p-6">
        <div className="mb-2 text-gray-500 text-sm text-left">
          <div className="flex flex-wrap gap-1 sm:gap-2 ml-2 sm:ml-9">
            {historyStack.map((item, index) => (
              <span key={item.name} className="flex items-center">
                {index > 0 && <span className="mx-1 sm:mx-2">&gt;</span>}
                <span
                  className={`${index === historyStack.length - 1 ? "text-grey-400 cursor-pointer hover:text-blue-500" : "text-gray-600 cursor-pointer hover:text-blue-500"}`}
                  onClick={() => item.path && navigate(item.path)}
                >
                  {item.name}
                </span>
              </span>
            ))}
            &gt; <span className="text-orange-500 font-semibold">Inbox</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 h-[calc(100vh-120px)] bg-white rounded-lg overflow-hidden shadow-lg">
          {/* Chat List */}
          <div className={`${paramUserId ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white flex-col flex-shrink-0 h-full`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100">
              <h2 className="text-xl font-bold text-pink-600 m-0">Inbox</h2>
              <div className="flex gap-3 cursor-pointer text-gray-600 text-lg">
                <span>ℹ</span><span>⋮</span><span>✖</span>
              </div>
            </div>
            <div className="p-3 bg-white">
              <div className="flex gap-2 text-xs">
                {['all', 'unread', 'important'].map(filter => (
                  <span
                    key={filter}
                    className={`flex-1 p-2 text-center cursor-pointer font-semibold rounded-lg ${activeFilter === filter ? 'bg-blue-500 text-white' : 'bg-white text-black border border-gray-300'}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loadingInbox ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-lg p-3 bg-gray-100">
                      <div className="flex items-start gap-2">
                        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">
                      {activeFilter === 'unread' && 'No unread messages'}
                      {activeFilter === 'important' && 'No important messages'}
                      {activeFilter === 'all' && 'No conversations yet'}
                    </h3>
                    <p className="text-sm">
                      {activeFilter === 'unread' && 'All your messages have been read.'}
                      {activeFilter === 'important' && 'Mark messages as important to see them here.'}
                      {activeFilter === 'all' && 'When someone messages you about a product, it will appear here.'}
                    </p>
                  </div>
                </div>
              ) : (
                sortedFilteredMessages.map(chatUser => {
                  const lastMsg = lastMessages[chatUser.id];
                  return (
                    <div
                      key={chatUser.id}
                      className={`rounded-lg p-3 cursor-pointer transition-colors ${chatUser.id === paramUserId ? 'bg-blue-50 border border-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => navigate(`/chat/${chatUser.id}`)}
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={chatUser.profilePicture || UserProfile}
                          alt={chatUser.displayName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-bold ${chatUser.id === paramUserId ? 'text-blue-700' : 'text-black'}`}>{chatUser.displayName}</span>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <button onClick={(e) => handleDeleteChat(chatUser.id, e)} disabled={deletingChatId === chatUser.id} className="hover:text-red-500 disabled:opacity-50" title="Delete Chat">
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-black text-sm mb-1">{lastMsg?.message || 'No messages yet.'}</p>
                          <p className="text-gray-500 text-xs mt-1">{(lastMsg?.timestamp || lastMsg?.createdAt) ? new Date(lastMsg.timestamp || lastMsg.createdAt).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* Inbox Interface */}
          <div className={`${paramUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white h-full`}>
            {paramUserId ? (
              <>
                <div className="bg-blue-600 p-3 flex justify-between items-center text-white flex-shrink-0 relative z-20">
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/inbox')} className="text-white hover:text-gray-200 mr-2">←</button>
                    <img
                      src={otherProfilePicture || UserProfile}
                      alt={otherDisplayEmail || 'Chat User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <span className="font-semibold text-sm">{otherDisplayEmail || 'Chat User'}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="cursor-pointer hover:text-gray-300" onClick={() => setShowUserInfo(true)} title="User Information">ℹ</button>
                    <span className="cursor-pointer hover:text-gray-300">⋮</span>
                    <button className="cursor-pointer hover:text-gray-300" onClick={() => navigate('/inbox')} title="Close Chat">✖</button>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-gray-50">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url(${chatBG})`,
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    opacity: '0.1'
                  }} />
                  <div className="relative z-10 h-full overflow-y-auto p-3 pb-4">
                    <div className="min-h-full flex flex-col">
                      {loadingChat ? (
                        <div className="space-y-3">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`flex mb-3 items-end gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                              {i % 2 !== 0 && (
                                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                              )}
                              <Skeleton className={`max-w-[70%] p-3 rounded-2xl h-12 ${i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-200'}`} />
                              {i % 2 === 0 && (
                                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                            <p className="text-sm mb-4">Send a message to begin chatting about this product.</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
                              <p className="text-xs text-blue-700">This is a real-time chat. Messages will appear here when you or the other person sends them.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Group messages by date */}
                          {messages.reduce((acc, msg, index) => {
                            const msgDate = new Date(msg.timestamp);
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(today.getDate() - 1);

                            let dateLabel;
                            if (msgDate.toDateString() === today.toDateString()) {
                              dateLabel = 'Today';
                            } else if (msgDate.toDateString() === yesterday.toDateString()) {
                              dateLabel = 'Yesterday';
                            } else {
                              dateLabel = msgDate.toLocaleDateString();
                            }

                            // Determine the last date label that was explicitly added as a date separator
                            const lastDateSeparator = acc.findLast(item => item.type === 'date');
                            const lastRenderedDateLabel = lastDateSeparator ? lastDateSeparator.label : null;

                            // Add date separator if it's a new day or the first message
                            if (index === 0 || dateLabel !== lastRenderedDateLabel) {
                              acc.push({ type: 'date', label: dateLabel, key: `date-${dateLabel}` });
                            }
                            acc.push({ type: 'message', content: msg, key: msg._id || msg.id || `${msg.timestamp}-${index}` });
                            return acc;
                          }, []).map((item) => (
                            item.type === 'date' ? (
                              <div key={item.key} className="text-center text-gray-500 text-xs my-3">{item.label}</div>
                            ) : (
                              <div key={item.key} className={`flex mb-3 items-end gap-2 ${(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) ? 'justify-end' : 'justify-start'}`}>
                                {!(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) && (
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {item.content.sender.profilePicture ? (
                                      <img src={item.content.sender.profilePicture} alt="Other User" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-gray-600 text-sm">👤</span>
                                    )}
                                  </div>
                                )}
                                <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm group relative flex flex-col ${(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) ? 'bg-blue-100 rounded-br-sm text-gray-800' : 'bg-gray-200 rounded-bl-sm text-gray-800'}`}>
                                  <p className="mb-1">{item.content.message}</p>
                                  <div className="flex items-center justify-end gap-1.5 self-end">
                                    <span className="text-xs text-gray-500">{new Date(item.content.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) && (
                                      <FaCheckDouble size={12} className={`${(item.content.readBy && item.content.readBy.includes(paramUserId)) || item.content.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    )}
                                  </div>
                                  {(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) && (
                                    <button onClick={() => handleDeleteMessage(item.content._id)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete message">
                                      <FaTrash size={10} />
                                    </button>
                                  )}
                                </div>
                                {(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) && (
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {item.content.sender.profilePicture ? (
                                      <img src={item.content.sender.profilePicture} alt="You" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-white text-sm">👤</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                          <div ref={chatMessagesEndRef} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-200 p-3 flex items-center gap-3 flex-shrink-0 relative z-20">
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="Attach file">📎</button>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || !socketReady}
                    className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    title="Send message"
                  >➤</button>
                  {!socketReady && (
                    <span className="text-sm text-gray-500 ml-2">Connecting...</span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center p-4">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to LocalMart Chat</h2>
                  <p className="text-gray-600 mb-2">Connect with buyers and sellers instantly</p>
                  <p className="text-sm text-gray-500 mb-4">Start a conversation from a product page to begin chatting.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
                    <h3 className="font-semibold text-blue-800 mb-2">How to start chatting:</h3>
                    <ol className="text-sm text-blue-700 text-left space-y-1">
                      <li>1. Browse products on LocalMart</li>
                      <li>2. Click "Chat with Seller" on any product</li>
                      <li>3. Your conversation will appear here</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* User Info Modal */}
          {showUserInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  <button onClick={() => setShowUserInfo(false)} className="text-gray-500 hover:text-gray-700 text-xl">✖</button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      {currentUserInfo.avatar ? (
                        <img src={currentUserInfo.avatar} alt="User" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl text-gray-600">👤</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-sm font-medium text-gray-600">Name</label><p className="text-gray-800">{otherParticipantInfo?.firstName || 'N/A'}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Email</label><p className="text-gray-800">{otherParticipantInfo?.email || 'N/A'}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Phone</label><p className="text-gray-800">{otherParticipantInfo?.mobileNumber || 'N/A'}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Location</label><p className="text-gray-800">{`${otherParticipantInfo?.city?.name || ''}, ${otherParticipantInfo?.state?.name || ''}`.trim().replace(/^, |^ /, '') || 'N/A'}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Member Since</label><p className="text-gray-800">{otherParticipantInfo?.createdAt ? new Date(otherParticipantInfo.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                    <div className="flex justify-between">
                      <div><label className="text-sm font-medium text-gray-600">Rating</label><p className="text-gray-800">{currentUserInfo.rating > 0 ? `⭐ ${currentUserInfo.rating}/5` : 'No ratings yet'}</p></div>
                      <div><label className="text-sm font-medium text-gray-600">Total Ads</label><p className="text-gray-800">{currentUserInfo.totalAds}</p></div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">About this conversation</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Product:</span> {adDetails?.title || 'N/A'}</p>
                      <p><span className="font-medium">Category:</span> {adDetails?.category?.name || currentProductInfo.category}</p>
                      <p><span className="font-medium">Price:</span> {adDetails?.price ? `₹${adDetails.price}` : currentProductInfo.price}</p>
                      <p><span className="font-medium">Location:</span> {adDetails?.location && (adDetails.location.city || adDetails.location.address) || currentProductInfo.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={() => {}}>View Profile</button>
                    <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600" onClick={() => {
                      if (currentUserInfo.phone && currentUserInfo.phone !== 'Not provided') window.location.href = `tel:${currentUserInfo.phone}`;
                      else alert('Phone number not available');
                    }}>Call</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ChatPage;