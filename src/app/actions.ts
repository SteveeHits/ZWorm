'use server';

import OpenAI from 'openai';
import { textToSpeech } from '@/ai/flows/tts-flow';
import type { Voice } from '@/context/settings-context';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export async function getVeniceResponse(userInput: string, withAudio: boolean, voice: Voice) {
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

    const message = completion?.choices?.[0]?.message?.content;

    if (message && message.trim().length > 0) {
      if(withAudio) {
        const audio = await textToSpeech(message, voice);
        return { success: true, message, audio };
      }
      return { success: true, message, audio: null };
    } else {
      // This handles cases where the API returns an empty or invalid response.
      console.error('Invalid response from AI:', completion);
      return { success: false, message: 'The AI returned an empty or invalid response. Please try again.', audio: null };
    }

  } catch (error: any) {
    // This provides more detailed logging for future debugging.
    console.error('Error getting AI response:', error);
    const errorMessage = error?.message || 'An unknown error occurred.';
    return { success: false, message: `Sorry, I am having trouble connecting to the AI. Error: ${errorMessage}`, audio: null };
  }
}
