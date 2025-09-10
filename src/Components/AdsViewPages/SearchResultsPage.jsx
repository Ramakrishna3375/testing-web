import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { searchAdsByTitle } from "../../Services/api";
import Header from '../Header&Footer/Header';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";

  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [adsError, setAdsError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!query) {
      setAds([]);
      return;
    }
    setLoadingAds(true);
    setAdsError(null);

    searchAdsByTitle(query)
      .then((res) => {
        // Handle different response structures gracefully
        if (res?.data?.postAd) {
          setAds([res.data.postAd]); // Wrap single ad into array
        } else if (Array.isArray(res?.data?.ads)) {
          setAds(res.data.ads);
        } else if (Array.isArray(res?.data?.postAds)) {
          setAds(res.data.postAds);
        } else {
          setAds([]);
        }
      })
      .catch(() => {
        setAds([]);
        setAdsError("Could not fetch ads");
      })
      .finally(() => {
        setLoadingAds(false);
      });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">
        <Header />
      <h2 className="text-xl font-semibold mb-4">Search Results for "{query}"</h2>

      {loadingAds ? (
        <div className="py-8 text-center text-xl text-blue-600 font-semibold">
          Loading ads . . .
        </div>
      ) : adsError ? (
        <div className="py-8 text-center text-red-600 font-semibold">{adsError}</div>
      ) : ads.length === 0 ? (
        <div className="py-8 text-center text-gray-700 font-semibold">
          No ads found matching your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 sm:p-0 sm:gap-3 gap-3">
            {(showAll ? ads : ads.slice(0, 10)).map((ad) => (
              <div
                key={ad.id || ad._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-400 p-2.5 sm:p-3 hover:shadow-lg hover:scale-102 transition cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/ad/${ad.id || ad._id}`)}
              >
                <img
                  src={(ad.images && ad.images[0]) ? ad.images[0] : "/no-image.png"}
                  alt={ad.title}
                  className="w-full h-34 sm:h-35 object-cover rounded-xl"
                />
                <div className="mt-1 flex flex-col flex-grow">
                  <div className="font-bold text-base sm:text-md">₹ {ad.price}</div>
                  <div className="text-gray-800 text-xs line-clamp-1">{ad.title}</div>
                  <div className="flex items-center text-gray-600 text-[9px] sm:text-xs sm:mt-1">
                    <span className="mr-1">
                      <FaMapMarkerAlt className="text-orange-500 text-md" />
                    </span>
                    {ad.location?.city || "Unknown"}
                    <span className="ml-auto text-gray-600 text-[8px] sm:text-xs sm:text-[9.5px]">
                      {(() => {
                        if (!ad.createdAt) return null;
                        const d = new Date(ad.createdAt);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
