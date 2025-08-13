import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook, FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt  } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";

const categories = [
  { name: "Mobiles", icon:<FaMobileAlt />, path: "mobiles" },
  { name: "Electronics & Appliances", icon:<FaTv />, path: "electronics-appliances" },
  { name: "Vehicles", icon:<FaCar />, path: "vehicles" },
  { name: "Real Estate", icon:<FaCity />, path: "real-estate" },
  { name: "Jobs", icon:<FaBriefcase />, path: "jobs" },
  { name: "Services", icon:<FaTools />, path: "services" },
  { name: "Furniture", icon:<FaCouch />, path: "furniture" },
  { name: "Fashion", icon:<FaTshirt />, path: "fashion" },
  { name: "Books, Sports & Hobbies", icon:<FaBook />, path: "books-sports-hobbies" },
  { name: "Pets", icon:<FaPaw />, path: "pets" },
  { name: "Others", icon:<FaPuzzlePiece />, path: "others" },
];

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
  id: index + 1,
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

  const productsPerPage = 15;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="text-sm">
      {/* Header */}
            <header className="bg-white p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <img src="/Website logos/LocalMartIcon.png"
                    alt="Local Mart Logo"
                    className="h-9"/>
                    <div
              className=" flex items-center bg-white rounded px-2 ml-3">
                    <FaMapMarkerAlt className="text-lg"/> {/* Location Icon */}
                    <select
                className="w-[90px] bg-transparent text-xs font-semibold rounded px-1">
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
                  
            <div className="flex items-center text-xs border border-gray-400 rounded-full p-1">
            {/* Left Side: All Categories */}
            <div className="flex items-center gap-2 px-4 w-1/2">
              {/* Red Icons */}
              <div className="flex flex-col gap-1">
                <div className="w-0 h-0 mb-[-2px] border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500"></div> {/* Triangle */}
                <div className="w-2 h-2 ml-[-1px] bg-red-600"></div> {/* Square */}
                <div className="w-2 h-2 ml-2 mt-[-12px] rounded-full bg-red-600"></div> {/* Circle */}
              </div>
      
              {/* Text + Dropdown */}
              <select className="w-30 text-black" defaultValue="" 
              onChange={e => { const path = e.target.value;
                  if (path) navigate(`/${path}`);}}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.path} >{cat.name}</option>
                ))}
              </select>
            </div>
      
            {/* Divider */}
            <div className="h-9 w-px bg-gray-400" />
      
            {/* Right Side: Search */}
            <div className="flex items-center gap-1 px-4 py-1 w-40">
              <div className="bg-blue-500 rounded-full ml-2">🔍
              </div>
              <input className="w-29.5 h-7" placeholder="Search product" />
            </div>
          </div>
                  </div>
      
                <button
                  onClick={() => navigate("/login")}
                  className="flex bg-orange-500 text-white rounded-full px-2 sm:px-4 py-2 text-sm md:text-base font-semibold">
                  <VscAccount className="text-xl mr-1"/> Login | Signup
                </button>
              </div>
            </header>

      <div className="flex max-w-7xl mx-auto mt-1 gap-3 items-start">
        {/* Sidebar */}
        <aside className="w-40 border border-gray-300 bg-white rounded-lg p-4 shadow sm:w-60">
          <h3 className="text-lg font-semibold mb-1">Mobiles</h3>
          <ul className="list-none">
            {brands.map((brand) => (
              <li key={brand} className="text-gray-500 px-2 py-2 border border-gray-300 text-sm rounded-lg mb-1 cursor-pointer flex items-center justify-between hover:font-medium hover:text-black"
              onClick={() => navigate(`${brand.path}`)}>
                <span className="ml-2">{brand.name}</span>
                <span className="font-bold">&gt;</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Section */}
        <main className="flex-1 text-xs">
          <div className="flex items-center justify-between mb-2 border-b border-gray-400 p-2">
            <div>
              <h2 className="text-base font-semibold">
                Mobiles{" "}
                <span className="text-gray-500 text-xs">
                  (Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, products.length)} of {products.length} products)
                </span>
              </h2>
              <div className="flex gap-4 text-xs mt-1 text-gray-500">
                <span className="text-black font-semibold">Sort By</span>
                <span className="cursor-pointer hover:underline">Price - Low To High</span>
                <span className="cursor-pointer hover:underline">Price - High To Low</span>
                <span className="cursor-pointer hover:underline">Newly Added</span>
              </div>
            </div>
            <div className="flex gap-4 items-center mr-10">
              <span className="text-4xl mr-4">𖹭</span>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 text-3xl rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
                ▦</button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 text-4xl rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
                ≡</button>
            </div>
          </div>

          {/* Products View */}
          <div className={`mr-8 ${viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-2" : "flex flex-col gap-2"}`}>
            {visibleProducts.map((prod, idx) => (
            <div key={idx} className={`border border-gray-400 bg-white rounded-xl shadow-md p-2 transition-all duration-200 hover:shadow-lg hover:scale-103 cursor-pointer ${
             viewMode === "list" ? "flex flex-col sm:flex-row gap-4 sm:items-center w-full md:w-150 lg:w-220" : ""}`}
              onClick={() => navigate(`/product/${startIndex + idx}`)}>
              <img src={prod.images[0]} alt={prod.title} 
      className={`rounded-lg ${viewMode === "grid" ? "w-40 h-23 sm:h-23" : "w-full sm:w-32 h-32"}`}/>
      <div className={`${viewMode === "list" ? "flex flex-col justify-between flex-1 mt-1 sm:mt-0" : ""}`}>
        <div className="flex flex-row font-bold text-base sm:text-lg">₹ {prod.price}
        <span className={`ml-auto text-2xl hover:text-orange-500 ${viewMode === "grid" ? "hidden" :""} ${viewMode === "list" ? "hidden" :""}`}>𖹭</span>
        </div>
        <div className={`${viewMode === "grid" ? "text-gray-800  sm:text-[10px] mb-1" :""} ${viewMode === "list" ? "text-lg font-medium" :""}`}>{prod.title}</div>
        <div className="text-gray-700 text-xs mb-1">📍 {prod.location}</div>

        <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
          <div className={`flex gap-1 ${viewMode === "list" ? "gap-8" :""}`}>
            <button className={`text-white bg-blue-600 rounded-full px-1 py-1 ${viewMode === "grid" ? "text-xs sm:text-[10px]" :""}
            ${viewMode === "list" ? "bg-blue-500 text-[12px] text-white px-10 py-1" :""}`}>
              📝 Text </button>
            <button className={`text-white bg-blue-600 rounded-full p-1 ${viewMode === "grid" ? "text-xs sm:text-[10px]" :""}
            ${viewMode === "list" ? "bg-blue-500 text-[12px] text-white px-10 py-1" :""}`}>
              📞 Contact </button>
              <span className={`${viewMode === "grid" ? "hidden" :""} ${viewMode === "list" ? "ml-auto text-3xl hover:text-orange-500" :""}`}>𖹭</span>
          </div>
          <span className={`${viewMode === "list" ? "hidden" :""} text-gray-600 text-xs sm:text-[10px]`}>{prod.time}</span>
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
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-8">
          <div>
            <img src="/Website logos/LocalMartIconBot.png" alt="Local Mart Logo" className="h-9" />
            <div className="text-gray-800 max-w-xs font-semibold mt-3">
              We gather and verify service provider details across various categories & display them on our website
            </div>
            <div className="flex gap-6 mt-8">
              <img src="/Website logos/instagram.png" onClick={() => window.open("https://www.instagram.com/localmart", "_blank")} alt="Instagram" className="cursor-pointer h-6" />
              <img src="/Website logos/facebook.jpg" onClick={() => window.open("https://www.facebook.com/localmart", "_blank")} alt="Facebook" className="cursor-pointer h-6" />
              <img src="/Website logos/twitter logo.jpg" onClick={() => window.open("https://www.twitter.com/localmart", "_blank")} alt="Twitter" className="cursor-pointer h-6" />
              <img src="/Website logos/linkedin.png" onClick={() => window.open("https://www.linkedin.com/company/localmart", "_blank")} alt="LinkedIn" className="cursor-pointer h-6" />            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Our Services</h4>
            <ul className="text-gray-900">
              <li onClick={() => navigate("/business-2-business")} className="cursor-pointer mb-2">Business 2 Business</li>
              <li onClick={() => navigate("/booking-services")} className="cursor-pointer mb-2">Booking Services</li>
              <li onClick={() => navigate("/food-delivery")} className="cursor-pointer mb-2">Food Delivery</li>
              <li onClick={() => navigate("/local-businesses")} className="cursor-pointer mb-2">Local Businesses</li>
              <li onClick={() => navigate("/e-commerce")} className="cursor-pointer mb-2">E-Commerce</li>
            </ul>
          </div>
          <div>
            <ul className="text-gray-900"><br />
              <li onClick={() => navigate("/advertise-here")} className="cursor-pointer mb-2">Advertise Here</li>
              <li onClick={() => navigate("/buy-sell")} className="cursor-pointer mb-2">Buy & Sell</li>
              <li onClick={() => navigate("/local-stores")} className="cursor-pointer mb-2">Local Stores</li>
              <li onClick={() => navigate("/explore-brands")} className="cursor-pointer mb-2">Explore Brands</li>
              <li onClick={() => navigate("/shopping")} className="cursor-pointer mb-2">Shopping</li>
            </ul>
          </div>
          <div>
            <ul className="text-gray-900"><br />
              <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-2">Terms & Conditions</li>
              <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-2">Privacy Policy</li>
              <li onClick={() => navigate("/cancellation-policy")} className="cursor-pointer mb-2">Cancellation Policy</li>
              <li onClick={() => navigate("/local-mart")} className="cursor-pointer mb-2">Local Mart</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MobilesPage;
