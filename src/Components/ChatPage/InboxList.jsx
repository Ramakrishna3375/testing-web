import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InboxList = ({ messages = [], onFilterChange }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter messages based on active filter
  const getFilteredMessages = () => {
    switch (activeFilter) {
      case 'unread':
        return messages.filter(msg => !msg.isRead);
      case 'important':
        return messages.filter(msg => msg.isImportant);
      default:
        return messages;
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="w-96 bg-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: '#FFF3F3' }}>
        <h2 className="text-xl font-bold text-pink-600 m-0">Inbox</h2>
        <div className="flex gap-4 cursor-pointer text-gray-600 text-lg">
          <span>ℹ</span>
          <span>⋮</span>
          <span>✖</span>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="flex gap-2">
          <span 
            className={`flex-1 p-3 text-center cursor-pointer font-semibold text-sm rounded-lg ${
              activeFilter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-black border border-gray-300'
            }`}
            onClick={() => handleFilterClick('all')}
          >
            All
          </span>
          <span 
            className={`flex-1 p-3 text-center cursor-pointer font-semibold text-sm rounded-lg ${
              activeFilter === 'unread' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-black border border-gray-300'
            }`}
            onClick={() => handleFilterClick('unread')}
          >
            Unread
          </span>
          <span 
            className={`flex-1 p-3 text-center cursor-pointer font-semibold text-sm rounded-lg ${
              activeFilter === 'important' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-black border border-gray-300'
            }`}
            onClick={() => handleFilterClick('important')}
          >
            Important
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
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
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors ${
                message.isRead ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
              onClick={() => navigate(`/chat/${message.id}`)}
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
                    <span className={`text-sm ${message.isRead ? 'font-normal text-gray-700' : 'font-bold text-black'}`}>
                      {message.senderName}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      {message.isImportant && <span className="text-yellow-500">⭐</span>}
                      {!message.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                      <span>📎</span>
                      <span>⋮</span>
                    </div>
                  </div>
                  <p className="text-black text-sm mb-1">{message.productName}</p>
                  <p className="text-black text-xs">{message.lastMessage}</p>
                  <p className="text-gray-500 text-xs mt-1">{message.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InboxList;