import React, { useState, useRef, useEffect } from 'react';
import { useRag } from './useRag';
import FilePicker from './FilePicker';
import ChatMessage from './ChatMessage';

const Summary = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const {
    messages,
    selectedFile,
    isIngesting,
    isChatting,
    ingestedFiles,
    handleFileSelect,
    handleSendMessage,
    handleClearConversation
  } = useRag();

  const quickActions = [
    'Summarize this document',
    'What are the key points?',
    'List the main topics',
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || isChatting || isIngesting) return;

    handleSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleQuickAction = (action) => {
    if (!selectedFile || isIngesting) return;
    handleSendMessage(action);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Assistant</h2>
              {selectedFile ? (
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active: {selectedFile.fileName}
                </p>
              ) : (
                <p className="text-xs text-blue-100">Select a file to start</p>
              )}
            </div>
          </div>

          <button
            onClick={handleClearConversation}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-1.5 text-sm transition-all"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isChatting && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <FilePicker
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            ingestedFiles={ingestedFiles}
            isIngesting={isIngesting}
          />

          {selectedFile && ingestedFiles.has(selectedFile.id) && (
            <div className="flex gap-2 flex-wrap flex-1">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  disabled={isIngesting || isChatting}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={selectedFile ? "Ask me anything about this file..." : "Select a file first..."}
            disabled={!selectedFile || isIngesting || isChatting}
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 px-4 py-3 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!selectedFile || isIngesting || isChatting || inputMessage.trim() === ''}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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