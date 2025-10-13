import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import { getChatUsers, getChatMessagesByUserId,  getUserDetails , getAllActiveAds, sendChatMessage } from '../../Services/api';
import { useSocket } from '../../hooks/useSocket.js';
import socketService from '../../hooks/socketService';
 
const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: paramUserId } = useParams(); // =================== (Seller's userId from route)===================

  // Get adId from location state if available
  const initialAdId = location.state?.adId || null;
  // =================== (Get adId from location state if available)===================
 
  // =================== (useAuth logic moved here)===================
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
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', user?.token || null);
  }, [user]);

  const isLoggedIn = !!user;
  // =================== (End useAuth logic)===================
 
  // =================== (State)===================
  const [activeFilter, setActiveFilter] = useState('all');
  const [chatUsers, setChatUsers] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [adError, setAdError] = useState(null); // =================== (Added adError state)===================
  const [lastMessages, setLastMessages] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const [loadingAd, setLoadingAd] = useState(true);
  const [chatError, setChatError] = useState(null); // =================== (CHAT ERROR STATE)===================
 
  // =================== (State for receiver ID)===================
  const [receiverId, setReceiverId] = useState(null);
  const [adDetails, setAdDetails] = useState(null); // =================== (New state for ad details, initialized to null)===================
  const [currentAdId, setCurrentAdId] = useState(initialAdId); // =================== (New state for current ad ID)===================
  const [historyStack, setHistoryStack] = useState([{ name: "Home", path: "/homepage" }]); // =================== (Initialize with Home)===================
 
  const { connectSocket, disconnectSocket, isConnected, onConnect, joinChatRoom, leaveChatRoom, emitChatMessage, onChatMessage, subscribeToNotifications, emitFetchChatHistory } = useSocket(!!user?.id, user?.id); // =================== (Pass login status and user ID)===================
 
  // =================== (State for other participant's info)===================
  const [otherParticipantInfo, setOtherParticipantInfo] = useState(null);
  const [otherDisplayEmail, setOtherDisplayEmail] = useState(null);
 
  // =================== (Dummy info (replace with real data if available))===================
  const currentUserInfo = { name: 'Chat User', email: 'user@example.com', phone: '+1 (000) 000-0000', location: 'Location', joinDate: 'Recently', rating: 0, totalAds: 0, avatar: null };
  const currentProductInfo = { name: 'Product', category: 'Category', price: 'Price on request', location: 'Location' };
 
  // =================== (Fetch chat users)===================
  useEffect(() => {
    console.log('DEBUG: user object:', user);
    console.log('DEBUG: user.id:', user?.id);
    console.log('DEBUG: user.token:', user?.token);
    console.log('DEBUG: sessionStorage token:', sessionStorage.getItem('token'));
    if (!user?.id) {
      console.log('DEBUG: user.id is missing, skipping chat user fetch.');
      setLoadingInbox(false); // =================== (Stop loading if no user ID)===================
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
          id: userObj._id, // =================== (Renamed adId to id as it's a user ID)===================
          email: userObj.email,
          profilePicture: userObj.profilePicture,
          displayName: userObj.email, // =================== (Using email for display, can be enhanced with actual name if available)===================
        }));
        setChatUsers(formattedChatUsers);
      })
      .catch(error => {
        console.error('Error fetching chat users:', error);
        setChatUsers([]);
      })
      .finally(() => setLoadingInbox(false));
  }, [user]);

  // =================== (Fetch last message for each chat user)===================
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
 
  // =================== (Effect to set receiverId when paramUserId or chatUsers change)===================
  useEffect(() => {
    if (!paramUserId) return;
    if (chatUsers.length > 0) {
      const activeChatUser = chatUsers.find(chatUser => chatUser.id === paramUserId);
      if (activeChatUser) {
        setReceiverId(activeChatUser.id);
        return;
      }
    }
    // =================== (Fallback to URL seller id directly if not found in chatUsers yet)===================
    setReceiverId(paramUserId);
  }, [paramUserId, chatUsers]);
 
  // =================== (Fetch ad details based on currentAdId)===================
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
          console.log("DEBUG: Ad Details fetched:", foundAd); // =================== (Debug log to inspect adDetails)===================

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
 
 
  // =================== (Filter chat users)===================
  const filteredMessages = chatUsers.filter(u =>
    activeFilter === 'unread' ? !u.isRead :
    activeFilter === 'important' ? u.isImportant : true
  );
  // =================== (Sort by latest message timestamp (desc))===================
  const sortedFilteredMessages = [...filteredMessages].sort((a, b) => {
    const taRaw = lastMessages[a.id]?.timestamp || lastMessages[a.id]?.createdAt;
    const tbRaw = lastMessages[b.id]?.timestamp || lastMessages[b.id]?.createdAt;
    const ta = taRaw ? new Date(taRaw).getTime() : 0;
    const tb = tbRaw ? new Date(tbRaw).getTime() : 0;
    return tb - ta;
  });
 
  // =================== (Function to fetch chat messages from API)===================
  const fetchChatMessages = async (userId, token) => {
    console.log('Fetching chat messages with userId:', userId);
    
    if (!user?.id) {
      console.error('Cannot fetch messages: No token or user ID available');
      return null;
    }
    
    try {
      setLoadingChat(true);
      setChatError(null); // =================== (Clear previous errors)===================
      console.log('DEBUG: setLoadingChat(true) at start of fetchChatMessages'); // =================== (DEBUG LOG)===================
      const historyCallback = (history) => {
        console.log('Socket chat history received:', history);
 
        const normalizedMessages = history.map(msg => ({
          ...msg,
          _id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
          sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender },
          receiver: typeof msg.receiver === 'object' ? msg.receiver : { _id: msg.receiver },
          ad: msg.ad && typeof msg.ad === 'object' ? msg.ad : { _id: msg.ad || msg.adId }, // =================== (FIX AD NORMALIZATION)===================
          message: msg.message || msg.content,
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString()
        })).sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB; // Ascending order - oldest first
        });
 
        setMessages(normalizedMessages);
        setLoadingChat(false);
        console.log('DEBUG: setLoadingChat(false) in historyCallback (fetchChatMessages).'); // =================== (DEBUG LOG)===================
 
        let chatAdId = null;
        if (normalizedMessages.length > 0) {
          chatAdId = normalizedMessages[0].ad?._id || normalizedMessages[0].ad?.id || normalizedMessages[0].adId;
        }
        // =================== (No need to return from here as this is a callback for a subscription)===================
      };
 
      const unsubscribeHistory = emitFetchChatHistory(user.id, userId, currentAdId, historyCallback);
 
      return unsubscribeHistory; // =================== (Return the unsubscribe function directly)===================
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setChatError('Failed to load chat messages.'); // =================== (Set error message)===================
      setLoadingChat(false);
      console.log('DEBUG: setLoadingChat(false) in error (fetchChatMessages).'); // =================== (DEBUG LOG)===================
       return null;
     }
   };
 
  // =================== (Function to fetch and listen for chat messages)===================
  const fetchAndListenForChatMessages = (userId, token, adId) => {
    console.log('Fetching and listening for chat messages with userId:', userId);
    
    if (!user?.id) {
      console.error('Cannot fetch messages: No token or user ID available');
      setLoadingChat(false);
      setChatError('User not logged in or token missing.'); // =================== (Set error message)===================
      console.log('DEBUG: setLoadingChat(false) - user not logged in in fetchAndListenForChatMessages'); // =================== (DEBUG LOG)===================
      return null;
    }
    
    try {
      setLoadingChat(true);
      setChatError(null); // =================== (Clear previous errors)===================
      console.log('DEBUG: setLoadingChat(true) at start of fetchAndListenForChatMessages'); // =================== (DEBUG LOG)===================
      // =================== (Fetch messages via socket)===================
      const unsubscribe = emitFetchChatHistory(user.id, userId, adId, (history) => {
        const normalizedMessages = history.map(msg => ({
          ...msg,
          _id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
          sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender },
          receiver: typeof msg.receiver === 'object' ? msg.receiver : { _id: msg.receiver },
          ad: msg.ad && typeof msg.ad === 'object' ? msg.ad : { _id: msg.ad || msg.adId }, // =================== (FIX AD NORMALIZATION)===================
          message: msg.message || msg.content,
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        })).sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB; // Ascending order - oldest first
        });
        setMessages(normalizedMessages);
        setLoadingChat(false);
        console.log('DEBUG: setLoadingChat(false) in historyCallback (fetchAndListenForChatMessages).'); // =================== (DEBUG LOG)===================
 
        let chatAdId = null;
        if (normalizedMessages.length > 0) {
          chatAdId = normalizedMessages[0].ad?._id || normalizedMessages[0].ad?.id || normalizedMessages[0].adId;
        }
        if (chatAdId) {
          setCurrentAdId(chatAdId);
        }
      });
      return unsubscribe; // =================== (Return unsubscribe function)===================
    } catch (error) {
      console.error('Error in fetchAndListenForChatMessages:', error);
      setChatError('Failed to load chat messages.'); // =================== (Set error message)===================
      setLoadingChat(false);
      console.log('DEBUG: setLoadingChat(false) in error (fetchAndListenForChatMessages).'); // =================== (DEBUG LOG)===================
       return null;
     }
   };
 
  // =================== (Set up socket message listener)===================
  const setupMessageListener = useCallback((userId) => { // =================== (MEMOIZE setupMessageListener)===================
    console.log('Setting up message listener for userId:', userId);
    
    // =================== (First, remove any existing listeners to prevent duplicates)===================
    const unsubscribe = onChatMessage((newMessage) => {
      console.log('Received new chat message via socket (setupMessageListener):', newMessage);
 
      const senderId = newMessage.sender?._id || newMessage.sender?.id || newMessage.sender;
      const receiverId = newMessage.receiver?._id || newMessage.receiver?.id || newMessage.receiver;
      const messageAdId = newMessage.ad?._id || newMessage.ad?.id || newMessage.adId || newMessage.ad;
 
      const isRelevantUser = senderId === userId || receiverId === userId ||
                            senderId === user?.id || receiverId === user?.id;
      const isRelevantAd = !currentAdId || messageAdId === currentAdId;
 
      if (!isRelevantUser || !isRelevantAd) {
        console.log('Message not relevant to current chat, skipping');
        return;
      }
 
      const normalized = {
        ...newMessage,
        _id: newMessage._id || newMessage.id || `temp-${Date.now()}`,
        sender: typeof newMessage.sender === 'object' ? newMessage.sender : { _id: newMessage.sender },
        receiver: typeof newMessage.receiver === 'object' ? newMessage.receiver : { _id: newMessage.receiver },
        ad: typeof newMessage.ad === 'object' ? newMessage.ad : { _id: newMessage.ad || newMessage.adId || currentAdId },
        message: newMessage.message || newMessage.content,
        timestamp: newMessage.timestamp || newMessage.createdAt || new Date().toISOString(),
        status: newMessage.status || (senderId === user?.id ? 'sent' : 'received'),
      };
 
      setMessages(prev => {
        const updated = [...prev, normalized].sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB; // Ascending order - oldest first
        });
        console.log('DEBUG: New message processed, total messages:', updated.length); // =================== (DEBUG LOG)===================
        return updated;
      });
 
      if (paramUserId) {
        setLastMessages(prev => ({ ...prev, [paramUserId]: normalized }));
      }
      console.log('ChatPage: New chat message processed and state updated.');
     });
 
    return unsubscribe; // =================== (Return the unsubscribe function)===================
  }, [user?.id, paramUserId, currentAdId, onChatMessage]); // =================== (MEMOIZE setupMessageListener)===================
 
  // =================== (Separate function to fetch participant details)===================
  const fetchParticipantDetails = async () => {
    if (!paramUserId || !user?.token) return;
    
    try {
      const participantRes = await getUserDetails(user.token, paramUserId);
      console.log('DEBUG: other participant details:', participantRes.data);
      const participantData = participantRes.data.data || participantRes.data;
      if (participantData) {
        setOtherParticipantInfo(participantData);
        // =================== (Update currentUserInfo for display purposes)===================
        currentUserInfo.name = participantData.firstName || 'Unknown User';
        currentUserInfo.email = participantData.email || 'N/A';
        currentUserInfo.phone = participantData.mobileNumber || 'Not provided';
        currentUserInfo.location = `${participantData.city?.name || ''}, ${participantData.state?.name || ''}`.trim().replace(/^, |^ /, '') || 'N/A';
        currentUserInfo.joinDate = participantData.createdAt ? new Date(participantData.createdAt).toLocaleDateString() : 'N/A';
        currentUserInfo.avatar = participantData.profilePicture || null;
        setOtherDisplayEmail(participantData.email); // =================== (Set the display email here)===================
      }
    } catch (error) {
      console.error('Error fetching participant details:', error);
    }
  };
 
  const handleConnectAndFetch = useCallback(() => {
    if (isConnected() && user?.id) {
      setLoadingChat(true);
      console.log('DEBUG: setLoadingChat(true) at start of handleConnectAndFetch (socket connected).'); // =================== (DEBUG LOG)===================
      console.log('ChatPage: Socket connected, attempting to fetch chat history.');
      // =================== (LOGGING PARAMS BEFORE EMITTING FETCH CHAT HISTORY)===================
      console.log('DEBUG: Emitting fetchChatHistory with -> currentUserId:', user.id, 'otherUserId:', paramUserId, 'currentAdId:', currentAdId);
      // =================== (ADD TIMEOUT MECHANISM FOR FETCHING CHAT HISTORY)===================
      const timeoutId = setTimeout(() => {
        console.warn('Chat history fetch timed out. Forcing setLoadingChat(false) and setting chatError.');
        setLoadingChat(false);
        setChatError('Failed to load chat history: Timeout.');
        setMessages([]); // =================== (ALSO ENSURE MESSAGES ARE CLEARED IF TIMEOUT OCCURS)===================
      }, 5000); // =================== (5 SECONDS TIMEOUT)===================

      const unsubscribeChatHistory = emitFetchChatHistory(user.id, paramUserId, currentAdId, (history) => {
        clearTimeout(timeoutId); // =================== (CLEAR THE TIMEOUT IF A RESPONSE IS RECEIVED)===================
        console.log('DEBUG: Raw chat history received in handleConnectAndFetch:', history); // =================== (DEBUG LOG)===================
        console.log('Initial chat history received in useEffect:', history);
        const normalizedMessages = history.map(msg => ({
          ...msg,
          _id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
          sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender },
          receiver: typeof msg.receiver === 'object' ? msg.receiver : { _id: msg.receiver },
          ad: typeof msg.ad === 'object' ? msg.ad : { _id: msg.ad || msg.adId },
          message: msg.message || msg.content,
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        })).sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.timestamp || b.createdAt).getTime();
          return timeA - timeB; // Ascending order - oldest first
        });
        console.log('DEBUG: Normalized messages after processing in handleConnectAndFetch:', normalizedMessages); // =================== (DEBUG LOG)===================
        setMessages(normalizedMessages);
        setLoadingChat(false);
        console.log('DEBUG: setLoadingChat(false) in handleConnectAndFetch history callback.'); // =================== (DEBUG LOG)===================

        let chatAdId = null;
        if (normalizedMessages.length > 0) {
          chatAdId = normalizedMessages[0].ad?._id || normalizedMessages[0].ad?.id || normalizedMessages[0].adId;
        }
        if (chatAdId) {
          setCurrentAdId(chatAdId);
        }
      });

      const unsubscribeNewMessages = setupMessageListener(paramUserId);

      fetchParticipantDetails();

      // =================== (Return a cleanup function for these subscriptions)===================
      return () => {
        clearTimeout(timeoutId); // =================== (ENSURE TIMEOUT IS CLEARED ON CLEANUP AS WELL)===================
        unsubscribeChatHistory();
        unsubscribeNewMessages();
      };
    } else {
      setLoadingChat(false); // =================== (Explicitly stop loading if not connected)===================
      console.log('DEBUG: setLoadingChat(false) - socket not connected in handleConnectAndFetch.'); // =================== (DEBUG LOG)===================
      setMessages([]);
      console.log('ChatPage: Socket not connected, clearing messages and waiting.');
      return () => {}; // =================== (Return a no-op cleanup function)===================
    }
  }, [isConnected, user?.id, paramUserId, emitFetchChatHistory, setupMessageListener, fetchParticipantDetails, setLoadingChat, setMessages, setCurrentAdId]);


  // =================== (Fetch messages for selected ad - using socket for real-time updates)===================
  useEffect(() => {
    console.log('DEBUG: user object (for messages):', user);
    console.log('DEBUG: paramAdId (for messages):', paramUserId);
    console.log('DEBUG: user.token (for messages):', user?.token);
    if (!paramUserId || !user?.id) {
       console.log('DEBUG: paramUserId or user.id is missing, skipping chat message fetch.');
       setMessages([]);
       setLoadingChat(false);
       console.log('DEBUG: setLoadingChat(false) - missing params in main useEffect.'); // =================== (DEBUG LOG)===================
       return;
     }
 
    let unsubscribeOnConnectListener = () => {};
 
    // =================== (Attempt to connect and fetch immediately if already connected)===================
    const cleanupHandleConnect = handleConnectAndFetch();
 
    // =================== (Also set up a listener to retry fetching on connect event (for initial connection or reconnects))===================
    unsubscribeOnConnectListener = onConnect(() => {
      console.log('ChatPage: Socket reconnected in ChatPage, attempting to fetch chat history...');
      handleConnectAndFetch(); // =================== (Call the memoized function)===================
    });
 
    return () => {
      if (typeof cleanupHandleConnect === 'function') {
        cleanupHandleConnect();
      }
      unsubscribeOnConnectListener();
      console.log('ChatPage: Cleaning up chat useEffect.'); // =================== (Cleaning up chat useEffect)===================
     };
   }, [paramUserId, user?.id, onConnect, handleConnectAndFetch, emitFetchChatHistory, isConnected, setupMessageListener]);

  // =================== (Join chat room and listen for messages)===================
  useEffect(() => {
    if (!(user?.id && currentAdId)) return;

    const tryJoin = () => {
      if (isConnected()) joinChatRoom(currentAdId);
    };
  
    // =================== (Attempt immediately if connected)===================
    tryJoin();

    const offConnect = onConnect(() => {
      if (currentAdId) joinChatRoom(currentAdId);
    });

    return () => {
      if (typeof onChatMessage === 'function') onChatMessage();
      if (typeof offConnect === 'function') offConnect();
    };
  }, [user?.id, currentAdId, paramUserId, isConnected, joinChatRoom, onConnect, onChatMessage]);

  // =================== (Subscribe to notifications)===================
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToNotifications((notification) => {
      console.log('=================== NEW NOTIFICATION RECEIVED IN CHAT PAGE ===================', notification);
      console.log('New Notification Received:', notification);
      alert(notification.message || 'You have a new notification!');
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.id, subscribeToNotifications]);

  // =================== (Send message)===================
  const handleSendMessage = async () => {
    // =================== (Prevent sending a message to yourself)===================
    if (user?.id && (receiverId === user.id || paramUserId === user.id)) {
      const err = "Cannot send message to yourself.";
      console.warn('Send blocked:', err);
      alert(JSON.stringify(err, null, 2));
      return;
    }
    if (!message.trim() || !user?.id || !paramUserId || !receiverId || !currentAdId) return; // =================== (Ensure currentAdId is present)===================
    
    // =================== (Create message object)===================
    const messageData = {
      senderId: user.id,
      // =================== (Backend might expect senderId from socket context, but good to have)===================
      receiver: receiverId,
      adId: currentAdId,
      message: message.trim(),
    };
    
    // =================== (Optimistically add message to UI)===================
    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`, // =================== (Temporary ID until server confirms)===================
      sender: {
        _id: user.id,
        profilePicture: user?.profilePicture || null
      },
      receiver: {
        _id: receiverId
      },
      ad: {
        _id: currentAdId
      },
      pending: true // =================== (Mark as pending until confirmed)===================
    };
    
    // =================== (Add message to UI and sort by timestamp)===================
    setMessages(prev => {
      const updated = [...prev, optimisticMessage].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt).getTime();
        const timeB = new Date(b.timestamp || b.createdAt).getTime();
        return timeA - timeB; // Ascending order - oldest first
      });
      return updated;
    });
    
    // =================== (Update last message for this chat)===================
    setLastMessages(prev => ({ ...prev, [paramUserId]: optimisticMessage }));
    
    setMessage(''); // =================== (Clear input field immediately)===================
    
    try {
      // =================== (Ensure we're in the chat room before sending)===================
      if (isConnected()) {
        joinChatRoom(currentAdId);

        // =================== (Send via socket using the 'sendMessage' event)===================
        console.log('Emitting chat message via socket service:', messageData);
        socketService.emitChatMessage(messageData);

      } else {
        console.warn('Socket not connected, falling back to API only');
      }
      
      // =================== (Also send via API as backup and to ensure persistence)===================
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
        
        // =================== (Replace the optimistic message with the confirmed one)===================
        setMessages(prev => prev.map(msg => 
          msg._id === optimisticMessage._id ? normalized : msg
        ));
        
        setLastMessages(prev => ({ ...prev, [paramUserId]: normalized }));
      } else {
        console.error('Failed to send message: Unexpected API response', res);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // =================== (Mark the optimistic message as failed)===================
      setMessages(prev => prev.map(msg => 
        msg._id === optimisticMessage._id ? {...msg, failed: true, pending: false} : msg
      ));
    }
  };
 
  // =================== (UI)===================
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
          {/* =================== (Inbox List)===================
          */}
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
                <div className="flex items-center justify-center h-full text-gray-500">Loading chats...</div>
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
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-7 h-5 bg-gray-700 rounded-sm relative"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-bold ${chatUser.id === paramUserId ? 'text-blue-700' : 'text-black'}`}>{chatUser.displayName}</span>
                            <div className="flex items-center gap-1 text-gray-500 text-xs"><span>📎</span><span>⋮</span></div>
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
          {/* =================== (Chat Interface)===================
          */}
          <div className={`${paramUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white h-full`}>
            {paramUserId ? (
              <>
                <div className="bg-blue-600 p-3 flex justify-between items-center text-white flex-shrink-0 relative z-20">
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/inbox')} className="text-white hover:text-gray-200 mr-2">←</button>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600 text-sm">👤</span></div>
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
                        <div className="flex items-center justify-center h-full text-gray-500">Loading chat...</div>
                      ) : chatError ? ( // =================== (DISPLAY CHAT ERROR)===================
                        <div className="flex items-center justify-center h-full text-red-500 font-semibold">
                          Error: {chatError}
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
                          {/* =================== (Group messages by date)===================
                          */}
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

                            // =================== (Determine the last date label that was explicitly added as a date separator)===================
                            const lastDateSeparator = acc.findLast(item => item.type === 'date');
                            const lastRenderedDateLabel = lastDateSeparator ? lastDateSeparator.label : null;

                            // =================== (Add date separator if it's a new day or the first message)===================
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
                                <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${(item.content?.sender?._id === user.id || item.content?.sender?.id === user.id || item.content?.sender === user.id) ? 'bg-blue-100 rounded-br-sm text-gray-800' : 'bg-gray-200 rounded-bl-sm text-gray-800'}`}>
                                  <p className="mb-1">{item.content.message}</p>
                                  <span className="text-xs text-gray-500">{new Date(item.content.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                    disabled={!message.trim()}
                    className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    title="Send message"
                  >➤</button>
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
          {/* =================== (User Info Modal)===================
          */}
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