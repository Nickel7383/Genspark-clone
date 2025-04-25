"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

export default function AgentsPage() {
  const [initialMessage, setInitialMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setInitialMessage(message);
    }
  }, [searchParams]);

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <ChatInterface initialMessage={initialMessage} />
    </div>
  );
} 