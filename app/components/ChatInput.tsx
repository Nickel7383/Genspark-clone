'use client';

import { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '@/app/lib/aiResponse';

interface ChatInputProps {
  initialMessage?: string;
  onSendMessage: (message: string, isUser: boolean) => void;
  messages: { text: string; isUser: boolean }[];
  onStreamEnd?: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro exp' },
  { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' }
];

export default function ChatInput({ 
  initialMessage, 
  onSendMessage, 
  messages, 
  onStreamEnd, 
  selectedModel,
  onModelChange 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [hasInitialMessageSent, setHasInitialMessageSent] = useState(false);

  // API 키 가져오기
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch('/api/user/api-key');
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey || '');
        }
      } catch (error) {
        console.error('API 키 조회 중 오류:', error);
      }
    }

    fetchApiKey();
  }, []);

  // initialMessage가 있을 때 처음 한 번만 전송
  useEffect(() => {
    if (initialMessage && !hasInitialMessageSent && apiKey) {

      setHasInitialMessageSent(true);
      
      // 약간의 지연 후 메시지 전송
      setTimeout(() => {
        if (!isLoading) {
          setIsLoading(true);
          onSendMessage(initialMessage, true);
          
          getAIResponse(
            initialMessage,
            messages,
            selectedModel,
            apiKey,
            onSendMessage,
            () => {
              setIsLoading(false);
              onStreamEnd?.();
            }
          );
          setIsLoading(false);
        }
      }, 100);
    }
  }, [initialMessage, apiKey]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    onSendMessage(message, true);
    setMessage('');

    await getAIResponse(
      message,
      messages,
      selectedModel,
      apiKey,
      onSendMessage,
      () => {
        setIsLoading(false);
        onStreamEnd?.();
      }
    );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full mx-auto relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
            handleSubmit(e);
            }
          }
        }}
        placeholder="무엇이든 물어보세요"
        className="w-full p-3 pr-24 bg-[#333333] text-gray-200 border border-gray-600 rounded-xl focus:outline-none min-h-[100px] resize-none"
        rows={4}
      />
      <div className="absolute right-3 bottom-4 flex items-center gap-2">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
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