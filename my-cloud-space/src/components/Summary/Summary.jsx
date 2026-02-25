import React, { useState } from 'react';

const Summary = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your AI assistant. I can help you summarize files, answer questions, and organize your documents. What can I help you with today?', sender: 'ai', timestamp: '10:30 AM' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, userMessage]);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: 'I understand your request. Let me analyze your files and provide you with a summary...',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const quickActions = [
    { id: 1, text: 'Summarize my latest files', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 2, text: 'Find duplicate files', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 3, text: 'Organize by category', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Assistant</h2>
            <p className="text-xs text-blue-100">Always ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-2xl px-4 py-2.5 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
        <div className="flex gap-2 flex-wrap">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.text)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}/>
              </svg>
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your files..."
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 px-4 py-3 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Summary;