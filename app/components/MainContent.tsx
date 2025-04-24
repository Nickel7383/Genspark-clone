import { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface Message {
  text: string;
  isUser: boolean;
}

export default function MainContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const handleNewMessage = (message: string, isUser: boolean) => {
    setMessages((prev) => [...prev, { text: message, isUser }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">AI 에이전트</h2>
          <p className="text-gray-400">채팅을 시작하려면 로그인해주세요</p>
          <button
            onClick={() => signIn('google')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Google 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className='max-w-[800px] w-full mx-auto flex-1 flex flex-col h-full'>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-6 text-white">AI 에이전트</h2>
            <div className="w-full">
              <ChatInput onSendMessage={handleNewMessage} messages={messages} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 px-8">
              <div className="space-y-4 pt-8">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isUser={message.isUser}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="sticky bottom-0 px-8 py-4">
              <ChatInput onSendMessage={handleNewMessage} messages={messages} />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 