import { useState, useEffect } from "react";
import { getAllCategories, getAllActiveAds } from "../../Services/api";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { IoIosShareAlt } from "react-icons/io";
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import LocalMartIconBot from '../../assets/Website logos/LocalMartIconBot.png';
import InstagramIcon from '../../assets/Website logos/instagram.png';
import FacebookIcon from '../../assets/Website logos/facebook.jpg';
import TwitterIcon from '../../assets/Website logos/twitter logo.jpg';
import LinkedinIcon from '../../assets/Website logos/linkedin.png';
import iPhone13ProMax from '../../assets/products/iphone13promax.avif';

// Dynamically fetched categories

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [loadingAd, setLoadingAd] = useState(true);
  const [ad, setAd] = useState(null);
  const [adError, setAdError] = useState(null);
  // Simple login detection: change per your app's logic if needed
  const isLoggedIn = !!sessionStorage.getItem('user') || !!sessionStorage.getItem('token');

  const getCategoryId = (cat) => cat._id;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCatError(null);
      try {
        const res = await getAllCategories();
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

  // Fetch ad by id
  useEffect(() => {
    const fetchAd = async () => {
      setLoadingAd(true);
      setAdError(null);
      try {
        const res = await getAllActiveAds();
        if (res && res.data && Array.isArray(res.data.postAds)) {
          const found = res.data.postAds.find(item => (item.id || item._id) === id);
          setAd(found || null);
          if (!found) setAdError("Ad not found");
        } else {
          setAd(null);
          setAdError("Could not fetch ads");
        }
      } catch (err) {
        setAd(null);
        setAdError("Error fetching ad");
      }
      setLoadingAd(false);
    };
    fetchAd();
  }, [id]);

  const adImages = ad && ad.images && ad.images.length > 0 ? ad.images : "";

  const handlePrev = () => {
    setCurrentImgIndex((prev) =>
      prev === 0 ? adImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImgIndex((prev) =>
      prev === adImages.length - 1 ? 0 : prev + 1
    );
  };

  if (loadingAd) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>
    );
  }
  if (adError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">{adError}</div>
    );
  }
  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Ad not found.
      </div>
    );
  }

  const date = new Date(ad.createdAt);
const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth()+1).padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <div className="text-sm">
{/* Header */}
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
                  <option key={cat._id} value={getCategoryId(cat)}>
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


      {/* Breadcrumb */}
<div className="flex flex-row sm:flex-row items-start sm:items-center text-sm sm:text-xl font-semibold max-w-6xl mx-auto py-3 px-4 sm:px-0">
  <div className="flex flex-wrap gap-1 sm:gap-2 ml-2 sm:ml-9">
    Home &gt; Categories &gt;
    <span className="text-orange-400 ml-1">{ad.category && ad.category.name}</span>
  </div>

  <div className="flex items-center sm:mt-0 ml-auto sm:ml-auto gap-4">
    <span className="text-xl sm:text-3xl cursor-pointer hover:text-blue-500" aria-label="Share">
      <IoIosShareAlt />
    </span>
    <span className="text-2xl sm:text-4xl cursor-pointer sm:mr-4 hover:text-orange-600" aria-label="Favorite">𖹭</span>
  </div>
</div>

      {/* Product Section */}
      <div className="max-w-7xl px-2 md:px-6 lg:px-8 pb-5 sm:pb-10 mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 xl:gap-14">

          {/* Image Carousel */}
          <div className="relative w-full max-w-xl mx-auto lg:mx-0 flex items-center justify-center shadow bg-white rounded-2xl aspect-[4/2.5] h-[19rem] sm:h-[25rem] lg:h-auto">
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 text-black px-2 sm:px-3 py-2 rounded-l-lg hover:bg-gray-300 z-10"
            >
              ←
            </button>
            <img
              src={adImages[currentImgIndex]}
              alt={`Ad image ${currentImgIndex + 1}`}
              className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg w-full h-full object-contain bg-white select-none"
            />
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 text-black px-2 sm:px-3 py-2 rounded-r-lg hover:bg-gray-300 z-10"
            >
              →
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between mt-6 lg:mt-0 gap-6">
            <div className="border border-gray-200 rounded-2xl shadow bg-white p-4 md:p-5 flex flex-col gap-3">
              <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900 leading-snug">₹ {ad.price}</div>
              <div className="text-base sm:text-xl md:text-2xl font-semibold text-gray-800">{ad.title}</div>
            </div>
            <div className="border border-gray-200 rounded-2xl shadow bg-white p-4 md:p-5 flex flex-col gap-4">
              <div className="flex flex-row sm:flex-row gap-4 sm:gap-6 md:gap-8">
                <div className="flex-1 text-center">
                  <strong>👤 Owner</strong>
                  <div className="text-sm md:text-base text-gray-500 font-medium break-words mt-1">{ad.name}</div>
                </div>
                <div className="flex-1 text-center">
                  <strong>📍 Location</strong>
                  <div className="text-sm md:text-base text-gray-500 font-medium break-words mt-1">{ad.location && (ad.location.city || ad.location.address)}</div>
                </div>
                <div className="flex-1 text-center">
                  <strong>📅 Date Posted</strong>
                  <div className="text-sm md:text-base text-gray-500 font-medium mt-1">{formatted}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <button
                  type="submit"
                  className="border border-gray-200 shadow bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition cursor-pointer w-full font-semibold"
                >
                  💬 Chat with seller
                </button>
                <button className="border border-gray-200 shadow rounded-lg py-2 px-4 hover:bg-orange-200 transition cursor-pointer font-semibold flex items-center justify-center gap-2 w-full">
                  <span className="border rounded-full text-white bg-amber-600 px-2 py-0.5">%</span>
                  Make an offer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 max-w-6xl mx-auto px-2 sm:px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal mb-5">Description</h2>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 whitespace-pre-line">
            {ad.description && ad.description.trim()}
          </p>
        </div>
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

export default ProductDetailPage;
