import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, useRef } from "react";
// Website logos and banners
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import UserProfile from '../../assets/Website logos/UserProfile.jpg';

import { FaMapMarkerAlt} from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { getAllCategories, searchAdsByTitle, getUserDetails } from "../../Services/api";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('user') || !!sessionStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfileButtonRef = useRef(null);
  const desktopProfileButtonRef = useRef(null);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        try {
          const token = sessionStorage.getItem('token');
          if (token) {
            const resp = await getUserDetails(token);
            const u = resp?.data?.data || resp?.data;
            if (u) {
              setUser(u);
            }
          }
        } catch (e) {
          console.error("Failed to fetch user details in header:", e);
        }
      };
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);
  
  const getCategoryId = (cat) => cat._id;
  
  useEffect(() => {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        setCatError(null);
        try {
          const res = await getAllCategories();
          // Accept array or categories array or (legacy) { success, categories }
          if (Array.isArray(res.data)) {
            setCategories(res.data);
          } else if (res && res.data && Array.isArray(res.data.categories)) {
            setCategories(res.data.categories);
          } else {
            setCategories([]);
            setCatError("Could not fetch categories");
          }
        } catch (err) {
          setCatError("Could not fetch categories");
          setCategories([]);
        }
        setLoadingCategories(false);
      };
      fetchCategories();
    }, []);

    useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
    return;
  }

  setIsSearching(true);
  const delayDebounceFn = setTimeout(async () => {
    try {
      const res = await searchAdsByTitle(searchQuery.trim());
      let adsArray = [];
      if (res && res.data) {
        if (Array.isArray(res.data.ads)) {
          adsArray = res.data.ads;
        } else if (res.data.postAds && Array.isArray(res.data.postAds)) {
          adsArray = res.data.postAds;
        } else if (res.data.postAd) {
          adsArray = [res.data.postAd];  // single ad object wrapped in array
        }
      }
      setSearchResults(adsArray);
      setSearchError(null);
    } catch (err) {
      setSearchResults([]);
      setSearchError('Could not fetch search results');
    }
    setIsSearching(false);
  }, 400);

  return () => clearTimeout(delayDebounceFn);
}, [searchQuery]);


  return (
    <header className="sm:sticky top-0 z-50 bg-white p-2 md:p-3 border-b border-gray-200">
           <div className="max-w-6xl mx-auto w-full px-2 md:px-4"> {/* Added px-2 md:px-4 */}
             {/* Flex container for header content */}
             <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-6 lg:gap-8 items-center justify-between min-h-[70px]">
               {/* Left side: logo and mobile button */}
               <div className="flex items-center w-full sm:w-auto gap-3 sm:gap-4">
                 {/* Logo */}
                 <img
                   src={LocalMartIcon}
                   alt="Local Mart Logo"
                   className="h-10 sm:h-12 w-auto min-w-[4rem] max-w-[8rem] flex-shrink-0 mr-2"
                 />
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
                   <div className="sm:hidden ml-auto mt-1 relative" >
                     <button
                       type="button"
                       ref={mobileProfileButtonRef} // Attach the new ref here
                       className="w-9 h-9 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center"
                       onClick={() => setShowProfileMenu(prev => !prev)}
                       aria-label="Open profile menu"
                     >
                       <img src={user?.profilePicture || UserProfile} alt="Profile" className="w-8 h-8 object-cover rounded-full" />
                     </button>
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
                             try {
                               sessionStorage.removeItem('user');
                               sessionStorage.removeItem('token');
                             } catch (e) {}
                             setShowProfileMenu(false);
                             navigate('/login');
                           }}
                         >
                           Logout
                         </button>
                       </div>
                     )}
                   </div>
                 )}
               </div>
         
               {/* Center: controls */}
               <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-5 w-full sm:w-auto flex-1 min-w-0">
                 {/* Location and categories */}
                 <div className="flex flex-row gap-2 sm:gap-6 md:gap-8 justify-center min-w-0 w-full sm:w-auto">
                   {/* Location selector */}
                   <div className="flex items-center bg-white rounded h-10 pl-2 pr-3 gap-2 border border-gray-300">
                     <FaMapMarkerAlt className="text-lg text-orange-500" />
                     <select className="w-[110px] sm:w-[130px] text-xs font-semibold bg-transparent focus:outline-none">
                       <option>Hyderabad</option>
                       <option>Visakhapatnam</option>
                       <option>Vijayawada</option>
                       <option>Chennai</option>
                       <option>Bengaluru</option>
                       <option>Mumbai</option>
                       <option>Delhi</option>
                       <option>Kolkata</option>
                       <option>Pune</option>
                     </select>
                   </div>
                   {/* Categories dropdown */}
                   <div className="border border-gray-400 rounded-full flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 h-10 min-w-[150px] max-w-[180px]">
                     <select
                       className="w-full text-xs md:text-sm bg-transparent focus:outline-none p-1"
                       defaultValue=""
                       onChange={(e) => {
                         const categoryId = e.target.value;
                         if (categoryId) navigate(`/ads/${categoryId}`);
                       }}
                     >
                       <option value="">All Categories</option>
                       {loadingCategories ? (
                         <option disabled>Loading...</option>
                       ) : catError ? (
                         <option disabled>Error loading categories</option>
                       ) : (
                         categories.map((cat) => (
                           <option key={cat._id} value={getCategoryId(cat)} >
                             {cat.name}
                           </option>
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
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                autoComplete="off"
              />
              <button
                type="button"
                className="bg-orange-500 text-white text-xs sm:text-sm px-4 h-full rounded-l-none rounded-r-full hover:bg-orange-600 transition min-w-[70px]"
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              >
                Search
              </button>

              {/* Search Results Dropdown */}
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
                        onClick={() => {
                          navigate(`/ad/${ad._id || ad.id}`);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
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
                         // e.stopPropagation(); // Removed as onMouseDown handles it
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
                         onMouseDown={(e) => e.stopPropagation()} // Stop propagation of mousedown
                         onClick={(e) => {
                           // e.stopPropagation(); // Removed as onMouseDown handles it
                           try {
                             sessionStorage.removeItem('user');
                             sessionStorage.removeItem('token');
                           } catch (e) {}
                           setShowProfileMenu(false);
                           navigate('/login');
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