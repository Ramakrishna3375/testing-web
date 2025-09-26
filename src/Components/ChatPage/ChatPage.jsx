import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import { useAuth } from '../../hooks/useAuth.js';
import { getChatUsers, getChatMessagesByAdId, sendChatMessage } from '../../Services/api';
 
const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { adId: paramAdId } = useParams();
 
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [chatUsers, setChatUsers] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const chatMessagesEndRef = useRef(null);
 
  // Dummy info (replace with real data if available)
  const currentUserInfo = { name: 'Chat User', email: 'user@example.com', phone: '+1 (000) 000-0000', location: 'Location', joinDate: 'Recently', rating: 0, totalAds: 0, avatar: null };
  const currentProductInfo = { name: 'Product', category: 'Category', price: 'Price on request', location: 'Location' };
 
  // Fetch chat users
  useEffect(() => {
    if (!user?.id) return;
    setLoadingInbox(true);
    getChatUsers(sessionStorage.getItem('token'))
      .then(res => setChatUsers(res.data.chatUsers || []))
      .catch(() => setChatUsers([]))
      .finally(() => setLoadingInbox(false));
  }, [user]);
 
  // Fetch last message for each chat user
  useEffect(() => {
    if (!chatUsers.length || !user?.token) return;
    Promise.all(chatUsers.map(async chatUser => {
      try {
        const res = await getChatMessagesByAdId(chatUser.adId, user.token);
        const msgs = res.data?.chatMessages || [];
        return { adId: chatUser.adId, lastMsg: msgs.at(-1) || null };
      } catch { return { adId: chatUser.adId, lastMsg: null }; }
    })).then(results => {
      const obj = {};
      results.forEach(({ adId, lastMsg }) => { obj[adId] = lastMsg; });
      setLastMessages(obj);
    });
  }, [chatUsers, user]);
 
  // Filter chat users
  const filteredMessages = chatUsers.filter(u =>
    activeFilter === 'unread' ? !u.isRead :
    activeFilter === 'important' ? u.isImportant : true
  );
 
  // Fetch messages for selected ad
  useEffect(() => {
    if (!paramAdId || !user?.token) { setMessages([]); setLoadingChat(false); return; }
    setLoadingChat(true);
    getChatMessagesByAdId(paramAdId, user.token)
      .then(res => setMessages(res.data.chatMessages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingChat(false));
  }, [paramAdId, user]);
 
  // Scroll to bottom on new message
  useEffect(() => { chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
 
  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !paramAdId) return;
    try {
      const res = await sendChatMessage(user.id, paramAdId, message.trim(), user.token);
      setMessages(prev => [...prev, res.data.chatMessage]);
      setMessage('');
    } catch { alert('Failed to send message.'); }
  };
 
  // UI
  const isChatView = location.pathname.startsWith('/chat/');
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 min-h-screen p-2 md:p-4 lg:p-6">
        <div className="mb-2 text-gray-500 text-sm text-left">
          <span>Home</span> &gt; <span>Categories</span> &gt; <span>Mobiles</span> &gt; <span className="text-orange-500 font-semibold">Inbox</span>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 h-[calc(100vh-120px)] bg-white rounded-lg overflow-hidden shadow-lg">
          {/* Inbox List */}
          <div className={`${isChatView && paramAdId ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white flex-col flex-shrink-0`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100">
              <h2 className="text-xl font-bold text-pink-600 m-0">Inbox</h2>
              <div className="flex gap-3 cursor-pointer text-gray-600 text-lg">
                <span>ℹ</span><span>⋮</span><span>✖</span>
              </div>
            </div>
            <div className="p-3 bg-white">
              <div className="flex gap-2 text-xs">
                {['all', 'unread', 'important'].map(filter => (
                  <span
                    key={filter}
                    className={`flex-1 p-2 text-center cursor-pointer font-semibold rounded-lg ${activeFilter === filter ? 'bg-blue-500 text-white' : 'bg-white text-black border border-gray-300'}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loadingInbox ? (
                <div className="flex items-center justify-center h-full text-gray-500">Loading chats...</div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">
                      {activeFilter === 'unread' && 'No unread messages'}
                      {activeFilter === 'important' && 'No important messages'}
                      {activeFilter === 'all' && 'No conversations yet'}
                    </h3>
                    <p className="text-sm">
                      {activeFilter === 'unread' && 'All your messages have been read.'}
                      {activeFilter === 'important' && 'Mark messages as important to see them here.'}
                      {activeFilter === 'all' && 'When someone messages you about a product, it will appear here.'}
                    </p>
                  </div>
                </div>
              ) : (
                filteredMessages.map(chatUser => {
                  const lastMsg = lastMessages[chatUser.adId];
                  return (
                    <div
                      key={chatUser.adId}
                      className="rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors bg-gray-100"
                      onClick={() => navigate(`/chat/${chatUser.adId}`)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-7 h-5 bg-gray-700 rounded-sm relative"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-black">{chatUser.productName || chatUser.adId}</span>
                            <div className="flex items-center gap-1 text-gray-500 text-xs"><span>📎</span><span>⋮</span></div>
                          </div>
                          <p className="text-black text-sm mb-1">{lastMsg?.message || 'No messages yet.'}</p>
                          <p className="text-gray-500 text-xs mt-1">{lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* Chat Interface */}
          <div className={`${isChatView && paramAdId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white h-full`}>
            {isChatView && paramAdId ? (
              <>
                <div className="bg-blue-600 p-3 flex justify-between items-center text-white flex-shrink-0 relative z-20">
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/inbox')} className="text-white hover:text-gray-200 mr-2">←</button>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600 text-sm">👤</span></div>
                    <div>
                      <span className="font-semibold text-sm">{currentUserInfo.name}</span>
                      <p className="text-xs text-gray-200">{currentProductInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="cursor-pointer hover:text-gray-300" onClick={() => setShowUserInfo(true)} title="User Information">ℹ</button>
                    <span className="cursor-pointer hover:text-gray-300">⋮</span>
                    <button className="cursor-pointer hover:text-gray-300" onClick={() => navigate('/inbox')} title="Close Chat">✖</button>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-gray-50">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url(${chatBG})`,
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    opacity: '0.1'
                  }} />
                  <div className="relative z-10 h-full overflow-y-auto p-3">
                    <div className="min-h-full">
                      {loadingChat ? (
                        <div className="flex items-center justify-center h-full text-gray-500">Loading chat...</div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                            <p className="text-sm mb-4">Send a message to begin chatting about this product.</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
                              <p className="text-xs text-blue-700">This is a real-time chat. Messages will appear here when you or the other person sends them.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-center text-gray-500 text-xs mb-3">Today</div>
                          {messages.map((msg) => (
                            <div key={msg._id} className={`flex mb-3 items-end gap-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                              {msg.sender !== user.id && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                                  <span className="text-gray-600 text-sm">👤</span>
                                </div>
                              )}
                              <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${msg.sender === user.id ? 'bg-blue-100 rounded-br-sm text-gray-800' : 'bg-gray-200 rounded-bl-sm text-gray-800'}`}>
                                <p className="mb-1">{msg.message}</p>
                                <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {msg.sender === user.id && <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>}
                            </div>
                          ))}
                          <div ref={chatMessagesEndRef} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-200 p-3 flex items-center gap-3 flex-shrink-0 relative z-20">
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="Attach file">📎</button>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    title="Send message"
                  >➤</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center p-4">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to LocalMart Chat</h2>
                  <p className="text-gray-600 mb-2">Connect with buyers and sellers instantly</p>
                  <p className="text-sm text-gray-500 mb-4">Start a conversation from a product page to begin chatting.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
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
          {/* User Info Modal */}
          {showUserInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  <button onClick={() => setShowUserInfo(false)} className="text-gray-500 hover:text-gray-700 text-xl">✖</button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      {currentUserInfo.avatar ? (
                        <img src={currentUserInfo.avatar} alt="User" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl text-gray-600">👤</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-sm font-medium text-gray-600">Name</label><p className="text-gray-800">{currentUserInfo.name}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Email</label><p className="text-gray-800">{currentUserInfo.email}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Phone</label><p className="text-gray-800">{currentUserInfo.phone}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Location</label><p className="text-gray-800">{currentUserInfo.location}</p></div>
                    <div><label className="text-sm font-medium text-gray-600">Member Since</label><p className="text-gray-800">{currentUserInfo.joinDate}</p></div>
                    <div className="flex justify-between">
                      <div><label className="text-sm font-medium text-gray-600">Rating</label><p className="text-gray-800">{currentUserInfo.rating > 0 ? `⭐ ${currentUserInfo.rating}/5` : 'No ratings yet'}</p></div>
                      <div><label className="text-sm font-medium text-gray-600">Total Ads</label><p className="text-gray-800">{currentUserInfo.totalAds}</p></div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">About this conversation</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Product:</span> {currentProductInfo.name}</p>
                      <p><span className="font-medium">Category:</span> {currentProductInfo.category}</p>
                      <p><span className="font-medium">Price:</span> {currentProductInfo.price}</p>
                      <p><span className="font-medium">Location:</span> {currentProductInfo.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={() => {}}>View Profile</button>
                    <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600" onClick={() => {
                      if (currentUserInfo.phone && currentUserInfo.phone !== 'Not provided') window.location.href = `tel:${currentUserInfo.phone}`;
                      else alert('Phone number not available');
                    }}>Call</button>
                  </div>
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
 
export default ChatPage;
 