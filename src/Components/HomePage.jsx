import { useNavigate, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
// Website logos and banners
import LocalMartIcon from '../assets/Website logos/LocalMartIcon.png';
import LocalMartIconBot from '../assets/Website logos/LocalMartIconBot.png';
import InstagramIcon from '../assets/Website logos/instagram.png';
import FacebookIcon from '../assets/Website logos/facebook.jpg';
import TwitterIcon from '../assets/Website logos/twitter logo.jpg';
import LinkedinIcon from '../assets/Website logos/linkedin.png';
import advertise1 from '../assets/Website logos/advertise1.jpg';
import advertise2 from '../assets/Website logos/advertise2.jpg';
import Banner1 from '../assets/Website logos/Banner1.png';
import Banner2 from '../assets/Website logos/Banner2.png';
import Botban from '../assets/Website logos/botban.jpg';
import Bottomb3 from '../assets/Website logos/bottomb3.jpg';
import Botban1 from '../assets/Website logos/botban1.jpg';
// Product/ad images
import CrosscutSpeaker from '../assets/products/Crosscut speaker.jpg';
import Pixel7a from '../assets/products/pixel 7a.avif';
import TitanCar from '../assets/products/Titan car.jpg';
import ModernHouse from '../assets/products/Modern house.jpeg';
import OfficeChair from '../assets/products/office chair.jpg';
import {FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook,
  FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt
} from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { getAllCategories, getAllActiveAds, getBanners } from "../Services/api";

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

 const ads = [
  {
    _id: 29,
    images: [
      CrosscutSpeaker,
      Pixel7a,
    ],
    title: "CrossCut Speaker",
    price: "28,000",
    location: "Uppal, Hyderabad",
    time: "Today",
    category: "electronics-appliances"
  },
  {
    _id: 30,
    images: [
      Pixel7a,
    ],
    title: "Pixel 7A",
    price: "10,000",
    location: "Karimnagar",
    time: "Today",
    category: "mobiles-accessories"
  },
  {
    _id: 31,
    images: [
      TitanCar,
    ],
    title: "Titan Car",
    price: "6.5 Lakh",
    location: "Peddapalli",
    time: "Today",
    category: "cars"
  },
  {
    _id: 32,
    images: [
      ModernHouse,
    ],
    title: "Modern House",
    price: "50 Lakh",
    location: "Nizamabad",
    time: "Today",
    category: "furniture"
  },
  {
    _id: 33,
    images: [
      OfficeChair,
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Ameerpet, Hyderabad",
    time: "Today",
    category: "furniture"
  },
  {
    _id: 34,
    images: [
      OfficeChair,
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Warangal",
    time: "Today",
    category: "furniture"
  },
  {
    _id: 35,
    images: [
      CrosscutSpeaker,
      Pixel7a,
    ],
    title: "CrossCut Speaker",
    price: "28,000",
    location: "Uppal, Hyderabad",
    time: "Today",
    category: "electronics-appliances"
  },
  {
    _id: 36,
    images: [
      Pixel7a,
    ],
    title: "Pixel 7A",
    price: "10,000",
    location: "Karimnagar",
    time: "Today",
    category: "mobiles-accessories"
  },
  {
    _id: 37,
    images: [
      TitanCar,
    ],
    title: "Titan Car",
    price: "6.5 Lakh",
    location: "Peddapalli",
    time: "Today",
    category: "cars"
  },
  {
    _id: 38,
    images: [
      ModernHouse,
    ],
    title: "Modern House",
    price: "50 Lakh",
    location: "Nizamabad",
    time: "Today",
    category: "furniture"
  },
  {
    _id: 39,
    images: [
      OfficeChair,
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Ameerpet, Hyderabad",
    time: "Today",
    category: "furniture"
  },
  {
    _id: 40,
    images: [
      OfficeChair,
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Warangal",
    time: "Today",
    category: "furniture"
  },
];

const banners = [
  Banner1, Banner2, Botban, Bottomb3, Botban1
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
    const fetchAds = async () => {
      setLoadingAds(true);
      setAdsError(null);
      try {
        const res = await getAllActiveAds();
        // Use postAds array from response
        if (res && res.data && Array.isArray(res.data.postAds)) {
          setAds(res.data.postAds);
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
<header className="sticky top-0 z-50 bg-white p-2 md:p-3 border-b border-gray-200">
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
             {/* Mobile login button */}
             {!isLoggedIn && (
               <div className="sm:hidden ml-auto mt-1">
                 <button
                   onClick={() => navigate("/login")}
                   className="flex items-center bg-orange-500 text-white text-xs rounded-sm p-1.5 hover:underline"
                 >
                   <VscAccount className="text-sm sm:text-xl mr-1" />
                   Login | Signup
                 </button>
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
             <div className="flex items-center border border-gray-400 rounded-full h-10 w-full md:w-80 lg:w-[340px] max-w-full overflow-hidden ml-0 md:ml-6">
               <input
                 type="text"
                 className="flex-1 px-3 py-1 text-xs sm:text-sm md:text-base bg-white outline-none placeholder-gray-500 min-w-0"
                 placeholder="Search product"
               />
               <button className="bg-orange-500 text-white text-xs sm:text-sm px-4 h-full rounded-l-none rounded-r-full hover:bg-orange-600 transition min-w-[70px]">
                 Search
               </button>
             </div>
           </div>
     
           {/* Right side: desktop login button */}
           {!isLoggedIn && (
             <div className="hidden sm:flex justify-end mt-2 w-full sm:w-auto md:mt-0 sm:h-10">
               <button
                 onClick={() => navigate("/login")}
                 className="flex items-center bg-orange-500 text-white rounded-full px-4 py-2 text-xs md:text-sm lg:text-base font-semibold hover:underline min-h-[40px]"
               >
                 <VscAccount className="text-xs sm:text-sm md:text-lg mr-2" />
                 Login | Signup
               </button>
             </div>
           )}
     
         </div>
       </div>
     </header>

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
          <div className="relative overflow-hidden rounded-lg shadow-md mb-4">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}>
              {banners.map((banner, index) => (
                <div key={banner._id || index} className="w-full flex-shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-38 sm:h-44 md:h-50 lg:h-72 object-cover rounded-lg"
                  />
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

           {/* LocalMart Recommended */}
          <h2 className="text-lg sm:text-lg font-semibold mb-2">LocalMart Recommended</h2>
        {loadingAds ? (
          <div className="py-8 text-center text-xl text-blue-600 font-semibold">
            Loading ads . . .
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
                onClick={() => navigate(`/ad/${ad.id}`)}
              >
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-full h-34 sm:h-35 object-cover rounded-xl"
                />
                <div className="mt-1 flex flex-col flex-grow">
                  <div className="font-bold text-base sm:text-md">₹ {ad.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{ad.title}</div>
                  <div className="flex items-center text-gray-600 text-[9px] sm:text-xs sm:mt-1">
                    <span className="mr-1"><FaMapMarkerAlt className="text-md" /></span> {ad.location.city}
                  </div>
                  <div className="flex-grow" />
                  <div className="flex items-center justify-between mt-1 sm:mt-2 flex-wrap">
                    <span className="text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px]">
                      {(() => {
                        const d = new Date(ad.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                    <span className="text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px] hover:underline cursor-pointer">
                       View Details
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
            Loading ads . . .
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
                onClick={() => navigate(`/ad/${ad.id}`)}
              >
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-full h-34 sm:h-35 object-cover rounded-xl"
                />
                <div className="mt-1 flex flex-col flex-grow">
                  <div className="font-bold text-base sm:text-md">₹ {ad.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{ad.title}</div>
                  <div className="flex items-center text-gray-600 text-[9px] sm:text-xs sm:mt-1">
                    <span className="mr-1"><FaMapMarkerAlt className="text-md" /></span> {ad.location.city}
                  </div>
                  <div className="flex-grow" />
                  <div className="flex items-center justify-between mt-1 sm:mt-2 flex-wrap">
                    <span className="text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px]">
                      {(() => {
                        const d = new Date(ad.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                    <span className="text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px] hover:underline">
                       View Details
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
      <footer className="bg-white mt-5 p-4 pt-8 pb-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-2 sm:gap-8">
          <div>
            <img src={LocalMartIconBot} alt="Local Mart Logo" className="h-9" />
            <div className="text-gray-800 max-w-xs font-semibold mt-1 sm:mt-3">
              We gather and verify service provider details across various categories & display them on our website
            </div>
            <div className="flex gap-6 mt-3 sm:mt-8">
              <img src={InstagramIcon} onClick={() => window.open("https://www.instagram.com/localmart", "_blank")} alt="Instagram" className="cursor-pointer h-6" />
              <img src={FacebookIcon} onClick={() => window.open("https://www.facebook.com/localmart", "_blank")} alt="Facebook" className="cursor-pointer h-6" />
              <img src={TwitterIcon} onClick={() => window.open("https://www.twitter.com/localmart", "_blank")} alt="Twitter" className="cursor-pointer h-6" />
              <img src={LinkedinIcon} onClick={() => window.open("https://www.linkedin.com/company/localmart", "_blank")} alt="LinkedIn" className="cursor-pointer h-6" />            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Our Services</h4>
            <ul className="text-gray-900">
              <li onClick={() => navigate("/business-2-business")} className="cursor-pointer mb-1 sm:mb-2">Business 2 Business</li>
              <li onClick={() => navigate("/booking-services")} className="cursor-pointer mb-1 sm:mb-2">Booking Services</li>
              <li onClick={() => navigate("/food-delivery")} className="cursor-pointer mb-1 sm:mb-2">Food Delivery</li>
              <li onClick={() => navigate("/local-businesses")} className="cursor-pointer mb-1 sm:mb-2">Local Businesses</li>
              <li onClick={() => navigate("/e-commerce")} className="cursor-pointer mb-1 sm:mb-2">E-Commerce</li>
            </ul>
          </div>
          <div>
            <ul className="text-gray-900"><br />
              <li onClick={() => navigate("/advertise-here")} className="cursor-pointer mb-1 sm:mb-2">Advertise Here</li>
              <li onClick={() => navigate("/buy-sell")} className="cursor-pointer mb-1 sm:mb-2">Buy & Sell</li>
              <li onClick={() => navigate("/local-stores")} className="cursor-pointer mb-1 sm:mb-2">Local Stores</li>
              <li onClick={() => navigate("/explore-brands")} className="cursor-pointer mb-1 sm:mb-2">Explore Brands</li>
              <li onClick={() => navigate("/shopping")} className="cursor-pointer mb-1 sm:mb-2">Shopping</li>
            </ul>
          </div>
          <div>
            <ul className="text-gray-900"><br />
              <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-1 sm:mb-2">Terms & Conditions</li>
              <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-1 sm:mb-2">Privacy Policy</li>
              <li onClick={() => navigate("/cancellation-policy")} className="cursor-pointer mb-1 sm:mb-2">Cancellation Policy</li>
              <li onClick={() => navigate("/local-mart")} className="cursor-pointer mb-1 sm:mb-2">Local Mart</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
