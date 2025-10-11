import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import { getMyAds } from '../../Services/api';
import { FaMapMarkerAlt, FaEye } from "react-icons/fa";

const MyAdsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("Error parsing user from session storage", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMyAds = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const res = await getMyAds(token);
        if (res && res.data && Array.isArray(res.data.postAds)) {
          const userAds = res.data.postAds;
          // Sort by most recent first
          userAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setMyAds(userAds);
        } else {
          setError("Could not fetch your ads.");
        }
      } catch (err) {
        setError("An error occurred while fetching your ads.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAds();
  }, [user]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="font-sans min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your ads.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login Now
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Ads</h1>

          {loading ? (
            <div className="text-center text-gray-500">Loading your ads...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : myAds.length === 0 ? (
            <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">No Ads Found</h3>
              <p>You haven't posted any ads yet. Start selling now!</p>
              <button onClick={() => navigate('/post-free-ad')} className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600">
                Post a Free Ad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {myAds.map(ad => (
                <div key={ad.id || ad._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <div className="relative">
                    <img src={ad.images && ad.images[0] ? ad.images[0] : "/no-image.png"} alt={ad.title} className="w-full h-40 object-cover" />
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${getStatusBadgeColor(ad.approvalStatus)}`}>
                      {ad.approvalStatus}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="font-bold text-lg mb-1">₹ {ad.price.toLocaleString('en-IN')}</div>
                    <p className="text-gray-800 text-sm mb-2 flex-grow line-clamp-2" title={ad.title}>{ad.title}</p>
                    <div className="flex items-center justify-between text-gray-600 text-xs mt-auto gap-2">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span className="truncate">{ad.location.city}</span>
                      </div>
                      <span className="flex items-center gap-1"><FaEye /> {ad.views || 0}</span>
                      <span className="ml-auto">{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {(ad.approvalStatus === 'Pending' || ad.approvalStatus === 'Rejected') && (
                    <div className="p-2 bg-gray-50 border-t">
                      <button 
                        onClick={() => {
                          const category = ad.category?.name || 'unknown';
                          const subcategory = ad.subcategory?.name || 'unknown';
                          navigate(`/post-free-ad/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}?edit=${ad.id || ad._id}`);
                        }}
                        className="w-full text-center bg-blue-500 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Edit Ad
                      </button>
                    </div>
                  )}
                   {ad.approvalStatus === 'Rejected' && ad.rejectionReason && (
                    <div className="p-2 bg-red-50 text-red-700 text-xs border-t border-red-200">
                      <strong>Reason:</strong> {ad.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyAdsPage;
