import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./Components/HomePage.jsx";
import MobilesPage from "./Components/AdsViewPages/AdsPage.jsx";
import ProductDetailPage from "./Components/AdsViewPages/AdDetailsPage.jsx";
import PostFreeAdPage from "./Components/PostFreeAd/PostFreeAdPage.jsx";
import PostAdForm from "./Components/PostFreeAd/PostAdForm.jsx";
import SearchResultsPage from './Components/AdsViewPages/SearchResultsPage';
import UserLogin from "./Components/LoginPage/LoginPage.jsx";
import CompleteRegistration from "./Components/LoginPage/RegisterPage.jsx";
import ProfilePage from "./Components/Profile/ProfilePage.jsx";
import ChatPage from "./Components/ChatPage/ChatPage.jsx";
import { useSocket } from "./hooks/useSocket.js";
import { useState, useEffect } from "react";

function App(){
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = sessionStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();

    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  useSocket(isLoggedIn);

return(
    <>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<CompleteRegistration />} />

        <Route path="/homepage" element={<HomePage />} />
        <Route path="/ads/:categoryId" element={<MobilesPage />} />
        <Route path="/ad/:id" element={<ProductDetailPage />} />
        <Route path="/post-free-ad" element={<PostFreeAdPage />} />
        <Route
          path="/post-free-ad/:category/:subcategory"
          element={<PostAdForm />}
        />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/inbox" element={<ChatPage />} />
        <Route path="/chat/:adId" element={<ChatPage />} /> {/* Use adId as param name as per new ChatPage component */}
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}
export default App;
