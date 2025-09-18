import { useLocation } from 'react-router-dom';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import InboxList from './InboxList';
import ChatInterface from './ChatInterface';
import React, { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const isInboxPage = location.pathname === '/inbox' || location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat/');
  
  // Real messages will come from API/database - empty by default
  const [messages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  // User and product info will come from the actual chat context/API
  // These will be passed from the product page or retrieved from the chat data
  const userInfo = {
    name: 'Chat User',
    email: 'user@example.com',
    phone: '+1 (000) 000-0000',
    location: 'Location',
    joinDate: 'Recently',
    rating: 0,
    totalAds: 0,
    avatar: null
  };

  const productInfo = {
    name: 'Product',
    category: 'Category',
    price: 'Price on request',
    location: 'Location'
  };

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="mb-2 text-gray-500 text-sm text-left px-4 pt-4">
          <span>Home</span> &gt; <span>Categories</span> &gt; <span>Mobiles</span> &gt; <span className="text-orange-500 font-semibold">Inbox</span>
        </div>
        
        <div className="flex gap-8 h-[calc(100vh-100px)] bg-white rounded-lg overflow-hidden shadow-lg mx-4">
          {/* Left Section - Inbox List */}
          <InboxList 
            messages={messages} 
            onFilterChange={handleFilterChange}
          />
          
          {/* Right Section - Chat Interface or Welcome */}
          {isChatPage ? (
            <ChatInterface 
              userInfo={userInfo}
              productInfo={productInfo}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to LocalMart Chat</h2>
                <p className="text-gray-600 mb-2">Connect with buyers and sellers instantly</p>
                <p className="text-sm text-gray-500 mb-6">Start a conversation from a product page to begin chatting.</p>
                
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h3 className="font-semibold text-blue-800 mb-2">How to start chatting:</h3>
                  <ol className="text-sm text-blue-700 text-left space-y-1">
                    <li>1. Browse products on LocalMart</li>
                    <li>2. Click "Chat with Seller" on any product</li>
                    <li>3. Your conversation will appear here</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;