'use server';

import { getInitialPrompt } from '@/ai/flows/initial-prompt';

export async function getVeniceResponse() {
  try {
    const response = await getInitialPrompt();
    // The AI flow is static and returns a welcome message.
    // This is used as a mock response for any user input.
    return { success: true, message: response.initialPrompt };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return { success: false, message: 'Sorry, I am having trouble connecting. Please try again later.' };
  }
}
