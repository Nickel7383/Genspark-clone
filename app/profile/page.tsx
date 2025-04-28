'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // API 키 조회
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch('/api/user/api-key');
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey || '');
        }
      } catch (error) {
        console.error('API 키 조회 중 오류:', error);
      }
    }

    if (session) {
      fetchApiKey();
    }
  }, [session]);

  // API 키 저장
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/api-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        alert('API 키가 저장되었습니다.');
      } else {
        const data = await response.json();
        alert(data.error || 'API 키 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 키 저장 중 오류:', error);
      alert('API 키 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        await signOut({ redirect: false });
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.message || '회원탈퇴 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('회원탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#232425]">
        <div className="text-white">로그인이 필요합니다.</div>
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
          
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">API 설정</h2>
            </div>
            <div className="space-y-4">
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
                  />
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '처리 중...' : '회원탈퇴'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 