import { useState, useEffect } from "react";
import { getAllCategories, getAllActiveAds } from "../../Services/api";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const MobilesPage = () => {
  const navigate = useNavigate();
  // login detection
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catError, setCatError] = useState(null);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [adsError, setAdsError] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [sortOption, setSortOption] = useState("new");

  const { categoryId } = useParams();

  // Extract unique brands from ads data
  const getBrandsFromAds = (ads) => {
    const brandsSet = new Set();
    ads.forEach(ad => {
      if (ad.categorySpecific && ad.categorySpecific.brand) {
        brandsSet.add(ad.categorySpecific.brand);
      }
    });
    return Array.from(brandsSet).sort();
  };

  // Filtering ads by brand name or categoryId (URL param)
  const productsPerPage = 15;
  let filteredAds = ads;
  if (categoryId) {
    filteredAds = filteredAds.filter(ad => ad.category && ad.category.id === categoryId);
  }

  // Only show brands in current category
  const brands = getBrandsFromAds(filteredAds);

  // Now further filter ads if brandFilter is set
  if (brandFilter) {
    filteredAds = filteredAds.filter(ad => ad.categorySpecific && ad.categorySpecific.brand === brandFilter);
  }

  // Sort logic
  const parsePrice = price => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    // Remove commas, '₹', 'Lakh', etc.
    let p = price.replace(/[^\d.]/g, '');
    if (/lakh/i.test(price)) p = parseFloat(p) * 100000;
    return parseFloat(p) || 0;
  };
  if (sortOption === 'low') {
    filteredAds = [...filteredAds].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortOption === 'high') {
    filteredAds = [...filteredAds].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortOption === 'new') {
    filteredAds = [...filteredAds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalPages = Math.ceil(filteredAds.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleAds = filteredAds.slice(startIndex, startIndex + productsPerPage);

  // Fetch categories on mount
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

  const currentCategory = categories.find(cat => (cat.id || cat._id) === categoryId);

  return (
    <div className="text-sm">
      {/* Header */}
      <Header />

            {/* Mobile brands: horizontal scroll - dynamic */}
            <nav className="block md:hidden w-full overflow-x-auto mb-3 p-1">
            <ul className="flex gap-2">
            <li
            key="all-brands"
            className={`min-w-[72px] px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 flex flex-col items-center cursor-pointer hover:bg-gray-100 ${!brandFilter ? "bg-orange-100 font-bold" : ""}`}
            onClick={() => setBrandFilter(null)}
            >
            <span className="mb-0.5 truncate text-black">All Brands</span>
            </li>
            {brands.map((brand) => (
            <li
            key={brand}
            className={`min-w-[72px] px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 flex flex-col items-center cursor-pointer hover:bg-gray-100 ${brandFilter === brand ? "bg-orange-100 font-bold" : ""}`}
            onClick={() => setBrandFilter(brand)}
            >
            <span className="mb-0.5 truncate text-black">{brand}</span>
            </li>
            ))}
            </ul>
            </nav>

      <div className="flex max-w-7xl mx-auto mt-1 gap-3 items-start">
        {/* Sidebar for desktop (lg) -- dynamic brands */}
        <aside className="hidden lg:block sticky top-20 h-120 w-60 min-w-[180px] max-w-[260px] border border-gray-300 bg-white rounded-lg p-4 shadow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-1">Brands</h3>
          <ul className="list-none">
            <li
              key="all-brands-d"
              className={`text-gray-700 hover:font-medium hover:text-black px-2 py-2 border border-gray-300 text-sm rounded-lg mb-1 cursor-pointer flex items-center justify-between ${!brandFilter ? "bg-orange-100 font-bold" : ""}`}
              onClick={() => setBrandFilter(null)}
            >
              <span className="ml-2">All Brands</span>
              <span className="font-bold">&gt;</span>
            </li>
            {brands.map((brand) => (
              <li
                key={brand}
                className={`text-gray-500 px-2 py-2 border border-gray-300 text-sm rounded-lg mb-1 cursor-pointer flex items-center justify-between hover:font-medium hover:text-black ${brandFilter === brand ? "bg-orange-100 font-bold" : ""}`}
                onClick={() => setBrandFilter(brand)}
              >
                <span className="ml-2">{brand}</span>
                <span className="font-bold">&gt;</span>
              </li>
            ))}
          </ul>
        </aside>
        {/* Sidebar for md (tablet) -- dynamic brands */}
        <aside className="hidden md:block lg:hidden sticky top-20 h-120 w-36 min-w-[90px] max-w-[130px] border border-gray-300 bg-white rounded-lg p-2 shadow overflow-y-auto mr-2">
          <h3 className="text-md font-semibold mb-1 text-center">Brands</h3>
          <ul>
            <li
              key="all-brands-m"
              className={`px-1 py-1 border border-gray-300 rounded-md mb-1 text-[13px] text-gray-700 cursor-pointer flex items-center gap-1 hover:font-medium hover:text-black ${!brandFilter ? "bg-orange-100 font-bold" : ""}`}
              onClick={() => setBrandFilter(null)}
            >
              <span>All Brands</span>
            </li>
            {brands.map((brand) => (
              <li
                key={brand}
                className={`px-1 py-1 border border-gray-300 rounded-md mb-1 text-[13px] text-gray-600 cursor-pointer flex items-center gap-1 hover:font-medium hover:text-black ${brandFilter === brand ? "bg-orange-100 font-bold" : ""}`}
                onClick={() => setBrandFilter(brand)}
              >
                <span>{brand}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Section. */}
        <main className="flex-1 text-xs">
          <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between mb-2 border-b border-gray-400 p-2">
  <div className="w-full sm:w-auto">
    <h2 className="text-base font-semibold">
      {filteredAds.length > 0
      ? filteredAds[0].category?.name : "Category"}{" "}
      <span className="block sm:inline-flex text-gray-500 text-[9px] sm:text-xs mt-1 sm:mt-0">
        (Showing {filteredAds.length === 0 ? 0 : startIndex + 1}-
        {Math.min(startIndex + productsPerPage, filteredAds.length)} of {filteredAds.length} products)
      </span>
    </h2>
    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 text-[9px] sm:text-xs mt-1 text-gray-500">
      <span className="text-black sm:font-semibold">Sort By</span>
      <span
        className={`cursor-pointer hover:underline ${sortOption === 'low' ? 'text-orange-600 font-semibold underline' : ''}`}
        onClick={() => { setSortOption('low'); setCurrentPage(1); }}
      >
        Price - Low To High
      </span>
      <span
        className={`cursor-pointer hover:underline ${sortOption === 'high' ? 'text-orange-600 font-semibold underline' : ''}`}
        onClick={() => { setSortOption('high'); setCurrentPage(1); }}
      >
        Price - High To Low
      </span>
      <span
        className={`cursor-pointer hover:underline ${sortOption === 'new' ? 'text-orange-600 font-semibold underline' : ''}`}
        onClick={() => { setSortOption('new'); setCurrentPage(1); }}
      >
        Newly Added
      </span>
    </div>
  </div>
  <div className="flex gap-2 sm:gap-4 items-center mt-2 sm:mt-0 ml-0 sm:ml-4">
    <span className="text-3xl sm:text-4xl mr-2 cursor-pointer hover:text-orange-500">𖹭</span>
    <button
      onClick={() => setViewMode("grid")}
      className={`p-1 text-2xl sm:text-3xl rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      aria-label="Grid view">
      ▦
    </button>
    <button
      onClick={() => setViewMode("list")}
      className={`p-1 text-2xl sm:text-3xl rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      aria-label="List view"
    >
      ≡
    </button>
  </div>
</div>

          {/* Ads View section */}
          {loadingAds ? (
  <div className="flex justify-center items-center h-40">
    <p className="text-blue-600 text-lg font-semibold">Loading ads...</p>
  </div>
) : adsError ? (
  <div className="flex justify-center items-center h-40">
    <p className="text-red-600 text-lg font-semibold">{adsError}</p>
  </div>
) : visibleAds.length > 0 ? (
<div className={`p-2 sm:p-2 sm:mr-2 mt-2
  ${viewMode === "grid" 
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4" 
    : "flex flex-col gap-2"} 
  ${viewMode === "list" ? "p-3 sm:p-0 m-2 md:ml-1 gap-3" : ""}`}>
  {visibleAds.map((ad, idx) => (
    <div
      key={ad.id || ad._id || idx}
      className={`border border-gray-400 bg-white rounded-sm sm:rounded-xl shadow-md p-2.5 sm:p-2 md:p-2.5 transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer
        ${viewMode === "list" ? "flex flex-row sm:flex-row gap-3 sm:gap-5 sm:items-center w-full md:w-150 lg:w-200" : "sm:w-47 md:w-full"}`}
      onClick={() => navigate(`/ad/${ad.id || ad._id}`, { state: { from: "category", categoryName: currentCategory?.name, categoryPath: `/ads/${categoryId}` } })}>
      <img src={(ad.images && ad.images[0]) ? ad.images[0] : "/no-image.png"} alt={ad.title}
        className={`rounded-lg ${viewMode === "grid"
            ? "w-full h-34 sm:h-30 md:h-32 lg:w-40 lg:h-30 object-cover" 
            : "w-35 sm:w-32 h-22"} `}
      />
      <div className={`${viewMode === "list" ? "flex flex-col justify-between flex-1 mt-1 sm:mt-0" : ""}`}>
        <div className="flex flex-row font-bold text-base sm:text-md">
          ₹ {ad.price}
        </div>
        <div className={`${viewMode === "grid" ? "text-gray-700 text-[10px] sm:text-xs sm:mb-1 line-clamp-1" : ""} ${viewMode === "list" ? "text-xs sm:text-lg font-medium line-clamp-1" : ""}`}>
          {ad.title}
        </div>
        <div className="flex text-gray-600 text-[10px] sm:text-xs mb-1 gap-1">
          <FaMapMarkerAlt className="text-orange-500 text-md" /> 
        {ad.location.city}
        <span className={`${viewMode === "grid" ? "hidden" : ""} 
            ${viewMode === "list" ? "ml-auto text-[15px] sm:text-[22px] bg-white rounded-full shadow px-0.5 sm:px-1 cursor-pointer hover:text-orange-500" : ""}`}>
            𖹭
          </span>
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
</div> ) : (
  <div className="flex justify-center items-center h-full">
    <p className="text-gray-500">No ads available</p>
  </div>
)}

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              Previous
            </button>
            <span className="px-4 py-2 font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              Next
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MobilesPage;
