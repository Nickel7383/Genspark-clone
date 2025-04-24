import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export default function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="w-full">
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`${isUser ? 'max-w-[70%] bg-gray-600 text-white p-3 rounded-3xl' : 'text-gray-200'}`}>
            {isUser ? (
              <p className="text-base whitespace-pre-wrap">{message}</p>
            ) : (
              <div className="text-base whitespace-pre-wrap">
                <ReactMarkdown>
                  {message}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 