import { useLocation } from 'react-router-dom';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import InboxList from './InboxList';
import ChatInterface from './ChatInterface';
import React from 'react';

const Layout = () => {
  const location = useLocation();
  const isInboxPage = location.pathname === '/inbox' || location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="mb-2 text-gray-500 text-sm text-left px-4 pt-4">
          <span>Home</span> &gt; <span>Categories</span> &gt; <span>Mobiles</span> &gt; <span className="text-orange-500 font-semibold">Inbox</span>
        </div>
        
        <div className="flex gap-8 h-[calc(100vh-100px)] bg-white rounded-lg overflow-hidden shadow-lg mx-4">
          {/* Left Section - Inbox List */}
          <InboxList />
          
          {/* Right Section - Chat Interface or Welcome */}
          {isChatPage ? (
            <ChatInterface />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to LocalMart Chat</h2>
                <p className="text-gray-600 mb-2">Connect with buyers and sellers instantly</p>
                <p className="text-sm text-gray-500">Select a conversation from the inbox to start chatting, or start a new conversation from a product page.</p>
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