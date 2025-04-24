"use client";

import { useState, useRef, useEffect } from "react";
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';

interface Message {
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [isTabOpen, setIsTabOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tabWidth = isTabOpen ? 256 : 64;
  const contentMarginLeft = `${tabWidth}px`;

  const handleNewMessage = (message: string, isUser: boolean) => {
    setMessages((prev) => [...prev, { text: message, isUser }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212' }}>
      {/* 왼쪽 고정 탭 */}
      <div className={`fixed left-0 top-0 h-screen bg-[#1a1a1a] text-white p-4 transition-all duration-300 ${isTabOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex justify-between items-center mb-6">
          {isTabOpen && <h2 className="text-xl font-bold">메뉴</h2>}
          <button 
            onClick={() => setIsTabOpen(!isTabOpen)}
            className="p-2 hover:bg-gray-700 rounded-xl"
          >
            {isTabOpen ? '◀' : '▶'}
          </button>
        </div>
        <ul className="space-y-4">
          <li 
            className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center"
            onClick={() => window.location.href = '/'}
          >
            {isTabOpen ? '홈' : '🏠'}
          </li>
          <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
            {isTabOpen ? '테스트' : 'ℹ️'}
          </li>
          <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
            {isTabOpen ? '테스트' : '🔧'}
          </li>
          <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
            {isTabOpen ? '테스트' : '📞'}
          </li>
        </ul>
      </div>

      {/* 메인 콘텐츠 */}
      <div 
        className="flex flex-col transition-all duration-300 min-h-screen"
        style={{ marginLeft: contentMarginLeft }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-3xl font-bold mb-6 text-white">AI 에이전트</h2>
            <div className="w-[800px]">
              <ChatInput onSendMessage={handleNewMessage} messages={messages} />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 text-white text-center mt-8">AI 에이전트</h2>
            <div className="flex-1 overflow-y-auto mb-4 px-8">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isUser={message.isUser}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="px-8 pb-8">
              <ChatInput onSendMessage={handleNewMessage} messages={messages} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
