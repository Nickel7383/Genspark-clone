import { GoogleGenAI, createUserContent, createPartFromUri, Modality } from '@google/genai';

interface Message {
  text: string;
  isUser: boolean;
}

export const getAIResponse = async (
  message: string | undefined,
  messages: Message[],
  selectedModel: string,
  apiKey: string,
  onSendMessage: (message: string, isUser: boolean, imageUrl?: string) => void,
  onStreamEnd?: () => void,
  imageFile?: File
) => {
  if (!apiKey) {
    onSendMessage('API 키가 설정되지 않았습니다. 프로필 페이지에서 API 키를 설정해주세요.', false);
    onStreamEnd?.();
    return;
  }

  try {
    const contents = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));


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
        onSendMessage(fullResponse, false);
      }
      onStreamEnd?.();

    }
    else{
      
      contents.push({
        role: 'user',
        parts: [{ text: message ?? '' }]
      });
      if (selectedModel === 'gemini-2.0-flash-exp-image-generation') {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: contents,
          config: {responseModalities: [Modality.TEXT, Modality.IMAGE]},
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.text) {
            onSendMessage(part.text, false);
          } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            if (imageData) {
              const mimeType = part.inlineData.mimeType
              const dataUrl = `data:${mimeType};base64,${imageData}`;
              onSendMessage("", false, dataUrl);
              
              // const res = await fetch('/api/save-image', {
              //   method: 'POST',
              //   headers: { 'Content-Type': 'application/json' },
              //   body: JSON.stringify({ imageData }),
              // });
              // const data = await res.json();
              // onSendMessage("", false, data.url as string);
            }
          }
        }
        onStreamEnd?.();
      }
      else{
        const response = await ai.models.generateContentStream({
          model: selectedModel,
          contents: contents,
        }); 

        
        let fullResponse = '';
        for await (const chunk of response) {
          if (chunk.text === undefined) {
            onStreamEnd?.();
            return;
          }
          fullResponse += chunk.text;
          onSendMessage(fullResponse, false);
        }
        onStreamEnd?.();
      }
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