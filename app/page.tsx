'use client';

import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

export default function Home() {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <MainContent />
    </div>
  );
}
