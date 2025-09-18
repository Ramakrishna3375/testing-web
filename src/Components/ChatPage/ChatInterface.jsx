import { useState } from 'react';
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
  { from: 'me', text: () => "Perfect! I'll be there at 3 PM. Looking forward to meeting you", time: '05:12' }
];

const ChatInterface = () => {
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
  );
};

export default ChatInterface;