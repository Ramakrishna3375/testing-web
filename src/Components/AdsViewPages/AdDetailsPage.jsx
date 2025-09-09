import { useState, useEffect } from "react";
import { getAllCategories, getAllActiveAds } from "../../Services/api";
import Header from '../Header&Footer/Header';
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
    <Header />

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
                  <div className="text-sm md:text-base text-gray-500 font-medium break-words mt-1">{ad.contactInfo.name}</div>
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
                  type="submit" onClick={() => navigate("/chat")}
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
