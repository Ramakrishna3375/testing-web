import { useState, useEffect } from "react";
import { getAllCategories, getAllSubCategories } from "../../Services/api";
import { useNavigate } from "react-router-dom";
import Header from '../Header&Footer/Header';
import Footer from "../Header&Footer/Footer";
import { Skeleton } from '../SkeletonLoader/FilesLoader';

export default function PostFreeAdPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('token') || !!sessionStorage.getItem('user');
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
      const sortOldFirst = (arr) => {
        return [...arr].sort((a, b) => {
          const aTime = Date.parse(a?.createdAt || 0) || 0;
          const bTime = Date.parse(b?.createdAt || 0) || 0;
          return aTime - bTime; // older first
        });
      };
      if (res && res.data && Array.isArray(res.data.categories)) {
        setCategories(sortOldFirst(res.data.categories));
      } else if (res && Array.isArray(res.data)) {
        setCategories(sortOldFirst(res.data));
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
      {isLoggedIn ? (
        <>
        {/* Header */}
      <Header />
          {/* Mobile Categories Bar (visible on small screens only) */}
         <div className="md:hidden top-20 bg-white z-20 border-b border-gray-300 overflow-x-auto px-2 py-1.5 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {loadingCategories ? (
            <div className="flex gap-2 min-w-max">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-2 min-w-[70px] max-w-[90px]">
                  <Skeleton className="h-5 w-5 mb-1 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
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
             <img className="h-5 w-5 mb-1" src={cat.iconUrl} />
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
              <ul className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2 border border-gray-300 p-4 rounded-md">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </li>
                ))}
              </ul>
            ) : categories.map((cat) => (
              <li
                key={cat.name}
                onMouseEnter={() => selectCategory(cat.name)}
                onClick={() => selectCategory(cat.name)}
                className={`flex flex-col items-center gap-2 border border-gray-300 p-4 rounded-md cursor-pointer transition-colors duration-200 md:flex-row md:items-center
                  ${selectedCategory === cat.name ? "bg-green-500 text-white border-green-600" : "hover:bg-green-100"}`}
              >
                <img className="h-6 w-6" src={cat.iconUrl} />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow-md p-2 sm:p-4 min-h-[120px]">
                    <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-1 sm:mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : subCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {subCategories.map((sub) => (
                  <div key={sub._id} className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-md p-2 sm:p-4 cursor-pointer hover:bg-blue-100 hover:shadow-lg transition-all duration-200 min-h-[120px] group"
                    onClick={() => navigate(`/post-free-ad/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(sub.name)}`)}>
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 mb-1 sm:mb-2 group-hover:bg-blue-200 transition-all">
                      <img className="text-blue-600 rounded-full" src={sub.iconUrl} />
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
      <Footer />
    </>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <main className="flex-1 flex items-center justify-center p-2 md:p-4 lg:p-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login to Post Ad</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to post an ad.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Login Now
          </button>
        </div>
      </main>
    </div>
  )}
    </div>
  );
}
