
/**
 * @fileOverview A flow for analyzing uploaded files using a generative AI model.
 *
 * - analyzeFileFlow - A function that takes file data and returns an analysis.
 * - AnalyzeFileInputSchema - The input schema for the analyzeFileFlow function.
 *   (not exported to prevent 'use server' issues)
 * - AnalyzeFileOutputSchema - The output schema for the analyzeFileFlow function.
 *   (not exported to prevent 'use server' issues)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file represented as a data URI, including a MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   fileName: z.string().describe('The name of the file.'),
});
export type AnalyzeFileInput = z.infer<typeof AnalyzeFileInputSchema>;

const AnalyzeFileOutputSchema = z.object({
  description: z.string().describe('The extracted raw text content from the file.'),
  fileType: z.string().describe("The identified type of the file (e.g., 'image', 'text', 'code', 'unknown')."),
});
export type AnalyzeFileOutput = z.infer<typeof AnalyzeFileOutputSchema>;


const analysisPrompt = ai.definePrompt({
    name: 'fileAnalysisPrompt',
    input: { schema: AnalyzeFileInputSchema },
    output: { schema: AnalyzeFileOutputSchema },
    prompt: `You are an expert text extractor. Your task is to analyze the provided file and extract all text content from it.

If the file is an image, perform OCR to extract all text.
If the file is a code file, extract the code.
If the file is a document, extract all text.

Return the full, raw, and unmodified text content.

File Name: {{{fileName}}}
File Content:
{{media url=fileDataUri}}
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
