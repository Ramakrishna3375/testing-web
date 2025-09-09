import React from 'react';
import { useNavigate } from 'react-router-dom';

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

const InboxList = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default InboxList;