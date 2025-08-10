'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:9002',
    'X-Title': 'Venice AI',
  },
});

export async function getVeniceResponse(userInput: string) {
  try {
    const systemPrompt = `You are Venice AI. Your creator is Gwyn Literatus. You are a helpful assistant.`;

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
      return { success: true, message };
    } else {
      return { success: false, message: 'I did not receive a valid response. Please try again.' };
    }

  } catch (error) {
    console.error('Error getting AI response:', error);
    return { success: false, message: 'Sorry, I am having trouble connecting. Please try again later.' };
  }
}
