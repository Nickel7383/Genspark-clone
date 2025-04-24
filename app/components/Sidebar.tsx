import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();

  return (
    <div className={`h-screen bg-[#1a1a1a] text-white p-4 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
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
      <div className="mt-auto">
        {session ? (
          <div className="flex flex-col gap-2">
            <div className="p-2 bg-gray-800 rounded-xl">
              {isOpen ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={session.user?.image || ''} 
                    alt="프로필" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm">{session.user?.name}</span>
                </div>
              ) : (
                <img 
                  src={session.user?.image || ''} 
                  alt="프로필" 
                  className="w-8 h-8 rounded-full mx-auto object-cover"
                />
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              {isOpen ? (
                <>
                  <span>로그아웃</span>
                </>
              ) : (
                '🚪'
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer"
          >
            {isOpen ? (
              <>
                <span>Google 로그인</span>
              </>
            ) : (
              '🔑'
            )}
          </button>
        )}
      </div>
    </div>
  );
} 