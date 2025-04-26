"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import LoadingSpinner from '../components/LoadingSpinner';
export default function AgentsPage() {
  const [initialMessage, setInitialMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedMessage = sessionStorage.getItem('tempMessage');
    if (savedMessage) {
      setInitialMessage(savedMessage);
      sessionStorage.removeItem('tempMessage');
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div 
      className="flex-1 flex flex-col h-full overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full bg-[#232425]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <ChatInterface key={initialMessage} initialMessage={initialMessage} />
    </div>
  );
}
