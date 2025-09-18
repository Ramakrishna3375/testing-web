import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./Components/HomePage.jsx";
import MobilesPage from "./Components/AdsViewPages/AdsPage.jsx";
import ProductDetailPage from "./Components/AdsViewPages/AdDetailsPage.jsx";
import PostFreeAdPage from "./Components/PostFreeAd/PostFreeAdPage.jsx";
import PostAdForm from "./Components/PostFreeAd/PostAdForm.jsx";
import Layout from './Components/ChatPage/Layout';
import SearchResultsPage from './Components/AdsViewPages/SearchResultsPage';
import UserLogin from "./Components/LoginPage/LoginPage.jsx";
import CompleteRegistration from "./Components/LoginPage/RegisterPage.jsx";
import ProfilePage from "./Components/Profile/ProfilePage.jsx";

function App(){
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
        <Route path="/chat" element={<Layout />} />
        <Route path="/inbox" element={<Layout />} />
        <Route path="/chat/:userId" element={<Layout />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}
export default App;
