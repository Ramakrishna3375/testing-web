import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatBG from '../../assets/Website logos/chatBG.png';

const ChatInterface = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Get product info from URL params or props (you can modify this based on your routing)
  const productInfo = {
    name: `User ${userId}`,
    product: 'Product Chat'
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
        
        // Add audio message to chat
        const audioMessage = {
          id: Date.now(),
          type: 'audio',
          content: audioUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'me'
        };
        
        setMessages(prev => [...prev, audioMessage]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <span className="font-semibold text-sm">{productInfo.name}</span>
            <p className="text-xs text-gray-200">{productInfo.product}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="cursor-pointer">ℹ</span>
          <span className="cursor-pointer">⋮</span>
          <span className="cursor-pointer" onClick={() => navigate('/inbox')}>✖</span>
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
                  <p className="text-sm">Send a message to begin chatting about this product.</p>
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
  );
};

export default ChatInterface;