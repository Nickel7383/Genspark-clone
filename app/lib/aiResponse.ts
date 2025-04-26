import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  text: string;
  isUser: boolean;
}

export const getAIResponse = async (
  message: string,
  messages: Message[],
  selectedModel: string,
  onSendMessage: (message: string, isUser: boolean) => void,
  onStreamEnd?: () => void
) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: selectedModel });
    
    // 대화 히스토리 생성
    const chatHistory = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // 현재 메시지 추가
    chatHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 채팅 시작
    const chat = model.startChat({
      history: chatHistory
    });
    
    const result = await chat.sendMessageStream(message);
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      onSendMessage(fullResponse, false);
    }
    onStreamEnd?.();
  } catch (error) {
    console.error('Error:', error);
    onSendMessage('죄송합니다. 오류가 발생했습니다.', false);
    onStreamEnd?.();
  }
}; 