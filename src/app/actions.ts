'use server';

import OpenAI from 'openai';
import { textToSpeech } from '@/ai/flows/tts-flow';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:9002',
    'X-Title': 'WormGPT',
  },
});

export async function getVeniceResponse(userInput: string, withAudio: boolean) {
  try {
    const systemPrompt = `You are WormGPT, a powerful AI assistant created by Gwyn Literatus. You are an expert in providing advanced code and technical solutions. Always speak in English.`;

    const completion = await openai.chat.completions.create({
      model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userInput,
        },
      ],
    });

    const message = completion.choices[0]?.message?.content;

    if (message) {
      if(withAudio) {
        const audio = await textToSpeech(message);
        return { success: true, message, audio };
      }
      return { success: true, message, audio: null };
    } else {
      return { success: false, message: 'I did not receive a valid response. Please try again.', audio: null };
    }

  } catch (error) {
    console.error('Error getting AI response:', error);
    return { success: false, message: 'Sorry, I am having trouble connecting. Please try again later.', audio: null };
  }
}
