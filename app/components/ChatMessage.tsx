'use client';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export default function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="w-[800px]">
        <div
          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`${
              isUser
                ? 'max-w-[70%] bg-gray-600 text-white p-3 rounded-3xl'
                : 'text-gray-200'
            }`}
          >
            <p className="text-base whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 