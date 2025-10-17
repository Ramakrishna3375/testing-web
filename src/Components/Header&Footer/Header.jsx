import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// Website logos and banners
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import UserProfile from '../../assets/Website logos/UserProfile.jpg';
 
import { FaMapMarkerAlt, FaBell } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { PiChatCircleDotsBold } from "react-icons/pi";
import { getAllCategories, searchAdsByTitle, getNotifications, markNotificationsAsRead, clearAllReadNotifications, replyToAdAvailability, getUserDetails, searchCities, getCitiesNames } from "../../Services/api";
import socketService from "../../hooks/socketService";
 
const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const isLoggedIn = !!user && !!user.id;

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const [clearingRead, setClearingRead] = useState(false);
  const [countChanged, setCountChanged] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfileButtonRef = useRef(null);
  const desktopProfileButtonRef = useRef(null);
  const notificationHandlerRef = useRef(null); // guard to avoid duplicate socket listeners
  const notifSyncRef = useRef(0); // throttle REST sync after live push
  const windowNotifHandlerRef = useRef(null); // guard for window event listener
  
  // Location search states
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [loadingAllCities, setLoadingAllCities] = useState(true);
  // Ad availability inquiry reply state
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const storedLocation = sessionStorage.getItem('selectedLocation');
      return storedLocation ? JSON.parse(storedLocation) : null;
    } catch (e) {
      console.error("Error parsing stored location:", e);
      return null;
    }
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef(null);
  const [highlightLocation, setHighlightLocation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // new state
 
  useEffect(() => {
    const onDocClick = (e) => {
      // Check if all refs are initialized before proceeding
      if (!profileMenuRef.current || !mobileProfileButtonRef.current || !desktopProfileButtonRef.current) {
        return;
      }
 
      const clickedOutsideMenu = !profileMenuRef.current.contains(e.target);
      const clickedOutsideMobileButton = !mobileProfileButtonRef.current.contains(e.target);
      const clickedOutsideDesktopButton = !desktopProfileButtonRef.current.contains(e.target);
 
      // Close menu if click is outside the menu content AND outside BOTH mobile and desktop buttons
      if (clickedOutsideMenu && clickedOutsideMobileButton && clickedOutsideDesktopButton) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', onDocClick);
    }
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showProfileMenu]);
 
  // Always ensure user state includes the user id from API using the login token
  useEffect(() => {
    let mounted = true;
    const token = sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    getUserDetails(token)
      .then(resp => {
        if (!mounted) return;
        const u = resp?.data?.data || resp?.data;
        if (u && (u.id || u._id)) {
          setUser({ ...u, id: u.id || u._id });
          sessionStorage.setItem('user', JSON.stringify({ ...u, id: u.id || u._id }));
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (mounted) setUser(null);
      });
    return () => { mounted = false };
  }, []);
 
  // Fetch categories
  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      setCatError(null);
      try {
        const res = await getAllCategories();
        const sortOldFirst = (arr) => [...arr].sort((a, b) => {
          const aTime = Date.parse(a?.createdAt || 0) || 0;
          const bTime = Date.parse(b?.createdAt || 0) || 0;
          return aTime - bTime; // older first
        });
        if (Array.isArray(res.data)) setCategories(sortOldFirst(res.data));
        else if (Array.isArray(res?.data?.categories)) setCategories(sortOldFirst(res.data.categories));
        else throw new Error();
      } catch {
        setCategories([]);
        setCatError("Could not fetch categories");
      }
      setLoadingCategories(false);
    })();
  }, []);
 
  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const res = await searchAdsByTitle(searchQuery.trim());
        let ads = [];
        if (Array.isArray(res?.data?.ads)) ads = res.data.ads;
        else if (Array.isArray(res?.data?.postAds)) ads = res.data.postAds;
        else if (res?.data?.postAd) ads = [res.data.postAd];
        setSearchResults(ads);
        setSearchError(null);
      } catch {
        setSearchResults([]);
        setSearchError('Could not fetch search results');
      }
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);
 
  // --- Notification System (Socket-First, Real-Time) ---
  // - Initial notification fetch: via socket emit 'getNotifications' with ack, fallback to REST if socket not ready
  // - All new incoming notifications: handled live via 'notification' socket event
  // - No REST polling after initial page load
  //
  const fetchNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]); setUnreadCount(0); return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) return;
    setLoadingNotifications(true);
    try {
      const res = await getNotifications(token);
      const list = res?.data?.notifications || [];
      const localRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const updated = list.map(n => localRead.includes(n._id) ? { ...n, read: true } : n);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
    setLoadingNotifications(false);
  };
 
  // Location search effect
  useEffect(() => {
    if (!locationQuery.trim()) {
      setLocationResults([]);
      setIsSearchingLocation(false);
      return;
    }
    
    setIsSearchingLocation(true);
    const delay = setTimeout(async () => {
      try {
        const res = await searchCities(locationQuery.trim());
        let cityNames = [];
        
        // Handle the API response format which returns an array of city names
        if (Array.isArray(res?.data?.cities)) {
          cityNames = res.data.cities.map(cityName => ({ name: cityName, id: cityName }));
        } else if (Array.isArray(res?.data)) {
          cityNames = res.data.map(cityName => ({ name: cityName, id: cityName }));
        }
        
        setLocationResults(cityNames);
      } catch (error) {
        console.error("Error searching cities:", error);
        setLocationResults([]);
      }
      setIsSearchingLocation(false);
    }, 400);
    
    return () => clearTimeout(delay);
  }, [locationQuery]);

  // Preload all cities once for initial dropdown display
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingAllCities(true);
        const res = await getCitiesNames();
        let cityNames = [];
        if (Array.isArray(res?.data?.cities)) cityNames = res.data.cities;
        else if (Array.isArray(res?.data)) cityNames = res.data;
        const normalized = cityNames
          .filter(Boolean)
          .map(name => ({ name, id: name }))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        if (mounted) setAllCities(normalized);
      } catch (e) {
        if (mounted) setAllCities([]);
      } finally {
        if (mounted) setLoadingAllCities(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Handle click outside location dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for external request to open location selector (e.g., from HomePage prompt)
  useEffect(() => {
    const openSelector = () => {
      setShowLocationDropdown(true);
      setHighlightLocation(true);
      setTimeout(() => setHighlightLocation(false), 2500);
    };
    window.addEventListener('openLocationSelector', openSelector);
    return () => window.removeEventListener('openLocationSelector', openSelector);
  }, []);

  // Centralized Socket Connection Management
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      const token = sessionStorage.getItem('token');
      if (token && !socketService.isSocketConnected()) {
        console.log("Header: User is logged in, connecting socket...");
        console.log("Header: Setting up socket connection", { userId: user?.id, token });
        socketService.connect(user.id, token);
      }
    } else if (!isLoggedIn && socketService.isSocketConnected()) {
      console.log("Header: User is logged out, disconnecting socket...");
      socketService.disconnect();
    }
    // This effect handles the socket connection lifecycle based on login status.
  }, [isLoggedIn, user?.id]);

  // Ensure notifications are fetched immediately after socket connection is established
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!isLoggedIn || !user?.id || !socket) {
      console.log('[Header] Skipping socket connect effect:', 'isLoggedIn:', isLoggedIn, 'user?.id:', user?.id, 'socket:', socket);
      return;
    }
    // Handler to trigger actions once socket is ready
    const handleConnect = () => {
      console.log('[Header] Socket connected:', socket.connected, 'socket.id:', socket.id, socket);
      // JOIN user-specific room to receive instant notifications addressed to userId
      try {
        socketService.joinUserRoom(user.id);
        console.log('[Header] Requested join to user room for notifications:', user.id);
      } catch (e) {
        console.warn('[Header] Failed to request join user room:', e);
      }

      // Register live notification handler once to update badge instantly
      if (!notificationHandlerRef.current) {
        const handleNotif = (notification) => {
          console.log('[Header] Live notification received:', notification);
          if (!notification) return;
          setNotifications(prev => [notification, ...prev]);
          if (!notification.read) {
            setUnreadCount(prev => prev + 1);
            setCountChanged(true);
            setTimeout(() => setCountChanged(false), 800);
          }
          // Throttled sync to ensure admin-side notifications and server state are reflected
          const now = Date.now();
          if (now - notifSyncRef.current > 3000) {
            notifSyncRef.current = now;
            fetchNotifications();
          }
        };
        notificationHandlerRef.current = handleNotif;
        socket.on('notification', handleNotif);
        socket.on('newNotification', handleNotif); // support alternate event name
        console.log('[Header] Registered live notification handler');
      }

      // Fetch existing notifications (history) via REST
      fetchNotifications();
    };
    console.log('[Header] Registering socket connect event, current state:', socket.connected, 'isLoggedIn:', isLoggedIn, 'user?.id:', user?.id);
    socket.on('connect', handleConnect);
    if (socket.connected) handleConnect();
    return () => {
      socket.off('connect', handleConnect);
    };
  }, [isLoggedIn, user?.id]);
 
  // Also listen to window-level events dispatched by socketService as a secondary live channel
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!windowNotifHandlerRef.current) {
      const handleWindowNotif = (evt) => {
        const notification = evt?.detail?.notification;
        if (!notification) return;
        console.log('[Header] Window event live notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
          setCountChanged(true);
          setTimeout(() => setCountChanged(false), 800);
        }
      };
      windowNotifHandlerRef.current = handleWindowNotif;
      window.addEventListener('notification_received', handleWindowNotif);
      window.addEventListener('newNotification', handleWindowNotif);
    }
    return () => {
      if (windowNotifHandlerRef.current) {
        window.removeEventListener('notification_received', windowNotifHandlerRef.current);
        window.removeEventListener('newNotification', windowNotifHandlerRef.current);
        windowNotifHandlerRef.current = null;
      }
    };
  }, [isLoggedIn]);
 
  // Mark notifications as read
  const handleMarkAsRead = async (ids, skipUIUpdate = false) => {
    const token = sessionStorage.getItem('token');
    if (!token || !ids.length) return;

    // --- Start of Fix ---
    // 1. Immediately update localStorage to persist the "read" state locally.
    const localRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const newRead = [...new Set([...localRead, ...ids])];
    localStorage.setItem('readNotifications', JSON.stringify(newRead));

    // 2. Optimistically update UI unless skipped.
    const unreadToReduce = notifications.filter(n => ids.includes(n._id) && !n.read).length;
    if (!skipUIUpdate) {
      setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n));
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - unreadToReduce);
        if (prev !== newCount) {
          setCountChanged(true);
          setTimeout(() => setCountChanged(false), 1000);
        }
        return newCount;
      });
    }
    // --- End of Fix ---

    setMarkingAsRead(prev => new Set([...prev, ...ids]));
    const timeoutId = setTimeout(() => setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; }), 10000);
    try {
      const res = await markNotificationsAsRead(ids, token);
      if (res && (res.status === 200 || res.data?.success)) {
        // API call was successful, state is already updated.
        clearTimeout(timeoutId);
        setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      } else if (res?.status === 404) {
        // API returned 404, but localStorage is already updated.
        clearTimeout(timeoutId);
        setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      } else {
        // Handle other non-successful API responses
        clearTimeout(timeoutId);
        setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      }
    } catch {
      // Handle API call failure
      clearTimeout(timeoutId);
      setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
    }
  };
 
  // Notification dropdown toggle
  const toggleNotifications = () => setShowNotifications(v => !v);

  const handleClearRead = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const readIds = notifications.filter(n => n.read).map(n => n._id);
    if (readIds.length === 0) return;
    setClearingRead(true);
    try {
      await clearAllReadNotifications(token);
    } catch {}
    // Update UI: remove read notifications
    setNotifications(prev => prev.filter(n => !n.read));
    // Clean localStorage list of read ids
    try {
      const localRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const filtered = localRead.filter(id => !readIds.includes(id));
      localStorage.setItem('readNotifications', JSON.stringify(filtered));
    } catch {}
    setClearingRead(false);
  };

  const openInquiryFormFromNotification = (notification) => {
    const reqId = notification.requestId || notification.payload?.requestId || notification.meta?.requestId;
    const aId = notification.adId || notification.payload?.adId || notification.meta?.adId;
    setActiveInquiry({
      requestId: reqId || "",
      adId: aId || "",
      isAvailable: true,
      message: ""
    });
    setInquiryError("");
    setInquirySuccess("");
  };

  const submitInquiryReply = async () => {
    const token = sessionStorage.getItem('token');
    if (!token || !activeInquiry?.requestId || !activeInquiry?.adId) {
      setInquiryError("Missing token or identifiers");
      return;
    }
    setInquirySubmitting(true);
    setInquiryError("");
    setInquirySuccess("");
    try {
      const res = await replyToAdAvailability(
        activeInquiry.requestId,
        activeInquiry.adId,
        !!activeInquiry.isAvailable,
        activeInquiry.message || ""
      , token);
      if (res && (res.status >= 200 && res.status < 300)) {
        setInquirySuccess("Reply sent successfully");
        // Optionally refresh notifications to reflect state
        try { await fetchNotifications(); } catch {}
        // Auto close the form after a short delay
        setTimeout(() => setActiveInquiry(null), 1200);
      } else {
        setInquiryError(res?.data?.message || "Failed to send reply");
      }
    } catch (e) {
      setInquiryError("Failed to send reply");
    } finally {
      setInquirySubmitting(false);
    }
  };
 
  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClick = e => { if (showNotifications && !e.target.closest('.notification-container')) setShowNotifications(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);
 
  return (
    <header className="sm:sticky top-0 z-50 bg-white p-2 md:p-3 border-b border-gray-200">
      <div className="max-w-6xl mx-auto w-full px-2 md:px-4 relative">
        {/* Mobile/Tablet: Bell placed left of profile icon */}
       
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-6 lg:gap-8 items-center justify-between min-h-[70px]">
          {/* Logo and mobile login */}
          <div className="flex items-center w-full sm:w-auto gap-3 sm:gap-4">
            <img src={LocalMartIcon} alt="Local Mart Logo" className="h-10 sm:h-12 w-auto min-w-[4rem] max-w-[8rem] flex-shrink-0 mr-2 cursor-pointer" 
            onClick={() => navigate("/homepage")} />
            {/* Mobile: show Login when logged out, avatar when logged in */}
            {!isLoggedIn ? (
                   <div className="sm:hidden ml-auto mt-1">
                     <button
                       onClick={() => navigate("/login")}
                       className="flex items-center bg-orange-500 text-white text-xs rounded-sm p-1.5 hover:underline"
                     >
                       <VscAccount className="text-sm sm:text-xl mr-1" />
                       Login | Signup
                     </button>
                   </div>
                ) : (
                  <div className="sm:hidden ml-auto mt-1 relative flex items-center gap-2 notification-container" >
                    <button
                      onClick={() => navigate('/inbox')}
                      className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 focus:outline-none border border-gray-300 rounded-full bg-white shadow-sm"
                      aria-label="Chat"
                    >
                      <PiChatCircleDotsBold className="text-xl" />
                    </button>
                    <button
                      onClick={toggleNotifications}
                      className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 focus:outline-none border border-gray-300 rounded-full bg-white shadow-sm"
                      aria-label="Notifications"
                    >
                      <FaBell className="text-xl" />
                      {unreadCount > 0 && (
                        <span className={`absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center font-bold transition-all duration-300 ${countChanged ? 'animate-bounce scale-110' : ''}`}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      ref={mobileProfileButtonRef} // Attach the new ref here
                      className="w-9 h-9 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center"
                      onClick={() => setShowProfileMenu(prev => !prev)}
                      aria-label="Open profile menu"
                    >
                      <img src={user?.profilePicture || UserProfile} alt="Profile" className="w-8 h-8 object-cover rounded-full" />
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                          </div>
                          <div className="flex gap-1">
                            {unreadCount > 0 && (
                              <button
                                onClick={() => {
                                  const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
                                  if (unreadIds.length) {
                                    setNotifications(prev => prev.map(n => unreadIds.includes(n._id) ? { ...n, read: true } : n));
                                    setUnreadCount(0);
                                    setCountChanged(true); setTimeout(() => setCountChanged(false), 1000);
                                    handleMarkAsRead(unreadIds, true);
                                  }
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors active:bg-orange-100 active:scale-95"
                              >Mark All Read</button>
                            )}
                            {notifications.some(n => n.read) && (
                              <button
                                onClick={handleClearRead}
                                disabled={clearingRead}
                                className="text-xs text-gray-600 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                              >{clearingRead ? 'Clearing...' : 'Clear read'}</button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {loadingNotifications ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading notifications...</div>
                          ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
                          ) : (
                            notifications.map(notification => (
                              <div
                                key={notification._id}
                                className={`p-3 border-b border-gray-100 transition-colors duration-200 ${
                                  markingAsRead.has(notification._id) ? 'cursor-wait bg-gray-100 opacity-75' : 'cursor-pointer hover:bg-gray-50'
                                } ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                onClick={() => {
                                  if (markingAsRead.has(notification._id)) return;
                                  if (!notification.read) {
                                    setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                    setUnreadCount(prev => { const c = Math.max(0, prev - 1); setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); return c; });
                                    handleMarkAsRead([notification._id], true);
                                  }
                                  // Open centered availability inquiry form
                                  if (notification.type === 'ad_availability_inquiry') {
                                    setShowNotifications(false);
                                    openInquiryFormFromNotification(notification);
                                    return;
                                  }
                                  if (notification.entityId) {
                                    if (['ad_pending_approval', 'ad_approved', 'ad_inquiry', 'ad_availability_request'].includes(notification.type)) {
                                      navigate(`/ad/${notification.entityId}`); setShowNotifications(false);
                                    } else if (['message', 'chat_message'].includes(notification.type)) {
                                      navigate(`/chat/${notification.entityId}`); setShowNotifications(false);
                                    }
                                  }
                                }}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-sm font-medium text-gray-800 pr-2">{notification.title}</h4>
                                  {markingAsRead.has(notification._id)
                                    ? <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                                    : !notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                  }
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(notification.timestamp).toLocaleDateString()} {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button onClick={() => setShowNotifications(false)} className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium">
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {showProfileMenu && (
                      <div
                        className="absolute right-0 top-11 bg-white border rounded shadow w-40 py-1 z-50"
                        ref={profileMenuRef} // Attach profileMenuRef here
                      >
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/profile');
                          }}
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/my-ads');
                          }}
                        >
                          My Ads
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                          onClick={() => {
                            try {
                              sessionStorage.removeItem('user');
                              sessionStorage.removeItem('token');
                              sessionStorage.removeItem('isLoggedIn');
                              socketService.disconnect(); // Explicitly disconnect on logout
                            } catch (e) {}
                            setShowProfileMenu(false);
                            navigate('/login', { replace: true });
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
          </div>
          {/* Center controls */}
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-5 w-full sm:w-auto flex-1 min-w-0">
            <div className="flex flex-row gap-2 sm:gap-6 md:gap-8 justify-center min-w-0 w-full sm:w-auto">
              {/* Location */}
              <div className="relative" ref={locationDropdownRef}>
                <div
                  className={`flex items-center bg-white rounded h-10 pl-2 pr-3 gap-2 border cursor-pointer transition-shadow ${highlightLocation ? 'border-orange-400 ring-2 ring-orange-300' : 'border-gray-300'}`}
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  <FaMapMarkerAlt className="text-lg text-orange-500" />
                  <span className="w-[110px] sm:w-[130px] text-xs font-semibold truncate">
                    {selectedLocation ? selectedLocation.name : "All Cities"}
                  </span>
                </div>
                
                {showLocationDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          if (e.target.value.trim()) {
                            setShowLocationDropdown(true);
                          }
                        }}
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-auto">
                      {isSearchingLocation ? (
                        <div className="p-2 text-sm text-gray-500">Searching cities...</div>
                      ) : locationQuery.trim() ? (
                        locationResults.length > 0 ? (
                          <ul>
                            {locationResults.map((city, index) => (
                              <li
                                key={city._id || city.id || `city-${index}`}
                                className="p-2 hover:bg-orange-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setSelectedLocation(city);
                                  setShowLocationDropdown(false);
                                  setLocationQuery("");
                                  sessionStorage.setItem('selectedLocation', JSON.stringify(city));
                                  window.dispatchEvent(new CustomEvent('selectedLocationChanged', { detail: city }));
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="text-orange-500" />
                                  <span>{city.name}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-2 text-sm text-gray-500">No cities found</div>
                        )
                      ) : (
                        <ul>
                          <li
                            className="p-2 hover:bg-orange-50 cursor-pointer text-sm font-semibold text-orange-600"
                            onClick={() => {
                              setSelectedLocation(null);
                              setShowLocationDropdown(false);
                              setLocationQuery("");
                              try { sessionStorage.removeItem('selectedLocation'); } catch {}
                              window.dispatchEvent(new CustomEvent('selectedLocationChanged', { detail: null }));
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-orange-500" />
                              <span>All Cities</span>
                            </div>
                          </li>
                          {loadingAllCities ? (
                            <li className="p-2 text-sm text-gray-500">Loading cities...</li>
                          ) : allCities.length === 0 ? (
                            <li className="p-2 text-sm text-gray-500">No cities available</li>
                          ) : (
                            allCities.map((city, index) => (
                              <li
                                key={city.id || `city-${index}`}
                                className="p-2 hover:bg-orange-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setSelectedLocation(city);
                                  setShowLocationDropdown(false);
                                  setLocationQuery("");
                                  sessionStorage.setItem('selectedLocation', JSON.stringify(city));
                                  window.dispatchEvent(new CustomEvent('selectedLocationChanged', { detail: city }));
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="text-orange-500" />
                                  <span>{city.name}</span>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Categories */}
              <div className="border border-gray-400 rounded-full flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 h-10 min-w-[150px] max-w-[180px]">
                <select
                  className="w-full text-xs md:text-sm bg-transparent focus:outline-none p-1"
                  value={selectedCategory}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedCategory(id);
                    if (id) {
                      // Navigate to category with optional location param
                      if (selectedLocation) {
                        navigate(`/ads/${id}?location=${encodeURIComponent(selectedLocation.name)}`);
                      } else {
                        navigate(`/ads/${id}`);
                      }
                    }
                  }}
                >
                  <option value="">Select Category</option>
                  {loadingCategories ? (
                    <option disabled>Loading...</option>
                  ) : catError ? (
                    <option disabled>Error loading categories</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {/* Search Bar */}
            <div className="flex items-center border border-gray-400 rounded-full h-10 w-full md:w-80 lg:w-[340px] max-w-full overflow-hidden ml-0 md:ml-6 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 text-xs sm:text-sm md:text-base bg-white outline-none placeholder-gray-500 min-w-0"
                placeholder="Search product"
                onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`); }}
                autoComplete="off"
              />
              <button
                type="button"
                className="bg-orange-500 text-white text-xs sm:text-sm px-4 h-full rounded-l-none rounded-r-full hover:bg-orange-600 transition min-w-[70px]"
                onClick={() => { if (searchQuery.trim()) navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`); }}
              >Search</button>
              {searchQuery && (
                <div className="absolute left-0 top-full w-full bg-white border z-50 rounded-b shadow max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-xs text-gray-500">Searching...</div>
                  ) : searchError ? (
                    <div className="p-3 text-xs text-red-500">{searchError}</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500">No results.</div>
                  ) : (
                    searchResults.map((ad, idx) => (
                      <div
                        key={ad._id || idx}
                        onClick={() => { navigate(`/ad/${ad._id || ad.id}`); setSearchQuery(""); setSearchResults([]); }}
                        className="p-3 cursor-pointer hover:bg-orange-100 border-b last:border-0 flex items-center gap-2"
                      >
                        <img src={ad.images?.[0] || "/no-image.png"} alt="" className="w-8 h-8 rounded object-cover border" />
                        <span className="text-xs text-gray-800">{ad.title}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Right side: desktop login/Profile area */}
          <div className="hidden sm:flex items-center justify-end gap-2 mt-2 w-full sm:w-auto md:mt-0 sm:h-10 relative" >
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center bg-orange-500 text-white rounded-full px-4 py-2 text-xs md:text-sm lg:text-base font-semibold hover:underline min-h-[40px]"
              >
                <VscAccount className="text-xs sm:text-sm md:text-lg mr-2" />
                Login | Signup
              </button>
            )}
            {/* Desktop: Bell placed left of profile icon */}
            {isLoggedIn && (
              <>
              <button
                onClick={() => navigate('/inbox')}
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 focus:outline-none border border-gray-300 rounded-full bg-white shadow-sm"
                aria-label="Chat"
              >
                <PiChatCircleDotsBold className="text-xl" />
              </button>
              <div className="hidden sm:flex items-center gap-2 relative notification-container">
                <button
                  onClick={toggleNotifications}
                  className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 focus:outline-none border border-gray-300 rounded-full bg-white shadow-sm"
                  aria-label="Notifications"
                >
                  <FaBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className={`absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center font-bold transition-all duration-300 ${countChanged ? 'animate-bounce scale-110' : ''}`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    </div>
                        <div className="flex gap-1">
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
                                if (unreadIds.length) {
                                  setNotifications(prev => prev.map(n => unreadIds.includes(n._id) ? { ...n, read: true } : n));
                                  setUnreadCount(0);
                                  setCountChanged(true); setTimeout(() => setCountChanged(false), 1000);
                                  handleMarkAsRead(unreadIds, true);
                                }
                              }}
                              className="text-xs text-orange-500 hover:text-orange-600 font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors active:bg-orange-100 active:scale-95"
                            >Mark All Read</button>
                          )}
                          {notifications.some(n => n.read) && (
                            <button
                              onClick={handleClearRead}
                              disabled={clearingRead}
                              className="text-xs text-gray-600 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            >{clearingRead ? 'Clearing...' : 'Clear read'}</button>
                          )}
                        </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`p-3 border-b border-gray-100 transition-colors duration-200 ${
                            markingAsRead.has(notification._id) ? 'cursor-wait bg-gray-100 opacity-75' : 'cursor-pointer hover:bg-gray-50'
                          } ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                          onClick={() => {
                            if (markingAsRead.has(notification._id)) return;
                            if (!notification.read) {
                              setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                              setUnreadCount(prev => { const c = Math.max(0, prev - 1); setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); return c; });
                              handleMarkAsRead([notification._id], true);
                            }
                            if (notification.type === 'ad_availability_inquiry') {
                              setShowNotifications(false);
                              openInquiryFormFromNotification(notification);
                              return;
                            }
                            if (notification.entityId) {
                              if (['ad_pending_approval', 'ad_approved', 'ad_inquiry', 'ad_availability_request'].includes(notification.type)) {
                                navigate(`/ad/${notification.entityId}`); setShowNotifications(false);
                              } else if (['message', 'chat_message'].includes(notification.type)) {
                                navigate(`/chat/${notification.senderId}`); setShowNotifications(false);
                              }
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-gray-800 pr-2">{notification.title}</h4>
                            {markingAsRead.has(notification._id)
                              ? <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                              : !notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            }
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.timestamp).toLocaleDateString()} {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                        
                        {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button onClick={() => setShowNotifications(false)} className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium">
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            </>
            )}
            {isLoggedIn && (
            <button
              type="button"
              ref={desktopProfileButtonRef} // Attach the new ref here
              className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center"
              onClick={() => setShowProfileMenu(prev => !prev)}
              aria-label="Open profile menu"
            >
              <img src={user?.profilePicture || UserProfile} alt="Profile" className="w-9 h-9 object-cover rounded-full" />
            </button>
            )}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 bg-white border rounded shadow w-44 py-1 z-50" ref={profileMenuRef}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                  onClick={(e) => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                  onClick={(e) => {
                    setShowProfileMenu(false);
                    navigate('/my-ads');
                  }}
                >
                  My Ads
                </button>
                {isLoggedIn && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                    onClick={(e) => {
                      try {
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('isLoggedIn');
                        socketService.disconnect(); // Explicitly disconnect on logout
                      } catch (e) {}
                      setShowProfileMenu(false);
                      navigate('/login', { replace: true });
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {activeInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-semibold text-gray-800">Reply to availability inquiry</h4>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setActiveInquiry(null)}>✖</button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">requestId</label>
                <input type="text" value={activeInquiry.requestId} readOnly className="w-full border rounded px-2 py-1 text-xs bg-gray-100" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">adId</label>
                <input type="text" value={activeInquiry.adId} readOnly className="w-full border rounded px-2 py-1 text-xs bg-gray-100" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">isAvailable</label>
                <select
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={activeInquiry.isAvailable ? 'true' : 'false'}
                  onChange={(e) => setActiveInquiry(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">message</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs"
                  rows={3}
                  placeholder="Enter message"
                  value={activeInquiry.message}
                  onChange={(e) => setActiveInquiry(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              {inquiryError && <div className="text-xs text-red-600">{inquiryError}</div>}
              {inquirySuccess && <div className="text-xs text-green-600">{inquirySuccess}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button className="text-xs px-3 py-1 border rounded" onClick={() => setActiveInquiry(null)} disabled={inquirySubmitting}>Cancel</button>
                <button className="text-xs px-3 py-1 bg-orange-500 text-white rounded disabled:opacity-50" onClick={submitInquiryReply} disabled={inquirySubmitting}>
                  {inquirySubmitting ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
 
export default Header;