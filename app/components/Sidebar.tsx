'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
        setIsOpen(true);
      }
    };

    // 초기 실행
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/agents', label: '슈퍼 에이전트', icon: '💬' },
    { path: '/test3', label: '이미지 스튜디오', icon: '📞' },
    { path: '/test2', label: '딥 리서치', icon: '🔧' },
  ];

  const profileMenu = [
    { path: '/profile', label: '나', icon: '👤' },
  ];

  return (
    <div className={`h-screen bg-[#1a1a1a] text-white p-3 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} ${!isVisible ? 'hidden' : ''} flex flex-col`}>
      <div className="flex justify-between items-center mb-6">
        {isOpen && (
          <h2 
            className="text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200 ml-2"
            onClick={() => router.push('/')}
          >
            Genspark
          </h2>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700 rounded-xl"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <React.Fragment key={`${item.path}-fragment`}>
            <li 
              key={item.path}
              className="p-1 cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              {isOpen ? (
                <span className={`${pathname === item.path ? 'bg-white text-gray-900' : 'text-white hover:bg-gray-800'} px-3 py-2 rounded-3xl transition-all duration-200 whitespace-nowrap text-base`}>
                  {item.label}
                </span>
              ) : (
                <span className={`${pathname === item.path ? 'bg-white text-gray-900' : 'text-white hover:bg-gray-800'} px-1.5 py-2 rounded-3xl transition-all duration-200 whitespace-nowrap text-base`}>
                  {item.icon}
                </span>
              )}
            </li>
            {index === 0 && <hr className="border-gray-700 my-5" />}
          </React.Fragment>
        ))}
      </ul>
      <hr className="border-gray-700 my-5" />
      <ul className="space-y-4">
        {profileMenu.map((item) => (
          <li 
            key={item.path}
            className="p-1 cursor-pointer"
            onClick={() => router.push(item.path)}
          >
            {isOpen ? (
              <span className={`${pathname === item.path ? 'bg-white text-gray-900' : 'text-white hover:bg-gray-800'} px-3 py-2 rounded-3xl transition-all duration-200 whitespace-nowrap text-base`}>
                {item.label}
              </span>
            ) : (
              <span className={`${pathname === item.path ? 'bg-white text-gray-900' : 'text-white hover:bg-gray-800'} px-1.5 py-2 rounded-3xl transition-all duration-200 whitespace-nowrap text-base`}>
                {item.icon}
              </span>
            )}
          </li>
        ))}
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
              onClick={() => {
                if (window.confirm('정말 로그아웃 하시겠습니까?')) {
                  signOut({ redirect: false }).then(() => {
                    router.push('/');
                  });
                }
              }}
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
            onClick={() => router.push('/auth/signin')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer"
          >
            {isOpen ? (
              <>
                <span>로그인</span>
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