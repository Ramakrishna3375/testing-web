import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';

const ChatInterface = ({ userInfo, productInfo, onClose }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Default info - will be replaced with real data from props or API
  const currentUserInfo = userInfo || {
    name: `User ${userId}`,
    email: 'user@example.com',
    phone: 'Not provided',
    location: 'Not specified',
    joinDate: 'Recently',
    rating: 0,
    totalAds: 0,
    avatar: null
  };

  const currentProductInfo = productInfo || {
    name: 'Product Chat',
    category: 'General',
    price: 'Contact for price',
    location: 'Not specified'
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioMessage = {
          id: Date.now(),
          type: 'audio',
          content: audioUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'me'
        };
        
        setMessages(prev => [...prev, audioMessage]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        type: 'text',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Navigate back to the product page or previous page
      navigate(-1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // User Info Modal Component
  const UserInfoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Information</h3>
          <button 
            onClick={() => setShowUserInfo(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✖
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              {currentUserInfo.avatar ? (
                <img src={currentUserInfo.avatar} alt="User" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-600">👤</span>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-800">{currentUserInfo.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{currentUserInfo.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-gray-800">{currentUserInfo.phone}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="text-gray-800">{currentUserInfo.location}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="text-gray-800">{currentUserInfo.joinDate}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <label className="text-sm font-medium text-gray-600">Rating</label>
                <p className="text-gray-800">
                  {currentUserInfo.rating > 0 ? `⭐ ${currentUserInfo.rating}/5` : 'No ratings yet'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Ads</label>
                <p className="text-gray-800">{currentUserInfo.totalAds}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">About this conversation</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Product:</span> {currentProductInfo.name}</p>
              <p><span className="font-medium">Category:</span> {currentProductInfo.category}</p>
              <p><span className="font-medium">Price:</span> {currentProductInfo.price}</p>
              <p><span className="font-medium">Location:</span> {currentProductInfo.location}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button 
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              onClick={() => {
                // Navigate to user profile or handle view profile action
                console.log('View profile clicked');
              }}
            >
              View Profile
            </button>
            <button 
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              onClick={() => {
                // Handle call action
                if (currentUserInfo.phone && currentUserInfo.phone !== 'Not provided') {
                  window.location.href = `tel:${currentUserInfo.phone}`;
                } else {
                  alert('Phone number not available');
                }
              }}
            >
              Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex-1 flex flex-col bg-white h-full">
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white flex-shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/inbox')} className="text-white hover:text-gray-200 mr-2">←</button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
            <div>
              <span className="font-semibold text-sm">{currentUserInfo.name}</span>
              <p className="text-xs text-gray-200">{currentProductInfo.name}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              className="cursor-pointer hover:text-gray-300 transition-colors"
              onClick={() => setShowUserInfo(true)}
              title="User Information"
            >
              ℹ
            </button>
            <span className="cursor-pointer hover:text-gray-300 transition-colors">⋮</span>
            <button 
              className="cursor-pointer hover:text-gray-300 transition-colors" 
              onClick={handleClose}
              title="Close Chat"
            >
              ✖
            </button>
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
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-sm mb-4">Send a message to begin chatting about this product.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
                      <p className="text-xs text-blue-700">
                        This is a real-time chat. Messages will appear here when you or the other person sends them.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center text-gray-500 text-xs mb-4">Today</div>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex mb-4 items-end gap-2 justify-end"
                    >
                      <div className="max-w-[70%] p-3 rounded-2xl shadow-sm text-sm bg-blue-100 rounded-br-sm text-gray-800">
                        {msg.type === 'text' ? (
                          <p className="mb-1">{msg.content}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <audio controls className="max-w-full">
                              <source src={msg.content} type="audio/wav" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="bg-red-100 border-t border-red-200 p-2 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="bg-gray-200 p-4 flex items-center gap-3 flex-shrink-0 relative z-20">
          <button 
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Attach file"
          >
            📎
          </button>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoComplete="off"
            disabled={isRecording}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isRecording}
            className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
            title="Send message"
          >
            ➤
          </button>
        </div>
      </div>

      {/* User Info Modal */}
      {showUserInfo && <UserInfoModal />}
    </>
  );
};

export default ChatInterface;