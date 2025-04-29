'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useSession } from 'next-auth/react';

interface Message {
  text: string;
  isUser: boolean;
  imageUrl?: string;
}

interface ChatInterfaceProps {
  initialMessage?: string;
  selectedChatId?: string;
}

export default function ChatInterface({ initialMessage, selectedChatId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [chatId, setChatId] = useState<string | null>(selectedChatId || null);
  const [isSaving, setIsSaving] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  // 선택된 채팅의 메시지 불러오기
  useEffect(() => {
    async function fetchChatMessages() {
      if (!selectedChatId) return;
      
      try {
        const response = await fetch(`/api/chat?id=${selectedChatId}`);
        if (!response.ok) {
          throw new Error('채팅 메시지를 불러오는데 실패했습니다.');
        }
        
        const chat = await response.json();
        setMessages(chat.messages || []);
        setChatId(chat.id);
      } catch (error) {
        console.error('채팅 메시지 조회 중 오류:', error);
        setMessages([]);
      }
    }
    
    fetchChatMessages();
  }, [selectedChatId]);

  // 대화 저장 함수
  const saveChat = useCallback(async (messagesToSave: Message[]) => {
    if (!session?.user || isSaving || messagesToSave.length === 0) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/chat', {
        method: chatId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(chatId && { chatId }),
          messages: messagesToSave,
          title: messagesToSave.find(msg => msg.isUser)?.text.slice(0, 50) || '새로운 대화',
        }),
      });

      if (!response.ok) {
        throw new Error('대화 저장에 실패했습니다.');
      }

      const data = await response.json();
      // chatId가 없을 때만 새로 설정
      if (!chatId) {
        setChatId(data.id);
      }
    } catch (error) {
      console.error('대화 저장 중 오류:', error);
    } finally {
      setIsSaving(false);
    }
  }, [chatId, isSaving, session?.user]);

  // 메시지 상태 업데이트 함수
  const updateMessages = useCallback((newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      setMessages(prev => {
        const updated = newMessages(prev);
        messagesRef.current = updated;
        return updated;
      });
    } else {
      setMessages(newMessages);
      messagesRef.current = newMessages;
    }
  }, []);

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

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('MODEL_STORAGE_KEY', model);
    }
  };

  const handleNewMessage = useCallback((message: string, isUser: boolean, imageUrl?: string) => {
    if (isUser) {
      updateMessages(prev => [...prev, { text: message, isUser, imageUrl }]);
      setIsStreaming(true);
    } else {
      updateMessages(prev => {
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
  }, [updateMessages]);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    // AI 응답이 완전히 끝난 후에만 대화 저장
    saveChat(messagesRef.current);
  }, [saveChat]);

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
                            imageUrl={message.imageUrl}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            <div className="sticky bottom-0 px-8 bg-gradient-to-b from-transparent via-[#232425] via-20% to-[#232425]">
                <div className="py-4">
                <ChatInput 
                    initialMessage={initialMessage}
                    onSendMessage={handleNewMessage} 
                    messages={messages} 
                    onStreamEnd={handleStreamEnd}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                />
                </div>
            </div>
        </div>
    </div>
  );
} 