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
  
  // Sample messages data - replace with real data from your API
  const [messages] = useState([
    {
      id: 1,
      senderName: 'John Smith',
      productName: 'iPhone 12 Pro Max',
      lastMessage: 'Hi, is this still available?',
      timestamp: '2 min ago',
      isRead: false,
      isImportant: true
    },
    {
      id: 2,
      senderName: 'Sarah Johnson',
      productName: 'Samsung Galaxy S21',
      lastMessage: 'What\'s the best price?',
      timestamp: '5 min ago',
      isRead: true,
      isImportant: false
    },
    {
      id: 3,
      senderName: 'Mike Wilson',
      productName: 'MacBook Pro 2021',
      lastMessage: 'Can you ship to Delhi?',
      timestamp: '10 min ago',
      isRead: false,
      isImportant: false
    }
  ]);

  const [currentFilter, setCurrentFilter] = useState('all');

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  // Sample user and product info for chat
  const userInfo = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2024',
    rating: 4.8,
    totalAds: 25,
    avatar: null
  };

  const productInfo = {
    name: 'iPhone 12 Pro Max',
    category: 'Electronics',
    price: '$899',
    location: 'New York, NY'
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
                <p className="text-sm text-gray-500 mb-6">Select a conversation from the inbox to start chatting, or start a new conversation from a product page.</p>
                
                {/* Filter Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    Currently showing: <span className="font-semibold capitalize">{currentFilter}</span> messages
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {currentFilter === 'unread' && 'Showing only unread conversations'}
                    {currentFilter === 'important' && 'Showing only starred/important conversations'}
                    {currentFilter === 'all' && 'Showing all conversations'}
                  </p>
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