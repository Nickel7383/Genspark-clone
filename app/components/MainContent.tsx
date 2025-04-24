'use client';

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface Message {
  text: string;
  isUser: boolean;
}

export default function MainContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleNewMessage = (message: string, isUser: boolean) => {
    if (isUser) {
      setMessages(prev => [...prev, { text: message, isUser }]);
    } else {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          newMessages[newMessages.length - 1] = { text: message, isUser };
        } else {
          newMessages.push({ text: message, isUser });
        }
        return newMessages;
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#232425]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

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
    <div className="flex-1 flex flex-col h-full overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full bg-[#232425]">
      <div className='max-w-[850px] w-full mx-auto flex-1 flex flex-col h-full'>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-6 text-white">AI 에이전트</h2>
            <div className="w-full">
              <ChatInput onSendMessage={handleNewMessage} messages={messages} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 px-8">
              <div className="space-y-4 pt-8">
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
            <div className="sticky bottom-0 px-8 bg-gradient-to-b from-transparent via-[#232425] via-20% to-[#232425]">
              <div className="py-4">
                <ChatInput onSendMessage={handleNewMessage} messages={messages} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 