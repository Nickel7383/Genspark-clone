"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

function AgentsContent() {
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

export default function AgentsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    }>
      <AgentsContent />
    </Suspense>
  );
} 