import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import UserProfile from '../../assets/Website logos/UserProfile.jpg';
import { FaMapMarkerAlt, FaBell } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { getAllCategories, searchAdsByTitle, getNotifications, markNotificationsAsRead, getUserDetails, searchCities } from "../../Services/api";
import { useSocket } from '../../hooks/useSocket.js';
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
  const isLoggedIn = !!user;
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
  const [countChanged, setCountChanged] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfileButtonRef = useRef(null);
  const desktopProfileButtonRef = useRef(null);
 
  // =================== (Use useSocket hook)===================
  const { connectSocket, disconnectSocket, isConnected, onConnect, subscribeToNotifications, subscribeToNotificationUpdates, subscribeToNotificationCount } = useSocket(isLoggedIn, user ? user.id : null);
  // =================== (Ensure user.id is stable)===================
 
  // =================== (Location search states)===================
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
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
 
  // =================== (SOCKET.IO: Connect socket on login)===================
  useEffect(() => {
    if (isLoggedIn && user?.id && !isConnected() && !socketService.isConnecting) {
      connectSocket();
    }
  }, [isLoggedIn, user?.id, connectSocket, isConnected]);
 
  // =================== (SOCKET.IO: Disconnect socket on logout)===================
  useEffect(() => {
    let disconnectTimer;
    if (!isLoggedIn && isConnected()) {
      disconnectTimer = setTimeout(() => {
        disconnectSocket();
      }, 500);
      // =================== (500ms delay)===================
    }
    return () => {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
      }
    };
  }, [isLoggedIn, isConnected, disconnectSocket]);
 
  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileMenuRef.current || !mobileProfileButtonRef.current || !desktopProfileButtonRef.current) return;
      const clickedOutsideMenu = !profileMenuRef.current.contains(e.target);
      const clickedOutsideMobileButton = !mobileProfileButtonRef.current.contains(e.target);
      const clickedOutsideDesktopButton = !desktopProfileButtonRef.current.contains(e.target);
      if (clickedOutsideMenu && clickedOutsideMobileButton && clickedOutsideDesktopButton) setShowProfileMenu(false);
    };
    if (showProfileMenu) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showProfileMenu]);

  // =================== (Fetch user details if logged in)===================
  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        try {
          const token = sessionStorage.getItem('token');
          if (token) {
            const resp = await getUserDetails(token);
            const u = resp?.data?.data || resp?.data;
            if (u) {
              // =================== (Ensure the user object has an _id for socket initialization)===================
              if (!u._id && u.id) {
                u._id = u.id;
              }
              setUser(u);
            }
          }
        } catch (e) {}
      };
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

  // =================== (Fetch categories)===================
  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      setCatError(null);
      try {
        const res = await getAllCategories();
        const sortOldFirst = (arr) => [...arr].sort((a, b) => {
          const aTime = Date.parse(a?.createdAt || 0) || 0;
          const bTime = Date.parse(b?.createdAt || 0) || 0;
          return aTime - bTime;
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

  // =================== (Debounced search)===================
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

  // =================== (Fetch notifications from API)===================
  const fetchNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]); setUnreadCount(0); return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) return;
    setLoadingNotifications(true);
    try {
      const res = await getNotifications(token);
      if (res?.data?.success && Array.isArray(res.data.notifications)) {
        const localRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const updated = res.data.notifications.map(n => localRead.includes(n._id) ? { ...n, read: true } : n);
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
      }
    } catch {}
    setLoadingNotifications(false);
  };

  // =================== (Fetch notifications on login)===================
  useEffect(() => { isLoggedIn ? fetchNotifications() : (setNotifications([]), setUnreadCount(0)); }, [isLoggedIn]);
 
  // =================== (Location search effect)===================
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
        
        // =================== (Handle the API response format which returns an array of city names)===================
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

  // =================== (Handle click outside location dropdown)===================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =================== (Listen for external request to open location selector (e.g., from HomePage prompt))===================
  useEffect(() => {
    const openSelector = () => {
      setShowLocationDropdown(true);
      setHighlightLocation(true);
      setTimeout(() => setHighlightLocation(false), 2500);
    };
    window.addEventListener('openLocationSelector', openSelector);
    return () => window.removeEventListener('openLocationSelector', openSelector);
  }, []);

  // =================== (SOCKET.IO: Listen for notifications in real-time)===================
  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      // =================== (Disconnect socket and clear header-specific listeners when logged out)===================
      return;
    }

    // =================== (Function to attach all notification listeners)===================
    const attachListeners = () => {
      const unsubscribeNew = subscribeToNotifications(async (notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount(prev => {
            setCountChanged(true);
            setTimeout(() => setCountChanged(false), 1000);
            return prev + 1;
          });
        }
      });

      const unsubscribeUpdate = subscribeToNotificationUpdates(async (data) => {
        if (Array.isArray(data.notificationIds)) {
          setNotifications(prev => prev.map(n => data.notificationIds.includes(n._id) ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - data.notificationIds.length));
        }
      });

      const unsubscribeCount = subscribeToNotificationCount(count => {
        setUnreadCount(count);
      });

      return () => {
        unsubscribeNew();
        unsubscribeUpdate();
        unsubscribeCount();
      };
    };

    let cleanUpListeners = () => {};
 
    // =================== (Ensure listeners are re-attached on reconnects)===================
    const unsubscribeOnConnect = onConnect(() => {
      // =================== (After a reconnect, the socket is connected, so re-attach listeners)===================
      if (isLoggedIn && user?.id) {
        cleanUpListeners();
        // =================== (Clean up old listeners before re-attaching)===================
        console.log('Header: Socket reconnected, re-attaching notification listeners.');
        // =================== (Note: socketService.connect already handles joinUserRoom, no need to call it here)===================
        cleanUpListeners = attachListeners();
      }
    });
 
    return () => {
      cleanUpListeners();
      unsubscribeOnConnect();
      console.log('Header: Cleaning up notification useEffect.');
    };
  }, [isLoggedIn, user?.id, subscribeToNotifications, subscribeToNotificationUpdates, subscribeToNotificationCount, fetchNotifications, onConnect, isConnected]);
 
  // =================== (Mark notifications as read)===================
  const handleMarkAsRead = async (ids, skipUIUpdate = false, isSocketEvent = false) => {
    const token = sessionStorage.getItem('token');
    if (!token || !ids.length) return;
    setMarkingAsRead(prev => new Set([...prev, ...ids]));
    const timeoutId = setTimeout(() => setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; }), 10000);
    const unreadToReduce = notifications.filter(n => ids.includes(n._id) && !n.read).length;
    try {
      const res = await markNotificationsAsRead(ids, token);
      if (res && (res.status === 200 || res.data?.success)) {
        if (!skipUIUpdate) {
          setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n));
          setUnreadCount(prev => { const c = Math.max(0, prev - unreadToReduce); if (prev !== c) { setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); } return c; });
        }
        if (!isSocketEvent) {
          clearTimeout(timeoutId);
          setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
          // =================== (Re-fetch notifications after a short delay to ensure consistency)===================
          setTimeout(fetchNotifications, 2000);
        }
      } else if (res?.status === 404) {
        const localRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const newRead = [...new Set([...localRead, ...ids])];
        localStorage.setItem('readNotifications', JSON.stringify(newRead));
        if (!skipUIUpdate) {
          setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n));
          setUnreadCount(prev => { const c = Math.max(0, prev - unreadToReduce); if (prev !== c) { setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); } return c; });
        }
        clearTimeout(timeoutId);
        setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      } else {
        clearTimeout(timeoutId);
        setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      }
    } catch {
      clearTimeout(timeoutId);
      setMarkingAsRead(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      if (skipUIUpdate) {
        setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, read: false } : n));
        setUnreadCount(prev => prev + unreadToReduce);
      }
    }
  };

  // =================== (Notification dropdown toggle)===================
  const toggleNotifications = () => setShowNotifications(v => !v);

  // =================== (Close notifications dropdown on outside click)===================
  useEffect(() => {
    const handleClick = e => { if (showNotifications && !e.target.closest('.notification-container')) setShowNotifications(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  return (
    <header className="sm:sticky top-0 z-50 bg-white p-2 md:p-3 border-b border-gray-200">
      <div className="max-w-6xl mx-auto w-full px-2 md:px-4 relative">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-6 lg:gap-8 items-center justify-between min-h-[70px]">
          {/* =================== (Logo and mobile login)===================
          */}
          <div className="flex items-center w-full sm:w-auto gap-3 sm:gap-4">
            <img src={LocalMartIcon} alt="Local Mart Logo" className="h-10 sm:h-12 w-auto min-w-[4rem] max-w-[8rem] flex-shrink-0 mr-2 cursor-pointer"
              onClick={() => navigate("/homepage")} />
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
              <div className="sm:hidden ml-auto mt-1 relative flex items-center gap-2 notification-container">
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
                  ref={mobileProfileButtonRef}
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
                            className={`p-3 border-b border-gray-100 transition-colors duration-200 ${markingAsRead.has(notification._id) ? 'cursor-wait bg-gray-100 opacity-75' : 'cursor-pointer hover:bg-gray-50'} ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            onClick={() => {
                              if (markingAsRead.has(notification._id)) return;
                              if (!notification.read) {
                                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                setUnreadCount(prev => { const c = Math.max(0, prev - 1); setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); return c; });
                                handleMarkAsRead([notification._id], true);
                              }
                              if (notification.entityId) {
                                if (['ad_pending_approval', 'ad_approved', 'ad_rejected', 'ad_inquiry', 'ad_availability_request'].includes(notification.type)) {
                                  navigate(`/ad/${notification.entityId}`); setShowNotifications(false);
                                } else if (['message', 'chat'].includes(notification.type)) {
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
                    ref={profileMenuRef}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                      onMouseDown={e => e.stopPropagation()}
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
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => {
                        try {
                          sessionStorage.removeItem('user');
                          sessionStorage.removeItem('token');
                          sessionStorage.removeItem('isLoggedIn');
                          // =================== (Add a small delay before disconnecting to allow any final events/ack to process)===================
                          setTimeout(() => disconnectSocket(), 500);
                        } catch {}
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
          {/* =================== (Center controls)===================
          */}
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-5 w-full sm:w-auto flex-1 min-w-0">
            <div className="flex flex-row gap-2 sm:gap-6 md:gap-8 justify-center min-w-0 w-full sm:w-auto">
              {/* =================== (Location)===================
              */}
              <div className="relative" ref={locationDropdownRef}>
                <div
                  className={`flex items-center bg-white rounded h-10 pl-2 pr-3 gap-2 border cursor-pointer transition-shadow ${highlightLocation ? 'border-orange-400 ring-2 ring-orange-300' : 'border-gray-300'}`}
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  <FaMapMarkerAlt className="text-lg text-orange-500" />
                  <span className="w-[110px] sm:w-[130px] text-xs font-semibold truncate">
                    {selectedLocation ? selectedLocation.name : "Select city"}
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
                      ) : locationResults.length > 0 ? (
                        <ul>
                          {locationResults.map((city, index) => (
                            <li
                              key={city._id || city.id || `city-${index}`}
                              className="p-2 hover:bg-orange-50 cursor-pointer text-sm"
                              onClick={() => {
                                setSelectedLocation(city);
                                setShowLocationDropdown(false);
                                setLocationQuery("");
                                // =================== (Store selected location in sessionStorage for other components)===================
                                sessionStorage.setItem('selectedLocation', JSON.stringify(city));
                                // =================== (Broadcast change so other pages react instantly)===================
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
                      ) : locationQuery.trim() ? (
                        <div className="p-2 text-sm text-gray-500">No cities found</div>
                      ) : (
                        <div className="p-2 text-sm text-gray-500">Type to search cities</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* =================== (Categories)===================
              */}
              <div className="border border-gray-400 rounded-full flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 h-10 min-w-[150px] max-w-[180px]">
                <select
                  className="w-full text-xs md:text-sm bg-transparent focus:outline-none p-1"
                  defaultValue=""
                  onChange={e => { const id = e.target.value; if (id) navigate(`/ads/${id}`); }}
                >
                  <option value="">All Categories</option>
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
            {/* =================== (Search Bar)===================
            */}
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
          {/* =================== (Right side: desktop login/Profile area)===================
          */}
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
            {isLoggedIn && (
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
                            className={`p-3 border-b border-gray-100 transition-colors duration-200 ${markingAsRead.has(notification._id) ? 'cursor-wait bg-gray-100 opacity-75' : 'cursor-pointer hover:bg-gray-50'} ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            onClick={() => {
                              if (markingAsRead.has(notification._id)) return;
                              if (!notification.read) {
                                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                setUnreadCount(prev => { const c = Math.max(0, prev - 1); setCountChanged(true); setTimeout(() => setCountChanged(false), 1000); return c; });
                                handleMarkAsRead([notification._id], true);
                              }
                              if (notification.entityId) {
                                if (['ad_pending_approval', 'ad_approved', 'ad_rejected', 'ad_inquiry', 'ad_availability_request'].includes(notification.type)) {
                                  navigate(`/ad/${notification.entityId}`); setShowNotifications(false);
                                } else if (['message', 'chat'].includes(notification.type)) {
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
              </div>
            )}
            {isLoggedIn && (
              <button
                type="button"
                ref={desktopProfileButtonRef}
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
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                >
                  Profile
                </button>
                {isLoggedIn && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => {
                      try {
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('isLoggedIn');
                        // =================== (Add a small delay before disconnecting to allow any final events/ack to process)===================
                        setTimeout(() => disconnectSocket(), 500);
                      } catch {}
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
    </header>
  );
};

export default Header;