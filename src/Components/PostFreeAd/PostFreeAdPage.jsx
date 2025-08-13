import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaMobileAlt, FaBriefcase, FaTv, FaCouch, FaTshirt, FaBook, FaPaw, FaTools, FaPuzzlePiece, FaCity, FaMapMarkerAlt,
  FaTabletAlt, FaHeadphones, FaLaptop, FaCamera, FaGamepad, FaBicycle, FaMotorcycle, FaTruck, FaHome, FaLandmark, FaStore,
  FaUserTie, FaChalkboardTeacher, FaDumbbell, FaGuitar, FaDog, FaCat, FaCrow, FaFish, FaTshirt as FaTshirt2, FaShoePrints,
  FaWatchmanMonitoring, FaBookOpen, FaFootballBall, FaPuzzlePiece as FaPuzzle2, FaUserFriends, FaMoneyBillWave, FaTools as FaTools2,
  FaCouch as FaCouch2, FaBed, FaChild, FaLeaf, FaBoxOpen, FaSearchLocation, FaUsers, FaUserAlt, FaUserNurse, FaUserCheck, FaUserClock, FaUserEdit
} from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";

const categories = [
  { name: "Mobiles", icon: <FaMobileAlt /> },
  { name: "Electronics & Appliances", icon: <FaTv /> },
  { name: "Vehicles", icon: <FaCar /> },
  { name: "Real Estate", icon: <FaCity /> },
  { name: "Jobs", icon: <FaBriefcase /> },
  { name: "Services", icon: <FaTools /> },
  { name: "Furniture", icon: <FaCouch /> },
  { name: "Fashion", icon: <FaTshirt /> },
  { name: "Books, Sports & Hobbies", icon: <FaBook /> },
  { name: "Pets", icon: <FaPaw /> },
  { name: "Others", icon: <FaPuzzlePiece /> },
];

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
  "TVs, Video - Audio": <FaTv />,
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
  "For Sale: Houses & Apartments": <FaHome />,
  "For Rent: Houses & Apartments": <FaHome />,
  "Land & Plots": <FaLandmark />,
  "Shops & Offices": <FaStore />,
  "Paying Guest (PG) & Roommates": <FaUserFriends />,
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
  "Home Services (Plumber, Electrician, etc.)": <FaTools2 />,
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
  "Office Furniture ": <FaCouch2 />,
  // Fashion
  "Men's Clothing": <FaTshirt2 />,
  "Women's Clothing": <FaTshirt2 />,
  "Men's Accessories": <FaWatchmanMonitoring />,
  "Women's Accessories": <FaWatchmanMonitoring />,
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const selectCategory = (catName) => setSelectedCategory(catName);

  return (
    <div className="min-h-screen text-sm">
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            <img src="/Website logos/LocalMartIcon.png" alt="Local Mart Logo" className="h-9" />
            <div className="flex ml-2 px-2 text-sm">
              <FaMapMarkerAlt className="text-lg" />
              <select className="w-23">
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
          <button onClick={() => navigate("/login")} className="flex bg-orange-500 text-white rounded-full px-2 sm:px-4 py-2 text-sm md:font-semibold">
            <VscAccount className="text-xl mr-1" /> Login | Signup
          </button>
        </div>
      </header>
      {/* BODY */}
      <div className="flex">
        {/* SIDEBAR */}
        <form className="w-1/4 border-r bg-white p-4">
          <h2 className="text-lg font-semibold mb-4">Select a category</h2>
          <ul className="space-y-2">
            {categories.map(({ name, icon }) => (
              <li key={name} onMouseEnter={() => selectCategory(name)}
                onClick={() => selectCategory(name)} className={`flex flex-col items-center gap-2 border border-gray-300 p-4 rounded-md cursor-pointer md:flex-row
                  ${selectedCategory === name ? "bg-green-500 text-white" : ""}`}>
                <span className="text-xl">{icon}</span>
                <span className="text-sm md:text-base">{name}</span>
              </li>
            ))}
          </ul>
        </form>
        {/* MAIN */}
        <main className="w-3/4 p-8">
          <h1 className="text-2xl font-semibold mb-4">Post Free Ad</h1>
          {/*---------- Sub Categories mapping ----------*/}
          {selectedCategory in subcategoriesMap && (
            <>
              <h2 className="font-bold text-lg mb-2">Select a subcategory</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {subcategoriesMap[selectedCategory].map((sub) => (
                  <div key={sub} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-md p-4 cursor-pointer hover:bg-blue-100 hover:shadow-lg transition-all duration-200 min-h-[120px] group"
                    onClick={() => navigate(`/post-free-ad/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(sub)}`)}>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2 group-hover:bg-blue-200 transition-all">
                      <span className="text-4xl text-blue-600">{subCategoryIcons[sub] || <FaPuzzlePiece />}</span>
                    </div>
                    <span className="font-semibold text-base text-gray-800 text-center break-words leading-tight">{sub}</span>
                  </div>
                ))}
              </div>
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
