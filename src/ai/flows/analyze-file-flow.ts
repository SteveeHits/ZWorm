
'use server';
/**
 * @fileOverview A flow for analyzing uploaded files using a generative AI model.
 *
 * - analyzeFile - A function that takes file data and returns an analysis.
 * - AnalyzeFileInput - The input type for the analyzeFile function.
 * - AnalyzeFileOutput - The return type for the analyzeFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AnalyzeFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file represented as a data URI, including a MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   fileName: z.string().describe('The name of the file.'),
});
export type AnalyzeFileInput = z.infer<typeof AnalyzeFileInputSchema>;

export const AnalyzeFileOutputSchema = z.object({
  description: z.string().describe('A detailed description of the file content.'),
  fileType: z.string().describe("The identified type of the file (e.g., 'image', 'text', 'code', 'unknown')."),
});
export type AnalyzeFileOutput = z.infer<typeof AnalyzeFileOutputSchema>;


const analysisPrompt = ai.definePrompt({
    name: 'fileAnalysisPrompt',
    input: { schema: AnalyzeFileInputSchema },
    output: { schema: AnalyzeFileOutputSchema },
    prompt: `You are an expert file analyzer. Your task is to analyze the provided file and return a concise description and its file type.

File Name: {{{fileName}}}
File Content:
{{media url=fileDataUri}}

Analyze the file and provide:
1.  A one-sentence summary of the file's content.
2.  The type of file (e.g., 'image', 'typescript code', 'json', 'text', 'pdf', 'unknown').

Be precise and brief in your analysis.
`,
});


export const analyzeFileFlow = ai.defineFlow(
  {
    name: 'analyzeFileFlow',
    inputSchema: AnalyzeFileInputSchema,
    outputSchema: AnalyzeFileOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);


export async function analyzeFile(input: AnalyzeFileInput): Promise<AnalyzeFileOutput> {
  return analyzeFileFlow(input);
}
