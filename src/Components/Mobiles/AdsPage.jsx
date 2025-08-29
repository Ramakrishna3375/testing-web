import { useState, useEffect } from "react";
import { getAllCategories } from "../../Services/api";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";

const brands = [
  {name:"Apple", path:"apple" },
  {name:"OnePlus", path:"oneplus"},
  {name:"Samsung", path:"samsung"},
  {name:"Nothing", path:"nothing"},
  {name:"Oppo", path:"oppo"},
  {name:"Redmi", path:"redmi"},
  {name:"Poco", path:"poco"},
  {name:"Motorola", path:"motorola"},
  {name:"Google Pixel", path:"google-pixel"},
];

// Generate 28 unique products
const products = Array.from({ length: 28 }, (_, index) => ({
  _id: index + 1,
  images: ["/products/iphone13promax.avif"],
  title: `iPhone 13 Pro Max, 256GB - #${index + 1}`,
  price: `${90000 + index * 1000}`,
  location: `Location ${index + 1}`,
  time: "Today"
}));

const MobilesPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getAllCategories();
      if (res && res.data && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      } else if (res && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  const productsPerPage = 15;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="text-sm">
      {/* Header */}
            <header className="sm:sticky top-0 z-50 bg-white p-2 md:p-4 border-b border-gray-200">
          <div className="max-w-6xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-6 items-stretch md:items-center justify-between">            
              {/* Left side: controls */}
                   <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full flex-1">
                         <div className="flex items-center gap-2">
                              <img src="/Website logos/LocalMartIcon.png" alt="Local Mart Logo" className="h-9" />
                         <div className="sm:hidden justify-end mt-2 md:mt-0 sm:h-10 ml-auto">
                            <button onClick={() => navigate("/login")}
                               className="flex items-center bg-orange-500 text-white text-xs rounded-sm p-1.5 hover:underline">
                              <VscAccount className="text-sm sm:text-xl mr-1" />
                              Login | Signup
                            </button>
                        </div>
                    </div>
                        
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="flex flex-row gap-1">
                       {/* Location selector */}
                   <div className="flex items-center bg-white rounded">
                      <FaMapMarkerAlt className="text-lg" />
                       <select className="w-[100px] md:w-[120px] bg-transparent text-xs font-semibold rounded px-1">
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
                      <div className="border border-gray-400 rounded-full flex items-center gap-2 px-2 py-1 md:px-5 md:py-2">
                        <select className="w-full text-[10px] sm:text-xs md:w-32 text-black" defaultValue="" 
                        onChange={(e) => { const categoryId = e.target.value; if (categoryId) navigate(`/ads/${categoryId}`); }}>
                        <option value="">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        </div>
                        </div>
                        
                    {/* Search Bar */}
                  <div className="flex items-center border border-gray-400 rounded-full w-full sm:w-72 overflow-hidden">
                  <input type="text" className="flex-1 px-2 py-1 sm:px-4 sm:py-2 sm:text-sm outline-none placeholder-gray-500" 
                  placeholder="Search product" />
                  <button className="bg-orange-500 text-white text-[12px] px-1 py-2 sm:px-3 sm:py-2 sm:text-sm font-medium hover:bg-orange-600">
                  Search
                  </button>
                  </div>
                </div>
              </div>
                        
              {/* Right side: Login button */}
                <div className="hidden sm:block justify-end mt-2 md:mt-0 sm:h-10">
                  <button onClick={() => navigate("/login")}
                  className="flex items-center sm:bg-orange-500 sm:text-white text-xs rounded-full sm:px-3 sm:py-2 hover:underline md:px-5 md:py-2 md:text-base font-semibold">
                  <VscAccount className="text-sm sm:text-xl mr-1" />
                    Login | Signup
                  </button>
                </div>
                </div>
                </div>
          </header>

            {/* Mobile brands: horizontal scroll */}
        <nav className="block md:hidden w-full overflow-x-auto mb-3 p-1">
          <ul className="flex gap-2">
            {brands.map((brand) => (
              <li key={brand.name} className="min-w-[72px] px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 flex flex-col items-center cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`${brand.path}`)}>
                <span className="mb-0.5 truncate text-black">{brand.name}</span>
              </li>
            ))}
          </ul>
        </nav>

      <div className="flex max-w-7xl mx-auto mt-1 gap-3 items-start">
        {/* Sidebar for desktop (lg) */}
        <aside className="hidden lg:block sticky top-20 h-120 w-60 min-w-[180px] max-w-[260px] border border-gray-300 bg-white rounded-lg p-4 shadow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-1">Mobiles</h3>
          <ul className="list-none">
            {brands.map((brand) => (
              <li key={brand.name} className="text-gray-500 px-2 py-2 border border-gray-300 text-sm rounded-lg mb-1 cursor-pointer flex items-center justify-between hover:font-medium hover:text-black"
                onClick={() => navigate(`${brand.path}`)}>
                <span className="ml-2">{brand.name}</span>
                <span className="font-bold">&gt;</span>
              </li>
            ))}
          </ul>
        </aside>
        {/* Sidebar for md (tablet) */}
        <aside className="hidden md:block lg:hidden sticky top-20 h-[calc(100vh-6rem)] w-36 min-w-[90px] max-w-[130px] border border-gray-300 bg-white rounded-lg p-2 shadow overflow-y-auto mr-2">
          <h3 className="text-md font-semibold mb-1 text-center">Brands</h3>
          <ul>
            {brands.map((brand) => (
              <li key={brand.name} className="px-1 py-1 border border-gray-300 rounded-md mb-1 text-[13px] text-gray-600 cursor-pointer flex items-center gap-1 hover:font-medium hover:text-black"
                onClick={() => navigate(`${brand.path}`)}>
                <span>{brand.name}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Section. */}
        <main className="flex-1 text-xs">
          <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between mb-2 border-b border-gray-400 p-2">
  <div className="w-full sm:w-auto">
    <h2 className="text-base font-semibold">
      Mobiles{" "}
      <span className="block sm:inline-flex text-gray-500 text-[9px] sm:text-xs mt-1 sm:mt-0">
        (Showing {startIndex + 1}-
        {Math.min(startIndex + productsPerPage, products.length)} of {products.length} products)
      </span>
    </h2>
    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 text-[9px] sm:text-xs mt-1 text-gray-500">
      <span className="text-black sm:font-semibold">Sort By</span>
      <span className="cursor-pointer hover:underline">Price - Low To High</span>
      <span className="cursor-pointer hover:underline">Price - High To Low</span>
      <span className="cursor-pointer hover:underline">Newly Added</span>
    </div>
  </div>
  <div className="flex gap-2 sm:gap-4 items-center mt-2 sm:mt-0 ml-0 sm:ml-4">
    <span className="text-3xl sm:text-4xl mr-2 cursor-pointer hover:text-orange-500">𖹭</span>
    <button
      onClick={() => setViewMode("grid")}
      className={`p-1 text-2xl sm:text-3xl rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      aria-label="Grid view"
    >
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

          {/* Products View */}
<div className={`ml-1 mr-1 sm:mr-2 md:ml-3 mt-4 
  ${viewMode === "grid" 
    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" 
    : "flex flex-col gap-2"} 
  ${viewMode === "list" ? "p-3 sm:p-0 m-2 md:ml-3 gap-3" : ""}`}>
  {visibleProducts.map((prod, idx) => (
    <div
      key={idx}
      className={`border border-gray-400 bg-white rounded-sm sm:rounded-xl shadow-md p-2 md:p-3 transition-all duration-200 hover:shadow-lg hover:scale-102
        ${viewMode === "list" ? "flex flex-row sm:flex-row gap-3 sm:gap-5 sm:items-center w-full md:w-150 lg:w-220" : ""}`}
      onClick={() => navigate(`/ad/${prod._id}`)}>
      <img
        src={prod.images[0]}
        alt={prod.title}
        className={`rounded-lg 
          ${viewMode === "grid" 
            ? "w-full h-22 sm:h-28 md:h-32 lg:w-40 lg:h-23" 
            : "w-35 sm:w-32 h-22"} `}
      />
      <div className={`${viewMode === "list" ? "flex flex-col justify-between flex-1 mt-1 sm:mt-0" : ""}`}>
        <div className="flex flex-row font-bold text-base sm:text-lg">
          ₹ {prod.price}
          <span className={`ml-auto text-2xl hover:text-orange-500 
            ${viewMode === "grid" ? "hidden" : ""} 
            ${viewMode === "list" ? "hidden" : ""}`}>
            𖹭
          </span>
        </div>
        <div className={`${viewMode === "grid" ? "text-gray-800 text-[10px] sm:text-sx sm:mb-1" : ""} ${viewMode === "list" ? "text-xs sm:text-lg font-medium" : ""}`}>
          {prod.title}
        </div>
        <div className="text-gray-700 text-[10px] sm:text-xs mb-1">📍 {prod.location}</div>

        <div className="flex items-center justify-between gap-2 sm:mt-1 flex-wrap">
          <div className={`flex gap-1 ${viewMode === "list" ? "gap-2 sm:gap-8" : ""}`}>
            <button className={`text-white rounded-sm  bg-blue-500 cursor-pointer 
              ${viewMode === "grid" ? "text-[9px] sm:text-xs px-2 py-1 sm:text-[10px]" : ""}
              ${viewMode === "list" ? "text-[10px] sm:text-[12px] px-2 py-1 sm:px-9 sm:py-[2px]" : ""}`}>
              📝 Chat
            </button>
            <button className={`text-white rounded-sm bg-blue-500 cursor-pointer 
              ${viewMode === "grid" ? "text-[9px] sm:text-xs px-2 py-1 sm:text-[10px]" : ""}
              ${viewMode === "list" ? "text-[10px] sm:text-[12px] px-2 py-1 sm:px-9 sm:py-[2px]" : ""}`}>
              📞 Contact
            </button>
            <span className={`${viewMode === "grid" ? "hidden" : ""} 
              ${viewMode === "list" ? "ml-auto text-[20px] bg-white rounded-full shadow px-1 cursor-pointer hover:text-orange-500" : ""}`}>
              𖹭
            </span>
          </div>
          <span className={`${viewMode === "list" ? "hidden" : ""} text-gray-600 text-[9px] sm:text-xs sm:text-[10px]`}>
            {prod.time}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>


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
      <footer className="bg-white mt-5 p-4 pt-8 pb-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-2 sm:gap-8">
          <div>
            <img src="/Website logos/LocalMartIconBot.png" alt="Local Mart Logo" className="h-9" />
            <div className="text-gray-800 max-w-xs font-semibold mt-1 sm:mt-3">
              We gather and verify service provider details across various categories & display them on our website
            </div>
            <div className="flex gap-6 mt-3 sm:mt-8">
              <img src="/Website logos/instagram.png" onClick={() => window.open("https://www.instagram.com/localmart", "_blank")} alt="Instagram" className="cursor-pointer h-6" />
              <img src="/Website logos/facebook.jpg" onClick={() => window.open("https://www.facebook.com/localmart", "_blank")} alt="Facebook" className="cursor-pointer h-6" />
              <img src="/Website logos/twitter logo.jpg" onClick={() => window.open("https://www.twitter.com/localmart", "_blank")} alt="Twitter" className="cursor-pointer h-6" />
              <img src="/Website logos/linkedin.png" onClick={() => window.open("https://www.linkedin.com/company/localmart", "_blank")} alt="LinkedIn" className="cursor-pointer h-6" />            </div>
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

export default MobilesPage;
