import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  imageUrl?: string;
}

export default function ChatMessage({ message, isUser, imageUrl }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const prevMessageRef = useRef(message);

  useEffect(() => {
    if (message !== prevMessageRef.current) {
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      prevMessageRef.current = message;
    } else if (!isVisible) {
      setIsVisible(true);
    }
  }, [message, isVisible]);

  return (
    <div className="flex justify-center mb-10">
      <div className="w-full">
        {imageUrl && (
          <div className={`flex mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <img 
              src={imageUrl} 
              alt="user upload" 
              style={{ maxWidth: '100%', maxHeight: 320, width: 'auto', height: 'auto', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
          </div>
        )}
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div 
            className={`${
              isUser 
                ? 'max-w-[70%] bg-white text-black p-2.5 rounded-2xl' 
                : 'text-gray-200'
            } transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
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