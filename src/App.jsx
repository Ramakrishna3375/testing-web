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
import MyAdsPage from "./Components/Profile/MyAdsPage.jsx";

function App(){
return(
    <>
      <Routes>
        // =================== (DEFAULT ROUTE)===================
        <Route path="/" element={<Navigate to="/homepage" replace />} />

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
        // =================== (USERID OF THE SELLER)===================
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-ads" element={<MyAdsPage />} />
      </Routes>
    </>
  );
}
export default App;
