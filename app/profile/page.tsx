'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [apiKey, setApiKey] = useState('');

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#232425]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#232425] p-8">
      <div className="max-w-[850px] mx-auto">
        <div className="bg-[#2a2b2c] rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-6">
            <img 
              src={session?.user?.image || ''} 
              alt="프로필" 
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {session?.user?.name}
              </h1>
              <p className="text-gray-400">
                {session?.user?.email}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">API 설정</h2>
              <span className="text-sm px-2 py-1 bg-red-500 text-white rounded-lg">준비중</span>
            </div>
            <div className="space-y-4 opacity-50">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Google API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Google API Key를 입력하세요"
                    className="flex-1 px-3 py-2 bg-[#232425] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    disabled
                  />
                  <button
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 cursor-not-allowed"
                    disabled
                  >
                    저장
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  * 현재 API 설정 기능은 준비 중입니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 