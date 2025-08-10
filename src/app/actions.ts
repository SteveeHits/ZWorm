'use server';

import { getInitialPrompt } from '@/ai/flows/initial-prompt';

export async function getVeniceResponse(userInput: string) {
  try {
    // For now, we are not using the user input and returning a canned response.
    // In the future, this could be a call to a real AI model.
    console.log('User input:', userInput);
    const response = await getInitialPrompt();
    return { success: true, message: response.initialPrompt };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return { success: false, message: 'Sorry, I am having trouble connecting. Please try again later.' };
  }
}
