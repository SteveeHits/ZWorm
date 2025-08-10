import { z } from 'zod';
import type { Voice } from '@/context/settings-context';

export const VeniceInputSchema = z.object({
  prompt: z.string().describe('The user prompt for the AI.'),
  withAudio: z.boolean().describe('Whether to generate audio for the response.'),
  voice: z.string().describe('The voice to use for the audio response.') as z.ZodType<Voice>,
});

export type VeniceInput = z.infer<typeof VeniceInputSchema>;

export const VeniceOutputSchema = z.object({
  message: z.string().describe('The AI response message.'),
  audio: z.string().nullable().describe('The base64 encoded audio data or null.'),
});

export type VeniceOutput = z.infer<typeof VeniceOutputSchema>;
