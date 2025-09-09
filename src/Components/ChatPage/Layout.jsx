
import { useLocation } from 'react-router-dom';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import InboxList from './InboxList';
import ChatInterface from './ChatInterface';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';

const users = {
  1: { name: 'John Smith', product: 'iPhone 12 pro max' },
  2: { name: 'Sarah Johnson', product: 'Samsung Galaxy S21' },
  3: { name: 'Mike Wilson', product: 'MacBook Pro 2021' },
  4: { name: 'Emma Davis', product: 'iPad Air 4th Gen' },
  5: { name: 'David Brown', product: 'Sony WH-1000XM4' },
  6: { name: 'Lisa Anderson', product: 'Nintendo Switch' },
  7: { name: 'Tom Martinez', product: 'GoPro Hero 9' },
  8: { name: 'Anna Taylor', product: 'DJI Mini 2 Drone' }
};

const inboxMessages = [
  { id: 1, name: 'John Smith', product: 'iPhone 12 pro max', message: 'Hii Sir, I am interested', time: '2 min ago' },
  { id: 2, name: 'Sarah Johnson', product: 'Samsung Galaxy S21', message: 'Is this still available?', time: '5 min ago' },
  { id: 3, name: 'Mike Wilson', product: 'MacBook Pro 2021', message: 'Can you ship to Delhi?', time: '10 min ago' },
  { id: 4, name: 'Emma Davis', product: 'iPad Air 4th Gen', message: "What's the best price?", time: '15 min ago' },
  { id: 5, name: 'David Brown', product: 'Sony WH-1000XM4', message: 'Is it in good condition?', time: '20 min ago' },
  { id: 6, name: 'Lisa Anderson', product: 'Nintendo Switch', message: 'Can I see more photos?', time: '25 min ago' },
  { id: 7, name: 'Tom Martinez', product: 'GoPro Hero 9', message: 'Does it include accessories?', time: '30 min ago' },
  { id: 8, name: 'Anna Taylor', product: 'DJI Mini 2 Drone', message: 'Is the warranty valid?', time: '35 min ago' }
];

const mockMessages = [
  { from: 'other', text: (product) => `Hi, I'm interested in your ${product}. Is it still available?`, time: '04:40' },
  { from: 'me', text: () => "Yes, it's still available! What would you like to know about it?", time: '04:42' },
  { from: 'other', text: () => "What's the condition and can you ship to my location?", time: '04:45' },
  { from: 'me', text: () => "It's in excellent condition, barely used. Yes, I can ship anywhere in India.", time: '04:47' },
  { from: 'other', text: () => "Great! What's the best price you can offer?", time: '04:50' },
  { from: 'me', text: () => "I can offer it for ₹45,000. It's a great deal considering the condition.", time: '04:52' },
  { from: 'other', text: (product) => `Can you send me some more photos of the ${product}?`, time: '04:55' },
  { from: 'me', text: () => "Sure! I'll send you detailed photos in the next message.", time: '04:57' },
  { from: 'other', text: () => "Perfect! Also, does it come with the original box and accessories?", time: '05:00' },
  { from: 'me', text: () => "Yes, it comes with the original box, charger, and all accessories. Everything is included.", time: '05:02' },
  { from: 'other', text: () => "That sounds perfect! When can we meet to complete the transaction?", time: '05:05' },
  { from: 'me', text: () => "I'm available tomorrow afternoon. We can meet at a public place for safety.", time: '05:07' },
  { from: 'other', text: () => "Great! Let's meet at the mall near the metro station at 3 PM.", time: '05:10' },
  { from: 'me', text: () => "Perfect! I'll be there at 3 PM. Looking forward to meeting you!", time: '05:12' }
];

const Layout = () => {
  const location = useLocation();
  const isInboxPage = location.pathname === '/inbox' || location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat/');
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const userData = users[userId] || { name: 'User', product: 'Product' };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
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
          <div className="w-96 bg-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: '#FFF3F3' }}>
        <h2 className="text-xl font-bold text-pink-600 m-0">Inbox</h2>
        <div className="flex gap-4 cursor-pointer text-white text-lg">
          <span>ℹ️</span>
          <span>⋮</span>
          <span>✖</span>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="flex gap-2">
          <span className="flex-1 p-3 text-center cursor-pointer bg-blue-500 text-white font-semibold text-sm rounded-lg">All</span>
          <span className="flex-1 p-3 text-center cursor-pointer bg-white text-black font-semibold text-sm rounded-lg border border-gray-300">Unread</span>
          <span className="flex-1 p-3 text-center cursor-pointer bg-white text-black font-semibold text-sm rounded-lg border border-gray-300">Important</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {inboxMessages.map(({ id, name, product, message, time }) => (
          <div
            key={id}
            className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => navigate(`/chat/${id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-6 bg-gray-700 rounded-sm relative">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-gray-600 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-black text-sm">{name}</span>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <span>✓</span>
                    <span>⋮</span>
                  </div>
                </div>
                <p className="text-black text-sm mb-1">{product}</p>
                <p className="text-black text-xs">{message}</p>
                <p className="text-gray-500 text-xs mt-1">{time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
          
          {/* Right Section - Chat Interface or Welcome */}
          {isChatPage ? (
            <div className="flex-1 flex flex-col bg-white h-full">
                  {/* Header */}
                  <div className="bg-blue-600 p-4 flex justify-between items-center text-white flex-shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigate('/inbox')} className="text-white hover:text-gray-200 mr-2">←</button>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">👤</span>
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{userData.name}</span>
                        <p className="text-xs text-gray-200">{userData.product}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="cursor-pointer">ℹ️</span>
                      <span className="cursor-pointer">⋮</span>
                      <span className="cursor-pointer">✖</span>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 relative overflow-hidden bg-gray-50">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url(${chatBG})`,
                      backgroundSize: '200px 200px',
                      backgroundRepeat: 'repeat',
                      backgroundPosition: 'center',
                      backgroundAttachment: 'fixed',
                      opacity: '0.1'
                    }} />
                    <div className="relative z-10 h-full overflow-y-auto">
                      <div className="p-4 min-h-full">
                        <div className="text-center text-gray-500 text-xs mb-4">Today</div>
                        {mockMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex mb-4 items-end gap-2 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.from === 'other' && (
                              <div className="w-8 h-8 bg-pink-400 rounded-full flex-shrink-0"></div>
                            )}
                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${msg.from === 'me'
                              ? 'bg-blue-100 rounded-br-sm text-gray-800'
                              : 'bg-pink-100 rounded-bl-sm text-gray-800'
                              }`}>
                              <p className="mb-1">{typeof msg.text === 'function' ? msg.text(userData.product) : msg.text}</p>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            {msg.from === 'me' && (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Input */}
                  <div className="bg-gray-200 p-4 flex items-center gap-3 flex-shrink-0 relative z-20">
                    <img src="/icons/placeholder.png" alt="Location" className="h-4 w-4 cursor-pointer" />
                    <input
                      type="text"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      autoComplete="off"
                    />
                    <span className="text-xl text-gray-600 cursor-pointer">🎙</span>
                  </div>
                </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to LocalMart Chat</h2>
                <p className="text-gray-600">Select a conversation from the inbox to start chatting.</p>
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
