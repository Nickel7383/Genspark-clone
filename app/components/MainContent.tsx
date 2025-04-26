'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';

export default function MainContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sessionStorage.setItem('tempMessage', message);
    router.push('/agents');
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden items-center justify-center bg-[#232425]">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">AI 에이전트</h2>
          <p className="text-gray-400">채팅을 시작하려면 로그인해주세요</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            로그인
          </button>
        </div>
      </div>
    );    
  }

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full bg-[#232425]"
    >
      <div className='max-w-[850px] w-full mx-auto flex-1 flex flex-col h-full'>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Genspark 슈퍼 에이전트</h2>
          <form onSubmit={handleSubmit} className="w-full mx-auto relative px-8">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
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
                className="absolute right-3 bottom-4 w-8 h-8 flex items-center justify-center text-white rounded-full bg-gray-500 hover:bg-gray-600 transition-opacity"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 