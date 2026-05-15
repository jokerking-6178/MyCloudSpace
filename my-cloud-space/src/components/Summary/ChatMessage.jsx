import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            : isSystem
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.sources.map((source, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
              >
                📄 {source.fileName || `Chunk ${idx + 1}`}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
      </div>
    </div>
  );
};

export default ChatMessage;