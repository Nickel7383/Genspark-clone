import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';

interface Message {
  text: string;
  isUser: boolean;
}

export const getAIResponse = async (
  message: string | undefined,
  messages: Message[],
  selectedModel: string,
  apiKey: string,
  onSendMessage: (message: string, isUser: boolean) => void,
  onStreamEnd?: () => void,
  imageFile?: File
) => {
  if (!apiKey) {
    onSendMessage('API 키가 설정되지 않았습니다. 프로필 페이지에서 API 키를 설정해주세요.', false);
    onStreamEnd?.();
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    if (imageFile) {
      // 이미지 업로드
      const uploaded = await ai.files.upload({ file: imageFile });
      
      if (!uploaded.uri || !uploaded.mimeType) {
        throw new Error('Uploaded file does not have a URI or MIME type.');
      }
      
      const response = await ai.models.generateContentStream({
        model: selectedModel,
        contents: [
          createUserContent([
            createPartFromUri(uploaded.uri, uploaded.mimeType),
            message ?? '',
          ]),
        ],
      });

      let fullResponse = '';
      for await (const chunk of response) {
        fullResponse += chunk.text;
        console.log('스트리밍 응답:', chunk.text);
        onSendMessage(fullResponse, false);
      }
      onStreamEnd?.();

    }
    else{
      const chat = ai.chats.create({
        model: selectedModel,
        history: messages.map(msg => ({
          role: msg.isUser ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
      });

      let fullResponse = '';
      const stream = await chat.sendMessageStream({
        message: message ?? '',
      });
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        onSendMessage(fullResponse, false);
      }
      onStreamEnd?.();
    }
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      onSendMessage('API 키가 올바르지 않습니다. 프로필 페이지에서 올바른 API 키를 설정해주세요.', false);
    } else {
      onSendMessage(`죄송합니다. 오류가 발생했습니다.\n${error}`, false);
    }
    onStreamEnd?.();
  }
}; 