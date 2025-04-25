'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ text: initialMessage, isUser: true }]);
      setIsStreaming(true);
    }
  }, [initialMessage]);

  const handleNewMessage = useCallback((message: string, isUser: boolean) => {
    if (isUser) {
      setMessages(prev => [...prev, { text: message, isUser }]);
      setIsStreaming(true);
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
  }, []);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (scrollTop < lastScrollTop) {
      setIsStreaming(false);
    } else if (isNearBottom) {
      setIsStreaming(true);
    }
    
    setLastScrollTop(scrollTop);
  }, [lastScrollTop]);

  useEffect(() => {
    if (isStreaming) {
      const container = messagesEndRef.current?.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages, isStreaming]);

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full bg-[#232425]"
      onScroll={handleScroll}
    >
        <div className='max-w-[850px] w-full mx-auto flex-1 flex flex-col h-full'>
            <div className="flex-1 px-8">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <h2 className="text-3xl font-bold text-white">안녕하세요, 무엇을 도와드릴까요?</h2>
                    </div>
                ) : (
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
                )}
            </div>
            <div className="sticky bottom-0 px-8 bg-gradient-to-b from-transparent via-[#232425] via-20% to-[#232425]">
                <div className="py-4">
                <ChatInput 
                    onSendMessage={handleNewMessage} 
                    messages={messages} 
                    onStreamEnd={handleStreamEnd}
                />
                </div>
            </div>
        </div>
    </div>
  );
} 