import {Route ,Routes, Navigate} from 'react-router-dom';
import './App.css';

import HomePage from './Components/HomePage.jsx';
import MobilesPage from './Components/Mobiles/ProductsPage.jsx';
import ProductDetailPage from './Components/Mobiles/ProductDetailPage.jsx';
import PostFreeAdPage from './Components/PostFreeAd/PostFreeAdPage.jsx'
import PostAdForm from './Components/PostFreeAd/PostAdForm.jsx';

function App(){
return(
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mobiles" element={<MobilesPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/post-free-ad" element={<PostFreeAdPage />} />
        <Route path="/post-free-ad/:category/:subcategory" element={<PostAdForm />} />
    </Routes>
    </>
);
}
export default App;