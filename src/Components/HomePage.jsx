import { useNavigate, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
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

const pathToCategory = Object.fromEntries(categories.map(cat => [`/${cat.path}`, cat.name]));

const products = [
   {
    id: 29,
    images: [
      "/products/Crosscut speaker.jpg",
      "/products/pixel 7a.avif",
      "/products/Crosscut speaker 3.jpg",
    ],
    title: "CrossCut Speaker",
    price: "28,000",
    location: "Uppal, Hyderabad",
    time: "Today",
    category: "electronics-appliances"
  },
  {
    id: 30,
    images: [
      "/products/pixel 7a.avif",
      "/products/pixel 7a 2.jpg",
      "/products/pixel 7a 3.jpg",
    ],
    title: "Pixel 7A",
    price: "10,000",
    location: "Karimnagar",
    time: "Today",
    category: "mobiles-accessories"
  },
  {
    id: 31,
    images: [
      "/products/Titan car.jpg",
      "/products/Titan car 2.jpg",
      "/products/Titan car 3.jpg",
    ],
    title: "Titan Car",
    price: "6.5 Lakh",
    location: "Peddapalli",
    time: "Today",
    category: "cars"
  },
  {
    id: 32,
    images: [
      "/products/Modern house.jpeg",
      "/products/Modern house 2.jpg",
      "/products/Modern house 3.jpg",
    ],
    title: "Modern House",
    price: "50 Lakh",
    location: "Nizamabad",
    time: "Today",
    category: "furniture"
  },
  {
    id: 33,
    images: [
      "/products/office chair.jpg",
      "/products/office chair 2.jpg",
      "/products/office chair 3.jpg",
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Ameerpet, Hyderabad",
    time: "Today",
    category: "furniture"
  },
  {
    id: 34,
    images: [
      "/products/office chair.jpg",
      "/products/office chair 2.jpg",
      "/products/office chair 3.jpg",
    ],
    title: "Office Chair",
    price: "2,000",
    location: "Warangal",
    time: "Today",
    category: "furniture"
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(0);

  const banners = [
    "/Website logos/Banner1.png",
    "/Website logos/Banner2.png",
    "/Website logos/botban.jpg",
    "/Website logos/bottomb3.jpg",
    "/Website logos/botban1.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const selectedCategory = pathToCategory[location.pathname];
  const filteredProducts = selectedCategory
    ? products.filter((prod) => prod.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen text-sm">
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            <img src="/Website logos/LocalMartIcon.png"
              alt="Local Mart Logo"
              className="h-9"/>
              <div className=" flex items-center bg-white rounded px-2 ml-3">
              <FaMapMarkerAlt className="text-lg"/>
              <select className="w-[90px] bg-transparent text-xs font-semibold rounded px-1">
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
      <div className="flex items-center gap-2 px-4 w-1/2">
        <div className="flex flex-col gap-1">
          <div className="w-0 h-0 mb-[-2px] border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500"></div>
          <div className="w-2 h-2 ml-[-1px] bg-red-600"></div>
          <div className="w-2 h-2 ml-2 mt-[-12px] rounded-full bg-red-600"></div>
        </div>
        <select className="w-30 text-black" defaultValue="" 
        onChange={e => { const path = e.target.value;
            if (path) navigate(`/${path}`);}}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.path} >{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="h-9 w-px bg-gray-400" />
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

      <div className="flex flex-col sm:flex-row gap-6 px-2 items-start">
        {/* Sidebar */}
        <aside className="w-full sm:w-65 bg-white rounded-lg p-2 shadow">
          <h3 className="text-2xl font-semibold mb-1 text-center">All Categories</h3>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat.name}
                className="px-2 py-3 border border-gray-300 rounded-xl  mb-1 cursor-pointer flex items-center justify-between hover:bg-gray-100"
                onClick={() => navigate(`/${cat.path}`)}>
                <span className="text-xs font-semibold flex items-center gap-2 ml-2">
                  {cat.icon}
                  {cat.name}
                </span>
                <span className="font-bold">&gt;</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Section */}
        <main className="flex-1 mt-4">
          <div className="bg-yellow-200 rounded-lg py-5 text-center font-bold text-lg sm:text-2xl mb-5 mr-5 cursor-pointer hover:bg-yellow-400"
          onClick={() => navigate("/post-free-ad")}>
            Post Free AD
          </div>

          {/* Banner Section */}
          <div className="relative overflow-hidden rounded-lg shadow-sm mb-4 mr-5">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {banners.map((src, index) => (
                <div key={index} className="min-w-full flex-shrink-0 cursor-pointer">
                  <img src={src} alt={`Banner ${index + 1}`}
                    className="w-full h-63 object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === current ? "bg-orange-500" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrent(index)}
                ></div>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Fresh Recommended</h2>
          <div className="mr-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-400 p-2 hover:shadow-lg hover:scale-102 transition cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/product/${product.id}`)}>
                <img src={product.images[0]} alt={product.title} className="w-40 h-25 object-cover rounded-xl"/>
                <div className="mt-2 flex flex-col flex-grow">
                  <div className="font-semibold text-base sm:text-md">₹ {product.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{product.title}</div>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <span className="text-red-500 mr-1">📍</span> {product.location}
                  </div>
                  <div className="flex-grow" />
                  <div className="flex items-center justify-between mt-2 flex-wrap">
                    <div className="flex gap-1">
                      <span className="bg-blue-600 text-white rounded-full px-1 py-0.5 text-xs">📝 Text</span>
                      <span className="bg-blue-600 text-white rounded-full px-1 py-0.5 text-xs">📞 Contact</span>
                    </div>
                    <span className="text-xs text-gray-500">{product.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-5 pt-8 pb-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto mt-10 p-7 flex flex-wrap justify-between items-start gap-8">
          <div>
            <img src="/Website logos/LocalMartIconBot.png" alt="Local Mart Logo" className="h-9" />
            <div className="text-gray-800 max-w-xs font-semibold mt-3">
              We gather and verify service provider details across various categories & display them on our website
            </div>
            <div className="flex gap-6 mt-8">
              <img src="/Website logos/instagram.png" onClick={() => window.open("https://www.instagram.com/localmart", "_blank")} alt="Instagram" className="cursor-pointer h-6" />
              <img src="/Website logos/facebook.jpg" onClick={() => window.open("https://www.facebook.com/localmart", "_blank")} alt="Facebook" className="cursor-pointer h-6" />
              <img src="/Website logos/twitter logo.jpg" onClick={() => window.open("https://www.twitter.com/localmart", "_blank")} alt="Twitter" className="cursor-pointer h-6" />
              <img src="/Website logos/linkedin.png" onClick={() => window.open("https://www.linkedin.com/company/localmart", "_blank")} alt="LinkedIn" className="cursor-pointer h-6" />
            </div>
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

export default HomePage;
