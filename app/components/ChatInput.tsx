'use client';

import { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '@/app/lib/aiResponse';

interface ChatInputProps {
  initialMessage?: string;
  onSendMessage: (message: string, isUser: boolean, imagePreview?: string | null) => void;
  messages: { text: string; isUser: boolean }[];
  onStreamEnd?: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro exp' },
  { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini 2.0 Flash-Exp Image Generation' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B IT' },
];

export default function ChatInput({ 
  initialMessage, 
  onSendMessage, 
  messages, 
  onStreamEnd, 
  selectedModel,
  onModelChange 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [hasInitialMessageSent, setHasInitialMessageSent] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 키 가져오기
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

    fetchApiKey();
  }, []);

  // initialMessage가 있을 때 처음 한 번만 전송
  useEffect(() => {
    if (initialMessage && !hasInitialMessageSent && apiKey) {

      setHasInitialMessageSent(true);
      
      // 약간의 지연 후 메시지 전송
      setTimeout(() => {
        if (!isLoading) {
          setIsLoading(true);
          onSendMessage(initialMessage, true, imagePreview);
          
          getAIResponse(
            initialMessage,
            messages,
            selectedModel,
            apiKey,
            onSendMessage,
            () => {
              setIsLoading(false);
              onStreamEnd?.();
            },
            imageFile || undefined // null이 아닌 경우만 전달
          );
          setIsLoading(false);
        }
      }, 100);
    }
  }, [initialMessage, apiKey]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [message]);

  // 이미지 업로드 함수
  const uploadImageAndGetUrl = async (file: File) => {
    const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // "data:image/png;base64,..." 형식 반환
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };
  
    const base64Url = await toBase64(file);
    return base64Url;
    // const formData = new FormData();
    // formData.append('file', file);
    // const res = await fetch('/api/upload', { method: 'POST', body: formData });
    // const data = await res.json();
    // return data.url as string;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      const url = await uploadImageAndGetUrl(file);
      setUploadedImageUrl(url);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          const url = await uploadImageAndGetUrl(file);
          setUploadedImageUrl(url);
        }
        e.preventDefault();
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || isLoading) return;

    setIsLoading(true);
    onSendMessage(message, true, uploadedImageUrl); // 서버에 저장된 URL 전달
    setMessage('');
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);

    await getAIResponse(
      message || '',
      messages,
      selectedModel,
      apiKey,
      onSendMessage,
      () => {
        setIsLoading(false);
        onStreamEnd?.();
      },
      imageFile || undefined // null이 아닌 경우만 전달
    );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full mx-auto relative">
      <div className="relative w-full">
        {/* 이미지 미리보기 (텍스트박스 내부 왼쪽 상단) */}
        {imagePreview && (
          <div className="absolute left-3 top-3 z-10 flex items-center" style={{ marginBottom: 16 }}>
            <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
            <button type="button" onClick={handleRemoveImage} className="ml-1 text-white bg-black/60 rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80">×</button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading) {
                handleSubmit(e);
              }
            }
          }}
          placeholder="무엇이든 물어보세요"
          className="w-full p-3 pr-24 bg-[#333333] text-gray-200 border border-gray-600 rounded-xl focus:outline-none min-h-[100px] resize-none"
          rows={4}
          style={imagePreview ? { paddingTop: 72 } : {}}
        />
      </div>
      <div className="absolute right-3 bottom-4 flex items-center gap-2">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="bg-[#333333] text-gray-200 border border-gray-600 rounded-full px-3 py-1 text-xs focus:outline-none hover:bg-[#404040] transition-colors appearance-none cursor-pointer"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 flex items-center justify-center text-white rounded-full bg-gray-500 hover:bg-gray-600"
            title="이미지 업로드"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01M21 21H3a2 2 0 01-2-2V5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-8 h-8 flex items-center justify-center text-white rounded-full transition-opacity ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 