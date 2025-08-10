'use server';

import { getVeniceResponse as getVeniceResponseFlow } from '@/ai/flows/venice-flow';
import type { VeniceInput, VeniceOutput } from '@/lib/venice-types';

export async function getVeniceResponse(
  input: VeniceInput
): Promise<VeniceOutput> {
  try {
    const response = await getVeniceResponseFlow(input);
    return response;
  } catch (error: any) {
    console.error('Error getting AI response:', error);
    const errorMessage = error?.message || 'An unknown error occurred.';
    return {
      message: `Sorry, I am having trouble connecting to the AI. Error: ${errorMessage}`,
      audio: null,
    };
  }
}
