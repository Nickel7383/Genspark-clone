import { useState, useEffect } from 'react';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  selectedChatId?: string;
  onDeleteChat?: (chatId: string) => void;
}

export default function ChatSidebar({ 
  onSelectChat, 
  onNewChat, 
  selectedChatId,
  onDeleteChat 
}: ChatSidebarProps) {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 대화 목록 불러오기
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch('/api/chat');
        if (!res.ok) {
          setChats([]);
          return;
        }
        const data: Chat[] = await res.json();
        setChats(data);
      } catch (error) {
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChats();
  }, [isLoading, open]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (onDeleteChat && window.confirm('이 대화를 삭제하시겠습니까?')) {
      setIsLoading(true);
      await onDeleteChat(chatId);
      //setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full">
      {/* 열기 버튼 (닫힌 상태에서만 보임) */}
      {!open && (
        <button
          className="absolute top-4 left-4 z-30 bg-[#232425] p-2 rounded-full shadow hover:bg-[#333] transition"
          onClick={() => {
            setOpen(true);
          }}
          aria-label="작업 목록 열기"
          style={{ transition: 'left 0.3s' }}
        >
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2">
            <rect x="4" y="7" width="16" height="2" rx="1" />
            <rect x="4" y="11" width="16" height="2" rx="1" />
            <rect x="4" y="15" width="16" height="2" rx="1" />
          </svg>
        </button>
      )}

      {/* 오버레이 (사이드바가 열려있을 때만 보임) */}
      {open && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`absolute top-0 left-0 h-full bg-[#2e2e2e] flex flex-col z-20
          ${open ? 'w-72 opacity-100' : 'w-0 opacity-0 pointer-events-none'}
          transition-all duration-300`}
        style={{ minWidth: open ? 288 : 0, overflow: 'hidden' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-lg font-bold text-white">작업 목록</span>
          <button onClick={() => setOpen(false)} className="text-white" aria-label="작업 목록 닫기">
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        <button
          className="m-4 p-2 bg-[#333] text-white rounded hover:bg-[#444] transition"
          onClick={() => {
            setIsLoading(true);
            onNewChat();
          }}
        >
          + 새 대화
        </button>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              로딩 중...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">대화 목록이 없습니다.</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                className={`relative group ${chat.id === selectedChatId ? 'bg-[#3a3a3a]' : 'hover:bg-[#333]'}`}
              >
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-white truncate pr-8">{chat.title || '새 대화'}</div>
                    <button 
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      aria-label="대화 삭제"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="3" x2="13" y2="13" />
                        <line x1="3" y1="13" x2="13" y2="3" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(chat.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 