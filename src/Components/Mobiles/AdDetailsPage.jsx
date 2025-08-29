import { useState, useEffect } from "react";
import { getAllCategories } from "../../Services/api";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { IoIosShareAlt } from "react-icons/io";

// Dynamically fetched categories

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
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

  const products = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    images: [
      "/products/iphone13promax.avif",
      "/products/Titan car.jpg",
      "/products/Modern house.jpeg",
    ],
    title: `iPhone 13 Pro Max, 256GB - #${index + 1}`,
    price: `₹ ${90000 + index * 1000}`,
    location: `Location ${index + 1}`,
    owner: `User ${index + 1}`,
    posted: "Today",
    description: `
      Selling my iPhone 13 Pro Max - 256GB, hardly used.
      Includes box, bill, and charger. Very well maintained.
      Serious buyers only.
    `,
  }));

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Product not found.
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentImgIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImgIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

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

      {/* Breadcrumb */}
<div className="flex flex-col sm:flex-row items-start sm:items-center text-sm sm:text-xl font-semibold max-w-6xl mx-auto py-4 px-4 sm:px-0">
  <div className="flex flex-wrap gap-1 sm:gap-2">
    Home &gt; Categories &gt;
    <span className="text-orange-400 ml-1">Mobiles</span>
  </div>

  <div className="flex items-center sm:mt-0 ml-auto sm:ml-auto gap-4">
    <span className="text-2xl sm:text-4xl cursor-pointer hover:text-blue-500" aria-label="Share">
      <IoIosShareAlt />
    </span>
    <span className="text-3xl sm:text-5xl cursor-pointer sm:mr-4 hover:text-orange-600" aria-label="Favorite">𖹭</span>
  </div>
</div>


      {/* Product Section */}
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-10">

          {/* Image Carousel */}
          <div className="relative w-full h-[200px] md:w-[450px] md:h-[420px] flex items-center justify-center">
            <button
              onClick={handlePrev}
              className="absolute left-0 bg-gray-200 text-black px-1 sm:px-3 sm:py-2 rounded-l hover:bg-gray-300 z-10"
            >
              ←
            </button>
            <img
              src={product.images[currentImgIndex]}
              alt={`Product image ${currentImgIndex + 1}`}
              className="border border-gray-300 rounded-xl sm:rounded-3xl shadow h-full w-full object-contain"
            />
            <button
              onClick={handleNext}
              className="absolute right-0 bg-gray-200 text-black px-1 sm:px-3 sm:py-2 rounded-r hover:bg-gray-300 z-10"
            >
              →
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 mt-3 space-y-4">
            <div className="border border-gray-300 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow">
              <div className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900">{product.price}</div>
              <div className="text-lg sm:text-xl md:text-2xl sm:font-bold text-gray-800 mt-1">{product.title}</div>
            </div>

            <div className="border border-gray-300 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow">
              <div className="flex flex-row sm:flex-row justify-between text-center sm:p-4 rounded text-sm sm:text-lg md:text-2xl font-light gap-4">
                <div>
                  <strong>👤 Owner</strong>
                  <br />
                  <span className="text-sm md:text-base text-gray-500 font-medium">{product.owner}</span>
                </div>
                <div>
                  <strong>📍 Location</strong>
                  <br />
                  <span className="text-sm md:text-base text-gray-500 font-medium">{product.location}</span>
                </div>
                <div>
                  <strong>📅 Date Posted</strong>
                  <br />
                  <span className="text-sm md:text-base text-gray-500 font-medium">{product.posted}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 sm:mt-6">
                <button
                  type="submit"
                  className="border border-gray-300 shadow bg-blue-500 text-white p-2 sm:p-4 rounded-lg hover:bg-blue-600 transition cursor-pointer"
                >
                  💬 Chat with seller
                </button>
                <button className="border border-gray-300 shadow rounded-lg p-1 sm:p-4 hover:bg-orange-200 transition cursor-pointer sm:text-lg flex items-center justify-center gap-1 px-3">
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
            {product.description.trim()}
          </p>
        </div>
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

export default ProductDetailPage;
