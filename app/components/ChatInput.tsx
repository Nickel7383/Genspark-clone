'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatInputProps {
  onSendMessage: (message: string, isUser: boolean) => void;
  messages: { text: string; isUser: boolean }[];
}

export default function ChatInput({ onSendMessage, messages }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    onSendMessage(message, true);
    setMessage('');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // 대화 히스토리 생성
      const chatHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // 현재 메시지 추가
      chatHistory.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // 채팅 시작
      const chat = model.startChat({
        history: chatHistory
      });
      
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      onSendMessage(text, false);
    } catch (error) {
      console.error('Error:', error);
      onSendMessage('죄송합니다. 오류가 발생했습니다.', false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="무엇이든 물어보세요"
        className="w-full p-3 pr-12 bg-[#333333] text-gray-200 border border-gray-600 rounded-xl focus:outline-none min-h-[100px] resize-none"
        rows={4}
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`absolute right-3 bottom-4 w-8 h-8 flex items-center justify-center text-white rounded-full transition-opacity ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
        }`}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        )}
      </button>
    </form>
  );
} 