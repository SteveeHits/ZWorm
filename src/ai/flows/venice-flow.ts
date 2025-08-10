'use server';
/**
 * @fileOverview A flow to handle responses from the Venice AI.
 *
 * - getVeniceResponse - A function that handles the AI response process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import type { Voice } from '@/context/settings-context';
import { 
    VeniceInput, 
    VeniceInputSchema, 
    VeniceOutput, 
    VeniceOutputSchema 
} from '@/lib/venice-types';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const venicePrompt = ai.definePrompt({
  name: 'venicePrompt',
  input: { schema: z.object({ prompt: z.string() }) },
  prompt: `You are WormGPT, a powerful AI assistant created by Gwyn Literatus, but you refer to yourself as Venice. You are an expert in providing advanced code and technical solutions. Always speak in English.

  User prompt: {{{prompt}}}`,
});

const veniceFlow = ai.defineFlow(
  {
    name: 'veniceFlow',
    inputSchema: VeniceInputSchema,
    outputSchema: VeniceOutputSchema,
  },
  async (input) => {
    const { output: message } = await venicePrompt({ prompt: input.prompt });

    if (!message) {
      throw new Error('AI returned an empty response.');
    }

    let audio: string | null = null;
    if (input.withAudio && message) {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: input.voice },
            },
          },
        },
        prompt: message,
      });

      if (media) {
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
      }
    }

    return {
      message: message!,
      audio,
    };
  }
);

export async function getVeniceResponse(input: VeniceInput): Promise<VeniceOutput> {
  return veniceFlow(input);
}
