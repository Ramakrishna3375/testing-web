import { useState, useEffect } from "react";
import { getAllCategories, getAllSubCategories } from "../../Services/api";
import { useNavigate } from "react-router-dom";
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import { FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook, FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt,
  FaTabletAlt, FaHeadphones, FaLaptop, FaCamera, FaGamepad, FaBicycle, FaMotorcycle, FaTruck, FaHome, FaLandmark, FaStore,
  FaUserTie, FaChalkboardTeacher, FaDumbbell, FaGuitar, FaDog, FaCat, FaCrow, FaFish, FaTshirt as FaTshirt2, FaShoePrints,
  FaWatchmanMonitoring, FaBookOpen, FaFootballBall, FaPuzzlePiece as FaPuzzle2, FaUserFriends, FaMoneyBillWave, FaTools as FaTools2,
  FaCouch as FaCouch2, FaBed, FaChild, FaLeaf, FaBoxOpen, FaSearchLocation, FaUsers, FaUserAlt, FaUserNurse, FaUserCheck, FaUserClock, FaUserEdit
} from "react-icons/fa";
import { MdOutlineHomeRepairService } from "react-icons/md";
import { GrRestroomWomen } from "react-icons/gr";
import { VscAccount } from "react-icons/vsc";

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

const subcategoriesMap = {
  "Mobiles": ["Mobile Phones", "Accessories", "Tablets"],
  "Electronics & Appliances": [
    "TVs, Video - Audio", "Computers & Laptops", "Computer Accessories", "Home Appliances", "Cameras & Lenses",
    "Kitchen & Other Appliances", "Games & Entertainment"
  ],
  "Vehicles": ["Cars", "Motorcycles", "Scooters", "Commercial Vehicles", "Spare Parts", " Bicycles "],
  "Real Estate": [
    "For Sale: Houses & Apartments", "For Rent: Houses & Apartments", "Land & Plots", "Shops & Offices",
    "Paying Guest (PG) & Roommates"
  ],
  "Jobs": [
    "Data Entry & Back Office", "Sales & Marketing", "BPO & Call Center", "Driver", "Delivery", "Hotel & Travel", "Office Assistant",
    "IT & Software", "Accountant", "Teacher", "Other Jobs"
  ],
  "Services": [
    "Home Services (Plumber, Electrician, etc.)", "Repair & Maintenance", "Packers & Movers", "Event Services", "Beauty & Wellness",
    "Health & Fitness", "Financial Services", "Tuition & Coaching"
  ],
  "Furniture": ["Sofa & Dining", "Beds & Wardrobes", "Home Decor & Garden", "Kids Furniture", "Office Furniture "],
  "Fashion": ["Men's Clothing", "Women's Clothing", "Men's Accessories", "Women's Accessories", "Watches", "Footwear"],
  "Books, Sports & Hobbies": ["Books", "Gym & Fitness", "Musical Instruments", "Sports Equipment", "Hobbies"],
  "Pets": ["Dogs", "Cats", "Birds", "Pet Food & Accessories", "Other Pets"],
  "Others": ["Miscellaneous Items", "Lost & Found", "Community"]
};

// Subcategory icon mapping
const subCategoryIcons = {
  // Mobiles
  "Mobile Phones": <FaMobileAlt />,
  "Accessories": <FaHeadphones />,
  "Tablets": <FaTabletAlt />,
  // Electronics & Appliances
  "TVs,Video - Audio": <FaTv />,
  "Computers & Laptops": <FaLaptop />,
  "Computer Accessories": <FaTools2 />,
  "Home Appliances": <FaCouch2 />,
  "Cameras & Lenses": <FaCamera />,
  "Kitchen & Other Appliances": <FaLeaf />,
  "Games & Entertainment": <FaGamepad />,
  // Vehicles
  "Cars": <FaCar />,
  "Motorcycles": <FaMotorcycle />,
  "Scooters": <FaBicycle />,
  "Commercial Vehicles": <FaTruck />,
  "Spare Parts": <FaTools2 />,
  " Bicycles ": <FaBicycle />,
  // Real Estate
  "Houses & Apartments For Sale": <FaHome />,
  "Houses & Apartments For Rent": <FaHome />,
  "Land & Plots": <FaLandmark />,
  "Shops & Offices": <FaStore />,
  "Paying Guest(PG) & Roommates": <FaUserFriends />,
  // Jobs
  "Data Entry & Back Office": <FaUserTie />,
  "Sales & Marketing": <FaUserCheck />,
  "BPO & Call Center": <FaUserClock />,
  "Driver": <FaCar />,
  "Delivery": <FaTruck />,
  "Hotel & Travel": <FaUserFriends />,
  "Office Assistant": <FaUserEdit />,
  "IT & Software": <FaLaptop />,
  "Accountant": <FaMoneyBillWave />,
  "Teacher": <FaChalkboardTeacher />,
  "Other Jobs": <FaUserAlt />,
  // Services
  "Home Services": <MdOutlineHomeRepairService />,
  "Repair & Maintenance": <FaTools2 />,
  "Packers & Movers": <FaBoxOpen />,
  "Event Services": <FaUsers />,
  "Beauty & Wellness": <FaUserNurse />,
  "Health & Fitness": <FaDumbbell />,
  "Financial Services": <FaMoneyBillWave />,
  "Tuition & Coaching": <FaChalkboardTeacher />,
  // Furniture
  "Sofa & Dining": <FaCouch2 />,
  "Beds & Wardrobes": <FaBed />,
  "Home Decor & Garden": <FaLeaf />,
  "Kids Furniture": <FaChild />,
  "Office Furniture": <FaCouch2 />,
  // Fashion
  "Men’s Clothing": <FaTshirt2 />,
  "Women’s Clothing": <GrRestroomWomen />,
  "Men’s Accessories": <FaWatchmanMonitoring />,
  "Women’s Accessories": <FaWatchmanMonitoring />,
  "Watches": <FaWatchmanMonitoring />,
  "Footwear": <FaShoePrints />,
  // Books, Sports & Hobbies
  "Books": <FaBookOpen />,
  "Gym & Fitness": <FaDumbbell />,
  "Musical Instruments": <FaGuitar />,
  "Sports Equipment": <FaFootballBall />,
  "Hobbies": <FaPuzzle2 />,
  // Pets
  "Dogs": <FaDog />,
  "Cats": <FaCat />,
  "Birds": <FaCrow />,
  "Pet Food & Accessories": <FaFish />,
  "Other Pets": <FaPaw />,
  // Others
  "Miscellaneous Items": <FaPuzzlePiece />,
  "Lost & Found": <FaSearchLocation />,
  "Community": <FaUsers />,
};

export default function PostFreeAdPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('user') || !!sessionStorage.getItem('token');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const res = await getAllCategories();
      if (res && res.data && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      } else if (res && Array.isArray(res.data)) {
        setCategories(res.data);
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when selectedCategory changes
  useEffect(() => {
    let isActive = true;
  const fetchSubCategories = async () => {
    if (selectedCategory) {
      setLoadingSubCategories(true);
      const selectedCatObj = categories.find(cat => cat.name === selectedCategory);
      if (selectedCatObj && selectedCatObj._id) {
        const res = await getAllSubCategories();
        // Fix: get array from res.data.subcategories or res.data
        const subcategoriesArray = Array.isArray(res.data.subcategories)
          ? res.data.subcategories
          : Array.isArray(res.data)
            ? res.data
            : [];
        const filteredSubCategories = subcategoriesArray.filter(
          sub => sub.categoryId === selectedCatObj._id
        );
        if (isActive) {
          setSubCategories(filteredSubCategories);
          setLoadingSubCategories(false);
        }
      } else {
        if (isActive) {
          setSubCategories([]);
          setLoadingSubCategories(false);
        }
      }
    } else {
      if (isActive) {
          setSubCategories([]);
          setLoadingSubCategories(false);
        }
    }
  };
  fetchSubCategories();
  return () => {
    isActive = false;
  };
}, [selectedCategory, categories]);

  const selectCategory = (catName) => setSelectedCategory(catName);

  return (
    <div className="min-h-screen text-sm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="flex flex-row items-center justify-between gap-2 py-2 sm:py-4 w-full">
            {/* Left: logo and location */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 w-auto">
              <img src={LocalMartIcon} alt="Local Mart Logo" className="h-9 sm:h-12 w-auto min-w-[2.5rem] max-w-[7rem]" />
              <div className="flex items-center ml-2 gap-1 px-2 py-1 text-xs sm:text-base border border-gray-200 rounded bg-gray-50">
                <FaMapMarkerAlt className="text-sm text-orange-500 sm:text-lg" />
                <select className="w-22 sm:w-28 md:w-36 pl-1 bg-transparent outline-none">
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
            </div>
            {/* Right: login/signup button (hidden if logged in) */}
            
              <>
                {/* Mobile button */}
                <div className="sm:hidden  ml-auto">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center bg-orange-500 text-white text-xs rounded-sm p-2 leading-none font-medium hover:bg-orange-600 transition"
                    style={{ minWidth: 80 }}
                  >
                    <VscAccount className="text-lg mr-0.5" />
                    Login | Signup
                  </button>
                </div>
                {/* Desktop/tablet button */}
                <div className="hidden sm:flex flex-shrink-0 justify-end">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center bg-orange-500 text-white text-base rounded-full px-5 py-2 font-semibold hover:bg-orange-600 transition min-w-[120px]" >
                    <VscAccount className="text-xl mr-2" />
                    Login | Signup
                  </button>
                </div>
              </>
            
          </div>
        </div>
      </header>
      {/* BODY */}
      {/* Mobile Categories Bar (visible on small screens only) */}
         <div className="md:hidden top-20 bg-white z-20 border-b border-gray-300 overflow-x-auto px-2 py-1.5 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {loadingCategories ? (
            <div className="py-8 text-center text-xl text-blue-600 font-semibold w-full">
              Loading categories . . .
            </div>
          ) : categories.map((cat) => (
            <button
               key={cat.name}
               onClick={() => selectCategory(cat.name)}
               className={`
              flex flex-col items-center justify-center cursor-pointer rounded-md 
              border border-gray-300 p-2 whitespace-normal text-center
              min-w-[70px] max-w-[90px]
              ${selectedCategory === cat.name ? "bg-green-500 text-white" : "bg-white text-gray-800 hover:bg-green-100"}
              `}
              >
             <img className="h-5 w-5 mb-1" src={cat.iconUrl || categoryIcons[cat.name]} />
             <span className="text-xs break-words">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
{/* Sidebar (visible on md and above) */}
<form className="hidden md:block sticky top-20 h-[30rem] w-72 min-w-[18rem] max-w-[22.5rem] border-r border-gray-300 bg-white p-4 overflow-y-auto">
  <h2 className="text-lg font-semibold mb-4">Select a category</h2>
  <ul className="space-y-3">
    {loadingCategories ? (
              <div className="py-8 text-center text-lg text-blue-600 font-semibold w-full">
                Loading categories . . .
              </div>
            ) : categories.map((cat) => (
              <li
                key={cat.name}
                onMouseEnter={() => selectCategory(cat.name)}
                onClick={() => selectCategory(cat.name)}
                className={`flex flex-col items-center gap-2 border border-gray-300 p-4 rounded-md cursor-pointer transition-colors duration-200 md:flex-row md:items-center
                  ${selectedCategory === cat.name ? "bg-green-500 text-white border-green-600" : "hover:bg-green-100"}`}
              >
                <img className="h-6 w-6" src={cat.iconUrl || categoryIcons[cat.name]} />
                <span className="text-sm md:text-base">{cat.name}</span>
              </li>
            ))}
  </ul>
</form>


        {/* MAIN */}
        <main className="flex-1 p-4 sm:p-8 ml-0">
          <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-4">Post Free Ad</h1>
          {/*---------- Sub Categories mapping ----------*/}
          {selectedCategory && (
          <>
            <h2 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">Select a subcategory</h2>
            {loadingSubCategories ? (
              <div className="py-8 text-center text-xl text-blue-600 font-semibold">
                Loading subcategories . . .
              </div>
            ) : subCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {subCategories.map((sub) => (
                  <div key={sub._id} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-md p-2 sm:p-4 cursor-pointer hover:bg-blue-100 hover:shadow-lg transition-all duration-200 min-h-[120px] group"
                    onClick={() => navigate(`/post-free-ad/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(sub.name)}`)}>
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 mb-1 sm:mb-2 group-hover:bg-blue-200 transition-all">
                      <img className="text-blue-600 rounded-full" src={sub.icon || subCategoryIcons[sub.name] } />
                    </div>
                    <span className="font-semibold text-xs sm:text-base text-gray-800 text-center break-words leading-tight">{sub.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No subcategories found.
              </div>
            )}
          </>
        )}
          {/*-------- DEFAULT PROMPT --------*/}
          {!selectedCategory && (
            <div className="relative bg-blue-100 border border-blue-300 p-4 rounded-md max-w-md shadow-sm ml-10">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 border-t-[20px] border-b-[20px] border-r-[40px] border-transparent border-r-blue-100" />
              <h3 className="font-semibold mb-2">Select the appropriate category to post your ad.</h3>
              <p className="text-sm"> Not sure? Give us a missed call&nbsp;
                <a href="tel:180030005000" className="text-blue-600 underline">
                  1-800-3000-5000
                </a>&nbsp;and we will help you.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
