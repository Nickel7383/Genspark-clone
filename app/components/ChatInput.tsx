'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatInputProps {
  onSendMessage: (message: string, isUser: boolean) => void;
  messages: { text: string; isUser: boolean }[];
  onStreamEnd?: () => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro exp' },
  { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' }
];

export default function ChatInput({ onSendMessage, messages, onStreamEnd }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('MODEL_STORAGE_KEY');
      if (savedModel) {
        setSelectedModel(savedModel);
      } else {
        localStorage.setItem('MODEL_STORAGE_KEY', 'gemini-2.0-flash');
      }
    }
  }, []);

  const changeModel = (model: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('MODEL_STORAGE_KEY', model);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    onSendMessage(message, true);
    setMessage('');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
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
      
      const result = await chat.sendMessageStream(message);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onSendMessage(fullResponse, false);
      }
      onStreamEnd?.();
    } catch (error) {
      console.error('Error:', error);
      onSendMessage('죄송합니다. 오류가 발생했습니다.', false);
      onStreamEnd?.();
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
        className="w-full p-3 pr-24 bg-[#333333] text-gray-200 border border-gray-600 rounded-xl focus:outline-none min-h-[100px] resize-none"
        rows={4}
      />
      <div className="absolute right-3 bottom-4 flex items-center gap-2">
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            changeModel(e.target.value);
          }}
          className="bg-[#333333] text-gray-200 border border-gray-600 rounded-full px-3 py-1 text-xs focus:outline-none hover:bg-[#404040] transition-colors appearance-none cursor-pointer"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-8 h-8 flex items-center justify-center text-white rounded-full transition-opacity ${
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
      </div>
    </form>
  );
} 