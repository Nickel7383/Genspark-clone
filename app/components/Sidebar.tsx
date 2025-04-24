import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-screen bg-[#1a1a1a] text-white p-4 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex justify-between items-center mb-6">
        {isOpen && <h2 className="text-xl font-bold">메뉴</h2>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700 rounded-xl"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
      <ul className="space-y-4">
        <li 
          className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center"
          onClick={() => window.location.href = '/'}
        >
          {isOpen ? '홈' : '🏠'}
        </li>
        <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
          {isOpen ? '테스트' : 'ℹ️'}
        </li>
        <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
          {isOpen ? '테스트' : '🔧'}
        </li>
        <li className="hover:bg-gray-800 p-2 rounded-xl cursor-pointer flex items-center">
          {isOpen ? '테스트' : '📞'}
        </li>
      </ul>
    </div>
  );
} 