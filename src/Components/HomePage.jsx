import { useNavigate, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
import advertise1 from '../assets/Website logos/advertise1.jpg';
import advertise2 from '../assets/Website logos/advertise2.jpg';
import { FaMapMarkerAlt } from "react-icons/fa";
import { getAllCategories, getAllActiveAds, getBanners, searchAdsByCity } from "../Services/api";
import Header from './Header&Footer/Header';
import Footer from "./Header&Footer/Footer";
import { Skeleton } from './SkeletonLoader/FilesLoader';

const adImages = [
  advertise1, advertise2
];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(0);
  const [showAllPremium, setShowAllPremium] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  // Decoupled datasets for each grid when using backend pagination (All cities)
  const [adsRecommended, setAdsRecommended] = useState([]);
  const [adsRecent, setAdsRecent] = useState([]);
  // Section-specific loading for backend pagination
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [adsError, setAdsError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannerError, setBannerError] = useState(null);
  // Pagination states
  const [premiumPage, setPremiumPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const PREMIUM_PAGE_SIZE = 20;
  const RECENT_PAGE_SIZE = 20;
  // Backend pagination when no city is selected (All cities)
  const [selectedLocationState, setSelectedLocationState] = useState(null);
  const [allAdsPage, setAllAdsPage] = useState(1);
  const [allAdsTotalPages, setAllAdsTotalPages] = useState(null);
  // Separate backend pagination for Recently grid when all cities
  const [allAdsRecentPage, setAllAdsRecentPage] = useState(1);
  const [allAdsRecentTotalPages, setAllAdsRecentTotalPages] = useState(null);

  // Keep pages in range when ads list changes
  useEffect(() => {
    const totalPremiumPages = Math.max(1, Math.ceil((Array.isArray(filteredAdsRecommended) ? filteredAdsRecommended.length : 0) / PREMIUM_PAGE_SIZE));
    if (premiumPage > totalPremiumPages) setPremiumPage(totalPremiumPages);
    if (premiumPage < 1) setPremiumPage(1);
    const totalRecentPages = Math.max(1, Math.ceil((Array.isArray(filteredAdsRecent) ? filteredAdsRecent.length : 0) / RECENT_PAGE_SIZE));
    if (recentPage > totalRecentPages) setRecentPage(totalRecentPages);
    if (recentPage < 1) setRecentPage(1);
  }, [/* decoupled filtered arrays */ adsRecommended, adsRecent, showAllPremium, showAllRecent]);

  const getCategoryId = (cat) => cat._id;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCatError(null);
      try {
        const res = await getAllCategories();
        // Accept array or categories array or (legacy) { success, categories }
        const sortOldFirst = (arr) => {
          return [...arr].sort((a, b) => {
            const aTime = Date.parse(a?.createdAt || 0) || 0;
            const bTime = Date.parse(b?.createdAt || 0) || 0;
            return aTime - bTime; // older first
          });
        };

        if (Array.isArray(res.data)) {
          setCategories(sortOldFirst(res.data));
        } else if (res && res.data && Array.isArray(res.data.categories)) {
          setCategories(sortOldFirst(res.data.categories));
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
   const fetchAds = async () => {
     setLoadingAds(true);
     setAdsError(null);
     try {
       let selectedLocation = null;
       try {
         const storedLocation = sessionStorage.getItem('selectedLocation');
         selectedLocation = storedLocation ? JSON.parse(storedLocation) : null;
       } catch {}

        setSelectedLocationState(selectedLocation);

        if (selectedLocation && selectedLocation.name) {
         // Fetch ads by city via API
         const res = await searchAdsByCity(selectedLocation.name);
         if (res && res.data && Array.isArray(res.data.postAds)) {
           setAds(res.data.postAds);
            setAdsRecommended(res.data.postAds);
            setAdsRecent(res.data.postAds);
            setAllAdsTotalPages(null);
         } else {
           setAds([]);
           setAdsError("Could not fetch ads");
         }
        } else {
         // No location selected: fetch all active ads
          const initialPage = 1;
          const res = await getAllActiveAds(initialPage);
         if (res && res.data && Array.isArray(res.data.postAds)) {
           setAds(res.data.postAds);
            setAdsRecommended(res.data.postAds);
            setAdsRecent(res.data.postAds);
            const total = res.data?.pagination?.totalPages || null;
            setAllAdsTotalPages(total);
            setAllAdsRecentTotalPages(total);
         } else {
           setAds([]);
           setAdsError("Could not fetch ads");
         }
       }
     } catch (err) {
       setAds([]);
       setAdsError("Could not fetch ads");
     }
     setLoadingAds(false);
   };

   fetchAds();

  const onLocChange = async (e) => {
     const next = e?.detail || null;
     setLoadingAds(true);
     setAdsError(null);
     try {
      if (next && next.name) {
         const res = await searchAdsByCity(next.name);
         if (res && res.data && Array.isArray(res.data.postAds)) {
           setAds(res.data.postAds);
          setAdsRecommended(res.data.postAds);
          setAdsRecent(res.data.postAds);
          setSelectedLocationState(next);
          setAllAdsPage(1);
          setAllAdsTotalPages(null);
          setAllAdsRecentPage(1);
          setAllAdsRecentTotalPages(null);
         } else {
           setAds([]);
           setAdsError("Could not fetch ads");
         }
       } else {
        const res = await getAllActiveAds(1);
         if (res && res.data && Array.isArray(res.data.postAds)) {
           setAds(res.data.postAds);
          setAdsRecommended(res.data.postAds);
          setAdsRecent(res.data.postAds);
          setSelectedLocationState(null);
          setAllAdsPage(1);
          const total = res.data?.pagination?.totalPages || null;
          setAllAdsTotalPages(total);
          setAllAdsRecentPage(1);
          setAllAdsRecentTotalPages(total);
         } else {
           setAds([]);
           setAdsError("Could not fetch ads");
         }
       }
     } catch (err) {
       setAds([]);
       setAdsError("Could not fetch ads");
     }
     setLoadingAds(false);
   };
   window.addEventListener('selectedLocationChanged', onLocChange);
   return () => window.removeEventListener('selectedLocationChanged', onLocChange);
 }, []);

 // Backend pagination fetch for Recommended (when All cities + View All)
 useEffect(() => {
   if (selectedLocationState || !showAllPremium) return;
   const pageToFetch = allAdsPage || 1;
   setLoadingPremium(true);
   setAdsError(null);
   (async () => {
     try {
      const res = await getAllActiveAds(pageToFetch);
      if (res && res.data && Array.isArray(res.data.postAds)) {
        setAdsRecommended(res.data.postAds);
         const total = res.data?.pagination?.totalPages || null;
         setAllAdsTotalPages(total);
       } else {
        setAdsRecommended([]);
         setAdsError("Could not fetch ads");
       }
     } catch {
      setAdsRecommended([]);
       setAdsError("Could not fetch ads");
     }
     setLoadingPremium(false);
   })();
 }, [allAdsPage, selectedLocationState, showAllPremium]);

 // Backend pagination fetch for Recent (when All cities + View All)
 useEffect(() => {
   if (selectedLocationState || !showAllRecent) return;
   const pageToFetch = allAdsRecentPage || 1;
   setLoadingRecent(true);
   setAdsError(null);
   (async () => {
     try {
      const res = await getAllActiveAds(pageToFetch);
      if (res && res.data && Array.isArray(res.data.postAds)) {
        setAdsRecent(res.data.postAds);
         const total = res.data?.pagination?.totalPages || null;
         setAllAdsRecentTotalPages(total);
       } else {
        setAdsRecent([]);
         setAdsError("Could not fetch ads");
       }
     } catch {
      setAdsRecent([]);
       setAdsError("Could not fetch ads");
     }
     setLoadingRecent(false);
   })();
 }, [allAdsRecentPage, selectedLocationState, showAllRecent]);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoadingBanners(true);
      setBannerError(null);
      try {
        const res = await getBanners();
        if (res && res.data && Array.isArray(res.data.banners)) {
          setBanners(res.data.banners);
        } else {
          setBanners([]);
          setBannerError("Could not fetch banners");
        }
      } catch (err) {
        setBanners([]);
        setBannerError("Could not fetch banners");
      }
      setLoadingBanners(false);
    };
    fetchBanners();
  }, []);

  // Category path helper and path-to-name map
  const getCategoryPath = (cat) => {
    if (cat && cat.categoryId) return cat.categoryId;
    return (cat.name || "others").toLowerCase().replace(/\s+/g, "-");
  };
  const pathToCategory = Object.fromEntries(
    categories.map(cat => ["/" + getCategoryPath(cat), cat.name])
  );

  const selectedCategory = pathToCategory[location.pathname];
  const filteredAds = selectedCategory
    ? ads.filter((ad) => ad.category === selectedCategory)
    : ads;
  const filteredAdsRecommended = selectedCategory
    ? adsRecommended.filter((ad) => ad.category === selectedCategory)
    : adsRecommended;
  const filteredAdsRecent = selectedCategory
    ? adsRecent.filter((ad) => ad.category === selectedCategory)
    : adsRecent;

  return (
    <div className="min-h-screen text-sm">
      {/* Header */}
       <Header />

      {/* Categories Top Bar (Mobile Only) */}
      <div className="sm:hidden top-14 bg-white z-10 p-1 pb-1 shadow">
        <div className="flex overflow-x-auto w-full gap-2 pb-1.5 scrollbar-hide">
          {loadingCategories ? (
            <div className="flex gap-2 min-w-max">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-2 min-w-[70px] max-w-[90px]">
                  <Skeleton className="h-5 w-5 mb-1 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : catError ? (
            <div className="px-3 py-2 text-red-600">Error loading categories</div>
          ) : (
            categories.map((cat) => (
              <div key={cat._id} onClick={() => navigate(`/ads/${getCategoryId(cat)}`)}
                className="flex-shrink-0 min-w-[60px] max-w-[90px] p-2 bg-white border border-gray-300 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100">
                <img className="text-base mb-1 h-5 w-5" src={cat.iconUrl} alt={cat.name} />
                <span className="text-[10px] text-center">{cat.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Advertisement below categories bar */}
<div className="sm:hidden w-full px-2 py-3 flex flex-col items-center">
  <span className="font-semibold text-xs text-gray-600 mb-2">Advertisements</span>
  <div className="flex flex-nowrap gap-3 justify-start w-full overflow-x-auto scrollbar-hide">
    {adImages.map((src, idx) => (
      <img
        key={idx}
        src={src}
        alt={`Ad Banner ${idx + 1}`}
        className="h-24 object-cover rounded-lg shadow border min-w-[220px] max-w-[400px]"
      />
    ))}
  </div>
</div>

      {/* Main Layout: Sidebar (desktop/tablet) */}
      <div className="flex flex-col sm:flex-row gap-5 px-2 items-start max-w-7xl mx-auto">
  {/* Sidebar: hidden on mobile, visible on sm+ */}
  <aside className="sticky">
    <div className="hidden sm:block top-20 h-120 w-58 md:w-44 lg:w-60 min-w-[160px] max-w-[250px] bg-white rounded-lg p-3 shadow overflow-y-auto">
      <h3 className="text-lg font-semibold mb-1 text-center">All Categories</h3>
      {loadingCategories ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow-md p-4 min-h-[120px]">
              <Skeleton className="w-12 h-12 rounded-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : catError ? (
        <div className="p-2 text-red-600">Failed to load categories</div>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat._id}
              className="px-2 py-3 border border-gray-300 rounded-xl mb-1 cursor-pointer flex items-center justify-between hover:bg-gray-100"
              onClick={() => navigate(`/ads/${getCategoryId(cat)}`)}>
              <img src={cat.iconUrl} alt={cat.name} className="h-5 w-5 text-xs font-semibold flex items-center" />
              <span className="mr-auto text-xs font-semibold sm:px-1.5">{cat.name}</span>
              <span>&gt;</span>
            </li>
          ))}
        </ul>
      )}
    </div>

  {/* Advertisement images below sidebar (desktop/tablet only) */}
<div className="hidden sm:flex flex-col items-center w-58 md:w-44 lg:w-60 min-w-[160px] max-w-[250px] mt-2 mb-4">
  <span className="font-semibold text-sm text-gray-600 mb-2">Advertisements</span>
  <div className="flex flex-col gap-3 w-full">
    {adImages.map((src, idx) => (
      <img
        key={idx}
        src={src}
        alt={`Ad Banner ${idx + 1}`}
        className="w-full h-25 object-cover rounded-lg shadow border max-w-[220px]"
      />
    ))}
  </div>
</div>
  </aside>

        {/* Main Section */}
        <main className="flex-1 mt-0 sm:mt-3 ml-0">

          {/* Post Ad Button */}
          <div className="bg-yellow-200 rounded-lg py-2 sm:py-4 text-center font-bold text-sm sm:text-xl mb-5 cursor-pointer hover:bg-yellow-400"
            onClick={() => navigate("/post-free-ad")} >
            Post Free AD
          </div>

          {/* Banner Section */}
          {loadingBanners ? (
            <div className="relative w-full h-64 sm:h-80 lg:h-96">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ) : bannerError ? (
            <div className="py-8 text-center text-red-600 font-semibold">{bannerError}</div>
          ) : (
            <div className="relative overflow-hidden rounded-lg shadow-md mb-4">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}>
              {banners.map((banner, index) => (
                <div key={banner._id || index} className="w-full flex-shrink-0">
                  {banner.link ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      <img
                        src={banner.image}
                        alt={banner.title || `Banner ${index + 1}`}
                        className="w-full h-38 sm:h-44 md:h-50 lg:h-72 object-cover rounded-lg"
                      />
                    </a>
                  ) : (
                    <img
                      src={banner.image}
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-38 sm:h-44 md:h-50 lg:h-72 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div> 
            {/* Dots */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner._id || index}
                  aria-label={`go to banner ${index + 1}`}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    index === current ? "bg-orange-500" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrent(index)}
                />
              ))}
            </div>
          </div>
        )}

           {/* LocalMart Recommended */}
          <h2 className="text-lg sm:text-lg font-semibold mb-2">LocalMart Recommended</h2>
        {(loadingAds || (!selectedLocationState && showAllPremium && loadingPremium)) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <Skeleton className="w-full h-32 rounded-lg mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : adsError ? (
          <div className="py-8 text-center text-red-600 font-semibold">
            {adsError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 sm:p-0 sm:gap-3 gap-3">
            {(
              showAllPremium
                ? (selectedLocationState ? filteredAdsRecommended.slice((premiumPage - 1) * PREMIUM_PAGE_SIZE, premiumPage * PREMIUM_PAGE_SIZE) : filteredAdsRecommended)
                : filteredAdsRecommended.slice(0, 10)
            ).map((ad) => (
              <div
                key={ad.id || ad._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-400 p-2.5 sm:p-3 hover:shadow-lg hover:scale-102 transition cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/ad/${ad.id || ad._id}`, { state: { from: "homepage", categoryName: ad.category?.name, categoryPath: `/ads/${ad.category?.id || ad.category?._id}` } })}
              >
                <img
                  src={(ad.images && ad.images[0]) ? ad.images[0] : "/no-image.png"}
                  alt={ad.title}
                  className="w-full h-34 sm:h-35 object-cover rounded-xl"
                />
                <div className="mt-1 flex flex-col flex-grow">
                  <div className="font-bold text-base sm:text-md">₹ {ad.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{ad.title}</div>
                  <div className="flex items-center text-gray-600 text-[9px] sm:text-xs sm:mt-1">
                    <span className="mr-1"><FaMapMarkerAlt className="text-orange-500 text-md" /></span> {ad.location.city}
                    <span className="ml-auto text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px]">
                      {(() => {
                        const d = new Date(ad.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredAdsRecommended.length > 10 && (
          <div className="flex justify-center items-center gap-3 mt-3">
            <button
              className="px-2 py-1 sm:px-5 sm:py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow"
              onClick={() => {
                setShowAllPremium((prev) => {
                  const next = !prev;
                  if (next) setPremiumPage(1);
                  return next;
                });
              }}>
              {showAllPremium ? "Show Less" : "View All"}
            </button>
            {showAllPremium && (
              <div className="flex items-center gap-2">
                {(() => { 
                  const totalPages = selectedLocationState
                    ? Math.max(1, Math.ceil(filteredAdsRecommended.length / PREMIUM_PAGE_SIZE))
                    : (allAdsTotalPages || Math.max(1, allAdsPage));
                  return (
                  <>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      disabled={selectedLocationState ? premiumPage <= 1 : allAdsPage <= 1}
                      onClick={() => selectedLocationState ? setPremiumPage((p) => Math.max(1, p - 1)) : setAllAdsPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <span className="text-xs text-gray-700">Page {selectedLocationState ? premiumPage : allAdsPage} of {totalPages}</span>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      disabled={selectedLocationState ? premiumPage >= totalPages : (allAdsTotalPages ? allAdsPage >= totalPages : false)}
                      onClick={() => selectedLocationState ? setPremiumPage((p) => Math.min(totalPages, p + 1)) : setAllAdsPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </>
                ); })()}
              </div>
            )}
          </div>
        )}

          {/* Recently Ad Grid */}
         <h2 className="text-lg sm:text-lg font-semibold mb-2 mt-4">Recently Added</h2>
        {(loadingAds || (!selectedLocationState && showAllRecent && loadingRecent)) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <Skeleton className="w-full h-32 rounded-lg mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : adsError ? (
          <div className="py-8 text-center text-red-600 font-semibold">
            {adsError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-3 gap-2">
            {(
              showAllRecent
                ? (selectedLocationState ? filteredAdsRecent.slice((recentPage - 1) * RECENT_PAGE_SIZE, recentPage * RECENT_PAGE_SIZE) : filteredAdsRecent)
                : filteredAdsRecent.slice(0, 10)
            ).map((ad) => (
              <div
                key={ad.id || ad._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-400 p-2 sm:p-3 hover:shadow-lg hover:scale-102 transition cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/ad/${ad.id || ad._id}`, { state: { from: "homepage", categoryName: ad.category?.name, categoryPath: `/ads/${ad.category?.id || ad.category?._id}` } })}
              >
                <img
                  src={(ad.images && ad.images[0]) ? ad.images[0] : "/no-image.png"}
                  alt={ad.title}
                  className="w-full h-34 sm:h-35 object-cover rounded-xl"
                />
                <div className="mt-1 flex flex-col flex-grow">
                  <div className="font-bold text-base sm:text-md">₹ {ad.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{ad.title}</div>
                  <div className="flex items-center text-gray-600 text-[9px] sm:text-xs sm:mt-1">
                    <span className="mr-1"><FaMapMarkerAlt className="text-orange-500 text-md" /></span> {ad.location.city}
                    <span className="ml-auto text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px]">
                      {(() => {
                        const d = new Date(ad.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredAdsRecent.length > 10 && (
          <div className="flex justify-center items-center gap-3 mt-3">
            <button
              className="px-2 py-1 sm:px-5 sm:py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow"
              onClick={() => {
                setShowAllRecent((prev) => {
                  const next = !prev;
                  if (next) setRecentPage(1);
                  return next;
                });
              }}
            >
              {showAllRecent ? "Show Less" : "View All"}
            </button>
            {showAllRecent && (
              <div className="flex items-center gap-2">
                {(() => { 
                  const totalPages = selectedLocationState
                    ? Math.max(1, Math.ceil(filteredAdsRecent.length / RECENT_PAGE_SIZE))
                    : (allAdsRecentTotalPages || Math.max(1, allAdsRecentPage));
                  return (
                  <>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      disabled={selectedLocationState ? recentPage <= 1 : allAdsRecentPage <= 1}
                      onClick={() => selectedLocationState ? setRecentPage((p) => Math.max(1, p - 1)) : setAllAdsRecentPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <span className="text-xs text-gray-700">Page {selectedLocationState ? recentPage : allAdsRecentPage} of {totalPages}</span>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      disabled={selectedLocationState ? recentPage >= totalPages : (allAdsRecentTotalPages ? allAdsRecentPage >= totalPages : false)}
                      onClick={() => selectedLocationState ? setRecentPage((p) => Math.min(totalPages, p + 1)) : setAllAdsRecentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </>
                ); })()}
              </div>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
