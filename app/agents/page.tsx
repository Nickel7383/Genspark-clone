"use client";

import { useState, useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [initialMessage, setInitialMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);

  // sessionStorage에서 메시지 가져오기
  useEffect(() => {
    const savedMessage = sessionStorage.getItem('tempMessage');
    if (savedMessage) {
      setInitialMessage(savedMessage);
      sessionStorage.removeItem('tempMessage');
    }
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    updateChatList();
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '새 대화', messages: [] }),
      });
      
      if (!res.ok) {
        throw new Error('새 대화 생성에 실패했습니다.');
      }
      
      const newChat: Chat = await res.json();
      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
      setInitialMessage('');
    } catch (error) {
      console.error('새 대화 생성 중 오류:', error);
      alert('새 대화를 생성하는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  const updateChatList = async () => {
    try {
      const res = await fetch('/api/chat');
      if (!res.ok) {
        // 대화 목록이 없거나 오류가 발생한 경우 조용히 빈 배열 반환
        setChats([]);
        return;
      }
      const data: Chat[] = await res.json();
      setChats(data);
    } catch (error) {
      // 오류 발생 시 조용히 빈 배열 반환
      setChats([]);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat?id=${chatId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('대화 삭제에 실패했습니다.');
      }
      
      // 삭제된 대화를 목록에서 제거
      setChats(chats.filter(chat => chat.id !== chatId));
      
      // 삭제된 대화가 현재 선택된 대화였다면 선택 해제
      if (selectedChatId === chatId) {
        setSelectedChatId(undefined);
      }
    } catch (error) {
      console.error('대화 삭제 중 오류:', error);
      alert('대화를 삭제하는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <ChatSidebar 
        onSelectChat={handleSelectChat} 
        onNewChat={handleNewChat} 
        selectedChatId={selectedChatId}
        onDeleteChat={handleDeleteChat}
      />
      <ChatInterface 
        key={selectedChatId}
        initialMessage={initialMessage} 
        selectedChatId={selectedChatId}
      />
    </div>
  );
}
