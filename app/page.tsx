"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/agents?message=${encodeURIComponent(input)}`);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <MainContent />
    </div>
  );
}
