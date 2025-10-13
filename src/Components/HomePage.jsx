import { useNavigate, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
import advertise1 from '../assets/Website logos/advertise1.jpg';
import advertise2 from '../assets/Website logos/advertise2.jpg';
import {FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook,
  FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt
} from "react-icons/fa";
import { getAllCategories, getAllActiveAds, getBanners } from "../Services/api";
import Header from './Header&Footer/Header';
import Footer from "./Header&Footer/Footer";

// Helper: map category names to icons from API
const categoryIcons = {
  "Mobiles": <FaMobileAlt />, 
  "Electronics & Appliances": <FaTv />, 
  "Vehicles": <FaCar />, 
  "Real Estate": <FaCity />, 
  "Jobs": <FaBriefcase />, 
  "Services": <FaTools />, 
  "Furniture": <FaCouch />, 
  "Fashion": <FaTshirt />, 
  "Books, Sports & Hobbies": <FaBook />, 
  "Pets": <FaPaw />, 
  "Others": <FaPuzzlePiece />
};

const adImages = [
  advertise1, advertise2
];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // login detection
  const isLoggedIn = !!sessionStorage.getItem('user') || !!sessionStorage.getItem('token');
  const [current, setCurrent] = useState(0);
  const [showAllPremium, setShowAllPremium] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [adsError, setAdsError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannerError, setBannerError] = useState(null);

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
    let allAds = [];
    let selectedLocation = null;

    const applyFilter = () => {
      if (!Array.isArray(allAds)) return;
      try {
        const storedLocation = sessionStorage.getItem('selectedLocation');
        selectedLocation = storedLocation ? JSON.parse(storedLocation) : null;
      } catch {}
      if (selectedLocation && selectedLocation.name) {
        const filtered = allAds.filter(ad => {
          const city = ad?.location?.city || ad?.city;
          return city && city.toLowerCase() === selectedLocation.name.toLowerCase();
        });
        setAds(filtered);
      } else {
        setAds(allAds);
      }
    };

    const fetchAds = async () => {
      setLoadingAds(true);
      setAdsError(null);
      try {
        const res = await getAllActiveAds();
        if (res && res.data && Array.isArray(res.data.postAds)) {
          allAds = res.data.postAds;
          applyFilter();
        } else {
          setAds([]);
          setAdsError("Could not fetch ads");
        }
      } catch (err) {
        setAds([]);
        setAdsError("Could not fetch ads");
      }
      setLoadingAds(false);
    };

    fetchAds();

    const onLocChange = (e) => {
      selectedLocation = e?.detail || null;
      applyFilter();
    };
    window.addEventListener('selectedLocationChanged', onLocChange);
    return () => window.removeEventListener('selectedLocationChanged', onLocChange);
  }, []);

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

  return (
    <div className="min-h-screen text-sm">
      {/* Header */}
       <Header />

      {/* Categories Top Bar (Mobile Only) */}
      <div className="sm:hidden top-14 bg-white z-10 p-1 pb-1 shadow">
        <div className="flex overflow-x-auto w-full gap-2 pb-1.5 scrollbar-hide">
          {loadingCategories ? (
            <div className="px-3 py-2">Loading...</div>
          ) : catError ? (
            <div className="px-3 py-2 text-red-600">Error loading categories</div>
          ) : (
            categories.map((cat) => (
              <div key={cat._id} onClick={() => navigate(`/ads/${getCategoryId(cat)}`)}
                className="flex-shrink-0 min-w-[60px] max-w-[90px] p-2 bg-white border border-gray-300 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100">
                <img className="text-base mb-1 h-5 w-5" src={cat.iconUrl  || categoryIcons[cat.name]} alt={cat.name} />
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
        <div className="p-2">Loading...</div>
      ) : catError ? (
        <div className="p-2 text-red-600">Failed to load categories</div>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat._id}
              className="px-2 py-3 border border-gray-300 rounded-xl mb-1 cursor-pointer flex items-center justify-between hover:bg-gray-100"
              onClick={() => navigate(`/ads/${getCategoryId(cat)}`)}>
              <img src={cat.iconUrl || categoryIcons[cat.name]} alt={cat.name} className="h-5 w-5 text-xs font-semibold flex items-center" />
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
            <div className="py-8 text-center text-xl text-blue-600 font-semibold">Loading . . .</div>
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
        {loadingAds ? (
          <div className="py-8 text-center text-xl text-blue-600 font-semibold">
            Loading . . .
          </div>
        ) : adsError ? (
          <div className="py-8 text-center text-red-600 font-semibold">
            {adsError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 sm:p-0 sm:gap-3 gap-3">
            {(showAllPremium ? filteredAds : filteredAds.slice(0, 10)).map((ad) => (
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
        {filteredAds.length > 10 && (
          <div className="flex justify-center mt-3">
            <button
              className="px-2 py-1 sm:px-5 sm:py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow"
              onClick={() => setShowAllPremium((prev) => !prev)}>
              {showAllPremium ? "Show Less" : "View All"}
            </button>
          </div>
        )}

          {/* Recently Ad Grid */}
         <h2 className="text-lg sm:text-lg font-semibold mb-2 mt-4">Recently Added</h2>
        {loadingAds ? (
          <div className="py-8 text-center text-xl text-blue-600 font-semibold">
            Loading . . .
          </div>
        ) : adsError ? (
          <div className="py-8 text-center text-red-600 font-semibold">
            {adsError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-3 gap-2">
            {(showAllRecent ? filteredAds : filteredAds.slice(0, 10)).map((ad) => (
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
        {filteredAds.length > 10 && (
          <div className="flex justify-center mt-3">
            <button
              className="px-2 py-1 sm:px-5 sm:py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow"
              onClick={() => setShowAllRecent((prev) => !prev)}
            >
              {showAllRecent ? "Show Less" : "View All"}
            </button>
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
