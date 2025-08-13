import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook, FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt  } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { IoIosShareAlt } from "react-icons/io";

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

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Simulated shared product list with multiple images
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

      {/* Breadcrumb */}
      <div className="flex flex-row text-xl font-semibold max-w-6xl mx-auto py-4">
        Home &gt; Categories &gt;{" "}
        <span className="text-orange-400">Mobiles</span>
        <div className="flex items-center ml-auto">
          <span className="text-4xl mr-8 cursor-pointer hover:text-blue-500"><IoIosShareAlt /></span>
              <span className="text-5xl mr-8 cursor-pointer hover:text-orange-600">𖹭</span>
            </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl px-15 pb-4">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Image Carousel */}
          <div className="relative w-full md:w-[450px] h-[420px] flex items-center justify-center">
            <button
              onClick={handlePrev}
              className="absolute left-0 bg-gray-200 text-black px-2 py-1 rounded-l hover:bg-gray-300"
            >
              ←
            </button>
            <img
              src={product.images[currentImgIndex]}
              alt={`Product image ${currentImgIndex + 1}`}
              className="border border-gray-300 rounded-3xl shadow h-full object-contain"
            />
            <button
              onClick={handleNext}
              className="absolute right-0 bg-gray-200 text-black px-2 py-1 rounded-r hover:bg-gray-300"
            >
              →
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 mt-2 space-y-3">
            <div className="border border-gray-300 p-7 rounded-3xl shadow">
            <div className="text-6xl font-bold text-gray-900">{product.price}</div>
            <div className="text-lg font-bold text-gray-800">{product.title}</div>
            </div>

            <div className="border border-gray-300 p-5 rounded-3xl shadow">
            <div className="flex justify-between text-center p-4 rounded text-2xl font-light">
              <div>
                <strong>👤 Owner</strong>
                <br />
                <span className="text-sm text-gray-500 font-medium">{product.owner}</span>
              </div>
              <div>
                <strong>📍 Location</strong>
                <br />
                <span className="text-sm text-gray-500 font-medium"> {product.location} </span>
              </div>
              <div>
                <strong>📅 Date Posted</strong>
                <br />
                <span className="text-sm text-gray-500 font-medium">{product.posted}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 text-lg gap-4 mt-6">
              <button
                type="submit"
                className="border border-gray-300 shadow bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 transition cursor-pointer"
              >
                💬 Chat with seller
              </button>
              <button className="border border-gray-300 shadow text-orange-700  rounded-xl hover:bg-orange-200 transition cursor-pointer">
                <span className="border rounded-full text-white bg-amber-600 p-1">%</span>{" "}
                Make an offer
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h2 className="text-4xl font-normal mb-4">Description</h2>
          <p className="text-xl font-normal text-gray-500 whitespace-pre-line">
            {product.description.trim()}
          </p>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-white mt-5 p-4 pt-8 pb-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex  justify-between items-start gap-8">
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
          <div>{""}</div>
          <div>{" "}</div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailPage;
