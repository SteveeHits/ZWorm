'use server';

import OpenAI from 'openai';
import { textToSpeech } from '@/ai/flows/tts-flow';
import type { Voice } from '@/context/settings-context';

interface VeniceOutput {
  message: string;
  audio: string | null;
}

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function getVeniceResponse(
  prompt: string,
  withAudio: boolean,
  voice: Voice
): Promise<VeniceOutput> {
  try {
    const response = await openrouter.chat.completions.create({
      model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      messages: [{ role: 'user', content: prompt }],
    });

    const message = response.choices[0]?.message?.content;

    if (!message) {
      throw new Error('AI returned an empty response.');
    }

    let audio: string | null = null;
    if (withAudio) {
      try {
        audio = await textToSpeech(message, voice);
      } catch (audioError) {
        console.error('Text-to-speech failed:', audioError);
        // We still want to return the text message even if TTS fails
      }
    }

    return {
      message: message,
      audio: audio,
    };
  } catch (error: any) {
    console.error('Error getting AI response:', error);
    const errorMessage = error?.message || 'An unknown error occurred.';
    return {
      message: `Sorry, I am having trouble connecting to the AI. Error: ${errorMessage}`,
      audio: null,
    };
  }
}
